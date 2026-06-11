from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import AdminMessage, ConstructionMaterial, Machine, MachineAssignment, MachineRequest, User


class Command(BaseCommand):
    help = "Seed TerraLink demo users, machines, requests, messages, assignments, and materials."

    def handle(self, *args, **options):
        UserModel = get_user_model()

        def upsert_user(username, email, password, role, phone_number, is_staff=False, is_superuser=False):
            user, _ = UserModel.objects.update_or_create(
                username=username,
                defaults={
                    "email": email,
                    "role": role,
                    "phone_number": phone_number,
                    "is_staff": is_staff,
                    "is_superuser": is_superuser,
                    "is_active": True,
                },
            )
            user.set_password(password)
            user.save()
            return user

        admin = upsert_user(
            "admin",
            "admin@terralink.dev",
            "AdminPass123!",
            User.Role.ADMIN,
            "+1-202-555-0100",
            is_staff=True,
            is_superuser=True,
        )
        client = upsert_user(
            "buildco",
            "client@terralink.dev",
            "ClientPass123!",
            User.Role.CONSTRUCTION_OWNER,
            "+1-202-555-0110",
        )
        client_two = upsert_user(
            "metrobuild",
            "metro@terralink.dev",
            "ClientPass123!",
            User.Role.CONSTRUCTION_OWNER,
            "+1-202-555-0111",
        )
        owner_one = upsert_user(
            "atlasmachines",
            "owner@terralink.dev",
            "OwnerPass123!",
            User.Role.MACHINE_OWNER,
            "+1-202-555-0120",
        )
        owner_two = upsert_user(
            "ironyard",
            "ironyard@terralink.dev",
            "OwnerPass123!",
            User.Role.MACHINE_OWNER,
            "+1-202-555-0121",
        )

        excavator, _ = Machine.objects.update_or_create(
            owner=owner_one,
            name="CAT 320 Excavator",
            defaults={
                "plate_number": "TX-EX-320",
                "machine_type": "Excavator",
                "description": "Medium excavator for trenching, foundation, and earthmoving work.",
                "location": "Austin, TX",
                "hourly_rate": 155,
                "daily_rate": 980,
                "availability_status": Machine.AvailabilityStatus.AVAILABLE,
            },
        )
        bulldozer, _ = Machine.objects.update_or_create(
            owner=owner_one,
            name="Komatsu D65 Bulldozer",
            defaults={
                "plate_number": "TX-BD-065",
                "machine_type": "Bulldozer",
                "description": "Tracked dozer for grading, clearing, and site preparation.",
                "location": "San Antonio, TX",
                "hourly_rate": 190,
                "daily_rate": 1240,
                "availability_status": Machine.AvailabilityStatus.MAINTENANCE,
            },
        )
        crane, _ = Machine.objects.update_or_create(
            owner=owner_two,
            name="Liebherr Mobile Crane",
            defaults={
                "plate_number": "TX-CR-500",
                "machine_type": "Crane",
                "description": "Mobile crane suitable for commercial lifting and placement.",
                "location": "Austin, TX",
                "hourly_rate": 260,
                "daily_rate": 1850,
                "availability_status": Machine.AvailabilityStatus.AVAILABLE,
            },
        )
        loader, _ = Machine.objects.update_or_create(
            owner=owner_two,
            name="Volvo Wheel Loader",
            defaults={
                "plate_number": "TX-LD-270",
                "machine_type": "Loader",
                "description": "Wheel loader for aggregate handling and material movement.",
                "location": "Addis Ababa",
                "hourly_rate": 140,
                "daily_rate": 900,
                "availability_status": Machine.AvailabilityStatus.BUSY,
            },
        )

        today = date.today()
        request_one, _ = MachineRequest.objects.update_or_create(
            requested_by=client,
            title="Foundation excavation for warehouse",
            defaults={
                "request_category": MachineRequest.RequestCategory.EQUIPMENT,
                "requested_item_type": "Excavator",
                "quantity": 1,
                "description": "Excavation support needed for a warehouse foundation and utility trenches.",
                "location": "Austin, TX",
                "required_machine_type": "Excavator",
                "expected_start_date": today + timedelta(days=7),
                "expected_end_date": today + timedelta(days=12),
                "budget": 7600,
                "status": MachineRequest.Status.CONTACTED,
                "admin_notes": "Atlas Machines has an available excavator in the target area.",
            },
        )
        request_two, _ = MachineRequest.objects.update_or_create(
            requested_by=client_two,
            title="Lift HVAC units to roof deck",
            defaults={
                "request_category": MachineRequest.RequestCategory.EQUIPMENT,
                "requested_item_type": "Crane",
                "quantity": 1,
                "description": "Crane support needed for rooftop HVAC placement on a commercial renovation.",
                "location": "Austin, TX",
                "required_machine_type": "Crane",
                "expected_start_date": today + timedelta(days=14),
                "expected_end_date": today + timedelta(days=16),
                "budget": 5900,
                "status": MachineRequest.Status.PENDING,
                "admin_notes": "",
            },
        )
        request_three, _ = MachineRequest.objects.update_or_create(
            requested_by=client,
            title="Site grading for access road",
            defaults={
                "request_category": MachineRequest.RequestCategory.EQUIPMENT,
                "requested_item_type": "Bulldozer",
                "quantity": 1,
                "description": "Dozer needed for grading and compaction preparation along access road.",
                "location": "San Antonio, TX",
                "required_machine_type": "Bulldozer",
                "expected_start_date": today + timedelta(days=21),
                "expected_end_date": today + timedelta(days=29),
                "budget": 9400,
                "status": MachineRequest.Status.REVIEWING,
                "admin_notes": "Maintenance status needs confirmation before contacting owner.",
            },
        )
        MachineRequest.objects.update_or_create(
            requested_by=client_two,
            title="Dangote Cement delivery for apartment slab",
            defaults={
                "request_category": MachineRequest.RequestCategory.MATERIAL,
                "requested_item_type": "Dangote Cement",
                "quantity": 250,
                "description": "Dangote Cement bags needed before slab casting starts.",
                "location": "Dallas, TX",
                "required_machine_type": "",
                "expected_start_date": today + timedelta(days=10),
                "expected_end_date": today + timedelta(days=10),
                "budget": 0,
                "status": MachineRequest.Status.PENDING,
                "admin_notes": "",
            },
        )

        MachineAssignment.objects.update_or_create(
            machine_request=request_one,
            machine=excavator,
            defaults={
                "machine_owner": owner_one,
                "assigned_by": admin,
                "status": MachineAssignment.Status.PROPOSED,
            },
        )

        AdminMessage.objects.update_or_create(
            sender=admin,
            recipient_machine_owner=owner_one,
            machine_request=request_one,
            defaults={
                "message": "Please confirm whether the CAT 320 Excavator is available next week for an Austin foundation excavation.",
                "is_read": False,
            },
        )
        AdminMessage.objects.update_or_create(
            sender=admin,
            recipient_machine_owner=owner_two,
            machine_request=request_two,
            defaults={
                "message": "We have an upcoming Austin crane request. Please share availability and mobilization details.",
                "is_read": True,
            },
        )

        materials = [
            ("National Cement", "Ethiopian cement supply in standard bags", "bag", 740, "National Cement Supplier", "Addis Ababa", 1800),
            ("Mugar Cement", "Ethiopian cement supply in standard bags", "bag", 735, "Mugar Cement Supplier", "Addis Ababa", 1450),
            ("Dangote Cement", "Ethiopian cement supply in standard bags", "bag", 750, "Dangote Cement Supplier", "Oromia", 2200),
            ("Habesha Cement", "Ethiopian cement supply in standard bags", "bag", 745, "Habesha Cement Supplier", "Addis Ababa", 1600),
            ("Gypsum Board", "Interior partition and ceiling gypsum board", "sheet", 620, "Finishing Materials Depot", "Addis Ababa", 900),
            ("Gypsum Powder", "Gypsum powder for plaster and finishing work", "bag", 510, "Finishing Materials Depot", "Addis Ababa", 700),
            ("Steel Bars", "Reinforcement and structural steel bars", "ton", 78500, "Addis Steel Supply", "Addis Ababa", 62),
            ("Wire Mesh", "Steel wire mesh for slab and concrete reinforcement", "roll", 3200, "Addis Steel Supply", "Addis Ababa", 180),
            ("Hollow Concrete Blocks", "HCB walling blocks for building construction", "piece", 42, "Block Works Supplier", "Addis Ababa", 12000),
            ("Ready-mix concrete", "4000 PSI concrete mix", "m3", 138, "Lone Star Concrete", "Austin, TX", 320),
            ("Rebar grade 60", "Standard reinforcing steel", "ton", 720, "Metro Steel Supply", "Dallas, TX", 95),
            ("Crushed limestone", "Road base aggregate", "truckload", 540, "Hill Country Aggregates", "San Antonio, TX", 48),
            ("Formwork panels", "Reusable modular wall panels", "piece", 42, "BuildPro Materials", "Austin, TX", 1200),
        ]
        for name, description, unit_type, price, supplier, location, quantity in materials:
            ConstructionMaterial.objects.update_or_create(
                name=name,
                supplier_name=supplier,
                defaults={
                    "description": description,
                    "unit_type": unit_type,
                    "price_per_unit": price,
                    "location": location,
                    "quantity_available": quantity,
                    "admin_only": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("TerraLink demo data seeded."))
        self.stdout.write("Admin: admin / AdminPass123!")
        self.stdout.write("Construction owner: buildco / ClientPass123!")
        self.stdout.write("Machine owner: atlasmachines / OwnerPass123!")
