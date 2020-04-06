class LtiEditorButtonController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  # GET /lti_editor_button
  # GET /lti_editor_button.json
  def index
    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"
    @canvas_user_id = Rails.cache.fetch("canvas_user_id")
    @canvas_email = Rails.cache.fetch("canvas_email")
    @canvas_fullname = Rails.cache.fetch("canvas_fullname")
    @canvas_course_name = Rails.cache.fetch("canvas_course_name")
    puts "### in lti_editor: canvas_user_id = #{@canvas_user_id}, @canvas_email = #{@canvas_email}, @canvas_fullname = #{@canvas_fullname}, @canvas_course_name = #{@canvas_course_name}"

    @deep_link_return_url = Rails.cache.fetch("lti_deep_link_return_url")
    puts "### Set @deep_link_return_url = #{@deep_link_return_url}"
    @jwt_response =  Rails.cache.fetch("lti_deep_link_jwt_response")
    puts "### @jwt_response = #{@jwt_response}"
  end

  # POST /lti_editor_button
  # POST /lti_editor_button.json
  def create
    redirect_to lti_editor_button_index_path
  end

end
