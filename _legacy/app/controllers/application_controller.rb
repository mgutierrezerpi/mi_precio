class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  before_action :log_subdomain
  
  private
  
  def log_subdomain
    Rails.logger.info "Current subdomain: #{request.subdomain}"
    Rails.logger.info "Current host: #{request.host}"
    Rails.logger.info "Apartment tenant: #{Apartment::Tenant.current}"
  end
end
