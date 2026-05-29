class PagesController < ApplicationController
  include TenantScoped
  before_action :require_tenant!

  def index
    # Get the list marked to show on index
    @list = @current_tenant.index_list

    # Get the current published version of that list
    @list_version = @list&.current_version

    # Get all items from the published version, ordered by position
    @items = @list_version&.items&.ordered || []
  end
end
