# 📅 Calendrier Interactif

## 🧩 Présentation

**Calendrier Interactif** est une application web permettant aux utilisateurs de **créer**, **modifier**, **supprimer** et **visualiser** des événements personnels via une interface fluide et intuitive. L'application s'appuie sur **FullCalendar** pour une gestion interactive du calendrier, et utilise une architecture **Node.js + Express** côté backend, avec une base de données **MySQL/MariaDB**.

---

## 🎯 Objectifs

* Proposer une solution simple pour la gestion d'événements personnels.
* Offrir une interface utilisateur réactive et conviviale.
* Assurer la séparation et la confidentialité des événements par utilisateur.
* Envoyer des **notifications visuelles** et **emails** lors d'actions importantes.

---

## ✅ Fonctionnalités

* 🔧 **CRUD complet** sur les événements (Créer, Lire, Mettre à jour, Supprimer)
* 👤 **Gestion des utilisateurs** (connexion, déconnexion, sessions)
* 📬 **Notifications visuelles** dynamiques pour chaque action
* ✉️ **Envoi d'emails** lors de la création, modification et suppression d'événements
* 🔐 Séparation stricte des événements par utilisateur
* 🌐 Interface compatible avec tous les navigateurs modernes

---

## 🛠️ Technologies utilisées

### Frontend

* HTML, CSS, JavaScript
* [FullCalendar](https://fullcalendar.io/) pour l'affichage du calendrier

### Backend

* Node.js + Express.js
* MariaDB / MySQL
* Sessions utilisateur
* Système d'emails intégré (hors Nodemailer)

---

## 🗃️ Structure du projet

```
calendrier-interactif/
├── backend/
│   ├── app.js
│   ├── routes/
│   ├── controllers/
│   └── config/
├── frontend/
│   └── index.html
└── README.md
```

---

## ⚙️ Installation

### Prérequis

* Node.js (v18+ recommandé)
* MySQL ou MariaDB installé et configuré

### 1. Clonage du dépôt

```bash
git clone https://github.com/votre-utilisateur/calendrier-interactif.git
```

### 2. Backend

```bash
cd calendrier-interactif/backend
npm install
node app.js
```

### 3. Frontend

Ouvrez simplement le fichier `index.html` dans un navigateur.

---

## 🔄 API – Endpoints

|  Méthode | Endpoint            | Description                   |
| -------: | ------------------- | ----------------------------- |
|    `GET` | `/events`           | Récupère tous les événements  |
|   `POST` | `/add-event`        | Crée un nouvel événement      |
|    `PUT` | `/update-event/:id` | Modifie un événement existant |
| `DELETE` | `/delete-event/:id` | Supprime un événement         |
|   `POST` | `/login`            | Connexion de l'utilisateur    |
|   `POST` | `/logout`           | Déconnexion de l'utilisateur  |

---

## 👥 Contribution

Contribuez en suivant ces étapes :

1. Forkez le dépôt
2. Créez une branche :
   ```bash
   git checkout -b feature/ma-nouvelle-fonction
   ```
3. Faites vos modifications
4. Commitez :
   ```bash
   git commit -m "Ajout : nouvelle fonctionnalité"
   ```
5. Poussez :
   ```bash
   git push origin feature/ma-nouvelle-fonction
   ```
6. Créez une **pull request** vers la branche principale

---

## 🔐 Sécurité & Confidentialité

* Les événements sont strictement liés à chaque utilisateur.
* La gestion des sessions assure que chaque utilisateur accède uniquement à ses données.
* L'envoi d'emails est sécurisé pour éviter les abus (vérification du contenu, anti-spam).

---

## 📄 Licence

Ce projet est sous licence **MIT**. Consultez le fichier [LICENSE](./LICENSE) pour plus d'informations.
