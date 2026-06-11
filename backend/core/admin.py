from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import AdminMessage, ConstructionMaterial, Machine, MachineAssignment, MachineRequest, User


@admin.register(User)
class TerraLinkUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("TerraLink", {"fields": ("role", "phone_number")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("TerraLink", {"fields": ("role", "phone_number", "email")}),
    )
    list_display = ("username", "email", "role", "phone_number", "is_active", "is_staff", "created_at")
    list_filter = ("role", "is_active", "is_staff", "created_at")
    search_fields = ("username", "email", "phone_number")


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ("name", "plate_number", "machine_type", "owner", "location", "availability_status", "hourly_rate", "daily_rate")
    list_filter = ("availability_status", "machine_type", "location")
    search_fields = ("name", "plate_number", "machine_type", "owner__username", "location")


@admin.register(MachineRequest)
class MachineRequestAdmin(admin.ModelAdmin):
    list_display = ("title", "requested_by", "request_category", "requested_item_type", "quantity", "location", "status", "created_at")
    list_filter = ("request_category", "status", "requested_item_type", "location", "created_at")
    search_fields = ("title", "description", "requested_item_type", "required_machine_type", "requested_by__username", "location")


@admin.register(MachineAssignment)
class MachineAssignmentAdmin(admin.ModelAdmin):
    list_display = ("machine_request", "machine", "machine_owner", "assigned_by", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("machine_request__title", "machine__name", "machine_owner__username")


@admin.register(ConstructionMaterial)
class ConstructionMaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "supplier_name", "unit_type", "location", "price_per_unit", "quantity_available", "admin_only")
    list_filter = ("unit_type", "location", "admin_only")
    search_fields = ("name", "supplier_name", "location")


@admin.register(AdminMessage)
class AdminMessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "recipient_machine_owner", "machine_request", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("message", "recipient_machine_owner__username", "machine_request__title")
