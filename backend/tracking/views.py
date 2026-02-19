from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import CheckIn, PilotProfile
from .serializers import CheckInSerializer, PilotProfileSerializer

User = get_user_model()


def _target_user(request):
    """
    User normal -> lui-même
    Staff -> peut cibler ?as=username
    """
    if request.user.is_staff:
        username = request.query_params.get("as")
        if username:
            try:
                return User.objects.get(username=username)
            except User.DoesNotExist:
                return request.user
    return request.user


class PilotProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PilotProfileSerializer

    def get_object(self):
        target = _target_user(self.request)
        profile, _ = PilotProfile.objects.get_or_create(
            user=target,
            defaults={"alias": f"{target.username}_pilot"}
        )
        return profile


class CheckInListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CheckInSerializer

    def get_queryset(self):
        target = _target_user(self.request)
        return CheckIn.objects.filter(user=target)

    def perform_create(self, serializer):
        target = _target_user(self.request)
        serializer.save(user=target)


class CheckInDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CheckInSerializer

    def get_queryset(self):
        target = _target_user(self.request)
        return CheckIn.objects.filter(user=target)