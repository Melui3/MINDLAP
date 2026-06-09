from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import RaceWeekend
from .serializers import RaceWeekendSerializer
from utils import get_default_user


@api_view(["GET"])
@permission_classes([AllowAny])
def sessions_list(request):
    target = get_default_user(request)

    qs = (
        RaceWeekend.objects
        .filter(sessions__result__pilot=target)
        .distinct()
        .order_by("season", "round")
    )

    return Response(RaceWeekendSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def next_race(request):
    today = timezone.localdate()
    wk = RaceWeekend.objects.filter(start_date__gte=today).order_by("start_date").first()
    return Response(RaceWeekendSerializer(wk).data if wk else None)
