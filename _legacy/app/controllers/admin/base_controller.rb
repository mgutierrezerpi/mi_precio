class Admin::BaseController < ApplicationController
  include TenantScoped

  before_action :authenticate_user!
  before_action :require_tenant!
  before_action :verify_tenant_access

  layout "admin"

  private

  def verify_tenant_access
    unless current_user.tenant_id == @current_tenant.id
      redirect_to tenant_root_path, alert: "Access denied"
    end
  end
end
