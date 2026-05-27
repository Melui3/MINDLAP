# MINDLAP

Application web de suivi mental personnel, pensée pour identifier les déclencheurs, renforcer les ancres positives et garder une trace des épisodes importants.

Le projet permet de construire une base claire autour de son fonctionnement interne : ce qui déclenche une réaction, ce qui stabilise, ce qui revient souvent, et les outils à utiliser quand la charge mentale monte.

## Aperçu

MINDLAP est une application de journalisation structurée autour de plusieurs axes :

- déclencheurs négatifs ;
- ancres positives ;
- journal d’épisodes ;
- historique ;
- espace SOS ;
- authentification utilisateur.

L’objectif est de transformer des ressentis parfois flous en données consultables, organisées et exploitables.

## Stack technique

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- React Router DOM 7
- Recharts
- ESLint
- gh-pages

### État et données

- appels API centralisés via `apiFetch`
- tokens JWT stockés dans `localStorage`
- refresh token automatique
- routes protégées via `RequireAuth`

## Fonctionnalités principales

### Authentification

L’application propose un système de connexion et d’inscription.

Les tokens sont stockés côté client :

- `mindlap_access`
- `mindlap_refresh`

En cas de réponse `401`, l’application tente automatiquement de récupérer un nouvel access token via le refresh token.

### Déclencheurs

La page des déclencheurs permet de consulter, filtrer, ajouter et supprimer des déclencheurs personnels.

Les déclencheurs sont organisés par catégories :

- Mémoire
- Estime
- Relations
- Surcharge
- Identité
- Physique
- Urgence

Chaque déclencheur peut contenir :

- un nom ;
- une catégorie ;
- une description ;
- des exemples ;
- une réaction typique ;
- des outils de gestion.

La page inclut aussi une chaîne d’escalade permettant d’identifier les premiers signes avant une montée en intensité.

### Ancres positives

Les ancres positives représentent les éléments qui stabilisent, apaisent ou ramènent à soi.

Elles sont séparées des déclencheurs négatifs grâce au champ `is_positive`.

Catégories prévues :

- Créativité
- Social
- Efficacité
- Corps
- Présence
- Estime
- Identité

Chaque ancre peut aussi contenir une description, des exemples et des outils associés.

### Journal d’épisodes

La section de journalisation permet de noter les épisodes importants afin de garder une trace du contexte, des réactions et des évolutions.

### Historique

L’historique permet de revenir sur les entrées précédentes et d’observer les répétitions ou patterns.

### SOS

La page SOS sert d’espace rapide en cas de surcharge ou de moment difficile, avec l’idée d’accéder vite aux ressources utiles.

## Structure du projet

```txt
MINDLAP/
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── auth/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
