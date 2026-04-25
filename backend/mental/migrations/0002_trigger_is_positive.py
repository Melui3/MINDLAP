from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mental", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="trigger",
            name="is_positive",
            field=models.BooleanField(default=False),
        ),
    ]
