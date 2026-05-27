from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import CheckIn, PilotProfile
from .serializers import CheckInSerializer, PilotProfileSerializer
from utils import get_default_user


class PilotProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PilotProfileSerializer

    def get_object(self):
        user = get_default_user()
        profile, _ = PilotProfile.objects.get_or_create(
            user=user,
            defaults={"alias": f"{user.username}_pilot"}
        )
        return profile


class CheckInListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CheckInSerializer

    def get_queryset(self):
        return CheckIn.objects.filter(user=get_default_user())

    def perform_create(self, serializer):
        serializer.save(user=get_default_user())


class CheckInDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = CheckInSerializer

    def get_queryset(self):
        return CheckIn.objects.filter(user=get_default_user())
