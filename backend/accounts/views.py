from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")
        email = request.data.get("email", "").strip()

        if not username or not password:
            return Response({"detail": "Username et mot de passe requis."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Ce nom d'utilisateur est déjà pris."}, status=400)

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"detail": e.messages[0]}, status=400)

        User.objects.create_user(username=username, password=password, email=email)
        return Response({"detail": "Compte créé. Tu peux maintenant te connecter."}, status=201)
