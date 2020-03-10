require 'rubycas-server-core/tickets'
require 'dry_crud'

class ApplicationController < ActionController::Base

  # TODO: have to put this here in order to exempt other controllers. It should be
  # off by default so I don't know why things where throwing at all. Make sure this doesn't break
  # CAS login.
  protect_from_forgery

  include RubyCAS::Server::Core::Tickets
  include DryCrud::Controllers

  before_action :authenticate_user!
  before_action :ensure_admin!

  private
  
  def authenticate_user!
    super unless authorized_by_token? || cas_ticket?
  end
  
  def ensure_admin!
    if current_user
      redirect_to('/unauthorized') unless current_user.admin?
    end
  end
  
  def authorized_by_token?
    return false unless request.format.symbol == :json

    key = params[:access_key] || request.headers['Access-Key']
    return false if key.nil?
    
    !!AccessToken.find_by(key: key)
  end

  def cas_ticket?
    ticket = params[:ticket]
    return false if ticket.nil?

    ServiceTicket.exists?(ticket: ticket)
  end
end
