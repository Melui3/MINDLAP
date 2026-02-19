from django.urls import path
from .views import PilotProfileView, CheckInListCreateView, CheckInDetailView
from .views_sessions import sessions_list, next_race

urlpatterns = [
    path("profile/", PilotProfileView.as_view(), name="pilot_profile"),
    path("checkins/", CheckInListCreateView.as_view(), name="checkins"),
    path("checkins/<int:pk>/", CheckInDetailView.as_view(), name="checkin_detail"),
    path("sessions/", sessions_list),
    path("sessions/next/", next_race),
]

