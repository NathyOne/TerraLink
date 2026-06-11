from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0004_machinerequest_quantity_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="constructionmaterial",
            name="unit_type",
            field=models.CharField(
                choices=[
                    ("m3", "m3"),
                    ("kg", "kg"),
                    ("bag", "Bag"),
                    ("quintal", "Quintal"),
                    ("ton", "Ton"),
                    ("truckload", "Truckload"),
                    ("piece", "Piece"),
                    ("meter", "Meter"),
                    ("sheet", "Sheet"),
                    ("roll", "Roll"),
                    ("liter", "Liter"),
                ],
                max_length=24,
            ),
        ),
    ]
