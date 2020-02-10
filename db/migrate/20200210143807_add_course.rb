class AddCourse < ActiveRecord::Migration[6.0]
  def change
  	create_table :courses do |t|
      t.string :name, null: false
      t.integer :organization_id, null: false
      t.string :term, null: false

      t.timestamps
    end

    add_index :courses, [:name, :term], unique: true
    add_foreign_key :courses, :organizations
  end
end
