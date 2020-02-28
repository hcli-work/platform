class LtiLinkSelectionController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  # GET /lti_link_selection
  # GET /lti_link_selection.json
  def index
    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"
  end

  # POST /lti_link_selection
  # POST /lti_link_selection.json
  def create
    redirect_to lti_link_selection_index_path
  end

end
