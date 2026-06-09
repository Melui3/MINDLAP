from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count, Avg

from .models import Trigger, TriggerLog
from .serializers import TriggerSerializer, TriggerLogSerializer
from utils import get_default_user, is_demo_request


class TriggerListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = get_default_user(request)
        if is_demo_request(request):
            triggers = Trigger.objects.filter(user=user)
        else:
            triggers = Trigger.objects.filter(Q(is_default=True) | Q(user=user))
        return Response(TriggerSerializer(triggers, many=True).data)

    def post(self, request):
        s = TriggerSerializer(data=request.data)
        if s.is_valid():
            s.save(user=get_default_user(request), is_default=False)
            return Response(s.data, status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class TriggerDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            t = Trigger.objects.get(pk=pk, user=get_default_user(request))
        except Trigger.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        t.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TriggerLogListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = get_default_user(request)
        logs = TriggerLog.objects.filter(user=user).select_related("trigger")
        return Response(TriggerLogSerializer(logs, many=True).data)

    def post(self, request):
        s = TriggerLogSerializer(data=request.data)
        if s.is_valid():
            s.save(user=get_default_user(request))
            return Response(s.data, status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


class TriggerLogDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            log = TriggerLog.objects.get(pk=pk, user=get_default_user(request))
        except TriggerLog.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        log.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = get_default_user(request)
        logs = TriggerLog.objects.filter(user=user).select_related("trigger")
        total = logs.count()
        avg_intensity = logs.aggregate(avg=Avg("intensity"))["avg"]

        top_triggers = list(
            logs.values("trigger__id", "trigger__name", "trigger__category")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        return Response({
            "total": total,
            "avg_intensity": round(avg_intensity, 1) if avg_intensity else None,
            "top_triggers": top_triggers,
        })
