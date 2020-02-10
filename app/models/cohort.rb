class Cohort < ApplicationRecord

	belongs_to :section
	has_many :user_cohorts
	has_many :users, through: :user_cohorts
end