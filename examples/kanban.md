# Kanban - E-commerce Project

## ⚙️ Configuration

**Columns**: 📝 Backlog (backlog) | 📋 To Do (todo) | 🚀 In Progress (in-progress) | 👀 In Review (in-review) | ✅ Done (done)
**Categories**: Frontend, Backend, Database, DevOps, Design, Tests, Documentation, Security
**Users**: @alice, @bob, @charlie, @diana
**Tags**: #bug, #feature, #urgent, #refactor, #performance, #security, #api, #ui, #database

## 📝 Backlog

### TASK-015 | Ajouter système de recommandations produits

**Priority**: Low | **Category**: Backend | **Assigned**: @alice
**Created**: 2025-11-02
**Tags**: #feature #ai #recommandations

Implémenter un moteur de recommandations basé sur l'historique d'achats et les produits consultés.

**Subtasks**:
- [ ] Analyser les algorithmes de recommandation (collaborative filtering, content-based)
- [ ] Choisir la solution technique (service externe ou algo interne)
- [ ] Implémenter la collecte de données utilisateur
- [ ] Créer l'API de recommandations
- [ ] Intégrer dans l'interface produit
- [ ] Tests A/B pour mesurer l'impact

**Notes**:
Possibilité d'utiliser un service tiers comme AWS Personalize ou implémenter un algo simple avec des similarités cosinus.

---

### TASK-016 | Mode sombre complet

**Priority**: Medium | **Category**: Frontend | **Assigned**: @diana
**Created**: 2025-11-03
**Tags**: #feature #ui #design

Ajouter un thème sombre pour toute l'application avec toggle de préférence utilisateur.

**Subtasks**:
- [ ] Définir la palette de couleurs dark mode
- [ ] Créer les variables CSS pour les deux thèmes
- [ ] Implémenter le toggle switch
- [ ] Sauvegarder la préférence utilisateur
- [ ] Tester sur toutes les pages
- [ ] Respecter la préférence système (prefers-color-scheme)

---

### TASK-017 | Export rapports analytics PDF

**Priority**: Low | **Category**: Backend | **Assigned**: @bob
**Created**: 2025-11-04
**Tags**: #feature #reporting #pdf

Permettre aux admins d'exporter les statistiques de vente en PDF.

**Subtasks**:
- [ ] Choisir librairie PDF (jsPDF, PDFKit, etc.)
- [ ] Designer le template PDF
- [ ] Implémenter génération côté serveur
- [ ] Ajouter graphiques et tableaux
- [ ] Bouton d'export dans le dashboard
- [ ] Tests avec gros volumes de données

---

## 📋 To Do

### TASK-012 | Corriger bug de calcul de taxes

**Priority**: Critical | **Category**: Backend | **Assigned**: @bob
**Created**: 2025-11-05 | **Due**: 2025-11-08
**Tags**: #bug #urgent #taxes #payment

Les taxes ne sont pas calculées correctement pour les livraisons internationales. Clients canadiens facturés avec TVA française.

**Subtasks**:
- [ ] Reproduire le bug avec commandes test
- [ ] Identifier la logique de calcul de taxes actuelle
- [ ] Créer table de mapping pays → taux de taxe
- [ ] Implémenter la correction
- [ ] Tests unitaires pour chaque pays
- [ ] Tests end-to-end sur le checkout

**Notes**:
Bug signalé par 12 clients. Impact financier potentiel. À corriger en priorité absolue.

---

### TASK-013 | Optimiser temps de chargement page produit

**Priority**: High | **Category**: Performance | **Assigned**: @alice
**Created**: 2025-11-06 | **Due**: 2025-11-12
**Tags**: #performance #optimization #frontend

Page produit charge en 2.8s, objectif < 1s. Images trop lourdes, requêtes API multiples non optimisées.

**Subtasks**:
- [ ] Profiler avec Lighthouse et DevTools
- [ ] Optimiser images (WebP, lazy loading, responsive)
- [ ] Grouper les requêtes API (GraphQL ou batch endpoint)
- [ ] Implémenter cache côté client
- [ ] Code splitting pour réduire bundle JS
- [ ] Tests de performance avant/après

**Notes**:

**Métriques actuelles** :
- LCP: 2.8s (objectif: < 1s)
- FID: 120ms (objectif: < 100ms)
- CLS: 0.18 (objectif: < 0.1)

---

### TASK-014 | Ajouter filtres avancés catalogue

**Priority**: High | **Category**: Frontend | **Assigned**: @diana
**Created**: 2025-11-07
**Tags**: #feature #ui #catalogue

Permettre de filtrer les produits par prix, marque, couleur, taille, note, disponibilité avec combinaisons multiples.

**Subtasks**:
- [ ] Designer l'interface des filtres (sidebar ou top bar)
- [ ] Implémenter les composants de filtres (checkboxes, range slider, etc.)
- [ ] Ajouter logique de filtrage côté client
- [ ] Pagination avec filtres actifs
- [ ] URL query params pour partager filtres
- [ ] Tests avec différentes combinaisons

---

## 🚀 In Progress

### TASK-009 | Implémenter paiement Stripe

**Priority**: Critical | **Category**: Backend | **Assigned**: @bob, @charlie
**Created**: 2025-10-28 | **Started**: 2025-11-01 | **Due**: 2025-11-10
**Tags**: #feature #payment #stripe #api

Intégrer Stripe pour gérer les paiements CB, Apple Pay, Google Pay.

**Subtasks**:
- [x] Créer compte Stripe et obtenir clés API
- [x] Setup SDK Stripe côté serveur
- [x] Créer endpoints payment intent et confirmation
- [x] Implémenter webhook pour événements Stripe
- [ ] Intégrer Stripe Elements côté frontend
- [ ] Gérer les erreurs de paiement (carte refusée, etc.)
- [ ] Tests avec cartes de test Stripe
- [ ] Passer en mode production

**Notes**:

**API endpoints créés** :
- POST /api/payment/create-intent
- POST /api/payment/confirm
- POST /api/webhooks/stripe

**En cours** : Intégration frontend avec Stripe Elements (sous-tâche 5/8).

---

### TASK-010 | Migration base de données PostgreSQL

**Priority**: High | **Category**: Database | **Assigned**: @alice
**Created**: 2025-10-30 | **Started**: 2025-11-04
**Tags**: #database #migration #postgresql

Migrer de SQLite vers PostgreSQL pour supporter la montée en charge.

**Subtasks**:
- [x] Setup PostgreSQL sur serveur staging
- [x] Créer schéma de migration
- [x] Script d'export SQLite
- [x] Script d'import PostgreSQL
- [ ] Migration données de production (prévu demain)
- [ ] Tests de validation des données
- [ ] Basculement production
- [ ] Monitoring post-migration

**Notes**:

**Blocage actuel** :
Migration en staging OK (15,000 produits, 8,000 utilisateurs, 12,000 commandes).
Prêt pour migration prod demain matin 6h (trafic faible).

**Backup** : Snapshot complet avant migration.

---

### TASK-011 | Dashboard admin analytics

**Priority**: Medium | **Category**: Frontend | **Assigned**: @diana, @charlie
**Created**: 2025-11-01 | **Started**: 2025-11-05
**Tags**: #feature #dashboard #admin #analytics

Créer un dashboard pour les admins avec statistiques de vente, graphiques, KPIs.

**Subtasks**:
- [x] Designer la maquette du dashboard
- [x] Créer les composants de graphiques (Chart.js)
- [x] API endpoint pour statistiques
- [ ] Intégrer les graphiques dans l'interface
- [ ] Ajouter filtres par date
- [ ] Export CSV des données
- [ ] Tests avec données réelles

**Notes**:

**KPIs à afficher** :
- CA total et évolution
- Nombre de commandes
- Panier moyen
- Produits les plus vendus
- Top clients
- Taux de conversion

Progression : 60% (4/7 sous-tâches).

---

## 👀 In Review

### TASK-007 | Système de wishlist

**Priority**: Medium | **Category**: Frontend | **Assigned**: @diana
**Created**: 2025-10-25 | **Started**: 2025-10-28 | **Finished**: 2025-11-03
**Tags**: #feature #wishlist #ui

Permettre aux utilisateurs de sauvegarder des produits favoris dans une wishlist.

**Subtasks**:
- [x] Créer modèle Wishlist en BDD
- [x] API CRUD pour wishlist
- [x] Bouton "Ajouter aux favoris" sur page produit
- [x] Page dédiée "Mes favoris"
- [x] Partage de wishlist par lien
- [x] Tests unitaires et e2e

**Notes**:

**Résultat** :
✅ Fonctionnalité complète et testée. En attente de review de @bob.

**Fichiers modifiés** :
- src/api/wishlist.js (nouveau)
- src/components/WishlistButton.jsx (nouveau)
- src/pages/Wishlist.jsx (nouveau)
- src/models/Wishlist.js (nouveau)

**Tests effectués** :
- ✅ Ajout/suppression produits
- ✅ Affichage liste
- ✅ Partage par lien unique
- ✅ Synchronisation multi-devices

---

### TASK-008 | Système de reviews produits

**Priority**: High | **Category**: Backend | **Assigned**: @bob, @alice
**Created**: 2025-10-26 | **Started**: 2025-10-30 | **Finished**: 2025-11-04
**Tags**: #feature #reviews #moderation

Permettre aux clients de laisser des avis et notes sur les produits.

**Subtasks**:
- [x] Créer modèle Review en BDD
- [x] API pour CRUD reviews
- [x] Système de modération (validation admin)
- [x] Affichage reviews sur page produit
- [x] Calcul note moyenne
- [x] Upload photos dans reviews
- [x] Tri reviews (plus utiles, récents, etc.)
- [x] Tests complets

**Notes**:

**Résultat** :
✅ Système complet avec modération, photos, et tri. En review finale.

**Fichiers modifiés** :
- src/api/reviews.js (nouveau)
- src/models/Review.js (nouveau)
- src/components/ReviewList.jsx (nouveau)
- src/components/ReviewForm.jsx (nouveau)
- src/admin/ModerationPanel.jsx (nouveau)

**Décisions techniques** :
- Modération automatique + manuelle (filtrage mots-clés puis validation admin)
- Upload photos via Cloudinary
- Calcul note moyenne en temps réel avec trigger BDD

**Tests effectués** :
- ✅ CRUD reviews complet
- ✅ Modération auto/manuelle
- ✅ Upload 5 photos max par review
- ✅ Performance avec 10,000 reviews

---

## ✅ Done

### TASK-001 | Setup projet et architecture

**Priority**: Critical | **Category**: DevOps | **Assigned**: @alice, @bob
**Created**: 2025-10-15 | **Started**: 2025-10-15 | **Finished**: 2025-10-18
**Tags**: #setup #architecture #devops

Initialiser le projet avec stack technique, CI/CD, et environnements dev/staging/prod.

**Subtasks**:
- [x] Initialiser repo Git
- [x] Setup Node.js + Express backend
- [x] Setup React frontend
- [x] Configuration Docker + docker-compose
- [x] Setup GitHub Actions CI/CD
- [x] Environnements dev/staging/prod
- [x] Documentation architecture

**Notes**:

**Résultat** :
✅ Projet complètement setupé et déployable.

**Stack technique** :
- Backend: Node.js 20 + Express + TypeScript
- Frontend: React 18 + Vite + TailwindCSS
- Database: PostgreSQL 15
- Cache: Redis 7
- Hosting: AWS (EC2 + RDS + S3)

**Fichiers modifiés** :
- package.json, Dockerfile, docker-compose.yml
- .github/workflows/ci.yml
- docs/ARCHITECTURE.md

---

### TASK-002 | Authentification JWT

**Priority**: Critical | **Category**: Backend | **Assigned**: @bob
**Created**: 2025-10-18 | **Started**: 2025-10-19 | **Finished**: 2025-10-22
**Tags**: #security #auth #jwt

Implémenter système d'authentification avec JWT, refresh tokens, et sécurité renforcée.

**Subtasks**:
- [x] Créer modèle User
- [x] Hash passwords avec bcrypt
- [x] Génération JWT access + refresh tokens
- [x] Middleware d'authentification
- [x] Endpoints login/logout/refresh
- [x] Rate limiting anti-bruteforce
- [x] Tests sécurité

**Notes**:

**Résultat** :
✅ Système d'auth sécurisé et testé.

**Décisions techniques** :
- Access token: 15 min (JWT)
- Refresh token: 7 jours (stocké en BDD)
- Rate limiting: 5 tentatives / 15 min par IP
- HTTPS obligatoire en production

**Tests effectués** :
- ✅ Login/logout/refresh
- ✅ Token expiration
- ✅ Rate limiting
- ✅ Tests de pénétration basiques

---

### TASK-003 | Catalogue produits avec recherche

**Priority**: High | **Category**: Backend | **Assigned**: @alice
**Created**: 2025-10-20 | **Started**: 2025-10-23 | **Finished**: 2025-10-27
**Tags**: #feature #catalogue #search

Créer le catalogue produits avec recherche full-text et filtres de base.

**Subtasks**:
- [x] Modèle Product en BDD
- [x] API CRUD produits
- [x] Index full-text pour recherche
- [x] Pagination et tri
- [x] Upload images produits (S3)
- [x] Cache Redis pour requêtes fréquentes
- [x] Tests performance

**Notes**:

**Résultat** :
✅ 500 produits ajoutés, recherche < 50ms.

**Fichiers modifiés** :
- src/models/Product.js
- src/api/products.js
- src/services/s3.js

**Performances** :
- Recherche full-text: 35ms moyenne
- Listing avec pagination: 20ms
- Cache hit rate: 85%

---

### TASK-004 | Panier d'achat

**Priority**: High | **Category**: Frontend | **Assigned**: @diana
**Created**: 2025-10-22 | **Started**: 2025-10-25 | **Finished**: 2025-10-29
**Tags**: #feature #cart #ui

Implémenter le panier d'achat avec ajout/suppression, quantités, calcul total.

**Subtasks**:
- [x] Modèle Cart en BDD
- [x] API gestion panier
- [x] Composant CartIcon avec badge
- [x] Page panier détaillée
- [x] Calcul automatique totaux (HT, TVA, TTC)
- [x] Persistence panier (localStorage + BDD si connecté)
- [x] Tests e2e

**Notes**:

**Résultat** :
✅ Panier fonctionnel avec sync multi-devices.

**Fichiers modifiés** :
- src/components/Cart.jsx
- src/api/cart.js
- src/hooks/useCart.js

**Tests effectués** :
- ✅ Ajout/suppression produits
- ✅ Modification quantités
- ✅ Calcul totaux avec taxes
- ✅ Sync entre devices pour users connectés

---

### TASK-005 | Interface utilisateur responsive

**Priority**: High | **Category**: Design | **Assigned**: @diana
**Created**: 2025-10-24 | **Started**: 2025-10-27 | **Finished**: 2025-11-01
**Tags**: #design #responsive #ui #mobile

Créer une interface moderne, responsive (mobile-first) avec TailwindCSS.

**Subtasks**:
- [x] Définir design system (couleurs, fonts, spacing)
- [x] Composants header/footer/navigation
- [x] Page d'accueil
- [x] Page produit détail
- [x] Page catalogue avec grille responsive
- [x] Tests sur mobile, tablette, desktop
- [x] Accessibilité (WCAG AA)

**Notes**:

**Résultat** :
✅ Interface complète, responsive, accessible.

**Design system** :
- Couleurs: Palette bleue (primary: #3b82f6)
- Font: Inter
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

**Tests effectués** :
- ✅ iPhone 13 Pro, iPad Air, Desktop 1920px
- ✅ Score Lighthouse Accessibility: 98/100

---

### TASK-006 | Tests unitaires et e2e

**Priority**: High | **Category**: Tests | **Assigned**: @charlie
**Created**: 2025-10-26 | **Started**: 2025-10-30 | **Finished**: 2025-11-02
**Tags**: #tests #quality #ci

Mettre en place suite de tests complète : unitaires (Jest), e2e (Playwright).

**Subtasks**:
- [x] Setup Jest pour backend
- [x] Setup Vitest + Testing Library pour frontend
- [x] Tests unitaires API (80%+ couverture)
- [x] Setup Playwright
- [x] Tests e2e parcours utilisateur
- [x] Intégration dans CI/CD
- [x] Coverage reporting

**Notes**:

**Résultat** :
✅ 240 tests, couverture 87%, CI green.

**Métriques** :
- Tests unitaires: 182 (backend: 95, frontend: 87)
- Tests e2e: 58 scénarios
- Couverture: Backend 92%, Frontend 81%
- Durée CI: 4min 30s

**Fichiers modifiés** :
- tests/ (nouveau dossier, 240 fichiers de tests)
- jest.config.js, vitest.config.js, playwright.config.js

---

<!-- LAST_TASK_ID:017 -->
