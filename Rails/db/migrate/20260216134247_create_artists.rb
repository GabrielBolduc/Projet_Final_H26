class CreateArtists < ActiveRecord::Migration[8.1]
  def change
    create_table :artists do |t|
      t.string :name, null: false, limit: 100
      t.string :genre, null: false, limit: 50
      t.text :bio
      t.integer :popularity, null: false

      t.timestamps
    end
    add_index :artists, :name, unique: true
  end
end
