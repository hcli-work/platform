class AddSection < ActiveRecord::Migration[6.0]
  def change
  	create_table :sections do |t|
  	  t.string :name, null: false
      t.string :day_of_week, null: false
      t.time :time_of_day, null: false
      t.integer :course_id, null: false

      t.timestamps
    end

    add_index :sections, [:day_of_week, :time_of_day], unique: true
    add_foreign_key :sections, :courses
  end
end
