class CreateFestivals < ActiveRecord::Migration[8.1]
  def change
    create_table :festivals do |t|
      t.date :start_at, null: false
      t.date :end_at, null: false

      t.integer :satisfaction, limit: 1
      t.text :comment
      t.column :coordinates, :point, null: false
      t.decimal :other_income
      t.decimal :other_expense
      t.integer :daily_capacity, null: false
      t.string :address, limit: 250, null: false
      t.string :statut, null: false, default: 'DRAFT'
      t.timestamps
    end

    add_check_constraint :festivals, "statut IN ('DRAFT', 'ONGOING', 'COMPLETED')", name: "check_festivals_statut_enum"
    add_check_constraint :festivals, "daily_capacity > 0", name: "check_festivals_daily_capacity_positive"
    
    add_check_constraint :festivals, "start_at <= end_at", name: "check_festivals_dates_chronology"
    add_check_constraint :festivals, "satisfaction >= 0 AND satisfaction <= 5", name: "check_festivals_satisfaction_range"
  end
end
