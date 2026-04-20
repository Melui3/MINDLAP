from django.urls import path
from .views import TriggerListView, TriggerDetailView, TriggerLogListView, TriggerLogDetailView, StatsView

urlpatterns = [
    path("mental/triggers/", TriggerListView.as_view()),
    path("mental/triggers/<int:pk>/", TriggerDetailView.as_view()),
    path("mental/logs/", TriggerLogListView.as_view()),
    path("mental/logs/<int:pk>/", TriggerLogDetailView.as_view()),
    path("mental/stats/", StatsView.as_view()),
]
