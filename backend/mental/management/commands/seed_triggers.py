from django.core.management.base import BaseCommand
from mental.models import Trigger

DEFAULTS = [
    {
        "name": "Chaîne de précurseurs",
        "category": "Surcharge",
        "description": "Pas un déclencheur externe — l'escalade interne qui signale que quelque chose se passe.",
        "examples": "Peut suivre n'importe lequel des autres déclencheurs",
        "reaction": "Perte d'envie > scroll > procrastination > 'ça sert à rien' généralisé > dissociation",
        "tools": [
            "Intervenir au niveau 1-2 — c'est la seule fenêtre facile",
            "Au niveau 2 : couper le scroll, faire 1 truc concret même minuscule",
            "Check bouffe : t'as mangé correctement ? Sinon c'est la priorité",
            "Nommer le niveau ('je suis à 2/5') — juste nommer réduit l'élan",
        ],
    },
    {
        "name": "Contenu miroir",
        "category": "Mémoire",
        "description": "Un personnage, une dynamique ou une situation qui ressemble à quelqu'un ou quelque chose du passé.",
        "examples": "TikTok mère/fille, RE relancé après 5 ans",
        "reaction": "Flash de souvenirs, dégoût, mini-dissociation passagère",
        "tools": [
            "Nommer ce qui vient de se passer ('c'est un écho, pas le présent')",
            "Pas obligé de finir la vidéo — quitter si nécessaire",
            "Écrire 1 phrase sur ce qui remonte, pas plus",
        ],
    },
    {
        "name": "Spirale 'insuffisant' post-échec",
        "category": "Estime",
        "description": "Une erreur ou résultat décevant déclenche une généralisation.",
        "examples": "Exam blanc raté, cerveau en 404 pendant révisions",
        "reaction": "Sentiment d'invalidité totale malgré les preuves contraires, rumination",
        "tools": [
            "Séparer les faits de l'interprétation : 'j'ai raté cet exercice' pas 'je suis nul'",
            "Lister 3 trucs concrets accomplis récemment, même petits",
            "Mode Max : 'C'est une journée, pas une carrière'",
        ],
    },
    {
        "name": "Demande de faire 'pour l'autre'",
        "category": "Relations",
        "description": "Quelqu'un demande un effort qui rappelle le pattern de parentification ou manipulation.",
        "examples": "Pattern mère (RSA dépensé), pattern exs (devoirs implicites)",
        "reaction": "Malaise, sentiment d'être piégé, culpabilité si refus",
        "tools": [
            "Pause avant répondre : 'est-ce que j'ai envie ou je me sens obligé ?'",
            "Test : 'si je dis non, qu'est-ce qui se passe ?' — punition implicite = signal",
            "Non complet possible. Pas de justification requise.",
        ],
    },
    {
        "name": "Renversement de réalité / gaslighting",
        "category": "Relations",
        "description": "Quelqu'un remet en cause ta perception, minimise ou retourne les faits.",
        "examples": "Mère à l'assistante sociale, ex qui dit que le deuil c'est ta faute",
        "reaction": "Confusion, doute de soi, colère rentrée, besoin de prouver",
        "tools": [
            "Écrire les faits bruts immédiatement — chronologie, pas d'interprétation",
            "La confusion que tu ressens EST la preuve que quelque chose cloche",
            "Couper l'échange. Tu n'as pas à convaincre.",
        ],
    },
    {
        "name": "Accumulation de charge admin",
        "category": "Surcharge",
        "description": "Trop de démarches en parallèle, sentiment que les batailles ne finissent jamais.",
        "examples": "Impôts, CAF, Ameli, admin identité, prospection client",
        "reaction": "Épuisement, paralysie, 'je gère tout seul et ça s'arrête jamais'",
        "tools": [
            "Triage brutal : 1 seule chose aujourd'hui, rien d'autre",
            "Liste 'plus tard' pour sortir les trucs de la tête sans les perdre",
            "Reconnaître la charge au lieu de la minimiser — c'est objectivement beaucoup",
        ],
    },
    {
        "name": "Doute sur la direction de vie",
        "category": "Identité",
        "description": "Questionnement sur si les choix (freelance, transition, isolement) sont les bons.",
        "examples": "'Est-ce que le déclic m'a bien mené quelque part ?'",
        "reaction": "Vertige, sentiment d'être à côté, peur du vide si la réponse est non",
        "tools": [
            "Énoncer les faits : CDA validé, identité changée, projet déployé",
            "Le doute arrive surtout quand t'es fatigué — noter l'état physique",
            "'Il y a 2 ans, t'aurais cru être là ?' — généralement la réponse recentre",
        ],
    },
    {
        "name": "Sous-alimentation sous pression",
        "category": "Physique",
        "description": "Quand un événement fort se produit, manger passe en dernier ou pas du tout.",
        "examples": "Gros stress, journée chargée, épisode dissociatif",
        "reaction": "Amplifie tout le reste — fatigue cognitive, irritabilité, escalade plus rapide",
        "tools": [
            "Si t'es à niveau 2+ de la chaîne : check actif — t'as mangé quelque chose ?",
            "Avoir un truc simple accessible sans effort de préparation",
            "Pas besoin de cuisiner — juste casser le jeûne suffit",
        ],
    },
    {
        "name": "Vide post-accomplissement",
        "category": "Identité",
        "description": "Après avoir validé quelque chose d'important, sentiment de 'meh' inexpliqué.",
        "examples": "Post-CDA, post-déploiement, post-victoire administrative",
        "reaction": "Sentiment creux, pas de satisfaction durable, 'ça sert à quoi ce que je fais'",
        "tools": [
            "Le cerveau en mode combat ne sait pas traiter le calme — c'est un bug système, pas un verdict",
            "Pas chercher à forcer la satisfaction — noter 'je suis en décompression'",
            "Laisser tourner le vide sans l'interpréter. Il passe.",
        ],
    },
    {
        "name": "Inconfort corporel / miroir",
        "category": "Identité",
        "description": "Vision du corps, reflet, photo — moments où la dissonance devient bruyante.",
        "examples": "Miroir, chaleur, photo, regard extérieur",
        "reaction": "Manque de confiance, inconfort, envie d'effacer ou d'éviter",
        "tools": [
            "L'évitement est une réponse valide à court terme — pas besoin de forcer l'exposition",
            "Recentrer sur ce que le corps fait plutôt que ce qu'il est (entraînement, mouvement)",
            "Ce que tu vois aujourd'hui n'est pas l'état final — c'est une étape en cours",
        ],
    },
    {
        "name": "Isolement lourd / pensées sombres",
        "category": "Urgence",
        "description": "L'isolement choisi bascule vers quelque chose de lourd. Phrases récurrentes sur l'inutilité de continuer.",
        "examples": "Combo isolement prolongé + chaîne d'escalade niveau 4-5",
        "reaction": "Retrait total, pensées récurrentes sur continuer ou non",
        "tools": [
            "Aller dans l'onglet SOS. Suivre le protocole dans l'ordre.",
            "Le cerveau ment à ce niveau — les phrases sont des symptômes, pas des vérités",
            "T'as survécu à 100% de tes pires journées jusqu'ici",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed default triggers"

    def handle(self, *args, **kwargs):
        created = 0
        for data in DEFAULTS:
            _, is_new = Trigger.objects.get_or_create(
                name=data["name"],
                is_default=True,
                defaults={**data, "user": None, "is_default": True},
            )
            if is_new:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Done. {created} triggers created ({len(DEFAULTS) - created} already existed)."))
