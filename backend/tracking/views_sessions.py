from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import RaceWeekend
from .serializers import RaceWeekendSerializer

User = get_user_model()


def resolve_target_user(request):
    u = request.user
    if u.is_staff:
        as_username = request.query_params.get("as")
        if as_username:
            try:
                return User.objects.get(username=as_username)
            except User.DoesNotExist:
                return u
    return u


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sessions_list(request):
    target = resolve_target_user(request)

    qs = (
        RaceWeekend.objects
        .filter(sessions__result__pilot=target)
        .distinct()
        .order_by("season", "round")
    )

    return Response(RaceWeekendSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def next_race(request):
    today = timezone.localdate()
    wk = RaceWeekend.objects.filter(start_date__gte=today).order_by("start_date").first()
    return Response(RaceWeekendSerializer(wk).data if wk else None)