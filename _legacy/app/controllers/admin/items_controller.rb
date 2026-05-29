class Admin::ItemsController < Admin::BaseController
  before_action :set_list_and_version

  def index
    @items = @version.items.ordered
  end

  def new
    @item = @version.items.new
  end

  def create
    @item = @version.items.new(item_params)
    if @item.save
      redirect_to admin_list_version_items_path(@list, @version), notice: "Item created successfully"
    else
      render :new
    end
  end

  def edit
    @item = @version.items.find(params[:id])
  end

  def update
    @item = @version.items.find(params[:id])
    if @item.update(item_params)
      redirect_to admin_list_version_items_path(@list, @version), notice: "Item updated successfully"
    else
      render :edit
    end
  end

  def destroy
    @item = @version.items.find(params[:id])
    @item.destroy
    redirect_to admin_list_version_items_path(@list, @version), notice: "Item deleted successfully"
  end

  private

  def set_list_and_version
    @list = @current_tenant.lists.find(params[:list_id])
    @version = @list.list_versions.find(params[:version_id])
  end

  def item_params
    params.require(:item).permit(:name, :price, :description, :position, :picture)
  end
end
