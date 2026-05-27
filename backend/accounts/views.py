from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from utils import get_default_user


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        u = get_default_user()
        return Response({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
        })
