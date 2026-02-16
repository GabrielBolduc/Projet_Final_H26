class CreateArtists < ActiveRecord::Migration[8.1]
  def change
    create_table :artists do |t|
      t.string :name, null: false
      t.string :genre, null: false
      t.text :bio
      t.integer :popularity, null: false
      t.datetime :deleted_at

      t.timestamps
    end
    add_index :artists, :deleted_at
    add_check_constraint :artists, "popularity >= 0 AND popularity <= 5", name: "check_artists_popularity_range"
  end
end
