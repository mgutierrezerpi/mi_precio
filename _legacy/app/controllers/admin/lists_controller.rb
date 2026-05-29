class Admin::ListsController < Admin::BaseController
  def index
    @lists = @current_tenant.lists.includes(:list_versions)
  end

  def show
    @list = @current_tenant.lists.find(params[:id])
    @versions = @list.list_versions.ordered
  end

  def new
    @list = @current_tenant.lists.new
  end

  def create
    @list = @current_tenant.lists.new(list_params)
    if @list.save
      redirect_to admin_list_path(@list), notice: "List created successfully"
    else
      render :new
    end
  end

  def edit
    @list = @current_tenant.lists.find(params[:id])
  end

  def update
    @list = @current_tenant.lists.find(params[:id])
    if @list.update(list_params)
      redirect_to admin_list_path(@list), notice: "List updated successfully"
    else
      render :edit
    end
  end

  def destroy
    @list = @current_tenant.lists.find(params[:id])
    @list.destroy
    redirect_to admin_lists_path, notice: "List deleted successfully"
  end

  def toggle_publish
    @list = @current_tenant.lists.find(params[:id])
    @list.update(published: !@list.published)
    redirect_to admin_lists_path, notice: "List #{@list.published ? 'published' : 'unpublished'}"
  end

  def toggle_index
    @list = @current_tenant.lists.find(params[:id])
    @list.update(show_on_index: !@list.show_on_index)
    redirect_to admin_lists_path, notice: "List index visibility updated"
  end

  private

  def list_params
    params.require(:list).permit(:name, :published, :show_on_index)
  end
end
