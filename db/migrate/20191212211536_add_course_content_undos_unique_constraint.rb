class AddCourseContentUndosUniqueConstraint < ActiveRecord::Migration[6.0]
  def change
    add_index :course_content_undos, [:course_content_id, :version], :unique => true
  end
end
