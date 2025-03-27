# Gestionnaire de Tâches

Ce projet est une application web de gestion des tâches développée avec Node.js, Express et MongoDB (via Mongoose). Il permet de créer, consulter, mettre à jour et supprimer des tâches, ainsi que d'ajouter des sous-tâches et des commentaires.

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://votre-repo.git
   cd votre-repo
   Installer les dépendances :
   ```

bash
Copier
npm install
Configurer l'environnement :

Créez un fichier .env à la racine du projet.

Ajoutez-y la variable d'environnement pour la connexion à MongoDB :

ini
Copier

```.env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

Lancer le serveur :

bash
Copier

```bash
npm start
```

Le serveur démarre sur le port défini (par défaut 3000).

Documentation API
Endpoints Principaux
Tâches
GET /tasks
Récupère la liste de toutes les tâches.
Filtres et tris possibles :

statut : Filtrer par statut (ex. "à faire", "en cours", "terminée", "annulée").

priorite : Filtrer par priorité (ex. "basse", "moyenne", "haute", "critique").

categorie : Filtrer par catégorie.

etiquette : Filtrer par étiquette.

avant : Récupérer les tâches dont l'échéance est antérieure à une date.

apres : Récupérer les tâches dont l'échéance est postérieure à une date.

q : Recherche dans le titre et la description.

tri et ordre : Trier par un champ (ex. echeance, priorite, dateCreation) en ordre ascendant (asc) ou descendant (desc).

GET /tasks/:id
Récupère une tâche spécifique en fonction de son identifiant.

POST /tasks
Crée une nouvelle tâche.
Exemple de corps de requête (JSON) :

```json
Copier
{
"titre": "Créer une API REST",
"description": "Développer une API pour gérer les tâches.",
"echeance": "2025-04-05",
"statut": "à faire",
"priorite": "moyenne",
"auteur": {
"nom": "Dupont",
"prenom": "Jean",
"email": "jean.dupont@example.com"
},
"categorie": "travail",
"etiquettes": ["API", "Node.js"]
}
```

PUT /tasks/:id
Met à jour une tâche existante.
Le corps de la requête doit contenir les champs à modifier.

DELETE /tasks/:id
Supprime une tâche.

Sous-tâches
POST /tasks/:id/sousTaches
Ajoute une sous-tâche à une tâche.
Exemple de corps de requête (JSON) :

```json
Copier
{
"titre": "Implémenter les routes",
"statut": "à faire",
"echeance": "2025-03-30"
}
```

PUT /tasks/:id/sousTaches/:sousTacheId
Modifie une sous-tâche existante.

DELETE /tasks/:id/sousTaches/:sousTacheId
Supprime une sous-tâche.

Commentaires
POST /tasks/:id/commentaires
Ajoute un commentaire à une tâche.
Exemple de corps de requête (JSON) :

```json
Copier
{
"auteur": {
"nom": "Martin",
"prenom": "Sophie",
"email": "sophie.martin@example.com"
},
"contenu": "Bon début, mais il faut améliorer la gestion des erreurs."
}
```

PUT /tasks/:id/commentaires/:commentaireId
Modifie un commentaire existant.

DELETE /tasks/:id/commentaires/:commentaireId
Supprime un commentaire.

Mode d’emploi
Interface Web :
L'interface utilisateur est accessible via le fichier index.html situé dans le dossier public. Ouvrez-le dans votre navigateur pour créer, filtrer et gérer vos tâches à l'aide des formulaires proposés.

Utilisation de l'API :
Vous pouvez interagir directement avec l'API via des outils comme Postman ou en utilisant des requêtes HTTP depuis votre application front-end.

Développement et Tests :

Utilisez les commandes npm pour démarrer le serveur et tester les endpoints.

Assurez-vous que MongoDB est en cours d'exécution et que la variable MONGO_URI est correctement configurée dans le fichier .env.

```

```
