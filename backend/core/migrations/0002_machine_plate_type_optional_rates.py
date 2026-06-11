from decimal import Decimal

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="machine",
            name="plate_number",
            field=models.CharField(blank=True, db_index=True, max_length=64),
        ),
        migrations.AlterField(
            model_name="machine",
            name="machine_type",
            field=models.CharField(
                choices=[
                    ("Excavator", "Excavator"),
                    ("Bulldozer", "Bulldozer"),
                    ("Loader", "Loader"),
                    ("Crane", "Crane"),
                    ("Dump Truck", "Dump Truck"),
                    ("Grader", "Grader"),
                    ("Roller", "Roller"),
                    ("Backhoe", "Backhoe"),
                    ("Forklift", "Forklift"),
                    ("Concrete Mixer", "Concrete Mixer"),
                    ("Other", "Other"),
                ],
                max_length=120,
            ),
        ),
        migrations.AlterField(
            model_name="machine",
            name="hourly_rate",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                default=Decimal("0"),
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal("0"))],
            ),
        ),
        migrations.AlterField(
            model_name="machine",
            name="daily_rate",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                default=Decimal("0"),
                max_digits=12,
                validators=[django.core.validators.MinValueValidator(Decimal("0"))],
            ),
        ),
    ]
