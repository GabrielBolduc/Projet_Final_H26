# Festify

---

## 1. Le Problème
L'organisation événementielle repose aujourd'hui sur une multitude d'outils déconnectés (billetterie externe, fichiers Excel, formulaires papier) qui ne communiquent pas entre eux. Cette absence de lien crée des zones d'ombre critiques pour les deux acteurs principaux :

### A. Du côté de l’organisateur
* **Données en silos :** Les ventes de billets ne sont pas reliées aux stocks logistiques en temps réel. L’organisateur ne peut donc pas savoir instantanément si une augmentation des ventes requiert plus de ressources et de personnel.
* **Perte de contrôle :** La gestion manuelle de plusieurs bases de données (artistes, accès, staff) augmente le risque d’erreur humaine et rend la coordination complexe.

### B. Du côté du festivalier
* **Expérience fragmentée :** L’utilisateur doit naviguer sur plusieurs plateformes (achat sur un site, inscription sur un autre, horaire en PDF), ce qui nuit à la fluidité du parcours client.
* **Accès complexe :** Les preuves d’accès sont souvent éparpillées (billets séparés pour l’entrée, le VIP ou les services), ce qui complique l’arrivée sur le site.

---

## 2. La Solution
**Festify** est un service web tout-en-un qui centralise la gestion commerciale et logistique. L’application offre une interface unifiée pour répondre aux besoins des deux publics :

1.  **Section Festivalière :** Une plateforme unique pour acheter son billet, réserver son hébergement (Camping ou hôtel) et consulter la programmation.
2.  **Section Organisatrice :** Un tableau de bord unique pour gérer la programmation, l’allocation des ressources et le staff, tout en accédant aux archives (revenus, dépenses, satisfaction) pour l'aide à la décision.

---

## 3. Valeur Ajoutée
La force de Festify réside dans l’automatisation et l’intégrité des données :

* **Intégrité du stock :** Liaison directe entre la billetterie et la capacité logistique (ex: la vente d’un billet réduit automatiquement les places de camping disponibles).
* **Code unique universel :** Génération d’un seul identifiant par festivalier pour tous ses accès.
* **Tri intelligent :** Algorithme de filtrage dynamique des hébergements basé sur la distance et des critères personnalisés.
* **Standard technique :** Communication via API avec le format **JSON**.

---

## 4. Répartition des Tâches

### 1- Artiste et programmation (**Gabriel Bolduc**)
**Responsabilité :** Gestion artistique et planification temporelle.
* **Administration :** Gestion des listes d'artistes et des infrastructures (scènes).
* **Planification :** Création de l'emploi du temps et assignation des créneaux.
* **Cohérence :** Outils de tri et filtrage pour éviter les conflits d'horaire.
* **Archives :** Création de nouveaux événements et gestion de l'historique des festivals passés.

### 2- Staff (**Laurent Le Bot Beaupré**)
**Responsabilité :** Espace administrateur pour la gestion du personnel.
* **Affectations :** Administration des listes de tâches et assignation des membres du staff.
* **Comptes :** Système de création de comptes employés par les administrateurs.
* **Suivi :** Module de recherche permettant de monitorer les tâches avec précision.

### 3- Hospitalité (**Alexandre Labbé**)
**Responsabilité :** Système de réservation (utilisateurs) et gestion hôtelière (admins).
* **Capacité :** Gestion des réservations multiples et des chambres additionnelles.
* **Algorithme de tri :** Calcul de distance entre vecteurs en base de données pour trier par proximité physique et temporelle (minutes).
* **Formulaires dynamiques :** Création d'hébergements avec champs contextuels selon le type d'établissement.

### 4- Billetterie (**Gabriel Racine**)
**Responsabilité :** Configuration commerciale et délivrance des accès.
* **Gestion des titres :** Définition des types de passes (weekend/journée) et des quotas de capacité.
* **Tunnel d'achat :** Formulaire de commande directe pour les festivaliers.
* **Preuves d'accès :** Génération de billets individuels avec code unique et nom du détenteur.
* **Recherche :** Filtrage avancé pour retrouver rapidement des commandes ou des billets.

---

## Schémas et Maquettes
<img width="2171" height="2069" alt="Schema_analyse drawio(3)" src="https://github.com/user-attachments/assets/6da4b93e-cc88-4a61-8925-c5762ffb1ab7" />

### Maquette Gabriel B.
<img width="4966" height="6966" alt="Maquette_GabrielB" src="https://github.com/user-attachments/assets/3802921c-c8b2-4d20-ac40-5c17d6c72bba" />

### Maquette Gabriel R.
<img width="4074" height="2182" alt="BilletterieGabR" src="https://github.com/user-attachments/assets/4dfc0718-a7cd-49c5-ba54-e8984491e391" />

### Maquette Alexandre
<img width="7726" height="3896" alt="Reservations _ Alexandre" src="https://github.com/user-attachments/assets/3f86e043-8e46-4534-8c17-4f205fe44cab" />

### Maquette Laurent
<img width="8906" height="5218" alt="laurent" src="https://github.com/user-attachments/assets/4be778db-38f0-4ca7-ba0f-4bb75e3c4f8b" />

