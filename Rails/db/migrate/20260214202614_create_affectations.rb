class CreateAffectations < ActiveRecord::Migration[8.1]
  def change
    create_table :affectations do |t|
      t.datetime :start
      t.datetime :end
      t.datetime :expected_start
      t.datetime :expected_end
      t.string :responsability
      t.references :festival, null: false, foreign_key: true
      t.references :task, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
