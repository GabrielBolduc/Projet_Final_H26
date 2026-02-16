class CreatePackages < ActiveRecord::Migration[8.1]
  def change
    create_table :packages do |t|

      t.string :title, limit: 100, null: false
      t.text :description

      t.string :category, null: false, default: "GENERAL"
      t.decimal :price, null: false
      t.integer :quota, null: false

      t.datetime :valid_at, null: false
      t.datetime :expired_at, null: false

      t.references :festival, null: false, foreign_key: true

      t.timestamps
    end

    add_check_constraint :packages, "valid_at <= expired_at AND expired_at >= valid_at", name: "check_packages_dates_chronology"
    
    add_check_constraint :packages, "price >= 0.00", name: "check_packages_price_positive"
    add_check_constraint :packages, "quota > 0", name: "check_packages_quota_positive"

    add_check_constraint :packages, "category IN ('GENERAL', 'DAILY', 'EVENING')", name: "check_packages_category_enum"

  end
end