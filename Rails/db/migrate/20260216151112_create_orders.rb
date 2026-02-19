class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.datetime :purchased_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }
      t.references :user, null: false, foreign_key: { on_delete: :restrict }

      t.timestamps
    end
  end
end