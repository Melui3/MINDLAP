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

POSITIVES = [
    {
        "name": "État de flow",
        "category": "Créativité",
        "description": "Moment où tu es complètement absorbé par une tâche — temps suspendu, friction zéro.",
        "examples": "Code qui tourne, écriture fluide, projet qui prend forme",
        "reaction": "Énergie calme, concentration sans effort, satisfaction spontanée",
        "tools": [
            "Noter ce qui a permis cet état (heure, contexte, type de tâche)",
            "Essayer de reproduire les conditions la prochaine fois",
            "Ne pas interrompre inutilement — protéger la fenêtre",
        ],
    },
    {
        "name": "Connexion humaine réelle",
        "category": "Social",
        "description": "Un échange où tu t'es senti compris, présent, sans masque.",
        "examples": "Conversation profonde, rire partagé, aide spontanée donnée ou reçue",
        "reaction": "Légèreté, sentiment d'appartenance, énergie restaurée",
        "tools": [
            "Enregistrer avec qui — les gens ressource méritent d'être identifiés",
            "Ce genre d'échange est rare : ne pas le minimiser",
        ],
    },
    {
        "name": "Accomplissement concret",
        "category": "Efficacité",
        "description": "T'as fini un truc. Vraiment fini. Pas juste avancé — fini.",
        "examples": "Feature déployée, dossier envoyé, objectif coché",
        "reaction": "Satisfaction brève mais réelle, preuve que tu peux",
        "tools": [
            "Logger même les petits — le cerveau a besoin de preuves accumulées",
            "Résister à l'envie de passer directement à la suite sans marquer le moment",
        ],
    },
    {
        "name": "Mouvement physique choisi",
        "category": "Corps",
        "description": "Tu as bougé parce que t'en avais envie ou besoin — pas par obligation.",
        "examples": "Marche, sport, étirements, sortie air frais",
        "reaction": "Tête plus légère, corps présent, rumination réduite",
        "tools": [
            "Note la durée et l'effet — utile pour calibrer la dose minimum efficace",
            "Même 15 minutes comptent",
        ],
    },
    {
        "name": "Ancre sensorielle",
        "category": "Présence",
        "description": "Un moment sensoriel simple qui t'a ramené dans le présent.",
        "examples": "Café chaud, musique qui touche juste, lumière du matin, odeur particulière",
        "reaction": "Apaisement, ralentissement, sortie du mental",
        "tools": [
            "Identifier tes ancres récurrentes — elles sont reproductibles à volonté",
            "Utiliser délibérément en début de journée difficile",
        ],
    },
    {
        "name": "Reconnaissance reçue",
        "category": "Estime",
        "description": "Quelqu'un a reconnu ton travail, ta valeur ou ton évolution.",
        "examples": "Retour positif client, compliment sincère, résultat qui parle de lui-même",
        "reaction": "Surprise souvent, chaleur, légère validation de ce qu'on sait déjà",
        "tools": [
            "Logger mot pour mot si possible — à relire quand l'estime baisse",
            "Ne pas minimiser ni surestimer : juste enregistrer",
        ],
    },
    {
        "name": "Moment de calme sans culpabilité",
        "category": "Présence",
        "description": "Du vide assumé — repos sans sentiment de devoir faire autre chose.",
        "examples": "Film, sieste, rien de particulier mais sans combat intérieur",
        "reaction": "Restauration, capacité à reprendre ensuite, tête reposée",
        "tools": [
            "C'est une ressource, pas une perte de temps — noter quand ça arrive",
            "Observer ce qui a permis d'y accéder sans culpabilité cette fois",
        ],
    },
    {
        "name": "Clarté soudaine",
        "category": "Identité",
        "description": "Un moment où tu sais exactement ce que tu veux ou qui tu es.",
        "examples": "Décision évidente, cap retrouvé, réponse qui émerge seule",
        "reaction": "Soulagement, énergie directionnelle, moins de bruit mental",
        "tools": [
            "Écrire la clarté immédiatement — elle s'efface vite",
            "C'est du signal pur : ne pas le rationaliser, juste l'enregistrer",
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
                defaults={**data, "user": None, "is_default": True, "is_positive": False},
            )
            if is_new:
                created += 1
        for data in POSITIVES:
            _, is_new = Trigger.objects.get_or_create(
                name=data["name"],
                is_default=True,
                defaults={**data, "user": None, "is_default": True, "is_positive": True},
            )
            if is_new:
                created += 1
        total = len(DEFAULTS) + len(POSITIVES)
        self.stdout.write(self.style.SUCCESS(
            f"Done. {created} triggers created ({total - created} already existed)."
        ))
