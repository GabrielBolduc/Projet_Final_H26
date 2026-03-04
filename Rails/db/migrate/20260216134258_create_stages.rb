class CreateStages < ActiveRecord::Migration[8.1]
  def change
    create_table :stages do |t|
      t.string :name, null: false, limit: 100
      t.integer :capacity, null: false
      t.string :environment, null: false, limit: 50
      t.text :technical_specs

      t.timestamps
    end
  end
end
