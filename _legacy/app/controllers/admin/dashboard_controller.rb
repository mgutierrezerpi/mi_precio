class Admin::DashboardController < Admin::BaseController
  def index
    @lists = @current_tenant.lists.includes(:list_versions)
    @total_lists = @lists.count
    @published_lists = @lists.where(published: true).count
    @total_items = Item.joins(list_version: { list: :tenant })
                       .where(lists: { tenant_id: @current_tenant.id })
                       .count
  end
end
