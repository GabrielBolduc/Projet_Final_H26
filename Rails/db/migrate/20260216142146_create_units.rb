class CreateUnits < ActiveRecord::Migration[7.1]
  def change
    create_table :units do |t|
      t.decimal :cost_person_per_night, precision: 6, scale: 2, null: false
      t.column :type, "ENUM('Units::SimpleRoom','Units::DoubleRoom','Units::FamilyRoom','Units::SmallTerrain','Units::StandardTerrain','Units::DeluxeTerrain')", null: false
      t.integer :quantity, limit: 1, unsigned: true, null: false
      t.boolean :wifi, default: false, null: false
      t.integer :water, limit: 1, default: 0
      t.boolean :electricity, default: false
      t.decimal :parking_cost, precision: 4, scale: 2, unsigned: true, default: 0.0, null: false
      t.column :food_options, "SET('None', 'Canteen', 'Room service', 'Restaurant')", default: 'None'
      t.references :accommodation, null: false, foreign_key: true

      t.timestamps

      t.check_constraint "quantity > 0", name: "chk_quantity"
    end
  end
end
