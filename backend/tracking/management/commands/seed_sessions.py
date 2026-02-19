import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from tracking.models import Circuit, RaceWeekend, Session, SessionResult, ChampionshipSnapshot

User = get_user_model()


def lap_ms(minutes, seconds, millis):
    return minutes * 60000 + seconds * 1000 + millis


class Command(BaseCommand):
    help = "Seed circuits + race weekends + sessions + results (fake data)"

    def add_arguments(self, parser):
        parser.add_argument("--season", type=int, default=2026)
        parser.add_argument("--pilot", type=str, default="noah")
        parser.add_argument("--rounds", type=int, default=24)
        parser.add_argument("--start", type=str, default="2026-03-01")
        parser.add_argument("--wipe", action="store_true", help="Wipe existing season data (safe for local dev)")

    def handle(self, *args, **opts):
        season = opts["season"]
        pilot_username = opts["pilot"]
        rounds = opts["rounds"]
        start_str = opts["start"]
        wipe = opts["wipe"]

        pilot = User.objects.filter(username=pilot_username).first()
        if not pilot:
            self.stdout.write(self.style.ERROR(f"Pilot user '{pilot_username}' not found. Create it first."))
            return

        circuits = [
            ("bahrain", "Bahrain International Circuit", "Bahrain", "Sakhir", 5.412, 57),
            ("jeddah", "Jeddah Corniche Circuit", "Saudi Arabia", "Jeddah", 6.174, 50),
            ("melbourne", "Albert Park Circuit", "Australia", "Melbourne", 5.278, 58),
            ("suzuka", "Suzuka", "Japan", "Suzuka", 5.807, 53),
            ("shanghai", "Shanghai International Circuit", "China", "Shanghai", 5.451, 56),
            ("miami", "Miami International Autodrome", "USA", "Miami", 5.412, 57),
            ("imola", "Imola", "Italy", "Imola", 4.909, 63),
            ("monaco", "Circuit de Monaco", "Monaco", "Monte-Carlo", 3.337, 78),
            ("montreal", "Circuit Gilles-Villeneuve", "Canada", "Montreal", 4.361, 70),
            ("barcelona", "Circuit de Barcelona-Catalunya", "Spain", "Barcelona", 4.657, 66),
            ("spielberg", "Red Bull Ring", "Austria", "Spielberg", 4.318, 71),
            ("silverstone", "Silverstone", "United Kingdom", "Silverstone", 5.891, 52),
            ("hungaroring", "Hungaroring", "Hungary", "Mogyoród", 4.381, 70),
            ("spa", "Spa-Francorchamps", "Belgium", "Stavelot", 7.004, 44),
            ("zandvoort", "Zandvoort", "Netherlands", "Zandvoort", 4.259, 72),
            ("monza", "Monza", "Italy", "Monza", 5.793, 53),
            ("baku", "Baku City Circuit", "Azerbaijan", "Baku", 6.003, 51),
            ("singapore", "Marina Bay Street Circuit", "Singapore", "Singapore", 4.940, 62),
            ("austin", "Circuit of the Americas", "USA", "Austin", 5.513, 56),
            ("mexico", "Autódromo Hermanos Rodríguez", "Mexico", "Mexico City", 4.304, 71),
            ("interlagos", "Interlagos", "Brazil", "São Paulo", 4.309, 71),
            ("lasvegas", "Las Vegas Strip Circuit", "USA", "Las Vegas", 6.201, 50),
            ("lusail", "Lusail International Circuit", "Qatar", "Lusail", 5.419, 57),
            ("abudhabi", "Yas Marina Circuit", "UAE", "Abu Dhabi", 5.281, 58),
        ]

        # Create/update circuits
        circuit_objs = []
        for slug, name, country, city, length_km, laps in circuits:
            obj, _ = Circuit.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "country": country, "city": city, "length_km": length_km, "laps": laps},
            )
            obj.name = name
            obj.country = country
            obj.city = city
            obj.length_km = length_km
            obj.laps = laps
            obj.save()
            circuit_objs.append(obj)

        y, m, d = map(int, start_str.split("-"))
        current = date(y, m, d)

        if wipe:
            SessionResult.objects.filter(pilot=pilot, session__weekend__season=season).delete()
            ChampionshipSnapshot.objects.filter(pilot=pilot, weekend__season=season).delete()
            Session.objects.filter(weekend__season=season).delete()
            RaceWeekend.objects.filter(season=season).delete()

        total_points = 0

        for rnd in range(1, rounds + 1):
            circuit = circuit_objs[(rnd - 1) % len(circuit_objs)]
            gp_name = f"{circuit.country} Grand Prix"

            wk, _ = RaceWeekend.objects.get_or_create(
                season=season,
                round=rnd,
                defaults={"gp_name": gp_name, "start_date": current, "circuit": circuit},
            )
            wk.gp_name = gp_name
            wk.start_date = current
            wk.circuit = circuit
            wk.save()

            # sessions
            sessions = {}
            for t in ["FP1", "FP2", "FP3", "Q", "R"]:
                s, _ = Session.objects.get_or_create(weekend=wk, type=t)
                sessions[t] = s

            # practice + quali lap base
            base = random.randint(87500, 92500)  # 1:27–1:32

            # FP results
            for t in ["FP1", "FP2", "FP3"]:
                SessionResult.objects.update_or_create(
                    session=sessions[t],
                    defaults={
                        "pilot": pilot,
                        "position": random.randint(2, 12),
                        "best_lap_ms": base + random.randint(-900, 1400),
                        "laps": random.randint(18, 30),
                        "status": "Finished",
                        "points": 0,
                        "notes": "Standard training day.",
                    },
                )

            q_pos = random.randint(1, 6)
            SessionResult.objects.update_or_create(
                session=sessions["Q"],
                defaults={
                    "pilot": pilot,
                    "position": q_pos,
                    "best_lap_ms": base + random.randint(-1400, 700),
                    "laps": random.randint(10, 16),
                    "status": "Finished",
                    "points": 0,
                    "notes": "Qualifying run.",
                },
            )

            race_pos = max(1, min(20, q_pos + random.randint(-2, 3)))
            points_map = {1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1}
            pts = points_map.get(race_pos, 0)
            total_points += pts

            SessionResult.objects.update_or_create(
                session=sessions["R"],
                defaults={
                    "pilot": pilot,
                    "position": race_pos,
                    "best_lap_ms": None,
                    "laps": circuit.laps or 50,
                    "status": "Finished",
                    "points": pts,
                    "notes": "Race completed.",
                },
            )

            # crude championship snapshot
            wdc_pos = 1 if total_points >= rnd * 14 else 2
            gap = 0 if wdc_pos == 1 else max(0, (rnd * 14) - total_points)

            ChampionshipSnapshot.objects.update_or_create(
                weekend=wk,
                defaults={"pilot": pilot, "position": wdc_pos, "points": total_points, "gap_to_p1": gap},
            )

            current = current + timedelta(days=14)

        self.stdout.write(self.style.SUCCESS(f"Seeded sessions: season={season} rounds={rounds} pilot={pilot_username}"))