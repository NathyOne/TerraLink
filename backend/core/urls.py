from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminMessageViewSet,
    ConstructionMaterialViewSet,
    DashboardStatsView,
    MachineAssignmentViewSet,
    MachineRequestViewSet,
    MachineViewSet,
    MeView,
    RegisterView,
    UserViewSet,
)


router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("machines", MachineViewSet, basename="machines")
router.register("machine-requests", MachineRequestViewSet, basename="machine-requests")
router.register("assignments", MachineAssignmentViewSet, basename="assignments")
router.register("materials", ConstructionMaterialViewSet, basename="materials")
router.register("messages", AdminMessageViewSet, basename="messages")


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("", include(router.urls)),
]
