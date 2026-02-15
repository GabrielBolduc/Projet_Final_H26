class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.integer :difficulty
      t.integer :priority
      t.boolean :reusable
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
