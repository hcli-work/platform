# This model typically represents a University Partner
# In some cases though, it may be something else.
# For example, we might want an "Organization" to which all pilots belong
class Organization < ApplicationRecord

	has_many :courses
end
