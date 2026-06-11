from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        CONSTRUCTION_OWNER = "construction_owner", "Construction Owner"
        MACHINE_OWNER = "machine_owner", "Machine Owner"

    role = models.CharField(max_length=32, choices=Role.choices, default=Role.CONSTRUCTION_OWNER)
    phone_number = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_platform_admin(self):
        return self.role == self.Role.ADMIN or self.is_staff or self.is_superuser

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)


class Machine(models.Model):
    class MachineType(models.TextChoices):
        EXCAVATOR = "Excavator", "Excavator"
        BULLDOZER = "Bulldozer", "Bulldozer"
        LOADER = "Loader", "Loader"
        CRANE = "Crane", "Crane"
        DUMP_TRUCK = "Dump Truck", "Dump Truck"
        GRADER = "Grader", "Grader"
        ROLLER = "Roller", "Roller"
        BACKHOE = "Backhoe", "Backhoe"
        FORKLIFT = "Forklift", "Forklift"
        CONCRETE_MIXER = "Concrete Mixer", "Concrete Mixer"
        OTHER = "Other", "Other"

    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        BUSY = "busy", "Busy"
        MAINTENANCE = "maintenance", "Maintenance"
        UNAVAILABLE = "unavailable", "Unavailable"

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="machines", on_delete=models.CASCADE)
    name = models.CharField(max_length=160, blank=True, default="")
    plate_number = models.CharField(max_length=64, blank=True, db_index=True)
    machine_type = models.CharField(max_length=120, choices=MachineType.choices)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=160, blank=True, default="")
    hourly_rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"), blank=True, validators=[MinValueValidator(Decimal("0"))])
    daily_rate = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"), blank=True, validators=[MinValueValidator(Decimal("0"))])
    availability_status = models.CharField(
        max_length=24,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE,
    )
    image = models.ImageField(upload_to="machines/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        label = self.name or self.plate_number or "Machine"
        return f"{label} ({self.machine_type})"


class MachineRequest(models.Model):
    class RequestCategory(models.TextChoices):
        EQUIPMENT = "equipment", "Construction Equipment"
        MATERIAL = "material", "Construction Material"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        REVIEWING = "reviewing", "Reviewing"
        CONTACTED = "contacted", "Contacted"
        ASSIGNED = "assigned", "Assigned"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="machine_requests", on_delete=models.CASCADE)
    request_category = models.CharField(max_length=24, choices=RequestCategory.choices, default=RequestCategory.EQUIPMENT)
    requested_item_type = models.CharField(max_length=160, blank=True, default="")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    title = models.CharField(max_length=180, blank=True, default="")
    description = models.TextField(blank=True, default="")
    location = models.CharField(max_length=160, blank=True, default="")
    required_machine_type = models.CharField(max_length=120, blank=True, default="")
    expected_start_date = models.DateField()
    expected_end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"), blank=True, validators=[MinValueValidator(Decimal("0"))])
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        if self.title:
            return self.title
        item = self.requested_item_type or self.required_machine_type or "Request"
        return f"{self.get_request_category_display()}: {item}"


class MachineAssignment(models.Model):
    class Status(models.TextChoices):
        PROPOSED = "proposed", "Proposed"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"

    machine_request = models.ForeignKey(MachineRequest, related_name="assignments", on_delete=models.CASCADE)
    machine = models.ForeignKey(Machine, related_name="assignments", on_delete=models.CASCADE)
    machine_owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="machine_assignments", on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="assignments_created", on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PROPOSED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("machine_request", "machine")

    def save(self, *args, **kwargs):
        if self.machine_id:
            self.machine_owner = self.machine.owner
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.machine} -> {self.machine_request}"


class ConstructionMaterial(models.Model):
    class UnitType(models.TextChoices):
        CUBIC_METER = "m3", "m3"
        KILOGRAM = "kg", "kg"
        BAG = "bag", "Bag"
        QUINTAL = "quintal", "Quintal"
        TON = "ton", "Ton"
        TRUCKLOAD = "truckload", "Truckload"
        PIECE = "piece", "Piece"
        METER = "meter", "Meter"
        SHEET = "sheet", "Sheet"
        ROLL = "roll", "Roll"
        LITER = "liter", "Liter"

    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    unit_type = models.CharField(max_length=24, choices=UnitType.choices)
    price_per_unit = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    supplier_name = models.CharField(max_length=160)
    location = models.CharField(max_length=160)
    quantity_available = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0"))])
    admin_only = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class AdminMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sent_admin_messages", on_delete=models.CASCADE)
    recipient_machine_owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="admin_messages", on_delete=models.CASCADE)
    machine_request = models.ForeignKey(MachineRequest, related_name="admin_messages", on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Message to {self.recipient_machine_owner}"
