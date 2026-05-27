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

Le système utilise **Laravel Sanctum**.

### Mapping des Rôles
Il existe une différence entre les labels frontend et les enums backend :

| Frontend Role | Backend `role_enum` |
| :--- | :--- |
| `Super Admin SaaS` | `superAdmin` |
| `Admin Agence` | `adminAgence` |
| `Dispatcher` | `dispatcher` |
| `Chauffeur` | `chauffeur` |

### Objet User & Session
Le backend renvoie l'ID de l'agence via le champ `Idagence`. 
**Attention :** Le frontend s'attend à `agencyId`. Un mapping sera nécessaire lors de la réception de l'objet `user`.

## 3. Multi-Tenancy (Cloisonnement)

Le backend utilise majoritairement `Idagence` (avec un 'I' majuscule et sans underscore) comme clé étrangère.

### Clés Primaires Backend
- Agence : `Idagence`
- Véhicule : `Idvehicule`
- Course : `Idcource` (Note: faute de frappe 'cource' dans la migration)
- Colis : `Idcolis`

## 4. Mapping des Champs (Exemples)

| Entité | Champ Frontend | Champ Backend |
| :--- | :--- | :--- |
| **User** | `agencyId` | `Idagence` |
| **User** | `role` | `role_enum` |
| **Vehicle** | `plate` | `plaque` |
| **Package** | `sender` | `nomExpediteur` |
| **Package** | `receiver` | `nomDestinateur` |

## 5. État actuel du Backend

D'après l'analyse du dossier `backend-motoka` :
- **Authentification** : Opérationnelle (`AuthController`).
- **Agences** : Opérationnel (`AgenceController`).
- **Véhicules** : Opérationnel (`VehiculeController`).
- **Utilisateurs** : Opérationnel (`UserController`).
- **Courses/Colis** : Les migrations existent mais les contrôleurs (`CourseControlleur`, `ColisController`) sont actuellement **vides**. Ils devront être implémentés pour que la liaison fonctionne.

## 6. Mapping des Endpoints (Mock API -> Laravel)

Remplacer les appels dans `lib/mock-api.ts` par les routes Laravel suivantes :

| Fonction Mock | Méthode | Endpoint Laravel | Description |
| :--- | :--- | :--- | :--- |
| `auth.login` | POST | `/login` | Authentification |
| `agencies.getAll` | GET | `/agencies` | Liste des agences (SaaS Admin) |
| `vehicles.getAll` | GET | `/vehicules` | Liste filtrée |
| `trips.save` | POST/PUT | `/courses` | (À implémenter côté backend) |
| `packages.save` | POST/PUT | `/colis` | (À implémenter côté backend) |


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
