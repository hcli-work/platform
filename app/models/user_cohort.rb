class UserCohort < ApplicationRecord

	LEADERSHIP_COACH = 'lc'
	FELLOW = 'fellow'
	TEACHING_ASSISTANT = 'ta'
	COACHING_PARTNER = 'cp'

	belongs_to :user
	belongs_to :cohort

	scope :only_fellows, -> { where(type: FELLOW) }
	scope :only_leadership_coaches, -> { where(type: LEADERSHIP_COACH) }
	scope :only_teaching_assistants, -> { where(type: TEACHING_ASSISTANT) }
	scope :only_coaching_partners, -> { where(type: COACHING_PARTNER) }

	validates :type,
		inclusion: { in: [LEADERSHIP_COACH, FELLOW, TEACHING_ASSISTANT, COACHING_PARTNER],
		message: "%{value} is not a valid user_cohort type" }
end