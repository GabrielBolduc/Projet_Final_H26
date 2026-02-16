class CreatePerformances < ActiveRecord::Migration[8.1]
  def change
    create_table :performances do |t|
      t.string :title
      t.datetime :start_at, null: false
      t.datetime :end_at, null: false
      t.text :description
      t.decimal :price, null: false
      t.references :artist, null: false, foreign_key: true
      t.references :stage, null: false, foreign_key: true
      t.references :festival, null: false, foreign_key: true

      t.timestamps
    end
    add_check_constraint :performances, "start_at < end_at", name: "check_performances_dates_chronology"
    add_check_constraint :performances, "price >= 0", name: "check_performances_price_positive"
  end
end
