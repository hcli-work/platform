class LtiCourseNavigationController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  # Non-standard controller without normal CRUD methods. Disable the convenience module.
  def dry_crud_enabled?
    false
  end

  # GET /lti_course_navigation
  # GET /lti_course_navigation.json
  def index
    puts "### request.headers = #{request.headers.env.reject { |key| key.to_s.include?('.') }}"
#    redirect_to '/lti/login' unless Rails.cache.fetch("canvas_user_id")

    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"

    @canvas_user_id = Rails.cache.fetch("canvas_user_id")
    @canvas_email = Rails.cache.fetch("canvas_email")
    @canvas_fullname = Rails.cache.fetch("canvas_fullname")
    @canvas_course_name = Rails.cache.fetch("canvas_course_name")
    puts "### in lti_course_nav: canvas_user_id = #{@canvas_user_id}, @canvas_email = #{@canvas_email}, @canvas_fullname = #{@canvas_fullname}, @canvas_course_name = #{@canvas_course_name}"

  end

  # POST /lti_course_navigation
  # POST /lti_course_navigation.json
  def create
    redirect_to lti_course_navigation_index_path
  end

end
