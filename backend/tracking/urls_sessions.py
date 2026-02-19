from django.urls import path
from .views_sessions import sessions_list, next_race

urlpatterns = [
    path("sessions/", sessions_list, name="sessions_list"),
    path("sessions/next/", next_race, name="sessions_next"),
]