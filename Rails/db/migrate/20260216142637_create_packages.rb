class CreatePackages < ActiveRecord::Migration[8.1]
  def change
    create_table :packages do |t|

      t.string :title, limit: 100, null: false
      t.text :description

      t.string :category, null: false, default: "GENERAL"
      t.decimal :price, null: false, precision: 10, scale: 2
      t.integer :quota, null: false

      t.datetime :valid_at, null: false
      t.datetime :expired_at, null: false

      t.references :festival, null: false, foreign_key: {on_delete: :cascade}

      t.timestamps
    end
  end
end