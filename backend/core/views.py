from django.contrib.auth import get_user_model
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdminMessage, ConstructionMaterial, Machine, MachineAssignment, MachineRequest, User
from .permissions import IsAdminOrConstructionOwner, IsAdminOrMachineOwner, IsAdminRole, is_admin_user, is_construction_owner, is_machine_owner
from .serializers import (
    AdminMessageSerializer,
    ConstructionMaterialSerializer,
    MachineAssignmentSerializer,
    MachineRequestSerializer,
    MachineSerializer,
    RegisterSerializer,
    UserSerializer,
)


UserModel = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if is_admin_user(user):
            data = {
                "users": UserModel.objects.count(),
                "machine_owners": UserModel.objects.filter(role=User.Role.MACHINE_OWNER).count(),
                "construction_owners": UserModel.objects.filter(role=User.Role.CONSTRUCTION_OWNER).count(),
                "machines": Machine.objects.count(),
                "available_machines": Machine.objects.filter(availability_status=Machine.AvailabilityStatus.AVAILABLE).count(),
                "requests": MachineRequest.objects.count(),
                "pending_requests": MachineRequest.objects.filter(status=MachineRequest.Status.PENDING).count(),
                "assignments": MachineAssignment.objects.count(),
                "materials": ConstructionMaterial.objects.count(),
            }
        elif is_construction_owner(user):
            own_requests = MachineRequest.objects.filter(requested_by=user)
            data = {
                "requests": own_requests.count(),
                "pending_requests": own_requests.filter(status=MachineRequest.Status.PENDING).count(),
                "reviewing_requests": own_requests.filter(status=MachineRequest.Status.REVIEWING).count(),
                "assigned_requests": own_requests.filter(status=MachineRequest.Status.ASSIGNED).count(),
                "completed_requests": own_requests.filter(status=MachineRequest.Status.COMPLETED).count(),
            }
        elif is_machine_owner(user):
            own_messages = AdminMessage.objects.filter(recipient_machine_owner=user)
            data = {
                "machines": Machine.objects.filter(owner=user).count(),
                "available_machines": Machine.objects.filter(owner=user, availability_status=Machine.AvailabilityStatus.AVAILABLE).count(),
                "busy_machines": Machine.objects.filter(owner=user, availability_status=Machine.AvailabilityStatus.BUSY).count(),
                "messages": own_messages.count(),
                "unread_messages": own_messages.filter(is_read=False).count(),
            }
        else:
            data = {}
        return Response(data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = UserModel.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ("role", "is_active")
    search_fields = ("username", "email", "phone_number")
    ordering_fields = ("created_at", "username", "email")


class MachineViewSet(viewsets.ModelViewSet):
    serializer_class = MachineSerializer
    permission_classes = [IsAdminOrMachineOwner]
    filterset_fields = {
        "machine_type": ["exact", "icontains"],
        "location": ["exact", "icontains"],
        "availability_status": ["exact"],
        "hourly_rate": ["gte", "lte"],
        "daily_rate": ["gte", "lte"],
    }
    search_fields = ("name", "plate_number", "machine_type", "location", "owner__username", "owner__email")
    ordering_fields = ("created_at", "hourly_rate", "daily_rate", "name")

    def get_queryset(self):
        queryset = Machine.objects.select_related("owner")
        if is_admin_user(self.request.user):
            return queryset
        if is_machine_owner(self.request.user):
            return queryset.filter(owner=self.request.user)
        return queryset.none()

    def perform_create(self, serializer):
        if is_admin_user(self.request.user):
            serializer.save()
        elif is_machine_owner(self.request.user):
            serializer.save(owner=self.request.user, availability_status=Machine.AvailabilityStatus.AVAILABLE)
        else:
            raise PermissionDenied("Only machine owners or admins can create machines.")

    def update(self, request, *args, **kwargs):
        if is_machine_owner(request.user):
            raise PermissionDenied("Submitted machines can only be changed by TerraLink admins.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if is_machine_owner(request.user):
            raise PermissionDenied("Submitted machines can only be changed by TerraLink admins.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if is_machine_owner(request.user):
            raise PermissionDenied("Submitted machines can only be deleted by TerraLink admins.")
        return super().destroy(request, *args, **kwargs)


class MachineRequestViewSet(viewsets.ModelViewSet):
    serializer_class = MachineRequestSerializer
    permission_classes = [IsAdminOrConstructionOwner]
    filterset_fields = {
        "request_category": ["exact"],
        "requested_item_type": ["exact", "icontains"],
        "quantity": ["gte", "lte"],
        "status": ["exact"],
        "required_machine_type": ["exact", "icontains"],
        "location": ["exact", "icontains"],
        "expected_start_date": ["gte", "lte"],
        "expected_end_date": ["gte", "lte"],
        "budget": ["gte", "lte"],
    }
    search_fields = ("title", "description", "location", "requested_item_type", "required_machine_type", "requested_by__username", "requested_by__email")
    ordering_fields = ("created_at", "expected_start_date", "quantity", "budget", "status")

    def get_queryset(self):
        queryset = MachineRequest.objects.select_related("requested_by").prefetch_related("assignments")
        if is_admin_user(self.request.user):
            return queryset
        if is_construction_owner(self.request.user):
            return queryset.filter(requested_by=self.request.user)
        return queryset.none()

    def perform_create(self, serializer):
        if is_admin_user(self.request.user):
            if "requested_by" not in serializer.validated_data:
                raise ValidationError({"requested_by_id": "Admin-created requests need a construction owner."})
            serializer.save()
        elif is_construction_owner(self.request.user):
            serializer.save(requested_by=self.request.user, status=MachineRequest.Status.PENDING, admin_notes="")
        else:
            raise PermissionDenied("Machine owners cannot create job requests.")

    @action(detail=True, methods=["get"], permission_classes=[IsAdminRole])
    def matches(self, request, pk=None):
        machine_request = self.get_object()
        if machine_request.request_category == MachineRequest.RequestCategory.MATERIAL:
            machines = Machine.objects.none()
            page = self.paginate_queryset(machines)
            serializer = MachineSerializer(page or machines, many=True, context={"request": request})
            if page is not None:
                return self.get_paginated_response(serializer.data)
            return Response(serializer.data)

        machines = Machine.objects.select_related("owner").filter(availability_status=Machine.AvailabilityStatus.AVAILABLE)
        machine_type = request.query_params.get("machine_type") or machine_request.required_machine_type
        location = request.query_params.get("location") or machine_request.location
        max_hourly = request.query_params.get("hourly_rate_lte")
        max_daily = request.query_params.get("daily_rate_lte")

        if machine_type:
            machines = machines.filter(machine_type__icontains=machine_type)
        if location:
            machines = machines.filter(location__icontains=location)
        if max_hourly:
            machines = machines.filter(hourly_rate__lte=max_hourly)
        if max_daily:
            machines = machines.filter(daily_rate__lte=max_daily)

        page = self.paginate_queryset(machines)
        serializer = MachineSerializer(page or machines, many=True, context={"request": request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class MachineAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = MachineAssignmentSerializer
    permission_classes = [IsAdminRole]
    queryset = MachineAssignment.objects.select_related(
        "machine_request",
        "machine",
        "machine_owner",
        "assigned_by",
        "machine__owner",
        "machine_request__requested_by",
    )
    filterset_fields = ("status", "machine_request", "machine", "machine_owner")
    search_fields = ("machine__name", "machine__machine_type", "machine_owner__username", "machine_request__title")
    ordering_fields = ("created_at", "status")

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        assignment = self.get_object()
        if assignment.status in {MachineAssignment.Status.ACTIVE, MachineAssignment.Status.ACCEPTED}:
            assignment.machine.availability_status = Machine.AvailabilityStatus.BUSY
            assignment.machine.save(update_fields=["availability_status"])
            assignment.machine_request.status = MachineRequest.Status.ASSIGNED
            assignment.machine_request.save(update_fields=["status"])
        elif assignment.status == MachineAssignment.Status.COMPLETED:
            assignment.machine.availability_status = Machine.AvailabilityStatus.AVAILABLE
            assignment.machine.save(update_fields=["availability_status"])
            assignment.machine_request.status = MachineRequest.Status.COMPLETED
            assignment.machine_request.save(update_fields=["status"])
        return response


class ConstructionMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = ConstructionMaterialSerializer
    permission_classes = [IsAdminRole]
    queryset = ConstructionMaterial.objects.all()
    filterset_fields = {
        "unit_type": ["exact"],
        "location": ["exact", "icontains"],
        "price_per_unit": ["gte", "lte"],
        "quantity_available": ["gte", "lte"],
    }
    search_fields = ("name", "supplier_name", "location")
    ordering_fields = ("name", "price_per_unit", "quantity_available", "created_at")

    def perform_create(self, serializer):
        serializer.save(admin_only=True)


class AdminMessageViewSet(viewsets.ModelViewSet):
    serializer_class = AdminMessageSerializer
    permission_classes = [IsAdminOrMachineOwner]
    filterset_fields = ("is_read", "recipient_machine_owner", "machine_request")
    search_fields = ("message", "recipient_machine_owner__username", "machine_request__title")
    ordering_fields = ("created_at", "is_read")

    def get_queryset(self):
        queryset = AdminMessage.objects.select_related(
            "sender",
            "recipient_machine_owner",
            "machine_request",
            "machine_request__requested_by",
        )
        if is_admin_user(self.request.user):
            return queryset
        if is_machine_owner(self.request.user):
            return queryset.filter(recipient_machine_owner=self.request.user)
        return queryset.none()

    def perform_create(self, serializer):
        if not is_admin_user(self.request.user):
            raise PermissionDenied("Only admins can send messages.")
        serializer.save(sender=self.request.user)

    def update(self, request, *args, **kwargs):
        if is_machine_owner(request.user):
            allowed = {"is_read"}
            if any(key not in allowed for key in request.data.keys()):
                raise PermissionDenied("Machine owners can only mark messages as read.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if is_machine_owner(request.user):
            allowed = {"is_read"}
            if any(key not in allowed for key in request.data.keys()):
                raise PermissionDenied("Machine owners can only mark messages as read.")
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only admins can delete messages.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if not (is_admin_user(request.user) or message.recipient_machine_owner_id == request.user.id):
            raise PermissionDenied("You cannot update this message.")
        message.is_read = True
        message.save(update_fields=["is_read"])
        return Response(AdminMessageSerializer(message, context={"request": request}).data, status=status.HTTP_200_OK)
