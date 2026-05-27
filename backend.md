# Documentation d'Intégration Backend (Laravel API)

Ce document sert de guide pour connecter le frontend **Next.js (Motoka)** au backend **Laravel API**. Il détaille les conventions, les protocoles d'authentification et la structure des données pour assurer une transition fluide du mode Mock vers le mode Réel.

## 1. Configuration de base

### Variables d'Environnement
Créer un fichier `.env.local` (si inexistant) :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Bibliothèques recommandées
Il est conseillé d'installer les outils suivants pour faciliter les appels API :
- `axios` : Pour les requêtes HTTP.
- `@tanstack/react-query` : Pour la gestion du cache et de l'état asynchrone.

## 2. Authentification (Laravel Sanctum)

Le système doit utiliser **Laravel Sanctum** (Token-based) pour l'authentification.

### Flux de connexion
1. **POST** `/login` : Envoie `email` et `password`.
2. **Réponse** : Retourne un `token` et l'objet `user`.
3. **Stockage** : Le token doit être stocké dans les cookies (pour le middleware) et passé dans le header `Authorization: Bearer <token>` pour chaque requête suivante.

### Mapping des Rôles
Assurez-vous que les rôles envoyés par Laravel correspondent exactement aux types définis dans `types/index.ts` :
- `Super Admin SaaS`
- `Admin Agence`
- `Admin Succursale`
- etc.

## 3. Multi-Tenancy (Cloisonnement)

Le frontend gère le cloisonnement via `agencyId` et `branchId`. 

### Stratégie de filtrage
Deux approches sont possibles (à adapter selon le backend Laravel) :
1. **Headers HTTP** (Recommandé) : Envoyer `X-Agency-ID` et `X-Branch-ID` dans chaque requête.
2. **Paramètres URL** : Ajouter `?agency_id=...&branch_id=...` aux requêtes GET.

## 4. Conventions de Données

### Mapping des Noms (CamelCase vs SnakeCase)
- **Laravel** utilise par défaut le `snake_case` (ex: `agency_id`, `created_at`).
- **Next.js (Motoka)** utilise le `camelCase` (ex: `agencyId`, `createdAt`).

**Action requise :** Créer un utilitaire de transformation ou configurer les *Resources* Laravel pour renvoyer du `camelCase`.

### Structure de Réponse API
Toutes les réponses doivent suivre ce format :
```json
{
  "success": true,
  "data": { ... },
  "message": "Action réussie"
}
```

## 5. Mapping des Endpoints (Mock API -> Laravel)

Remplacer les appels dans `lib/mock-api.ts` par les routes Laravel suivantes :

| Fonction Mock | Méthode | Endpoint Laravel | Description |
| :--- | :--- | :--- | :--- |
| `auth.login` | POST | `/login` | Authentification |
| `agencies.getAll` | GET | `/agencies` | Liste des agences (SaaS Admin) |
| `vehicles.getAll` | GET | `/vehicles` | Liste filtrée par agence/succursale |
| `trips.save` | POST/PUT | `/trips` | Créer ou modifier une course |
| `packages.save` | POST/PUT | `/packages` | Enregistrement de colis |
| `cash.getAll` | GET | `/transactions` | Flux financier |

## 6. Mode Offline & Synchronisation

Le frontend utilise `localforage` pour le mode offline-first. 
- Lors d'une perte de connexion, les actions sont ajoutées à `syncQueue`.
- Dès que la connexion est rétablie, l'IA devra implémenter une fonction de synchronisation qui "rejoue" ces actions vers le backend Laravel.

## 7. Gestion des Erreurs

Les erreurs de validation Laravel (Code 422) doivent être mappées pour être affichées par `react-hook-form` :
```json
{
  "message": "Données invalides",
  "errors": {
    "email": ["Cet email est déjà utilisé"],
    "plate": ["Le format de la plaque est incorrect"]
  }
}
```

---
*Note : Ce fichier doit être mis à jour au fur et à mesure que les routes réelles sont déployées sur le serveur Laravel.*
