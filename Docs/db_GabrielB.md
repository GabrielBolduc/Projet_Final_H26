# Caractéristiques détaillées des entités (Module 1)

## [FESTIVAL]

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
  - [name] : String requis (Max 100). Doit être UNIQUE.
  - [genre] : String requis (Max 50).
  - [popularity] : Entier requis. Doit être compris entre 0 et 5.
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
  - [start_time] : DATETIME requis. Doit être inclus dans les dates du [FESTIVAL].
  - [end_time] : DATETIME requis. Doit être strictement postérieur à [start_time].
  - [price] : Décimal positif ou nul (>= 0.00).
  - [LOGIQUE MÉTIER] : Trigger (Intégrité Temporelle) - Un [stage_id] ne peut pas avoir de chevauchement d'horaire.
  - [LOGIQUE MÉTIER] : Validation Applicative - Un [artist_id] ne peut pas jouer à deux endroits en même temps.