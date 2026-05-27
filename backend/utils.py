from django.contrib.auth import get_user_model


def get_default_user():
    User = get_user_model()
    user = User.objects.first()
    if user is None:
        user = User.objects.create_user(username="pilot", password="no-login-needed")
    return user
