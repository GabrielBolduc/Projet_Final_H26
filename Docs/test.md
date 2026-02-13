
## FESTIVAL Gabriel Bolduc

**Actions referentielles:**
  - [PERFORMANCE] : DELETE CASCADE 
  - [PACKAGE] : DELETE CASCADE 
  - [RESERVATIONS] : DELETE CASCADE 
  - [AFFECTATION] : DELETE CASCADE 

**Validations:**
  - [start_date] : Format DATE requis. Doit etre moins vieux ou égal à [end_date].
  - [end_date] : Format DATE requis. Doit etre plus vieux ou égal à [start_date].
  - [status] : ENUM requis. Valeurs : 'DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'.
  - [daily_capacity] : Entier strictement positif (> 0).
  - [coordinates] : Format SPATIAL POINT valide (Géolocalisation).
  - [satisfaction] : Entier entre 0 et 5 (Optionnel).

---

## [ARTIST]

**Actions referentielles:**
  - [PERFORMANCE] : DELETE RESTRICT (Impossible de supprimer un artiste s'il est programmé dans une performance active).
  - [SELF] : SOFT DELETE (archive sans perte d'historique).

**Validations:**
  - [name] : String requis (Max 100). Doit etre UNIQUE.
  - [genre] : String requis (Max 50).
  - [popularity] : Entier requis. Doit etre entre 0 et 5.
  - [image] : Validation du format.

---

## [STAGE]

**Actions referentielles:**
  - [PERFORMANCE] : DELETE RESTRICT (Impossible de supprimer une scene si des spectacles y sont liee).

**Validations:**
  - [name] : Chaîne de caractères requise (Max 100).
  - [capacity] : Entier strictement positif (> 0).
  - [environment] : ENUM requis. Valeurs : 'INDOOR', 'OUTDOOR', 'COVERED'.
  - [technical_specs] : Texte libre (Optionnel).

---

## [PERFORMANCE]

**Actions referentielles:**
  - [FESTIVAL] : UPDATE CASCADE, DELETE CASCADE.
  - [ARTIST] : UPDATE CASCADE, DELETE RESTRICT.
  - [STAGE] : UPDATE CASCADE, DELETE RESTRICT.

**Validations:**
  - [start_time] : DATETIME requis. Doit etre inclus dans les dates du [FESTIVAL].
  - [end_time] : DATETIME requis. Doit etre strictement apres [start_time].
  - [price] : Décimal positif ou nul (>= 0.00).
  - [LOGIQUE MÉTIER] : Trigger. Un [stage_id] ne peut pas avoir de chevauchement d'horaire.
  - [LOGIQUE MÉTIER] : Validation. Un [artist_id] ne peut pas jouer a deux endroits en meme temps.

---

# Billetterie Gabriel Racine

---

## [PACKAGE]
### Actions référentielles
* **[FESTIVAL]** : `DELETE CASCADE` (Si un festival est supprimé, ses forfaits le sont aussi).

### Validations
* **[title]** : String requis (Max 100).
* **[type]** : `ENUM` requis. Valeurs : `'General'`, `'Evening'`, `'Daily'`.
* **[price]** : Décimal positif ou nul ($>= 0.00$).
* **[total_quota]** : Entier strictement positif ($> 0$).
* **[valid_from]** : `DATETIME` requis. Doit être antérieur à `[valid_until]`.
* **[valid_until]** : `DATETIME` requis. Doit être ultérieur à `[valid_from]`.
* **[image_url]** : String. Validation du format URL.

---

## [ORDER]
### Actions référentielles
* **[USER]** : `DELETE RESTRICT` (Impossible de supprimer un utilisateur s'il a un historique de commandes).

### Validations
* **[purchase_date]** : `DATETIME` requis. Défaut : `CURRENT_TIMESTAMP`.

---

## [TICKET]
### Actions référentielles
* **[ORDER]** : `DELETE CASCADE` (Si la commande est supprimée, les tickets le sont aussi).
* **[PACKAGE]** : `DELETE RESTRICT` (Impossible de supprimer un forfait si des billets ont été vendus).

### Validations
* **[unique_code]** : String requis (UUID recommandé). Doit être **UNIQUE** pour garantir la sécurité du QR Code.
* **[purchase_price]** : Décimal positif ou nul ($>= 0.00$). Snapshot du prix au moment de l'achat.
* **[holder_name]** : String requis (Max 100).
* **[holder_email]** : String requis (Max 255). Format email valide.
* **[holder_phone]** : String (Max 20).
* **[refunded]** : Booléen. Défaut `FALSE`.

## [LOGIQUE MÉTIER]
* **Trigger** : Vérification du quota (Sold Out) avant insertion.
* **Trigger** : Snapshot automatique du prix depuis `[PACKAGE]` si non fourni.

---

## Hospitalité Alexandre  

## Tables

### Audits
* **id** : `INT PRIMARY KEY`
* **arrival_date** : `DATE NOT NULL`
* **departure_date** : `DATE NOT NULL`
* **nb_of_people** : `INT NOT NULL`
* **reservation_name** : `VARCHAR(250) NOT NULL`
* **user_id** : `INT` (FK)
* **unit_id** : `INT` (FK)
* **festival_id** : `INT` (FK)
* **reservation_id** : `INT` (FK)
* **Contraintes** :
    * `chk_dates` : arrival_date < departure_date
    * `chk_guests` : nb_of_people > 0

### Reservations
* **id** : `INT PRIMARY KEY`
* **arrival_date** : `DATE NOT NULL`
* **departure_date** : `DATE NOT NULL`
* **nb_of_people** : `INT NOT NULL`
* **reservation_name** : `VARCHAR(250) NOT NULL`
* **user_id** : `INT` (FK)
* **unit_id** : `INT` (FK)
* **festival_id** : `INT` (FK)
* **Contraintes** :
    * `chk_dates` : arrival_date < departure_date
    * `chk_guests` : nb_of_people > 0

### Accommodations
* **id** : `INT PRIMARY KEY`
* **name** : `VARCHAR(250) NOT NULL`
* **category** : `ENUM('Camping', 'Hotel') NOT NULL`
* **address** : `VARCHAR(250) NOT NULL`
* **coordinates** : `POINT NOT NULL` (`SPATIAL INDEX`)
* **shuttle** : `BOOLEAN NOT NULL DEFAULT FALSE`
* **time_car** : `INT UNSIGNED NOT NULL`
* **time_walk** : `INT UNSIGNED NOT NULL`
* **commission** : `DECIMAL(5, 2) NOT NULL DEFAULT 0.00`
* **festival_id** : `INT NOT NULL` (FK)
* **Contrainte** : `chk_commission` (0.00 <= commission <= 100.00)

### Units (STI - Single Table Inheritance)
* **id** : `INT PRIMARY KEY`
* **person_per_night_cost** : `DECIMAL(10, 2) NOT NULL`
* **room_type** : `ENUM('Simple', 'Double', 'Family')`
* **terrain_type** : `ENUM('Small', 'Standard', 'Deluxe')`
* **quantity** : `INT NOT NULL`
* **wi-fi** : `BOOLEAN`
* **water** : `ENUM('No', 'Undrinkable', 'Drinkable')`
* **electricity** : `BOOLEAN`
* **parking_cost** : `DECIMAL(10, 2) NOT NULL DEFAULT 0.00`
* **food_options** : `SET('None', 'Breakfast', 'Half-board', 'Full-board', 'Restaurant')`
* **accommodation_id** : `INT NOT NULL` (FK)
* **Contrainte** : `chk_quantity` (quantity > 0)

---

## Actions Référentielles

| Table | Colonne | Action |
| :--- | :--- | :--- |
| **Reservations** | `user_id` | `ON UPDATE CASCADE`, `ON DELETE SET NULL` |
| | `unit_id` | `ON UPDATE CASCADE`, `ON DELETE RESTRICT` |
| | `festival_id` | `ON UPDATE CASCADE`, `ON DELETE CASCADE` |
| **Audits** | `reservation_id` | `ON UPDATE CASCADE`, `ON DELETE CASCADE` |
| **Units** | `accommodation_id` | `ON UPDATE CASCADE`, `ON DELETE CASCADE` |

---

## Triggers (Alexandre)

### `check_hotel_capacity_before_reservation`
**Description :** Vérifie que le nombre de personnes ne dépasse pas la capacité maximale selon le type de chambre d'hôtel avant l'insertion.

```sql
CREATE TRIGGER check_hotel_capacity_before_reservation
BEFORE INSERT ON Reservations
FOR EACH ROW
BEGIN
    DECLARE unit_category ENUM('Camping', 'Hotel');
    DECLARE unit_room_type ENUM('Simple', 'Double', 'Family');
    DECLARE max_capacity INT;

    SELECT a.category, u.room_type
    INTO unit_category, unit_room_type
    FROM Units u
    JOIN Accommodations a ON u.accommodation_id = a.id
    WHERE u.id = NEW.unit_id;

    IF unit_category = 'Hotel' THEN
        SET max_capacity = CASE unit_room_type
            WHEN 'Simple' THEN 1
            WHEN 'Double' THEN 2
            WHEN 'Family' THEN 6
            ELSE 0
        END;

        IF NEW.nb_of_people > max_capacity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Reservation exceeds hotel room capacity for this room type.';
        END IF;
    END IF;
END;

[alt text](Schema_analyse.drawio(5).png)