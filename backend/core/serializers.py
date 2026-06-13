from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AdminMessage, ConstructionMaterial, Machine, MachineAssignment, MachineRequest, User
from .permissions import is_admin_user


UserModel = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ("id", "username", "email", "role", "phone_number")


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=False)

    class Meta:
        model = UserModel
        fields = ("id", "username", "email", "password", "role", "phone_number", "is_active", "created_at")
        read_only_fields = ("id", "created_at")

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if not request or not is_admin_user(request.user):
            fields["role"].read_only = True
            fields["is_active"].read_only = True
            fields["password"].read_only = True
        return fields

    def validate(self, attrs):
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": "Password is required."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = UserModel(**validated_data)
        if user.role == User.Role.ADMIN:
            user.is_staff = True
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if instance.role == User.Role.ADMIN:
            instance.is_staff = True
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = UserModel
        fields = ("id", "username", "email", "password", "role", "phone_number")
        read_only_fields = ("id",)

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Admin accounts must be created by an existing admin.")
        if value not in {User.Role.CONSTRUCTION_OWNER, User.Role.MACHINE_OWNER}:
            raise serializers.ValidationError("Choose construction_owner or machine_owner.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = UserModel(**validated_data)
        user.set_password(password)
        user.save()
        return user


class MachineSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        source="owner",
        queryset=UserModel.objects.filter(role=User.Role.MACHINE_OWNER),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Machine
        fields = (
            "id",
            "owner",
            "owner_id",
            "name",
            "plate_number",
            "machine_type",
            "description",
            "location",
            "hourly_rate",
            "daily_rate",
            "availability_status",
            "image",
            "created_at",
        )
        read_only_fields = ("id", "owner", "created_at")

    def validate(self, attrs):
        request = self.context.get("request")
        if not request:
            return attrs
        if is_admin_user(request.user):
            if self.instance is None and "owner" not in attrs:
                raise serializers.ValidationError({"owner_id": "Admin-created machines need a machine owner."})
            return attrs
        if request.user.role != User.Role.MACHINE_OWNER:
            raise serializers.ValidationError("Only machine owners can manage their own machines.")
        if self.instance is None and not attrs.get("plate_number"):
            raise serializers.ValidationError({"plate_number": "Plate number is required."})
        attrs.pop("owner", None)
        attrs.pop("availability_status", None)
        return attrs


class MachineRequestSerializer(serializers.ModelSerializer):
    requested_by = UserSummarySerializer(read_only=True)
    requested_by_id = serializers.PrimaryKeyRelatedField(
        source="requested_by",
        queryset=UserModel.objects.filter(role=User.Role.CONSTRUCTION_OWNER),
        write_only=True,
        required=False,
    )

    class Meta:
        model = MachineRequest
        fields = (
            "id",
            "requested_by",
            "requested_by_id",
            "request_category",
            "requested_item_type",
            "quantity",
            "title",
            "description",
            "location",
            "required_machine_type",
            "expected_start_date",
            "expected_end_date",
            "budget",
            "status",
            "admin_notes",
            "created_at",
        )
        read_only_fields = ("id", "requested_by", "created_at")

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if not request or not is_admin_user(request.user):
            fields["requested_by_id"].read_only = True
            fields["status"].read_only = True
            fields["admin_notes"].read_only = True
        return fields

    def validate(self, attrs):
        instance = self.instance
        category = attrs.get("request_category", getattr(instance, "request_category", MachineRequest.RequestCategory.EQUIPMENT))
        item_type = attrs.get("requested_item_type", getattr(instance, "requested_item_type", ""))
        machine_type = attrs.get("required_machine_type", getattr(instance, "required_machine_type", ""))
        item_type = item_type or machine_type

        if category == MachineRequest.RequestCategory.EQUIPMENT:
            if not item_type:
                raise serializers.ValidationError({"requested_item_type": "Choose the construction equipment type."})
            attrs["requested_item_type"] = item_type
            attrs["required_machine_type"] = item_type
        elif category == MachineRequest.RequestCategory.MATERIAL:
            if not item_type:
                raise serializers.ValidationError({"requested_item_type": "Choose the construction material type."})
            attrs["requested_item_type"] = item_type
            attrs["required_machine_type"] = ""

        quantity = attrs.get("quantity", getattr(instance, "quantity", 1))
        if quantity is not None and quantity < 1:
            raise serializers.ValidationError({"quantity": "Quantity must be at least 1."})

        start = attrs.get("expected_start_date", getattr(self.instance, "expected_start_date", None))
        end = attrs.get("expected_end_date", getattr(self.instance, "expected_end_date", None))
        if not start:
            raise serializers.ValidationError({"expected_start_date": "Choose the date this is needed."})
        if not end:
            attrs["expected_end_date"] = start
        if start and end and end < start:
            raise serializers.ValidationError({"expected_end_date": "End date must be on or after start date."})

        title = attrs.get("title", getattr(instance, "title", ""))
        if not title:
            label = "Equipment request" if category == MachineRequest.RequestCategory.EQUIPMENT else "Material request"
            attrs["title"] = f"{label}: {item_type}"

        return attrs


class MachineAssignmentSerializer(serializers.ModelSerializer):
    machine_request = MachineRequestSerializer(read_only=True)
    machine = MachineSerializer(read_only=True)
    machine_owner = UserSummarySerializer(read_only=True)
    assigned_by = UserSummarySerializer(read_only=True)
    machine_request_id = serializers.PrimaryKeyRelatedField(
        source="machine_request",
        queryset=MachineRequest.objects.all(),
        write_only=True,
    )
    machine_id = serializers.PrimaryKeyRelatedField(
        source="machine",
        queryset=Machine.objects.all(),
        write_only=True,
    )

    class Meta:
        model = MachineAssignment
        fields = (
            "id",
            "machine_request",
            "machine_request_id",
            "machine",
            "machine_id",
            "machine_owner",
            "assigned_by",
            "status",
            "created_at",
        )
        read_only_fields = ("id", "machine_request", "machine", "machine_owner", "assigned_by", "created_at")

    def create(self, validated_data):
        machine = validated_data["machine"]
        validated_data["machine_owner"] = machine.owner
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "machine" in validated_data:
            validated_data["machine_owner"] = validated_data["machine"].owner
        return super().update(instance, validated_data)

    def validate(self, attrs):
        machine_request = attrs.get("machine_request", getattr(self.instance, "machine_request", None))
        if machine_request and machine_request.request_category == MachineRequest.RequestCategory.MATERIAL:
            raise serializers.ValidationError({"machine_request_id": "Machine assignments are only for equipment requests."})
        return attrs


class ConstructionMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConstructionMaterial
        fields = (
            "id",
            "name",
            "description",
            "unit_type",
            "price_per_unit",
            "supplier_name",
            "location",
            "quantity_available",
            "admin_only",
            "created_at",
        )
        read_only_fields = ("id", "admin_only", "created_at")


class AdminMessageSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    recipient_machine_owner = UserSummarySerializer(read_only=True)
    recipient_machine_owner_id = serializers.PrimaryKeyRelatedField(
        source="recipient_machine_owner",
        queryset=UserModel.objects.filter(role=User.Role.MACHINE_OWNER),
        write_only=True,
    )
    machine_request = serializers.SerializerMethodField()
    machine_request_id = serializers.PrimaryKeyRelatedField(
        source="machine_request",
        queryset=MachineRequest.objects.all(),
        write_only=True,
    )

    class Meta:
        model = AdminMessage
        fields = (
            "id",
            "sender",
            "recipient_machine_owner",
            "recipient_machine_owner_id",
            "machine_request",
            "machine_request_id",
            "message",
            "created_at",
            "is_read",
        )
        read_only_fields = ("id", "sender", "recipient_machine_owner", "machine_request", "created_at")

    def get_machine_request(self, obj):
        request = self.context.get("request")
        if request and is_admin_user(request.user):
            return MachineRequestSerializer(obj.machine_request, context=self.context).data
        return {
            "id": obj.machine_request_id,
            "title": obj.machine_request.title,
            "status": obj.machine_request.status,
        }
