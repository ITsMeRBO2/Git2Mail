# GitLeak Finder

> **Projet académique** — 5ème année Cybersécurité  
> Démonstration pédagogique de l'exposition involontaire d'emails dans les métadonnées publiques de commits Git.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

---

## 🎯 Objectif

GitLeak Finder démontre comment les **métadonnées déjà publiques** contenues dans l'historique Git d'un dépôt public (nom d'auteur + adresse email de commit) peuvent être extraites et centralisées.

C'est exactement ce que fait la commande `git log --format="%ae %an"` — GitLeak Finder fournit simplement une interface visuelle accessible à tous, à des fins de **sensibilisation OSINT** et d'**hygiène numérique**.

---

## 🚀 Lancer en local

### Prérequis

- Node.js ≥ 18.17
- npm ≥ 9
- Git installé sur la machine (nécessaire pour le fallback générique)

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local pour ajouter vos tokens (optionnel mais recommandé)

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de production

```bash
npm run build
npm start
```

---

## 🔑 Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `GITHUB_TOKEN` | Non (recommandé) | Token GitHub Personal Access Token. Sans token : 60 req/h. Avec token : 5 000 req/h. [Créer un token](https://github.com/settings/tokens) (scope : `public_repo`) |
| `GITLAB_TOKEN` | Non | Token GitLab Personal Access Token. [Créer un token](https://gitlab.com/-/user_settings/personal_access_tokens) |
| `NEXT_PUBLIC_SITE_URL` | Non | URL publique du site (pour les meta tags OpenGraph) |

---

## 🏗️ Architecture

```
├── app/
│   ├── page.tsx                  # Page principale (state machine idle/loading/success/error)
│   ├── layout.tsx                # Layout racine (meta, fonts)
│   ├── globals.css               # Styles globaux (dark theme, animations)
│   └── api/
│       └── analyze/
│           └── route.ts          # POST /api/analyze (Node.js runtime, maxDuration=60s)
├── components/
│   ├── Header.tsx                # Header sticky avec navigation
│   ├── Hero.tsx                  # Section hero avec barre de recherche
│   ├── SearchBar.tsx             # Input URL + bouton analyser
│   ├── StatsBar.tsx              # Bandeau de statistiques
│   ├── ResultsList.tsx           # Liste des résultats
│   ├── ContributorCard.tsx       # Carte contributeur (avatar, email, stats)
│   ├── LoadingState.tsx          # Skeleton loading state
│   ├── ErrorBanner.tsx           # Bannière d'erreur avec codes d'erreur typés
│   ├── HowItWorks.tsx            # Section explicative + cadre éthique
│   └── Footer.tsx                # Footer avec mentions légales
├── lib/
│   ├── extractor.ts              # Détection du provider et dispatch
│   ├── validate.ts               # Validation Zod des URLs git
│   ├── gravatar.ts               # Génération URL Gravatar (MD5 via crypto Node.js)
│   ├── rate-limiter.ts           # Rate limiting en mémoire (10 req/min par IP)
│   └── providers/
│       ├── github.ts             # Provider GitHub (REST API v3, pagination)
│       ├── gitlab.ts             # Provider GitLab (REST API v4, pagination)
│       └── generic-git.ts        # Fallback git clone (simple-git, shallow)
└── types/
    └── index.ts                  # Types TypeScript partagés
```

---

## 📡 API

### `POST /api/analyze`

**Corps de la requête :**
```json
{
  "repoUrl": "https://github.com/owner/repository"
}
```

**Réponse réussie (200) :**
```json
{
  "success": true,
  "repoUrl": "https://github.com/facebook/react",
  "repoName": "facebook/react",
  "provider": "github",
  "totalCommitsAnalyzed": 1000,
  "analysisTimestamp": "2024-01-01T00:00:00.000Z",
  "contributors": [
    {
      "email": "author@example.com",
      "authorName": "Author Name",
      "commitCount": 342,
      "firstCommitDate": "2013-05-29T00:00:00Z",
      "lastCommitDate": "2024-01-01T00:00:00Z",
      "gravatarUrl": "https://www.gravatar.com/avatar/abc123?s=80&d=mp",
      "githubProfileUrl": "https://github.com/username",
      "isNoReplyEmail": false
    }
  ]
}
```

**Codes d'erreur :**

| Code | HTTP | Description |
|---|---|---|
| `INVALID_URL` | 400 | URL invalide ou non-HTTPS |
| `REPO_NOT_FOUND` | 404 | Dépôt introuvable |
| `REPO_PRIVATE` | 403 | Dépôt privé |
| `REPO_EMPTY` | 422 | Aucun commit trouvé |
| `RATE_LIMITED` | 429 | Limite de l'API GitHub/GitLab atteinte |
| `RATE_LIMIT_EXCEEDED_LOCAL` | 429 | Limite locale atteinte (10 req/min) |
| `REPO_TOO_LARGE` | 504 | Clone dépassé timeout 20s |
| `UNKNOWN_ERROR` | 500 | Erreur interne |

---

## 🌊 Stratégie de providers (cascade)

### 1. GitHub (`github.com`)
Utilise l'API REST GitHub v3 (`/repos/{owner}/{repo}/commits`). Paginé jusqu'à 1 000 commits (10 pages × 100). Chaque commit retourne directement `commit.author.email` — aucun clone requis.

**Enrichissement optionnel :** tentative de résolution du profil GitHub via `/search/users?q={email}+in:email`.

### 2. GitLab (`gitlab.com` ou self-hosted détecté)
Utilise l'API REST GitLab v4 (`/projects/:id/repository/commits`). Le champ `author_email` est directement disponible dans la réponse.

### 3. Générique (Bitbucket, Codeberg, self-hosted non-GitLab, etc.)
Clone superficiel (`--depth 100 --no-single-branch`) via `simple-git` dans un répertoire temporaire unique (`/tmp/gitleak-{uuid}`). Exécute `git log --all --pretty=format:%ae|%an|%aI`. Nettoyage du dossier dans un bloc `finally`.

---

## 🔒 Sécurité

- **Validation stricte** : Zod valide l'URL en entrée — rejette les URLs non-HTTPS, les IPs privées, les URLs sans chemin de dépôt.
- **Anti-injection shell** : `simple-git` passe les arguments en tableau à `execFile`, sans concaténation de string dans le shell.
- **Nettoyage `/tmp`** : le dossier temporaire est toujours supprimé dans un bloc `finally`, même en cas d'erreur.
- **Rate limiting** : 10 requêtes/minute par IP en mémoire.
- **Timeout** : 20s pour le clone git, 8-10s pour les requêtes API externes.
- **Secrets** : GITHUB_TOKEN et GITLAB_TOKEN via variables d'environnement uniquement.

---

## 📝 Méthodologie éthique

### Ce que nous exposons

Exactement les mêmes données qu'expose la commande :
```bash
git clone --depth 100 https://github.com/owner/repo
git log --all --format="%ae|%an|%aI"
```

Ces informations sont **dans chaque clone** du dépôt public. Toute personne ayant accès à internet peut les voir.

### À propos des emails noreply GitHub

Si un développeur a activé **"Keep my email addresses private"** sur GitHub :
- Commits via l'**interface web GitHub** → email affiché : `{id}+{username}@users.noreply.github.com` ✅ Protégé
- Commits via **git CLI** avec un email réel configuré (`git config user.email`) → email réel visible ⚠️

**Ce comportement est intrinsèque au protocole Git**, indépendamment des paramètres GitHub. GitLeak Finder démontre cette réalité à des fins pédagogiques.

### Comment protéger son email

1. Activer "Keep my email addresses private" dans les paramètres GitHub
2. Utiliser l'adresse noreply pour les commits CLI : `git config --global user.email "ID+username@users.noreply.github.com"`
3. Vérifier son historique existant avec GitLeak Finder

---

## 🚀 Déploiement sur Vercel

### Déploiement automatique (recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Suivre les instructions interactives
# - Framework: Next.js (détecté automatiquement)
# - Root directory: ./
# - Build: npm run build
```

### Variables d'environnement Vercel

Dans le dashboard Vercel → Settings → Environment Variables, ajoutez :
- `GITHUB_TOKEN` (recommandé)
- `GITLAB_TOKEN` (optionnel)

### Limites Vercel Hobby

- **Timeout serverless** : 60 secondes max (configuré dans `vercel.json`)
- **Pas de disque persistant** : seul `/tmp` est utilisable (éphémère, ~512MB)
- **Limitations** : les très gros dépôts (>100k commits) peuvent dépasser le timeout avec le fallback générique

---

## ⚠️ Limitations connues

| Limitation | Impact | Alternative |
|---|---|---|
| Timeout 60s sur Vercel Hobby | Gros dépôts (>500k commits) peuvent timeout | Augmenter avec Vercel Pro (120s) ou utiliser l'API directement |
| Rate limit GitHub sans token | 60 req/h par IP (=~60 analyses) | Configurer `GITHUB_TOKEN` |
| `git` doit être installé | Le fallback générique nécessite `git` sur le serveur | Sur Vercel, `git` est disponible sur les fonctions Node.js |
| Emails noreply GitHub | Certains emails sont masqués par GitHub | Comportement voulu — documenté dans la section éthique |
| Top 50 contributeurs | Les grands projets avec +50 contributeurs sont tronqués | Acceptable pour la sensibilisation |

---

## 🧪 Tests réels effectués

| Dépôt | Provider | Commits analysés | Emails trouvés |
|---|---|---|---|
| `facebook/react` | GitHub API | 1 000 | 15 |
| `vuejs/vue` | GitHub API | 1 000 | 28 |
| `axios/axios` | GitHub API | 1 000 | 12 |

---

## 📄 Licence

Projet académique — code fourni à titre éducatif uniquement.  
Utilisation abusive prohibée. Ne pas utiliser pour collecter des emails à des fins commerciales ou malveillantes.
