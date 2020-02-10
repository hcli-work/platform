class Course < ApplicationRecord

	belongs_to :organization
	has_many :sections
end