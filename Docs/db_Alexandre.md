# Festify, structure BD


### Hospitalité (Alexandre)

#### Reservations

- id INT PRIMARY KEY
- arrival_date DATE NOT NULL
- departure_date DATE NOT NULL
- nb_of_people INT NOT NULL
- reservation_name VARCHAR(250) NOT NULL
- user_id INT
- unit_id INT
- edition_id INT
<hr>

- FOREIGN KEY (user_id) REFERENCES Users(id)
- FOREIGN KEY (unit_id) REFERENCES Units(id)
- FOREIGN KEY (edition_id) REFERENCES Editions(id)
- CONSTRAINT chk_dates CHECK (arrival_date < departure_date)
- CONSTRAINT chk_guests CHECK (nb_of_people > 0)

#### Accommodations

- id INT PRIMARY KEY
- name VARCHAR(250) NOT NULL
- category ENUM('Camping','Hotel') NOT NULL
- address VARCHAR(250) NOT NULL
- coordinates POINT NOT NULL
- shuttle BOOLEAN NOT NULL DEFAULT FALSE
- time_car INT UNSIGNED NOT NULL
- time_walk INT UNSIGNED NOT NULL
- commission DECIMAL(5, 2) NOT NULL DEFAULT 0.00
- edition_id INT NOT NULL
<hr>

- SPATIAL INDEX(coordinates)
- FOREIGN KEY (edition_id) REFERENCES Editions(id)
- CONSTRAINT chk_commission CHECK (commission >= 0 AND commission <= 100)

#### Units (STI)

- id INT PRIMARY KEY
- person_per_night_cost DECIMAL(10, 2) NOT NULL
- type VARCHAR(255) NOT NULL
- room_type ENUM('Simple','Double','Family')
- terrain_type ENUM('Small', 'Standard', 'Deluxe')
- quantity INT NOT NULL
- wi-fi BOOLEAN
- water ENUM('No','Undrinkable','Drinkable')
- electricity BOOLEAN
- parking_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- food_options SET('None', 'Breakfast', 'Half-board', 'Full-board', 'Restaurant');
- accomodation_id INT NOT NULL
<hr>

- FOREIGN KEY (accomodation_id) REFERENCES Accomodations(id)
- CONSTRAINT chk_quantity CHECK (quantity > 0)

#### Triggers (Alexandre)

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