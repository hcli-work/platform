class LtiPocController < ApplicationController

  # TODO: tmp for testing. We need to get auth actually working.
  skip_before_action :authenticate_user!
  skip_before_action :ensure_admin!

  skip_before_action :verify_authenticity_token

  def index
    response.headers["X-FRAME-OPTIONS"] = "ALLOW-FROM https://braven.instructure.com"
  end

  def create
    redirect_to lti_lti_poc_index_path
  end

end
