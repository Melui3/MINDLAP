import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from tracking.models import PilotProfile, CheckIn

User = get_user_model()


class Command(BaseCommand):
    help = "Seed MINDLAP with fake pilot data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating Noah Van Rijck...")

        user, created = User.objects.get_or_create(
            username="noah",
            defaults={
                "email": "noah@mindlap.app"
            }
        )

        if created:
            user.set_password("noah1234")
            user.save()

        profile, _ = PilotProfile.objects.get_or_create(
            user=user,
            defaults={
                "alias": "Noah Van Rijck",
                "goals": {
                    "focus": True,
                    "stress_control": True,
                    "sleep_optimization": True
                }
            }
        )

        today = timezone.localdate()

        # Supprime anciennes données pour éviter doublons
        CheckIn.objects.filter(user=user).delete()

        for i in range(90):
            date = today - timedelta(days=i)

            # Variation type week-end GP
            weekend_boost = 10 if date.weekday() in (5, 6) else 0

            focus = min(100, int(random.gauss(85, 5)))
            stress = min(100, max(20, int(random.gauss(45 + weekend_boost, 10))))
            confidence = min(100, int(random.gauss(90, 4)))
            fatigue = min(100, max(20, int(random.gauss(40 + i * 0.2, 8))))
            sleep = min(100, max(30, int(random.gauss(80 - weekend_boost, 6))))

            CheckIn.objects.create(
                user=user,
                date=date,
                focus=focus,
                stress=stress,
                confidence=confidence,
                fatigue=fatigue,
                sleep=sleep,
                tags=["race_weekend"] if weekend_boost else ["training"],
                notes="Race pressure managed." if weekend_boost else "Standard training day."
            )

        self.stdout.write(self.style.SUCCESS("Noah Van Rijck seeded successfully."))