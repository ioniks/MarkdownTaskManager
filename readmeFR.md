# 📋 Markdown Task Manager

**Gestionnaire de tâches Kanban basé sur des fichiers Markdown locaux**

Un système complet de gestion de tâches qui transforme vos fichiers Markdown en un tableau Kanban interactif, sans base de données ni serveur. Parfait pour les développeurs, les équipes distribuées et l'intégration avec des assistants IA.

![Aperçu de l'Application](docs/images/app-overview.jpg)
*Vue d'ensemble de l'interface Markdown Task Manager avec tableau Kanban, filtres et gestion des tâches*

---

## 🎯 Qu'est-ce que c'est ?

Le Markdown Task Manager est une **application web autonome** contenue dans un seul fichier HTML (`task-manager.html`). Elle utilise l'API File System Access du navigateur pour lire et écrire directement dans vos fichiers Markdown locaux.

### Principe de fonctionnement

```
┌─────────────────────┐
│  task-manager.html  │  ← Un seul fichier HTML
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │  Navigateur  │  ← Chrome, Edge, Opera
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Vos fichiers │  ← kanban.md + archive.md
    │   Markdown    │     (sur votre disque)
    └──────────────┘
```

**Avantages :**
- ✅ **Un seul fichier** : Facile à copier, partager et maintenir
- ✅ **100% local** : Vos données restent sur votre machine
- ✅ **Compatible Git** : Versionnable, synchronisable, diffable
- ✅ **Lisible en texte brut** : Éditable avec n'importe quel éditeur
- ✅ **Sans serveur** : Fonctionne entièrement dans le navigateur
- ✅ **Multi-projets** : Gérez plusieurs projets avec historique
- ✅ **Mode sombre & responsive** : Thème clair/sombre, prêt pour mobile (glisser-déposer tactile)
- ✅ **Multilingue** : Anglais, Français, Allemand et Chinois simplifié

---

## ⚡ Démarrage Rapide

### Prérequis

- **Navigateur compatible** : Chrome 86+, Edge 86+ ou Opera 72+
- L'API File System Access n'est pas disponible sur Firefox ou Safari

### Installation en 3 étapes

1. **Téléchargez** `task-manager.html` depuis ce dépôt
2. **Ouvrez-le** dans votre navigateur (double-clic)
3. **Sélectionnez** un dossier pour y stocker vos tâches

C'est tout ! 🎉

### Première utilisation

Au premier lancement :
1. L'application demande l'accès à un dossier
2. Si le dossier est vide, elle crée automatiquement :
   - `kanban.md` - Vos tâches actives
   - `archive.md` - Vos tâches archivées
3. Vous pouvez donner un nom au projet
4. Le projet est mémorisé pour les prochaines sessions

---

## 📦 Installation sur un Projet

### Option 1 : Installation à la racine (recommandé)

Copiez simplement 2 fichiers à la racine de votre projet :

```bash
mon-projet/
├── kanban.md          # ← Créez ce fichier (voir template ci-dessous)
├── archive.md         # ← Créez ce fichier (voir template ci-dessous)
├── src/
├── package.json
└── README.md
```

**Template kanban.md minimal :**
```markdown
# Kanban Board

## ⚙️ Configuration

**Colonnes**: 📝 À faire | 🚀 En cours | ✅ Terminé
**Catégories**: Frontend, Backend, Design
**Utilisateurs**: @alice, @bob
**Tags**: #bug, #feature, #docs

## 📝 À faire

## 🚀 En cours

## ✅ Terminé
```

**Template archive.md minimal :**
```markdown
# Archive des Tâches

> Tâches archivées du projet

## ✅ Archives
```

Ensuite :
1. Ouvrez `task-manager.html` dans votre navigateur
2. Sélectionnez le dossier `mon-projet/`
3. Commencez à créer des tâches !

### Option 2 : Installation dans un sous-répertoire

Si vous préférez isoler les fichiers de tâches :

```bash
mon-projet/
├── .tasks/            # ← ou docs/tasks/, .kanban/, etc.
│   ├── kanban.md
│   └── archive.md
├── src/
└── package.json
```

Ensuite, sélectionnez le dossier `.tasks/` lors de l'ouverture de l'application.

### Option 3 : Ajout au .gitignore (optionnel)

Si vous ne voulez pas versionner vos tâches :

```bash
# .gitignore
kanban.md
archive.md
# ou
.tasks/
```

**Note :** Il est généralement recommandé de **versionner** les fichiers de tâches pour garder l'historique et synchroniser avec l'équipe.

---

## 🗂️ Gestion du Fichier HTML

Vous avez 2 options pour gérer `task-manager.html` :

### Option A : Une copie par projet

```bash
projet-1/
├── task-manager.html  # ← Copie locale
├── kanban.md
└── archive.md

projet-2/
├── task-manager.html  # ← Copie locale
├── kanban.md
└── archive.md
```

**Avantages :**
- ✅ Autonomie complète de chaque projet
- ✅ Fonctionne même si le fichier central est modifié
- ✅ Peut être versionné avec le projet

**Inconvénients :**
- ❌ Duplication du fichier HTML
- ❌ Mise à jour manuelle dans chaque projet

### Option B : Un seul fichier centralisé (recommandé)

```bash
~/tools/
└── task-manager.html  # ← Une seule copie

~/projets/
├── projet-1/
│   ├── kanban.md
│   └── archive.md
├── projet-2/
│   ├── kanban.md
│   └── archive.md
└── projet-3/
    ├── kanban.md
    └── archive.md
```

**Avantages :**
- ✅ Un seul fichier à maintenir
- ✅ Mises à jour automatiques pour tous les projets
- ✅ Économie d'espace disque

**Inconvénients :**
- ❌ Dépendance à un fichier externe

**Comment l'utiliser :**
1. Gardez `task-manager.html` dans un dossier accessible (ex: `~/tools/`)
2. Créez un raccourci/signet dans votre navigateur
3. Ouvrez-le et sélectionnez le dossier du projet voulu
4. L'application se souvient des 10 derniers projets

**Astuce :** Créez un alias pour l'ouvrir rapidement :

```bash
# ~/.bashrc ou ~/.zshrc
alias tasks='open ~/tools/task-manager.html'  # macOS
alias tasks='xdg-open ~/tools/task-manager.html'  # Linux
alias tasks='start ~/tools/task-manager.html'  # Windows
```

---

## 🤖 Intégration avec Assistants IA

Ce système est conçu pour fonctionner avec des assistants IA afin d'obtenir une **traçabilité complète** du travail effectué.

### Principe

Les assistants IA (Claude, ChatGPT, Copilot, Gemini, etc.) peuvent :
1. ✅ Créer des tâches avec format strict dans `kanban.md`
2. ✅ Décomposer les tâches complexes en sous-tâches
3. ✅ Mettre à jour la progression en temps réel
4. ✅ Documenter le résultat complet dans `**Notes**:`
5. ✅ Référencer les tâches dans les commits Git (`TASK-XXX`)
6. ✅ Archiver sur demande uniquement (pas automatiquement)

### Configuration

Chaque IA a son propre fichier de configuration qui doit référencer `AI_WORKFLOW.md` :

| Assistant IA | Fichier de Configuration | Emplacement |
|--------------|--------------------------|-------------|
| **Claude** (Anthropic) | `CLAUDE.md` | Racine du projet |
| **GitHub Copilot** (Microsoft) | `copilot-instructions.md` | `.github/` |
| **OpenAI CLI** (GPT-4, GPT-3.5) | `OPENAI_CLI.md` | Racine du projet |
| **ChatGPT** (OpenAI Web/Desktop) | `CHATGPT.md` ou Custom GPT | Racine ou Web |
| **Gemini** (Google) | `GEMINI.md` ou `instructions.md` | Racine ou `.gemini/` |
| **Qwen** (Alibaba) | `QWEN.md` ou `.qwenrc` | Racine du projet |
| **Codeium / Windsurf** | `instructions.md` | `.windsurf/` ou `.codeium/` |

**Templates disponibles :**
- `CLAUDE.md.exemple`
- `COPILOT.md.exemple`
- `CHATGPT.md.exemple`
- `GEMINI.md.exemple`
- `QWEN.md.exemple`
- `CODEIUM.md.exemple`
- `OPENAI_CLI.md.exemple`

### Installation Rapide

**Étape 1 : Copier les fichiers de base**

```bash
# Fichiers obligatoires
cp AI_WORKFLOW.md votre-projet/
cp kanban.md votre-projet/
cp archive.md votre-projet/
```

**Étape 2 : Configurer votre IA préférée**

Pour **Claude** :
```bash
cp CLAUDE.md.exemple votre-projet/CLAUDE.md
```

**Pour Claude Code (CLI)** : Un skill dédié est disponible !
```bash
# Copier le dossier du skill (le metadata est dans SKILL.md)
cp -R .claude/skills/markdown-task-manager ~/.claude/skills/
# Redémarrer Claude Code pour activer le skill
```

Claude Code lit les métadonnées dans `SKILL.md`, d'où la nécessité de copier tout le dossier. Le skill `markdown-task-manager` permet à Claude Code de gérer automatiquement vos tâches avec le format strict requis. Une fois installé globalement, il est disponible sur tous vos projets.

**Utilisation du skill Claude Code :**
Une fois le skill installé et Claude Code redémarré, le skill détectera automatiquement les projets contenant `kanban.md` et `archive.md`. Vous pouvez simplement demander :
- "Crée une tâche pour implémenter l'authentification"
- "Mets à jour TASK-007 avec les résultats"
- "Liste toutes les tâches en cours"
- "Archive les tâches terminées"

Claude Code suivra automatiquement le format strict et gérera vos tâches correctement.

Pour **GitHub Copilot** :
```bash
mkdir -p votre-projet/.github
cp COPILOT.md.exemple votre-projet/.github/copilot-instructions.md
```

Pour **ChatGPT** :
```bash
cp CHATGPT.md.exemple votre-projet/CHATGPT.md
```

Pour **Gemini** :
```bash
mkdir -p votre-projet/.gemini
cp GEMINI.md.exemple votre-projet/.gemini/instructions.md
```

Pour **Windsurf / Codeium** :
```bash
mkdir -p votre-projet/.windsurf
cp CODEIUM.md.exemple votre-projet/.windsurf/instructions.md
```

Pour **OpenAI CLI** :
```bash
cp OPENAI_CLI.md.exemple votre-projet/OPENAI_CLI.md
```

Pour **Qwen** :
```bash
cp QWEN.md.exemple votre-projet/QWEN.md
```

**Étape 3 : Structure finale**

```bash
votre-projet/
├── AI_WORKFLOW.md              # ← Consignes générales pour toutes les IAs
├── CLAUDE.md                   # ← Configuration Claude (optionnel)
├── .github/
│   └── copilot-instructions.md # ← Configuration Copilot (optionnel)
├── .gemini/
│   └── instructions.md         # ← Configuration Gemini (optionnel)
├── .windsurf/
│   └── instructions.md         # ← Configuration Windsurf (optionnel)
├── kanban.md                   # ← Tâches actives
├── archive.md                  # ← Tâches archivées
└── src/
```

### Première Utilisation

**Pour Claude :**
```
"Lis CLAUDE.md et utilise le système de tâches"
```

**Pour GitHub Copilot :**
```
@workspace Lis AI_WORKFLOW.md et crée une tâche pour [feature]
```

**Pour ChatGPT :**
1. Uploadez `CHATGPT.md` et `AI_WORKFLOW.md`
2. Dites : `"Lis ces fichiers et utilise le système de tâches"`

**Pour Gemini :**
```
@workspace Lis AI_WORKFLOW.md et planifie [feature]
```

**Pour Windsurf / Codeium :**
```
Lis AI_WORKFLOW.md et crée TASK-001 pour [feature]
```

**Pour OpenAI CLI :**
```bash
openai --system-file OPENAI_CLI.md "Lis AI_WORKFLOW.md et crée une tâche pour [feature]"
```

**Pour Qwen :**
```bash
qwen --system-file QWEN.md "Lis AI_WORKFLOW.md et planifie [feature]"
```

### Ce que l'IA fait automatiquement

L'IA va :
1. ✅ Lire `AI_WORKFLOW.md` pour comprendre le format et le workflow
2. ✅ Créer des tâches dans `kanban.md` avec le format strict
3. ✅ Déplacer les tâches entre colonnes selon la progression
4. ✅ Cocher les sous-tâches au fur et à mesure
5. ✅ Documenter le résultat complet dans `**Notes**:`
6. ✅ Référencer les tâches dans les commits Git
7. ✅ Laisser les tâches terminées dans "✅ Terminé" (archivage sur demande uniquement)

### Traçabilité et transparence

Avec ce système, vous avez :

- 📝 **Historique complet** : Chaque action de l'IA est documentée
- 🔍 **Recherche facile** : Grep dans les fichiers Markdown
- 📊 **Statistiques** : Vélocité, temps passé, progression
- 🔗 **Liens Git** : Commits référencent les tâches
- 👥 **Collaboration** : Toute l'équipe voit ce que l'IA fait
- 📦 **Archives** : Rien n'est perdu, tout est archivé

### Commandes Utilisateur

```bash
# Planification
"Planifie [feature]"
"Crée roadmap pour 3 mois"

# Exécution
"Fais TASK-XXX"
"Continue TASK-XXX"

# Suivi
"Où en sommes-nous ?"
"Point de la semaine"

# Modifications
"Décompose TASK-XXX"
"Ajoute sous-tâche à TASK-XXX"

# Recherche
"Cherche dans archives : [mot-clé]"

# Maintenance
"Archive les tâches terminées"
```

---

## ✨ Fonctionnalités de l'Application

### 1. Vue Kanban Interactive

![Tableau Kanban](docs/images/kanban-board.jpg)
*Tableau Kanban interactif avec drag & drop, colonnes personnalisables et compteurs de tâches*

- **Colonnes personnalisables** : Créez et organisez vos propres colonnes
  - Par défaut : 📝 À faire, 🚀 En cours, 👀 Review, ✅ Terminé
  - Modifiables via le bouton "⚙️ Colonnes"
- **Drag & Drop** : Déplacez les tâches entre colonnes en glissant-déposant
- **Layout adaptatif** : Colonnes centrées utilisant toute la largeur de l'écran
- **Compteurs** : Nombre de tâches affiché dans chaque colonne

### 2. Gestion Complète des Tâches

![Modale de Création de Tâche](docs/images/task-modal.jpg)
*Modale complète de création et d'édition de tâches avec tous les champs de métadonnées et sous-tâches*

**Création :**
- Formulaire complet avec tous les champs
- ID auto-généré (TASK-XXX)
- Validation des champs obligatoires

**Métadonnées riches :**
- **Titre** : Identifiant unique et description courte
- **Priority** : Critique, Haute, Moyenne, Basse (code couleur)
- **Category** : Personnalisable (Frontend, Backend, etc.)
- **Assignation** : Plusieurs utilisateurs possibles (@user1, @user2)
- **Tags** : Tags multiples (#bug, #feature, etc.)
- **Dates** : Création, début, échéance, fin
- **Description** : Texte libre avec support Markdown

**Sous-tâches :**
- Créer, modifier, supprimer des sous-tâches
- Cocher/décocher en temps réel
- Barre de progression visuelle
- Compteur (ex: "3/5 sous-tâches complétées")

**Édition :**
- Modal d'édition détaillée pour chaque tâche
- Modification de tous les champs
- Prévisualisation instantanée
- Sauvegarde automatique

### 3. Filtres Avancés

![Filtres Avancés](docs/images/filters.jpg)
*Système de filtrage avancé avec filtres par priorité, tags, catégories et utilisateurs*

**4 types de filtres cumulables :**

1. **Priorité** 🔴🟡🟢 (badges colorés)
   - Filtrer par niveau de priorité
   - Options : Critique, Haute, Moyenne, Basse
   - Identifier rapidement les tâches urgentes

2. **Tags** 🔵 (bulles bleues)
   - Filtrer par un ou plusieurs tags
   - Exemple : #bug, #urgent, #backend

3. **Catégories** 🟣 (bulles violettes)
   - Filtrer par catégorie de tâche
   - Exemple : Frontend, Backend, Design

4. **Utilisateurs** 🟢 (bulles vertes)
   - Filtrer par assignation
   - Exemple : @alice, @bob

**Fonctionnement :**
- Sélectionnez un filtre via les dropdowns
- Cliquez sur un badge dans une tâche pour filtrer instantanément
- Combinez plusieurs filtres (ET logique)
- Supprimez un filtre individuellement (✕ sur la bulle)
- Effacez tous les filtres d'un coup

**Autocomplete intelligent :**
- Les filtres se souviennent de l'historique
- Même les valeurs archivées restent disponibles
- Suggestions contextuelles pendant la saisie

### 4. Système d'Archives

![Vue Archives](docs/images/archives.jpg)
*Vue des archives montrant les tâches complétées avec capacités de recherche et restauration*

**Archivage :**
- Déplacez les tâches terminées vers `archive.md`
- Archivage manuel (bouton dans la tâche)
- Organisation par sections (ex: par mois, par sprint)

**Consultation :**
- Vue dédiée des archives (bouton "📦 Archives")
- Recherche dans les archives
- Affichage détaillé de chaque tâche archivée

**Restauration :**
- Restaurez une tâche vers le kanban
- La tâche retourne dans sa colonne d'origine
- Métadonnées conservées

**Historique persistant :**
- Les tags/catégories/utilisateurs des tâches archivées restent dans l'autocomplete
- Permet de maintenir la cohérence entre projets

### 5. Recherche Globale

**Fonctionnalité de recherche puissante :**
- Recherche dans toutes les tâches actives
- Recherche dans les tâches archivées
- Filtrage en temps réel pendant la saisie
- Recherche dans les titres, descriptions et métadonnées

**Fonctionnalités de recherche :**
- Trouver des tâches par ID (ex: "TASK-042")
- Recherche par mots-clés dans le titre ou la description
- Filtrer les résultats par colonne
- Voir les tâches archivées correspondant à votre recherche

**Accessibilité :**
- Accès rapide via le bouton de recherche dans le header
- Modal de recherche dédiée
- Présentation claire des résultats

### 6. Traduction de l'Interface

**Support multilingue :**
- Langues disponibles : Anglais, Français, Allemand et Chinois simplifié
- Sélecteur de langue dans les paramètres de l'application
- Traduction complète de l'interface
- Changement de langue sans interruption

**Éléments traduits :**
- Tous les boutons et labels de l'interface
- Champs de formulaire et placeholders
- Noms de colonnes et messages de statut
- Textes d'aide et instructions
- Messages d'erreur et notifications

**Note :** Le contenu des fichiers markdown (kanban.md, archive.md) reste dans la langue de votre choix.

### 7. Multi-Projets

![Sélecteur Multi-Projets](docs/images/multi-project.jpg)
*Sélecteur rapide de projets affichant les projets récents avec noms personnalisés*

**Gestion de projets :**
- Mémorisation des 10 derniers projets utilisés
- Sélecteur rapide dans le header (dropdown)
- Noms personnalisés pour chaque projet
- Chemins de fichiers mémorisés

**Navigation :**
- Changement de projet instantané
- Auto-restauration du dernier projet au lancement
- Bouton "✏️" pour renommer le projet actuel

**Stockage :**
- Utilise IndexedDB pour stocker les handles de répertoires
- Pas besoin de re-sélectionner le dossier à chaque fois
- Permissions navigateur persistantes

### 8. Auto-Sauvegarde

- **Sauvegarde immédiate** : Chaque modification est écrite instantanément
- **Pas de bouton "Sauvegarder"** : Tout est automatique
- **Synchronisation** : Les fichiers Markdown restent toujours à jour
- **Compatible édition externe** : Vous pouvez éditer les fichiers manuellement

### 9. Autres Fonctionnalités

- **Export** : Vos fichiers Markdown sont déjà exportés !
- **Thème** : Interface moderne et épurée
- **Responsive** : Optimisé pour mobile — glisser-déposer tactile, formulaires empilés, bouton « + » par colonne
- **Mode sombre** : Basculement clair/sombre avec détection automatique du système
- **Raccourcis clavier** : Navigation rapide (à venir)

---

## 📁 Structure des Fichiers

### Fichiers principaux

```
votre-projet/
├── kanban.md          # Tâches actives (obligatoire)
├── archive.md         # Tâches archivées (obligatoire)
├── AI_WORKFLOW.md     # Consignes pour l'IA (optionnel)
└── [fichier IA].md    # Configuration IA spécifique (optionnel)
```

### Contenu de kanban.md

```markdown
# Kanban Board

<!-- Config: Last Task ID: 42 -->

## ⚙️ Configuration

**Colonnes**: 📝 À faire (todo) | 🚀 En cours (in-progress) | ✅ Terminé (done)
**Catégories**: Frontend, Backend, Design
**Utilisateurs**: @alice (Alice Martin), @bob (Bob Dupont)
**Tags**: #bug, #feature, #docs, #refactor

---

## 📝 À faire

### TASK-001 | Ma première tâche
**Priority**: Haute | **Category**: Frontend | **Assigned**: @alice
**Created**: 2025-01-20 | **Due**: 2025-02-01
**Tags**: #feature #ui

Description de la tâche...

**Subtasks**:
- [ ] Première sous-tâche
- [x] Sous-tâche terminée
- [ ] Dernière sous-tâche

## 🚀 En cours

### TASK-002 | Autre tâche
...

## ✅ Terminé

### TASK-003 | Tâche complétée
...
```

### Contenu de archive.md

```markdown
# Archive des Tâches

> Tâches archivées du projet Mon Projet

## ✅ Janvier 2025

### TASK-042 | Implémenter système de notifications
**Priority**: Haute | **Category**: Backend | **Assigned**: @alice
**Created**: 2025-01-15 | **Started**: 2025-01-18 | **Finished**: 2025-01-22
**Tags**: #feature #notifications

Système de notifications en temps réel avec WebSockets.

**Subtasks**:
- [x] Setup WebSocket server
- [x] Créer API REST
- [x] Implémenter envoi emails
- [x] UI de notifications
- [x] Tests end-to-end

**Notes**:

**Résultat** :
✅ Système de notifications fonctionnel avec WebSocket, API REST et emails.

**Fichiers modifiés** :
- src/websocket/server.js (lignes 1-150)
- src/api/notifications.js (lignes 20-85)
- src/ui/NotificationPanel.jsx (lignes 1-200)

**Décisions techniques** :
- Socket.io pour WebSockets (plus simple que ws natif)
- SendGrid pour emails (quota 100/jour gratuit)
- Historique 30 jours en MongoDB

**Tests effectués** :
- ✅ 100 connexions simultanées OK
- ✅ Reconnexion automatique après déconnexion
- ✅ Emails envoyés en < 2s

---

## ✅ Décembre 2024

### TASK-001 | Ancienne tâche archivée
...
```

---

## 🎨 Interface Utilisateur

### Header

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Task Manager  [Projet ▼] [✏️] [📁] [➕] [📦] [⚙️]          │
└─────────────────────────────────────────────────────────────────┘
```

Boutons :
- **[Projet ▼]** : Sélecteur de projets récents
- **[✏️]** : Renommer le projet actuel
- **[📁 Ouvrir dossier]** : Sélectionner/changer de dossier
- **[➕ Nouvelle tâche]** : Créer une tâche
- **[📦 Archives]** : Voir les tâches archivées
- **[⚙️ Colonnes]** : Gérer les colonnes du Kanban

### Barre de filtres

```
┌─────────────────────────────────────────────────────────────────┐
│  Tags: [Select ▼] [+]   Catégorie: [Select ▼] [+]   User: [▼]  │
│                                                                   │
│  🔵 #bug ✕    🔵 #urgent ✕    🟣 Frontend ✕    🟢 @alice ✕    │
└─────────────────────────────────────────────────────────────────┘
```

### Kanban

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📝 À faire   │ 🚀 En cours  │ 👀 Review    │ ✅ Terminé   │
│    (3)       │    (2)       │    (1)       │    (5)       │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │ TASK-001 │ │ │ TASK-004 │ │ │ TASK-007 │ │ │ TASK-008 │ │
│ │ Titre... │ │ │ Titre... │ │ │ Titre... │ │ │ Titre... │ │
│ │          │ │ │          │ │ │          │ │ │          │ │
│ │ 🔴 Crit. │ │ │ 🟡 Moy.  │ │ │ 🟢 Basse │ │ │ ✅ Done  │ │
│ │ 🟣 Front │ │ │ 🟣 Back  │ │ │ 🟣 Front │ │ │ 🟣 Back  │ │
│ │ 🟢 @alice│ │ │ 🟢 @bob  │ │ │ 🟢 @alice│ │ │ 🟢 @alice│ │
│ │          │ │ │          │ │ │          │ │ │          │ │
│ │ ▓▓▓░░ 3/5│ │ │ ▓▓▓▓░ 4/5│ │ │ ▓▓▓▓▓ 5/5│ │ │          │ │
│ │   [✏️]   │ │ │   [✏️]   │ │ │   [✏️]   │ │ │   [✏️]   │ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │
│              │              │              │              │
│ ┌──────────┐ │              │              │              │
│ │ TASK-002 │ │              │              │              │
│ │ ...      │ │              │              │              │
│ └──────────┘ │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Carte de tâche (détails)

```
┌──────────────────────────────────────────────┐
│ TASK-042 | Implémenter système de notifs    │
├──────────────────────────────────────────────┤
│ Priorité: 🟡 Haute                           │
│ Catégorie: 🟣 Backend                        │
│ Assigné: 🟢 @alice, @bob                     │
│ Créé: 2025-01-15                             │
│ Échéance: 2025-02-01                         │
│ Tags: 🔵 #feature #notifications             │
├──────────────────────────────────────────────┤
│ Description détaillée de la tâche...         │
│                                              │
│ Sous-tâches (3/5):                          │
│ ☑ Setup WebSocket server                    │
│ ☑ Créer API REST                            │
│ ☑ Implémenter envoi emails                  │
│ ☐ UI de notifications                       │
│ ☐ Tests end-to-end                          │
├──────────────────────────────────────────────┤
│ [Éditer] [Archiver] [Supprimer] [Fermer]    │
└──────────────────────────────────────────────┘
```

---

## 🔧 Configuration et Personnalisation

### Colonnes du Kanban

Personnalisez vos colonnes dans `kanban.md` :

```markdown
**Colonnes**: 📝 Backlog (backlog) | 🔍 Analyse (analysis) | 🚀 Dev (dev) | 👀 Review (review) | ✅ Done (done)
```

Format : `Emoji Nom (id) | ...`

Exemples :
- Développement simple : `À faire | En cours | Terminé`
- Scrum : `Backlog | Sprint | En cours | Review | Terminé`
- Kanban étendu : `Icebox | Backlog | Analysis | Dev | QA | Deploy | Done`

### Catégories

Définissez les catégories de votre projet :

```markdown
**Catégories**: Frontend, Backend, Database, DevOps, Design, Tests, Documentation
```

Adaptez à votre contexte :
- Web : `UI, API, Database, DevOps`
- Mobile : `iOS, Android, Backend, Design`
- Data : `ETL, Analysis, ML, Visualization`

### Utilisateurs

Listez les membres de l'équipe :

```markdown
**Utilisateurs**: @alice (Alice Martin), @bob (Bob Dupont), @charlie (Charlie Dubois)
```

Format : `@username (Nom Complet)`

### Tags

Créez un système de tags adapté :

```markdown
**Tags**: #bug, #feature, #refactor, #docs, #urgent, #blocked, #tech-debt
```

Exemples de systèmes de tags :
- Par type : `#bug`, `#feature`, `#refactor`, `#docs`
- Par priorité : `#urgent`, `#important`, `#nice-to-have`
- Par état : `#blocked`, `#waiting`, `#in-review`
- Par domaine : `#security`, `#performance`, `#ux`, `#a11y`

---

## 🎯 Cas d'Usage

### 1. Développement Logiciel

**Gestion de backlog :**
- Créer des tâches depuis les issues GitHub
- Planifier les sprints
- Suivre la vélocité de l'équipe

**Suivi des bugs :**
- Tag `#bug` + priorité critique
- Assignation aux développeurs
- Documentation de la résolution

**Code reviews :**
- Colonne dédiée "👀 Review"
- Checklist de review dans les sous-tâches
- Archivage avec décisions techniques

### 2. Gestion de Projet

**Roadmap produit :**
- Créer des tâches pour chaque feature
- Échéances et jalons
- Suivi de la progression

**Collaboration équipe :**
- Assignation multi-utilisateurs
- Filtrage par personne
- Visibilité temps réel via Git

**Rétrospectives :**
- Recherche dans les archives
- Statistiques sur les tâches complétées
- Analyse de la vélocité

### 3. Usage Personnel

**ToDo lists avancées :**
- Organiser ses tâches par projet
- Sous-tâches pour décomposer
- Archives pour l'historique

**Projets personnels :**
- Suivi de side-projects
- Notes et apprentissages
- Objectifs avec échéances

**Journaling :**
- Tâche = entrée de journal
- Tags pour catégoriser
- Archives = journal complet

### 4. Équipes Distribuées

**Synchronisation Git :**
```bash
git pull origin main          # Récupérer les mises à jour
# Travailler dans l'application
git add kanban.md archive.md
git commit -m "Update tasks"
git push origin main          # Partager avec l'équipe
```

**Résolution de conflits :**
```bash
# En cas de conflit sur kanban.md
git checkout --theirs kanban.md  # Prendre la version distante
# ou
git checkout --ours kanban.md    # Garder la version locale
# ou résoudre manuellement (format Markdown simple)
```

**Workflow branches :**
```bash
# Créer une branche par feature
git checkout -b feature/TASK-042-notifications

# Référencer la tâche dans les commits
git commit -m "feat: Add WebSocket server (TASK-042 - 1/5)"
git commit -m "feat: Add notification API (TASK-042 - 2/5)"

# Merger et archiver
git checkout main
git merge feature/TASK-042-notifications
# Déplacer TASK-042 vers "✅ Terminé" puis archiver
```

---

## 🌐 Compatibilité

### Navigateurs Supportés

| Navigateur | Version minimale | Support | Notes |
|------------|------------------|---------|-------|
| Chrome     | 86+              | ✅ Complet | Recommandé |
| Edge       | 86+              | ✅ Complet | Recommandé |
| Opera      | 72+              | ✅ Complet | OK |
| Brave      | 1.17+            | ✅ Complet | OK |
| Firefox    | -                | ❌ Non supporté | API non disponible |
| Safari     | -                | ❌ Non supporté | API non disponible |

**Note :** L'API File System Access est requise. Elle n'est pas disponible sur Firefox et Safari.

### Systèmes d'Exploitation

- ✅ **Windows** 10/11
- ✅ **macOS** 10.15+ (avec Chrome/Edge)
- ✅ **Linux** (toutes distributions avec Chrome/Edge/Opera)
- ✅ **Chrome OS**
- ❌ iOS/iPadOS (Safari uniquement)
- ❌ Android (support limité)

### Performance

- **Fichier HTML** : ~144 Ko (tout inclus, aucune dépendance)
- **Chargement** : Instantané (< 100ms)
- **Parsing** : < 50ms pour 1000 tâches
- **Mémoire** : ~10 Mo (pour 500 tâches)

---

## 📚 Documentation Supplémentaire

### Dans ce dépôt

- **`AI_WORKFLOW.md`** : Consignes complètes pour les assistants IA
- **`/examples/`** : Exemples de fichiers kanban.md et archive.md
- **`/examples/README.md`** : Format Markdown détaillé

### Templates

Téléchargez les templates vierges :
- [`kanban.md`](/examples/kanban.md) - Template de base
- [`archive.md`](/examples/archive.md) - Template d'archives
- [`AI_WORKFLOW.md`](/AI_WORKFLOW.md) - Consignes pour les IAs
- Templates de configuration IA : `CLAUDE.md.exemple`, `COPILOT.md.exemple`, etc.

### Format Markdown

Documentation détaillée du format dans [`/examples/README.md`](/examples/README.md) :
- Structure des tâches
- Métadonnées obligatoires/optionnelles
- Sous-tâches et notes
- Configuration du Kanban
- Exemples complets

---

## 🔒 Sécurité et Confidentialité

- ✅ **Données 100% locales** : Rien n'est envoyé sur Internet
- ✅ **Pas de tracking** : Aucune télémétrie, aucune analytics
- ✅ **Pas de compte** : Aucune authentification requise
- ✅ **Permissions explicites** : L'utilisateur contrôle l'accès aux fichiers
- ✅ **Code ouvert** : Tout le code JavaScript est lisible dans le fichier HTML
- ✅ **Pas de CDN** : Aucune ressource externe chargée
- ✅ **Hors ligne** : Fonctionne sans connexion Internet

### Permissions requises

L'application demande uniquement :
- **Lecture/Écriture de fichiers** : Pour accéder à vos fichiers Markdown
- **IndexedDB** : Pour mémoriser les projets récents (local au navigateur)

Aucune permission réseau, webcam, microphone ou autre n'est requise.

---

## 🚀 Démarrage Avancé

### Avec Git

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/markdown-task-manager.git
cd markdown-task-manager

# Ouvrir l'application
open task-manager.html  # macOS
xdg-open task-manager.html  # Linux
start task-manager.html  # Windows

# Ou héberger localement (optionnel)
python -m http.server 8000
# Puis ouvrir http://localhost:8000/task-manager.html
```

### Installation sur un nouveau projet

```bash
# Créer un nouveau projet avec le système de tâches
mkdir mon-projet
cd mon-projet
git init

# Copier les fichiers nécessaires
cp /path/to/kanban.md .
cp /path/to/archive.md .
cp /path/to/AI_WORKFLOW.md .        # Optionnel (pour IA)
cp /path/to/CLAUDE.md.exemple CLAUDE.md   # Optionnel (pour Claude)

# Premier commit
git add .
git commit -m "chore: Initialize task management system"

# Ouvrir l'application
open /path/to/task-manager.html
# Sélectionner le dossier mon-projet/
```

### Migration depuis un système existant

**Depuis Trello/Jira/Linear :**
1. Exportez vos tâches en CSV
2. Utilisez un script pour convertir en format Markdown
3. Importez dans `kanban.md`

**Depuis GitHub Issues :**
```bash
# Utilisez GitHub CLI
gh issue list --state all --json number,title,body,labels
# Convertir en format Markdown Task Manager
```

**Depuis Notion/Obsidian :**
1. Exportez en Markdown
2. Ajustez le format pour correspondre au template
3. Importez dans l'application

---

## 🤝 Contribution

Contributions bienvenues ! Voici comment aider :

### Signaler un bug

1. Vérifiez que le bug n'existe pas déjà dans les issues
2. Créez une issue avec :
   - Description du bug
   - Étapes pour reproduire
   - Navigateur et version
   - Captures d'écran si applicable

### Proposer une fonctionnalité

1. Créez une issue avec le tag `enhancement`
2. Décrivez la fonctionnalité et son utilité
3. Attendez les retours avant d'implémenter

### Contribuer au code

1. Forkez le dépôt
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Modifiez `task-manager.html` (tout est dans ce fichier)
4. Testez dans Chrome, Edge et Opera
5. Commitez (`git commit -m "feat: Add feature"`)
6. Pushez (`git push origin feature/ma-fonctionnalite`)
7. Créez une Pull Request

### Guidelines

- **Lisibilité** : Code commenté et structuré
- **Performance** : Optimiser pour 1000+ tâches
- **Compatibilité** : Tester sur Chrome, Edge, Opera
- **Accessibilité** : Respecter les standards ARIA
- **Documentation** : Mettre à jour le README si nécessaire

---

## 📝 Roadmap

### Version actuelle : 2.0

**Socle (depuis la 1.0)**
- ✅ Kanban interactif avec glisser-déposer
- ✅ Gestion complète des tâches
- ✅ Filtres avancés
- ✅ Système d'archives
- ✅ Multi-projets
- ✅ Auto-sauvegarde
- ✅ Intégration IA

**Ajouté en 1.1 → 2.0**
- ✅ Système de priorités étendu (50+ icônes emoji) — *1.1*
- ✅ Mode sombre (bascule + détection automatique du système) — *1.2*
- ✅ Traductions allemande et chinois simplifié — *1.2*
- ✅ Vue détaillée des tâches archivées — *1.2*
- ✅ Support mobile : glisser-déposer tactile, mise en page responsive, bouton « + » par colonne — *1.3 (issue #12)*
- ✅ Durcissement XSS : rendu échappé + validation du schéma des liens Markdown — *1.3.1*
- ✅ **Statut « économe en tokens » (statut en champ)** — la colonne d'une tâche est un champ `**Status**:` dans une seule section `## Tasks` ; déplacer une tâche entre colonnes devient une modification d'une seule ligne, et une IA lit/met à jour le tableau via un simple `grep` (aucun index stocké). Parser rétro-compatible + **migration automatique et sûre V1→V2 au chargement** (crée un `.v1-backup.md`, sans perte de données) ; l'archive est migrée aussi. — *2.0*
- ✅ Sources découpées dans `src/` et compilées vers l'unique `task-manager.html` par un build Node sans dépendance (`npm run build`) — *2.0*
- ✅ **Échéances visibles** — la date **Due** est affichée sur chaque carte et signalée (orange si à 2 jours ou moins, rouge si dépassée) ; les tâches terminées ne sont jamais signalées — *2.0*
- ✅ Fidélité de migration — le titre H1 personnalisé est préservé (plus de réécriture en « Kanban Board »), les lignes config Catégories/Utilisateurs/Tags ne gonflent plus à chaque sauvegarde, et les champs d'autocomplétion sont échappés — *2.0*

### Prochaines versions

**Plus tard**
- [ ] Raccourcis clavier
- [ ] Export PDF/HTML & statistiques visuelles (graphiques)
- [ ] Pièces jointes, mentions @user, rappels d'échéance, templates de tâches
- [ ] Mode hors-ligne complet (Service Worker), synchronisation multi-appareils, plugin IDE, API REST locale optionnelle

---

## 📄 Licence

Mozilla Public License 2.0 (MPL-2.0)

Ce projet est distribué sous la licence MPL-2.0. Vous êtes libre de :
- Utiliser le code dans des projets commerciaux et privés
- Modifier le code source
- Distribuer le code modifié ou non

Sous condition de :
- Publier les modifications apportées aux fichiers sous licence MPL-2.0
- Inclure une copie de la licence MPL-2.0
- Préserver les mentions de copyright

Voir le fichier `LICENSE` pour plus de détails.

---

## 🙏 Remerciements

Merci à la communauté open-source pour :
- L'API File System Access (Google Chrome team)
- Les standards Markdown (CommonMark)
- Les retours et suggestions des utilisateurs

---

## 📞 Support

**Questions ?** Ouvrez une issue sur GitHub

**Bugs ?** Créez une issue avec le tag `bug`

**Suggestions ?** Créez une issue avec le tag `enhancement`

---

**Créé avec ❤️ pour ceux qui aiment la simplicité, le contrôle de leurs données, et la transparence**

---

## 🎓 Guide de Démarrage : Scénarios Complets

### Scénario 1 : Développeur solo sur un projet perso

```bash
# 1. Télécharger task-manager.html dans ~/tools/
cd ~/tools
# [Télécharger task-manager.html]

# 2. Créer un nouveau projet
cd ~/projets
mkdir mon-app
cd mon-app
git init

# 3. Créer les fichiers de tâches
cat > kanban.md << 'EOF'
# Kanban Board

## ⚙️ Configuration

**Colonnes**: 📝 À faire | 🚀 En cours | ✅ Terminé
**Catégories**: Frontend, Backend, Database
**Utilisateurs**: @moi
**Tags**: #feature, #bug, #refactor

## 📝 À faire
## 🚀 En cours
## ✅ Terminé

<!-- Config: Last Task ID: 000 -->
EOF

cat > archive.md << 'EOF'
# Archive des Tâches
## ✅ Archives
EOF

# 4. Ouvrir l'application
open ~/tools/task-manager.html

# 5. Sélectionner le dossier mon-app/

# 6. Créer votre première tâche !
```

### Scénario 2 : Équipe qui migre depuis Trello

```bash
# 1. Installer pour l'équipe
git clone https://github.com/team/project.git
cd project

# 2. Ajouter le système de tâches
cp ~/downloads/kanban.md .
cp ~/downloads/archive.md .
git add kanban.md archive.md
git commit -m "chore: Add task management system"
git push

# 3. Chaque membre de l'équipe :
# - Télécharge task-manager.html
# - Clone/pull le projet
# - Ouvre task-manager.html
# - Sélectionne le dossier project/

# 4. Workflow quotidien :
git pull                    # Récupérer les mises à jour
# [Travailler dans l'app]
git add kanban.md
git commit -m "Update tasks"
git push                    # Partager avec l'équipe
```

### Scénario 3 : Intégration avec Claude/ChatGPT

```bash
# 1. Installation complète avec IA
cd mon-projet
cp ~/downloads/kanban.md .
cp ~/downloads/archive.md .
cp ~/downloads/AI_WORKFLOW.md .
cp ~/downloads/CLAUDE.md.exemple CLAUDE.md

# 2. Première session avec Claude
# Dire : "Lis CLAUDE.md et crée une tâche pour implémenter un système d'auth"

# 3. Claude va automatiquement :
# - Créer TASK-001 dans kanban.md
# - Décomposer en sous-tâches
# - Mettre à jour au fur et à mesure
# - Documenter le résultat

# 4. Vous pouvez visualiser dans l'app
open ~/tools/task-manager.html
# [Sélectionner mon-projet/]
# Voir TASK-001 avec toutes les sous-tâches cochées !
```

---

**🎉 Vous êtes prêt ! Commencez à organiser vos tâches dès maintenant.**
