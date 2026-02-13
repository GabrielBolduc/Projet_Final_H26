
# Festify, structure BD

### Billetterie (Gabriel Racine)

#### Packages

* id INT PRIMARY KEY AUTO_INCREMENT
* title VARCHAR(100) NOT NULL
* description TEXT
* type ENUM('General', 'Evening', 'Daily') NOT NULL
* price DECIMAL(10, 2) NOT NULL
* total_quota INT NOT NULL
* image_url VARCHAR(255)
* valid_from DATETIME NOT NULL
* valid_until DATETIME NOT NULL
* festival_id INT NOT NULL
* FOREIGN KEY (festival_id) REFERENCES Festivals(id) ON DELETE CASCADE
* CONSTRAINT chk_package_price CHECK (price >= 0)
* CONSTRAINT chk_package_quota CHECK (total_quota > 0)
* CONSTRAINT chk_package_dates CHECK (valid_from < valid_until)

#### Orders

* id INT PRIMARY KEY AUTO_INCREMENT
* purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
* user_id INT NOT NULL
* FOREIGN KEY (user_id) REFERENCES Users(id)

#### Tickets

* id INT PRIMARY KEY AUTO_INCREMENT
* unique_code VARCHAR(255) NOT NULL UNIQUE
* refunded BOOLEAN NOT NULL DEFAULT FALSE
* purchase_price DECIMAL(10, 2) NOT NULL
* holder_name VARCHAR(100) NOT NULL
* holder_email VARCHAR(255) NOT NULL
* holder_phone VARCHAR(20)
* order_id INT NOT NULL
* package_id INT NOT NULL
* FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
* FOREIGN KEY (package_id) REFERENCES Packages(id) ON DELETE RESTRICT
* CONSTRAINT chk_ticket_price CHECK (purchase_price >= 0)

---

### Actions referentielles

**Packages**

* [Festivals] : **DELETE CASCADE** (Si un festival est annulé/supprimé, ses forfaits disparaissent)

**Orders**

* [Users] : **DELETE RESTRICT** (Impossible de supprimer un utilisateur s'il a un historique de commandes. Soft delete recommandé sur User)

**Tickets**

* [Orders] : **DELETE CASCADE** (Si la commande est purgée, les tickets le sont aussi)
* [Packages] : **DELETE RESTRICT** (Impossible de supprimer un forfait si des billets ont déjà été vendus)

---

### Validations

**Packages**

* [price] : Doit être positif ou nul (gratuit).
* [total_quota] : Doit être supérieur à 0 à la création.
* [dates] : La date de fin (`valid_until`) doit être ultérieure à la date de début (`valid_from`).

**Tickets**

* [unique_code] : Doit être unique dans tout le système (UUID recommandé) pour garantir la sécurité du QR Code.
* [purchase_price] : Enregistre le coût au moment de l'achat (Snapshot) pour l'historique comptable.
* [refunded] : Par défaut à `FALSE`. Passe à `TRUE` uniquement lors d'un remboursement administratif.

---

### Triggers

#### Trigger 1 : Contrôle du Quota (Sold Out)

Empêche la vente d'un billet si le quota total du forfait est atteint.

```sql
CREATE TRIGGER check_ticket_quota_before_insert
BEFORE INSERT ON Tickets
FOR EACH ROW
BEGIN
    DECLARE current_sold INT;
    DECLARE max_quota INT;

    -- Récupérer la limite du forfait
    SELECT total_quota INTO max_quota
    FROM Packages
    WHERE id = NEW.package_id;

    -- Compter les billets actifs (non remboursés)
    SELECT COUNT(*) INTO current_sold
    FROM Tickets
    WHERE package_id = NEW.package_id
    AND refunded = FALSE;

    -- Vérifier si on dépasse
    IF current_sold >= max_quota THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Ticket quota exceeded for this package (Sold Out).';
    END IF;
END;

```

#### Trigger 2 : Snapshot du Prix (Intégrité Historique)

S'assure que le billet conserve le prix du forfait au moment de l'achat, même si le prix du forfait change plus tard.

```sql
CREATE TRIGGER set_ticket_price_snapshot
BEFORE INSERT ON Tickets
FOR EACH ROW
BEGIN
    DECLARE current_package_price DECIMAL(10,2);

    -- Si le prix n'est pas fourni par le backend
    IF NEW.purchase_price IS NULL THEN
        SELECT price INTO current_package_price
        FROM Packages
        WHERE id = NEW.package_id;
        
        SET NEW.purchase_price = current_package_price;
    END IF;
END;

```