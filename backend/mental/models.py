from django.db import models
from django.contrib.auth.models import User


class Trigger(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE,
        null=True, blank=True, related_name="triggers"
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    examples = models.TextField(blank=True)
    reaction = models.TextField(blank=True)
    tools = models.JSONField(default=list)
    is_default = models.BooleanField(default=False)
    is_positive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.name} ({self.category})"


class TriggerLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trigger_logs")
    trigger = models.ForeignKey(Trigger, on_delete=models.CASCADE, related_name="logs")
    intensity = models.PositiveSmallIntegerField()
    notes = models.TextField(blank=True)
    tool_used = models.TextField(blank=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]

    def __str__(self):
        return f"{self.user.username} — {self.trigger.name} ({self.intensity}/5)"
