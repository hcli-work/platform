class AddUserCohort < ActiveRecord::Migration[6.0]
  def change
  	create_table :user_cohorts do |t|
  	  t.integer :user_id, null: false
      t.integer :cohort_id, null: false
      t.string :type, null: false

      t.timestamps
    end

    add_index :user_cohorts, [:user_id, :cohort_id], unique: true
    add_foreign_key :user_cohorts, :users
    add_foreign_key :user_cohorts, :cohorts
  end
end
