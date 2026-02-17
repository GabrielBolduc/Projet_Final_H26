class CreateTickets < ActiveRecord::Migration[8.1]
  def change
    create_table :tickets do |t|
      t.string :unique_code, null: false
      t.boolean :refunded, default: false
      t.datetime :refunded_at
      t.string :holder_name, null: false, limit: 100
      t.string :holder_phone, null: false, limit: 20
      t.string :holder_email, null: false, limit: 255
      t.decimal :price, null: false, precision: 10, scale: 2
      t.references :order, null: false, foreign_key: true
      t.references :package, null: false, foreign_key: true

      t.timestamps
    end
  end
end