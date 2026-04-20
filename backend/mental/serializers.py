from rest_framework import serializers
from .models import Trigger, TriggerLog


class TriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trigger
        fields = ["id", "name", "category", "description", "examples", "reaction", "tools", "is_default", "user"]
        read_only_fields = ["id", "is_default", "user"]


class TriggerLogSerializer(serializers.ModelSerializer):
    trigger_name = serializers.CharField(source="trigger.name", read_only=True)
    trigger_category = serializers.CharField(source="trigger.category", read_only=True)

    class Meta:
        model = TriggerLog
        fields = ["id", "trigger", "trigger_name", "trigger_category", "intensity", "notes", "tool_used", "logged_at"]
        read_only_fields = ["id", "logged_at", "trigger_name", "trigger_category"]
