class CreatePerformances < ActiveRecord::Migration[8.1]
  def change
    create_table :performances do |t|
      t.string :title, limit: 20
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false

      t.references :artist, null: false, foreign_key: true
      t.references :stage, null: false, foreign_key: true
      t.references :festival, null: false, foreign_key: true

      t.timestamps
    end
  end
end
