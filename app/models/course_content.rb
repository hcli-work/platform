class CourseContent < ApplicationRecord
  def publish(params)
    if params[:content_type] == 'wiki_page'
      response = CanvasProdClient.update_course_page(params[:course_id], params[:secondary_id], params[:body])
    elsif params[:content_type] == 'assignment'
      response = CanvasProdClient.update_assignment(params[:course_id], params[:secondary_id], params[:body])
    end

    response.code == 200
  end
end
