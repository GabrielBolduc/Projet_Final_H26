class CreateStages < ActiveRecord::Migration[8.1]
  def change
    create_table :stages do |t|
      t.string :name, null: false
      t.integer :capacity, null: false
      t.string :environment, null: false
      t.text :technical_specs

      t.timestamps
    end
    add_check_constraint :stages, "capacity > 0", name: "check_stages_capacity_positive"
    
    add_check_constraint :stages, "environment IN ('INDOOR', 'OUTDOOR', 'COVERED')", name: "check_stages_environment_enum"
  end
end
