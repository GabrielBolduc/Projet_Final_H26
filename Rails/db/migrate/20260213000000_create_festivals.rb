class CreateFestivals < ActiveRecord::Migration[8.1]
  def change
    create_table :festivals do |t|
      t.string :name, null: false, limit: 100
      t.date :start_at, null: false
      t.date :end_at, null: false
      t.integer :satisfaction, limit: 1
      t.text :comment
      t.decimal :latitude, precision: 10, scale: 8
      t.decimal :longitude, precision: 11, scale: 8
      t.decimal :other_income, precision: 10, scale: 2
      t.decimal :other_expense, precision: 10, scale: 2
      t.integer :daily_capacity, null: false
      t.string :address, null: false
      t.string :status, null: false, limit: 20
      
      t.timestamps
    end
  end
end
