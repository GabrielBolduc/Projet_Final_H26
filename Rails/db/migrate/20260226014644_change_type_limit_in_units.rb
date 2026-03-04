class ChangeTypeLimitInUnits < ActiveRecord::Migration[8.1]
  def change
    change_column :units, :type, :string, limit: 255
  end
end
