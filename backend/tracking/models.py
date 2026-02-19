from django.conf import settings
from django.db import models
from django.utils import timezone

class PilotProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="pilot_profile")
    alias = models.CharField(max_length=40, unique=True)
    timezone = models.CharField(max_length=64, default="Europe/Paris")
    goals = models.JSONField(default=dict, blank=True)  # ex: {"focus": true, "sleep": true}
    team = models.CharField(max_length=60, default="Scuderia Ferrari")
    driver_number = models.CharField(max_length=4, blank=True, default="16")
    nationality = models.CharField(max_length=40, blank=True, default="NL")
    age = models.PositiveSmallIntegerField(default=24)
    avatar_url = models.URLField(blank=True, default="")
    bio = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.alias


class CheckIn(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="checkins")
    date = models.DateField(default=timezone.localdate)
    admin_comment = models.TextField(blank=True, default="")
    focus = models.PositiveSmallIntegerField()
    stress = models.PositiveSmallIntegerField()
    confidence = models.PositiveSmallIntegerField()
    fatigue = models.PositiveSmallIntegerField()
    sleep = models.PositiveSmallIntegerField()

    tags = models.JSONField(default=list, blank=True)   # ex: ["work", "training"]
    notes = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.username} - {self.date}"
    
class Circuit(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    country = models.CharField(max_length=80, blank=True)
    city = models.CharField(max_length=80, blank=True)
    length_km = models.DecimalField(max_digits=5, decimal_places=3, null=True, blank=True)
    laps = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class RaceWeekend(models.Model):
    season = models.PositiveIntegerField(default=2026)
    round = models.PositiveIntegerField()
    gp_name = models.CharField(max_length=120)
    start_date = models.DateField()
    circuit = models.ForeignKey(Circuit, on_delete=models.PROTECT, related_name="weekends")

    class Meta:
        unique_together = ("season", "round")
        ordering = ["season", "round"]

    def __str__(self):
        return f"{self.season} R{self.round} - {self.gp_name}"


class Session(models.Model):
    TYPES = (
        ("FP1", "Free Practice 1"),
        ("FP2", "Free Practice 2"),
        ("FP3", "Free Practice 3"),
        ("Q", "Qualifying"),
        ("R", "Race"),
    )

    weekend = models.ForeignKey(RaceWeekend, on_delete=models.CASCADE, related_name="sessions")
    type = models.CharField(max_length=3, choices=TYPES)

    class Meta:
        unique_together = ("weekend", "type")

    def __str__(self):
        return f"{self.weekend} {self.type}"


class SessionResult(models.Model):
    session = models.OneToOneField(Session, on_delete=models.CASCADE, related_name="result")
    pilot = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    position = models.PositiveIntegerField(null=True, blank=True)
    best_lap_ms = models.PositiveIntegerField(null=True, blank=True)
    laps = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(max_length=50, default="Finished")
    points = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.session} P{self.position}"


class ChampionshipSnapshot(models.Model):
    weekend = models.OneToOneField(RaceWeekend, on_delete=models.CASCADE, related_name="wdc")
    pilot = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    position = models.PositiveIntegerField()
    points = models.DecimalField(max_digits=6, decimal_places=2)
    gap_to_p1 = models.DecimalField(max_digits=6, decimal_places=2, default=0)