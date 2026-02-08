# Festify, structure BD


### Artist & Programmation 

#### Festivals

- id INT PRIMARY KEY
- name VARCHAR(255) NOT NULL
- start_date DATE NOT NULL
- end_date DATE NOT NULL
- daily_capacity INT NOT NULL
- status ENUM('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT'
- address VARCHAR(255) NOT NULL
- coordinates POINT
- satisfaction_rating INT DEFAULT NULL
- comment TEXT
- SPATIAL INDEX(coordinates)
- CONSTRAINT chk_festival_dates CHECK (start_date <= end_date)
- CONSTRAINT chk_capacity CHECK (daily_capacity > 0)
- CONSTRAINT chk_satisfaction CHECK (satisfaction_rating BETWEEN 0 AND 5)

#### Artists

- id INT PRIMARY KEY AUTO_INCREMENT
- name VARCHAR(100) NOT NULL UNIQUE
- genre VARCHAR(50) NOT NULL
- bio TEXT
- popularity INT DEFAULT 0
- image_url VARCHAR(255)
- deleted_at DATETIME DEFAULT NULL
- CONSTRAINT chk_popularity CHECK (popularity BETWEEN 0 AND 5)

#### Stages

- id INT PRIMARY KEY AUTO_INCREMENT
- name VARCHAR(100) NOT NULL
- capacity INT NOT NULL
- environment ENUM('INDOOR', 'OUTDOOR', 'COVERED') NOT NULL
- technical_specs TEXT
- CONSTRAINT chk_stage_capacity CHECK (capacity > 0)

#### Performances 

- id INT PRIMARY KEY AUTO_INCREMENT
- title VARCHAR(200)
- start_time DATETIME NOT NULL
- end_time DATETIME NOT NULL
- description TEXT
- price DECIMAL(10, 2) DEFAULT 0.00
- artist_id INT NOT NULL
- stage_id INT NOT NULL
- festival_id INT NOT NULL
- FOREIGN KEY (artist_id) REFERENCES Artists(id)
- FOREIGN KEY (stage_id) REFERENCES Stages(id)
- FOREIGN KEY (festival_id) REFERENCES Festivals(id) ON DELETE CASCADE
-  CONSTRAINT chk_perf_times CHECK (start_time < end_time)

#### Triggers 

CREATE TRIGGER check_stage_conflict_before_insert
BEFORE INSERT ON Performances
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

    SELECT COUNT(*) INTO conflict_count
    FROM Performances
    WHERE stage_id = NEW.stage_id
    AND festival_id = NEW.festival_id
    AND start_time < NEW.end_time 
    AND end_time > NEW.start_time;

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: The stage is already booked for this time slot (Schedule Conflict).';
    END IF;
END;