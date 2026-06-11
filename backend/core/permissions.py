from rest_framework import permissions

from .models import User


def is_admin_user(user):
    return bool(user and user.is_authenticated and getattr(user, "is_platform_admin", False))


def is_construction_owner(user):
    return bool(user and user.is_authenticated and user.role == User.Role.CONSTRUCTION_OWNER)


def is_machine_owner(user):
    return bool(user and user.is_authenticated and user.role == User.Role.MACHINE_OWNER)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsAdminOrConstructionOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user) or is_construction_owner(request.user)


class IsAdminOrMachineOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user) or is_machine_owner(request.user)
