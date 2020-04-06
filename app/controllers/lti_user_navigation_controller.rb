class LtiUserNavigationController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  # Non-standard controller without normal CRUD methods. Disable the convenience module.
  def dry_crud_enabled?
    false
  end

  # GET /lti_user_navigation
  # GET /lti_user_navigation.json
  def index
    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"
  end

  # POST /lti_user_navigation
  # POST /lti_user_navigation.json
  def create
    redirect_to lti_user_navigation_index_path
  end

end
