  class CreateReservations < ActiveRecord::Migration[7.1]
    def change
      create_table :reservations do |t|
        t.date :arrival_at, null: false
        t.date :departure_at, null: false
        t.integer :nb_of_people, limit: 1, unsigned: true, null: false
        t.string :reservation_name, limit: 100, null: false
        t.string :phone_number, limit: 20, null: false

        t.references :user, null: false, foreign_key: true
        t.references :unit, null: false, foreign_key: true
        t.references :festival, null: false, foreign_key: true

        t.timestamps

        t.check_constraint "arrival_at < departure_at", name: "chk_dates"
        t.check_constraint "nb_of_people > 0", name: "chk_guests"
        t.check_constraint "phone_number REGEXP '^[0-9]{8,15}$'", name: "chk_phone_numeric"
        t.check_constraint "TRIM(reservation_name) <> ''", name: "chk_name_not_empty"
      end
    end
  end
