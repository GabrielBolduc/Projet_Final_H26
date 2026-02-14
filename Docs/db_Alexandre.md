# Festify, structure BD

### Hospitalité (Alexandre)

#### Reservations

- id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- arrival_at DATE NOT NULL
- departure_at DATE NOT NULL
- nb_of_people TINYINT UNSIGNED NOT NULL
- reservation_name VARCHAR(100) NOT NULL
- phone_number : VARCHAR(20) NOT NULL
- user_id INT UNSIGNED NOT NULL
- unit_id INT UNSIGNED NOT NULL
- festival_id INT UNSIGNED NOT NULL

<hr>

- FOREIGN KEY (user_id) REFERENCES Users(id)
- FOREIGN KEY (unit_id) REFERENCES Units(id)
- FOREIGN KEY (festival_id) REFERENCES Festivals(id)
- CONSTRAINT chk_dates CHECK (arrival_at < departure_at)
- CONSTRAINT chk_guests CHECK (nb_of_people > 0)
- CONSTRAINT chk_phone_numeric CHECK (phone_number REGEXP '^[0-9]{8,15}$');
- CONSTRAINT chk_name_not_empty CHECK (TRIM(reservation_name) <> '');

#### Accommodations

- id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- name VARCHAR(100) NOT NULL
- category ENUM('Camping','Hotel') NOT NULL
- address VARCHAR(255) NOT NULL
- coordinates POINT NOT NULL
- shuttle BOOLEAN NOT NULL DEFAULT FALSE
- time_car TIME NOT NULL
- time_walk TIME NOT NULL
- commission DECIMAL(4, 2) UNSIGNED NOT NULL DEFAULT 0.00
- festival_id INT UNSIGNED NOT NULL
<hr>

- SPATIAL INDEX(coordinates)
- FOREIGN KEY (festival_id) REFERENCES Festivals(id)
- CONSTRAINT chk_commission CHECK (commission >= 0 AND commission < 30)
- CONSTRAINT chk_name_not_empty CHECK (TRIM(name) <> '');
- CONSTRAINT chk_address_not_empty CHECK (TRIM(address) <> '');

#### Units (STI)

- id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- cost_person_per_night DECIMAL(6, 2) NOT NULL
- type : ENUM['SimpleRoom','DoubleRoom', 'FamilyRoom', 'SmallTerrain','StandardTerrain','DeluxeTerrain']
- quantity TINYINT UNSIGNED NOT NULL
- wifi BOOLEAN NOT NULL
- water ENUM('No','Undrinkable','Drinkable')
- electricity BOOLEAN
- parking_cost DECIMAL(4, 2) UNSIGNED NOT NULL DEFAULT 0.00
- food_options SET['None', 'Canteen', 'Room service', 'Restaurant']
- accomodation_id INT UNSIGNED NOT NULL
<hr>

- FOREIGN KEY (accomodation_id) REFERENCES Accomodations(id)
- CONSTRAINT chk_quantity CHECK (quantity > 0)

#### Actions Référentielles

[Reservations] :

- user_id : ON UPDATE CASCADE, ON DELETE SET NULL
- unit_id : ON UPDATE CASCADE, ON DELETE RESTRICT
- festival_id : ON UPDATE CASCADE, ON DELETE CASCADE

[Audits] :

- reservation_id : ON UPDATE CASCADE, ON DELETE CASCADE

[Units] :

- accommodation_id : ON UPDATE CASCADE, ON DELETE CASCADE.

#### Triggers (Alexandre)

    CREATE TRIGGER check_unit_availability_and_capacity
    BEFORE INSERT ON Reservations
    FOR EACH ROW
    BEGIN
        DECLARE unit_max_capacity INT;
        DECLARE overlapping_reservations INT;

        SELECT 
            CASE type
                WHEN 'SimpleRoom'      THEN 1
                WHEN 'DoubleRoom'      THEN 2
                WHEN 'FamilyRoom'      THEN 6
                WHEN 'SmallTerrain'    THEN 2
                WHEN 'StandardTerrain' THEN 4
                WHEN 'DeluxeTerrain'   THEN 8
                ELSE 0 
            END INTO unit_max_capacity
        FROM Units
        WHERE id = NEW.unit_id;

        IF NEW.nb_of_people > unit_max_capacity THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Capacity Error: Too many people for this unit type.';
        END IF;

        SELECT COUNT(*) INTO overlapping_reservations
        FROM Reservations
        WHERE unit_id = NEW.unit_id
        AND arrival_at < NEW.departure_at 
        AND departure_at > NEW.arrival_at;

        IF overlapping_reservations > 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Availability Error: Unit already booked for these dates.';
        END IF;

    END; //

    CREATE TRIGGER validate_reservation_dates
    BEFORE INSERT ON Reservations
    FOR EACH ROW
    BEGIN
        DECLARE festival_start DATE;
        DECLARE festival_end DATE;

        IF NEW.arrival_at < CURDATE() THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Error: Reservations cannot be made for past dates.';
        END IF;

        SELECT start_date, end_date 
        INTO festival_start, festival_end
        FROM Festivals 
        WHERE id = NEW.festival_id;

        IF NEW.arrival_at < DATE_SUB(festival_start, INTERVAL 3 DAY) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Arrival cannot be more than 3 days before the festival starts.';
        
        ELSEIF NEW.departure_at > DATE_ADD(festival_end, INTERVAL 3 DAY) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Departure cannot be more than 3 days after the festival ends.';
        END IF;
    END;