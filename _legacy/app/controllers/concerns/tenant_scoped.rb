module TenantScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_current_tenant
  end

  private

  def set_current_tenant
    return unless defined?(Tenant)
    
    @current_tenant = Tenant.find_by(subdomain: request.subdomain)
  rescue => e
    Rails.logger.error "Error setting current tenant: #{e.message}"
    @current_tenant = nil
  end

  def require_tenant!
    unless @current_tenant
      redirect_to root_url(subdomain: false), alert: "Tenant not found"
    end
  end
end