from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from tracking.models import CheckIn

User = get_user_model()


def _target_user(request):
    if request.user.is_staff:
        username = request.query_params.get("as")
        if username:
            try:
                return User.objects.get(username=username)
            except User.DoesNotExist:
                return request.user
    return request.user


def risk_index(avg):
    # MRI = stress*0.4 + fatigue*0.3 - confidence*0.2 - focus*0.1 - sleep*0.05
    if not avg:
        return None
    stress = avg.get("stress") or 0
    fatigue = avg.get("fatigue") or 0
    confidence = avg.get("confidence") or 0
    focus = avg.get("focus") or 0
    sleep = avg.get("sleep") or 0
    mri = (stress * 0.4) + (fatigue * 0.3) - (confidence * 0.2) - (focus * 0.1) - (sleep * 0.05)
    return round(mri, 2)


class SummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rng = int(request.query_params.get("range", "7"))
        rng = 7 if rng not in (7, 30, 90) else rng

        today = timezone.localdate()
        start = today - timedelta(days=rng - 1)

        target = _target_user(request)
        qs = CheckIn.objects.filter(user=target, date__range=(start, today))

        avg = qs.aggregate(
            focus=Avg("focus"),
            stress=Avg("stress"),
            confidence=Avg("confidence"),
            fatigue=Avg("fatigue"),
            sleep=Avg("sleep"),
        )

        return Response({
            "range_days": rng,
            "from": str(start),
            "to": str(today),
            "count": qs.count(),
            "averages": {k: (round(v, 2) if v is not None else None) for k, v in avg.items()},
            "mental_risk_index": risk_index(avg),
        })