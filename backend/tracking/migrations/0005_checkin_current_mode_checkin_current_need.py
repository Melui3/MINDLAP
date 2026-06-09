# Generated manually on 2026-06-09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0004_circuit_raceweekend_championshipsnapshot_session_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="checkin",
            name="current_mode",
            field=models.CharField(
                blank=True,
                choices=[
                    ("stable", "Stable"),
                    ("surcharge", "Surcharge"),
                    ("fuite_scroll", "Fuite / scroll"),
                    ("analyse_intense", "Analyse intense"),
                    ("vide_extinction", "Vide / extinction"),
                    ("elan_creatif", "Elan creatif"),
                    ("passion_vivant", "Passion / vivant"),
                ],
                default="",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="checkin",
            name="current_need",
            field=models.CharField(
                blank=True,
                choices=[
                    ("repos", "repos"),
                    ("silence", "silence"),
                    ("parler", "parler"),
                    ("creer", "creer"),
                    ("bouger", "bouger"),
                    ("manger_boire", "manger/boire"),
                    ("etre_rassure", "etre rassure"),
                    ("juste_tenir", "juste tenir"),
                ],
                default="",
                max_length=32,
            ),
        ),
    ]
