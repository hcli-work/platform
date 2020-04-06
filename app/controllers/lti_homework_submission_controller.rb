class LtiHomeworkSubmissionController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  # GET /lti_homework_submission
  # GET /lti_homework_submission.json
  def index
    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"
  end

  # POST /lti_homework_submission
  # POST /lti_homework_submission.json
  def create
    redirect_to lti_homework_submission_index_path
  end

end
