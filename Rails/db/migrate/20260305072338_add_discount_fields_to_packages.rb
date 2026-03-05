class AddDiscountFieldsToPackages < ActiveRecord::Migration[8.1]
  def change
    add_column :packages, :discount_min_quantity, :integer, default: nil
    add_column :packages, :discount_rate, :decimal, precision: 5, scale: 4, default: nil
  end
end
