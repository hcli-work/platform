class AddCohort < ActiveRecord::Migration[6.0]
  def change
  	create_table :cohorts do |t|
  	  t.string :name, null: false
      t.integer :section_id, null: false

      t.timestamps
    end

    add_index :cohorts, :name, unique: true
    add_foreign_key :cohorts, :sections
  end
end
