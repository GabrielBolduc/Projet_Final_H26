class CreateAccommodations < ActiveRecord::Migration[7.1]
  def change
    create_table :accommodations do |t|
      t.string :name, limit: 100, null: false
      t.integer :category, limit: 1, null: false 
      t.string :address, null: false
      t.column :coordinates, :point
      t.boolean :shuttle, default: false, null: false
      t.time :time_car, null: false
      t.time :time_walk, null: false
      t.decimal :commission, precision: 4, scale: 2, default: 0.0, null: false
      t.references :festival, null: false, foreign_key: true

      t.timestamps

      t.check_constraint "commission >= 0 AND commission < 30", name: "chk_commission"
      t.check_constraint "TRIM(name) <> ''", name: "chk_name_not_empty"
      t.check_constraint "TRIM(address) <> ''", name: "chk_address_not_empty"
    end
  end
end