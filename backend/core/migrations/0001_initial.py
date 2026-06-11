from django.conf import settings
import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
import decimal
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("username", models.CharField(error_messages={"unique": "A user with that username already exists."}, help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.", max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name="username")),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("email", models.EmailField(blank=True, max_length=254, verbose_name="email address")),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("role", models.CharField(choices=[("admin", "Admin"), ("construction_owner", "Construction Owner"), ("machine_owner", "Machine Owner")], default="construction_owner", max_length=32)),
                ("phone_number", models.CharField(blank=True, max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={
                "verbose_name": "user",
                "verbose_name_plural": "users",
                "abstract": False,
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="ConstructionMaterial",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("description", models.TextField(blank=True)),
                ("unit_type", models.CharField(choices=[("m3", "m3"), ("kg", "kg"), ("ton", "Ton"), ("truckload", "Truckload"), ("piece", "Piece"), ("meter", "Meter")], max_length=24)),
                ("price_per_unit", models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0"))])),
                ("supplier_name", models.CharField(max_length=160)),
                ("location", models.CharField(max_length=160)),
                ("quantity_available", models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0"))])),
                ("admin_only", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Machine",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=160)),
                ("machine_type", models.CharField(max_length=120)),
                ("description", models.TextField(blank=True)),
                ("location", models.CharField(max_length=160)),
                ("hourly_rate", models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0"))])),
                ("daily_rate", models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0"))])),
                ("availability_status", models.CharField(choices=[("available", "Available"), ("busy", "Busy"), ("maintenance", "Maintenance"), ("unavailable", "Unavailable")], default="available", max_length=24)),
                ("image", models.ImageField(blank=True, null=True, upload_to="machines/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="machines", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="MachineRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=180)),
                ("description", models.TextField()),
                ("location", models.CharField(max_length=160)),
                ("required_machine_type", models.CharField(max_length=120)),
                ("expected_start_date", models.DateField()),
                ("expected_end_date", models.DateField()),
                ("budget", models.DecimalField(decimal_places=2, max_digits=12, validators=[django.core.validators.MinValueValidator(decimal.Decimal("0"))])),
                ("status", models.CharField(choices=[("pending", "Pending"), ("reviewing", "Reviewing"), ("contacted", "Contacted"), ("assigned", "Assigned"), ("completed", "Completed"), ("cancelled", "Cancelled")], default="pending", max_length=24)),
                ("admin_notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("requested_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="machine_requests", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="AdminMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("is_read", models.BooleanField(default=False)),
                ("machine_request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="admin_messages", to="core.machinerequest")),
                ("recipient_machine_owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="admin_messages", to=settings.AUTH_USER_MODEL)),
                ("sender", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sent_admin_messages", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="MachineAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("proposed", "Proposed"), ("accepted", "Accepted"), ("rejected", "Rejected"), ("active", "Active"), ("completed", "Completed")], default="proposed", max_length=24)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("assigned_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assignments_created", to=settings.AUTH_USER_MODEL)),
                ("machine", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignments", to="core.machine")),
                ("machine_owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="machine_assignments", to=settings.AUTH_USER_MODEL)),
                ("machine_request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assignments", to="core.machinerequest")),
            ],
            options={"ordering": ["-created_at"], "unique_together": {("machine_request", "machine")}},
        ),
    ]
