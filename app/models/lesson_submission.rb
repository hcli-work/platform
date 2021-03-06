class LessonSubmission < ApplicationRecord
  belongs_to :user
  belongs_to :lesson

  # Example Usage: 
  # submissions = LessonSubmission.for_lessons_and_user(grade_category.lessons, user)
  scope :for_lessons_and_user, ->(ls, u) { where(lesson: ls, user: u) }

end
