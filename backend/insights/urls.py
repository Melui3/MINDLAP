from django.urls import path
from .views import SummaryView

urlpatterns = [
    path("insights/summary/", SummaryView.as_view(), name="insights_summary"),
]