from rest_framework import serializers
from .models import PilotProfile, CheckIn, Circuit, RaceWeekend, Session, SessionResult, ChampionshipSnapshot

class PilotProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PilotProfile
        fields = ["id", "alias", "timezone", "goals", "created_at"]
        read_only_fields = ["id", "created_at"]
        fields = ["id","alias","timezone","goals","team","driver_number","nationality","age","avatar_url","bio","created_at"]

class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = [
            "id","date","focus","stress","confidence","fatigue","sleep",
            "tags","notes","admin_comment","created_at"
        ]
        read_only_fields = ["id","created_at"]

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and not request.user.is_staff:
            validated_data.pop("admin_comment", None)
        return super().update(instance, validated_data)

    def validate(self, data):
        # garde-fou 0-100
        for k in ["focus","stress","confidence","fatigue","sleep"]:
            v = data.get(k)
            if v is not None and not (0 <= v <= 100):
                raise serializers.ValidationError({k: "Doit être entre 0 et 100."})
        return data
    
def ms_to_laptime(ms):
    if ms is None:
        return None
    total = int(ms)
    minutes = total // 60000
    seconds = (total % 60000) / 1000
    return f"{minutes}:{seconds:06.3f}"


class CircuitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Circuit
        fields = ["id", "slug", "name", "country", "city", "length_km", "laps"]


class SessionResultSerializer(serializers.ModelSerializer):
    best_lap = serializers.SerializerMethodField()

    class Meta:
        model = SessionResult
        fields = ["position", "best_lap_ms", "best_lap", "laps", "status", "points", "notes"]

    def get_best_lap(self, obj):
        return ms_to_laptime(obj.best_lap_ms)


class SessionSerializer(serializers.ModelSerializer):
    result = SessionResultSerializer(read_only=True)

    class Meta:
        model = Session
        fields = ["id", "type", "result"]


class ChampionshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChampionshipSnapshot
        fields = ["position", "points", "gap_to_p1"]


class RaceWeekendSerializer(serializers.ModelSerializer):
    circuit = CircuitSerializer(read_only=True)
    sessions = SessionSerializer(many=True, read_only=True)
    wdc = ChampionshipSerializer(read_only=True)

    class Meta:
        model = RaceWeekend
        fields = ["id", "season", "round", "gp_name", "start_date", "circuit", "sessions", "wdc"]