from django.contrib.auth import get_user_model
from django.conf import settings


OWNER_HEADER = "HTTP_X_MINDLAP_OWNER_KEY"


def _get_or_create_user(username, password):
    User = get_user_model()
    user = User.objects.filter(username=username).first()
    if user is None:
        user = User.objects.create_user(username=username, password=password)
    return user


def is_owner_request(request):
    owner_key = getattr(settings, "MINDLAP_OWNER_KEY", "")
    if not owner_key or request is None:
        return False
    return request.META.get(OWNER_HEADER) == owner_key


def get_default_user(request=None):
    demo_username = getattr(settings, "MINDLAP_DEMO_USERNAME", "demo")
    owner_username = getattr(settings, "MINDLAP_OWNER_USERNAME", "")

    if is_owner_request(request):
        User = get_user_model()
        if owner_username:
            return _get_or_create_user(owner_username, "owner-session")

        owner = User.objects.exclude(username=demo_username).order_by("id").first()
        if owner:
            return owner
        return _get_or_create_user("pilot", "owner-session")

    return _get_or_create_user(demo_username, "demo-session")
