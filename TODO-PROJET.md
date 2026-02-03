# Pages détectées

## Web (Backoffice / web-manager-react)

| Route | Composant | Dossier |
|---|---|---|
| `/` | `PublicHome` | `src/pages/PublicHome.tsx` |
| `/login` | `Login` | `src/pages/auth/Login.tsx` |
| `/inscription` | `Inscription` | `src/pages/auth/Inscription.tsx` |
| `/carte` | `CartePage` | `src/pages/CartePage.tsx` |
| `/tableau` | `Dashboard` | `src/pages/Dashboard.tsx` |
| `/signalements` | `SignalementList` | `src/pages/signalement/SignalementList.tsx` |
| `/signalements/ajouter` | `AddSignalement` | `src/pages/signalement/AddSignalement.tsx` |
| `/signalements/modifier/:id` | `EditSignalement` | `src/pages/signalement/EditSignalement.tsx` |
| `/utilisateurs` | `UserList` | `src/pages/user/UserList.tsx` |
| `/utilisateurs/creer` | `CreateUser` | `src/pages/user/CreateUser.tsx` |
| `/utilisateurs/modifier/:id` | `EditUser` | `src/pages/user/EditUser.tsx` |
| `/entreprises` | `EntrepriseList` | `src/pages/entreprise/EntrepriseList.tsx` |
| `/entreprises/creer` | `CreateEntreprise` | `src/pages/entreprise/CreateEntreprise.tsx` |
| `/entreprises/modifier/:id` | `EditEntreprise` | `src/pages/entreprise/EditEntreprise.tsx` |
| `/manager` | `ManagerProfile` | `src/pages/manager/ManagerProfile.tsx` |
| `/manager/edit` | `EditManagerProfile` | `src/pages/manager/EditManagerProfile.tsx` |
| `/manager/validations` | `ValidationQueue` | `src/pages/manager/ValidationQueue.tsx` |

Pages trouvées mais non routées (à vérifier si à garder) :
- `src/pages/user/ManagerCreateUser.tsx`
- `src/pages/user/ManagerUnlockUsers.tsx`

## Mobile (Ionic Vue / travaux-routiers-mobile)

| Route | Page | Fichier |
|---|---|---|
| `/login` | `LoginPage` | `src/views/LoginPage.vue` |
| `/tabs/` | `TabsPage` | `src/views/TabsPage.vue` |
| `/tabs/tab1` | `Tab1Page` (Carte + création signalement) | `src/views/Tab1Page.vue` |
| `/tabs/tab2` | `Tab2Page` (placeholder) | `src/views/Tab2Page.vue` |
| `/tabs/tab3` | `Tab3Page` (placeholder) | `src/views/Tab3Page.vue` |

Page trouvée mais non routée (UI prête) :
- `src/views/RegisterPage.vue`

---

# TODO (modèle demandé)

Colonnes : `Ligne | Catégorie | Module | Page | Taches | Type`

| Ligne | Catégorie | Module | Page | Taches | Type |
|---:|---|---|---|---|---|
| 1 | Backoffice | Accueil public | PublicHome | UI: header + stats + carte | Affichage |
| 2 | Backoffice | Accueil public | PublicHome | Fonctions: calcul stats + filtres (statuts/surfaces/budgets) | Metier |
| 3 | Backoffice | Accueil public | PublicHome | Intégrer: appel API `GET /signalements` + gestion loading/erreurs | Integration |
| 4 | Backoffice | Auth | Login | UI: formulaire login + validations | Affichage |
| 5 | Backoffice | Auth | Login | Endpoint: `POST /auth/login` (roles/token) ou fonction `login()` côté service | Metier |
| 6 | Backoffice | Auth | Login | Intégrer: stockage token + guards (`RequireAuth`/`RequireRole`) | Integration |
| 7 | Backoffice | Auth | Inscription | UI: formulaire inscription + validations | Affichage |
| 8 | Backoffice | Auth | Inscription | Endpoint: `POST /auth/register` (création utilisateur) | Metier |
| 9 | Backoffice | Auth | Inscription | Intégrer: appel register + redirection + messages erreurs | Integration |
| 10 | Backoffice | Carte | CartePage | UI: page carte + légende + actions (filtres/centrage) | Affichage |
| 11 | Backoffice | Carte | CartePage | Fonctions: affichage marqueurs + filtres + sélection détail | Metier |
| 12 | Backoffice | Carte | CartePage | Intégrer: charger signalements + tuiles/tiles + refresh | Integration |
| 13 | Backoffice | Tableau de bord | Dashboard | UI: cartes KPI + tableaux + graphiques | Affichage |
| 14 | Backoffice | Tableau de bord | Dashboard | Fonctions: calcul KPI + règles de synchro (Firebase↔Local) | Metier |
| 15 | Backoffice | Tableau de bord | Dashboard | Intégrer: endpoints/fonctions de sync + feedback utilisateur | Integration |
| 16 | Backoffice | Signalements | SignalementList | UI: liste (table) + filtres + actions | Affichage |
| 17 | Backoffice | Signalements | SignalementList | Endpoint: `GET /signalements` (pagination + filtres) | Metier |
| 18 | Backoffice | Signalements | SignalementList | Intégrer: fonction `listSignalements()` + état + refresh | Integration |
| 19 | Backoffice | Signalements | AddSignalement | UI: formulaire création + upload photo | Affichage |
| 20 | Backoffice | Signalements | AddSignalement | Endpoint: `POST /signalements` (validation + image/photoUrl) | Metier |
| 21 | Backoffice | Signalements | AddSignalement | Intégrer: fonction `createSignalement()` + toast + redirect | Integration |
| 22 | Backoffice | Signalements | AddSignalement | Base: modèle + table + stockage URL photo (ou storage) | Base |
| 23 | Backoffice | Signalements | EditSignalement | UI: formulaire modification + pré-remplissage | Affichage |
| 24 | Backoffice | Signalements | EditSignalement | Endpoint: `PUT/PATCH /signalements/{id}` (status + champs) | Metier |
| 25 | Backoffice | Signalements | EditSignalement | Intégrer: fonction `updateSignalement()` + reload + erreurs | Integration |
| 26 | Backoffice | Signalements | EditSignalement | Base: persistance update + historique statut si besoin | Base |
| 27 | Backoffice | Utilisateurs | UserList | UI: liste utilisateurs + recherche + actions | Affichage |
| 28 | Backoffice | Utilisateurs | UserList | Endpoint: `GET /users` (roles, pagination) | Metier |
| 29 | Backoffice | Utilisateurs | UserList | Intégrer: fonction `listUsers()` + états + erreurs | Integration |
| 30 | Backoffice | Utilisateurs | CreateUser | UI: formulaire création user | Affichage |
| 31 | Backoffice | Utilisateurs | CreateUser | Endpoint: `POST /users` (création + role) | Metier |
| 32 | Backoffice | Utilisateurs | CreateUser | Intégrer: fonction `createUser()` + redirect + validation | Integration |
| 33 | Backoffice | Utilisateurs | CreateUser | Base: table users + contraintes + hash mdp | Base |
| 34 | Backoffice | Utilisateurs | EditUser | UI: formulaire édition user | Affichage |
| 35 | Backoffice | Utilisateurs | EditUser | Endpoint: `PUT/PATCH /users/{id}` (profil/role/état) | Metier |
| 36 | Backoffice | Utilisateurs | EditUser | Intégrer: fonction `updateUser()` + pré-remplissage | Integration |
| 37 | Backoffice | Utilisateurs | EditUser | Base: persistance update + audit si besoin | Base |
| 38 | Backoffice | Entreprises | EntrepriseList | UI: liste entreprises + recherche + actions | Affichage |
| 39 | Backoffice | Entreprises | EntrepriseList | Endpoint: `GET /entreprises` (pagination + filtres) | Metier |
| 40 | Backoffice | Entreprises | EntrepriseList | Intégrer: fonction `listEntreprises()` + états | Integration |
| 41 | Backoffice | Entreprises | CreateEntreprise | UI: formulaire création entreprise | Affichage |
| 42 | Backoffice | Entreprises | CreateEntreprise | Endpoint: `POST /entreprises` (validation) | Metier |
| 43 | Backoffice | Entreprises | CreateEntreprise | Intégrer: fonction `createEntreprise()` + redirect | Integration |
| 44 | Backoffice | Entreprises | CreateEntreprise | Base: table entreprises + index/contraintes | Base |
| 45 | Backoffice | Entreprises | EditEntreprise | UI: formulaire édition entreprise | Affichage |
| 46 | Backoffice | Entreprises | EditEntreprise | Endpoint: `PUT/PATCH /entreprises/{id}` | Metier |
| 47 | Backoffice | Entreprises | EditEntreprise | Intégrer: fonction `updateEntreprise()` + pré-remplissage | Integration |
| 48 | Backoffice | Entreprises | EditEntreprise | Base: persistance update + règles d’unicité | Base |
| 49 | Backoffice | Profil manager | ManagerProfile | UI: page profil + infos + actions | Affichage |
| 50 | Backoffice | Profil manager | ManagerProfile | Endpoint: `GET /manager/me` (profil + permissions) | Metier |
| 51 | Backoffice | Profil manager | ManagerProfile | Intégrer: fonction `getManagerProfile()` + affichage | Integration |
| 52 | Backoffice | Profil manager | EditManagerProfile | UI: formulaire édition profil manager | Affichage |
| 53 | Backoffice | Profil manager | EditManagerProfile | Endpoint: `PUT /manager/me` (update profil) | Metier |
| 54 | Backoffice | Profil manager | EditManagerProfile | Intégrer: fonction `updateManagerProfile()` + redirect | Integration |
| 55 | Backoffice | Profil manager | EditManagerProfile | Base: persistance profil + validations | Base |
| 56 | Backoffice | Validations | ValidationQueue | UI: file d’attente + boutons valider/refuser | Affichage |
| 57 | Backoffice | Validations | ValidationQueue | Endpoints: `GET /validations` + `POST /validations/{id}/approve|reject` | Metier |
| 58 | Backoffice | Validations | ValidationQueue | Intégrer: actions approve/reject + refresh liste | Integration |
| 59 | Mobile | Auth | LoginPage | UI: formulaire login + toast erreurs | Affichage |
| 60 | Mobile | Auth | LoginPage | Fonction: `loginFirebaseOnly(email, password)` + règles validation | Metier |
| 61 | Mobile | Auth | LoginPage | Intégrer: auth state + redirection `/tabs/tab1` | Integration |
| 62 | Mobile | Navigation | TabsPage | UI: tabbar + libellés + icônes | Affichage |
| 63 | Mobile | Navigation | TabsPage | Règles: navigation + (option) guard si non connecté | Metier |
| 64 | Mobile | Navigation | TabsPage | Intégrer: `waitForAuthReady()` + protection routes si besoin | Integration |
| 65 | Mobile | Carte & signalements | Tab1Page | UI: carte + recap KPI + formulaire création | Affichage |
| 66 | Mobile | Carte & signalements | Tab1Page | Fonctions: `createFirebaseSignalement()` + filtres + brouillon geo | Metier |
| 67 | Mobile | Carte & signalements | Tab1Page | Intégrer: `subscribeFirebaseSignalements()` + geoloc + upload photo | Integration |
| 68 | Mobile | Carte & signalements | Tab1Page | Base: structure données (Firebase) + storage photo + indexes | Base |
| 69 | Mobile | Onglet 2 | Tab2Page | UI: écran onglet 2 (à définir) | Affichage |
| 70 | Mobile | Onglet 2 | Tab2Page | Métier: définir feature + créer fonctions/services associés | Metier |
| 71 | Mobile | Onglet 2 | Tab2Page | Intégrer: brancher API/Firebase + états loading/erreurs | Integration |
| 72 | Mobile | Onglet 3 | Tab3Page | UI: écran onglet 3 (à définir) | Affichage |
| 73 | Mobile | Onglet 3 | Tab3Page | Métier: définir feature + créer fonctions/services associés | Metier |
| 74 | Mobile | Onglet 3 | Tab3Page | Intégrer: brancher API/Firebase + états loading/erreurs | Integration |
| 75 | Mobile | Auth | RegisterPage | UI: formulaire inscription + validations | Affichage |
| 76 | Mobile | Auth | RegisterPage | Fonction: `registerUser()` (Firebase/Auth) ou endpoint `POST /auth/register` | Metier |
| 77 | Mobile | Auth | RegisterPage | Intégrer: création compte + auto-login + redirection | Integration |

> Notes :
> - `Type=Integration` = branchement front ↔ API/services (HTTP/Firebase).
> - `Type=Base` = tâches de persistance / modèle / migration / endpoints backend nécessaires au CRUD.
> - Les pages "non routées" sont listées séparément pour décision (à supprimer ou à intégrer).
