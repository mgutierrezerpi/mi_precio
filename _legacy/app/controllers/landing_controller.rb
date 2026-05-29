class LandingController < ApplicationController
  def index
    @tenants = Tenant.all.order(:created_at)
  end
end
