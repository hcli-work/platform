class LtiAccountNavigationController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  # GET /lti_account_navigation
  # GET /lti_account_navigation.json
  def index
    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"
  end

  # POST /lti_account_navigation
  # POST /lti_account_navigation.json
  def create
    redirect_to lti_account_navigation_index_path
  end

end
