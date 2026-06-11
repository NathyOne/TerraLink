from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_machine_plate_type_optional_rates"),
    ]

    operations = [
        migrations.AlterField(
            model_name="machine",
            name="name",
            field=models.CharField(blank=True, default="", max_length=160),
        ),
        migrations.AlterField(
            model_name="machine",
            name="location",
            field=models.CharField(blank=True, default="", max_length=160),
        ),
    ]
