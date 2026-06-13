import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from core.models import User


class Command(BaseCommand):
    help = "Create or update the initial TerraLink admin from environment variables."

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_ADMIN_USERNAME")
        password = os.getenv("DJANGO_ADMIN_PASSWORD")
        email = os.getenv("DJANGO_ADMIN_EMAIL", "")
        phone_number = os.getenv("DJANGO_ADMIN_PHONE", "")

        if not username or not password:
            raise CommandError("Set DJANGO_ADMIN_USERNAME and DJANGO_ADMIN_PASSWORD before running this command.")

        UserModel = get_user_model()
        user, created = UserModel.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "role": User.Role.ADMIN,
                "phone_number": phone_number,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        user.email = email or user.email
        user.phone_number = phone_number or user.phone_number
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} initial admin '{username}'."))
