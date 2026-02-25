class AddUniqueIndexToTicketsUniqueCode < ActiveRecord::Migration[8.1]
  def change
    add_index :tickets, :unique_code, unique: true
  end
end
