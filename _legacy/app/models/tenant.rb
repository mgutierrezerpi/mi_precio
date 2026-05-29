class Tenant < ApplicationRecord
  has_many :lists, dependent: :destroy
  has_many :users, dependent: :destroy

  validates :name, presence: true
  validates :subdomain, presence: true, uniqueness: true
  validates :database, presence: true, uniqueness: true

  before_validation :set_database_name
  after_create :create_tenant
  after_destroy :drop_tenant

  # Get the list to display on the index page
  def index_list
    lists.find_by(show_on_index: true)
  end

  # Get all published lists
  def published_lists
    lists.published
  end
  
  private
  
  def set_database_name
    self.database ||= subdomain if subdomain.present?
  end
  
  def create_tenant
    return unless defined?(Apartment)
    
    Apartment::Tenant.create(database)
  rescue Apartment::TenantExists
    Rails.logger.info "Tenant #{database} already exists"
  rescue => e
    Rails.logger.error "Error creating tenant #{database}: #{e.message}"
  end
  
  def drop_tenant
    return unless defined?(Apartment)
    
    Apartment::Tenant.drop(database)
  rescue Apartment::TenantNotFound
    Rails.logger.info "Tenant #{database} not found"
  rescue => e
    Rails.logger.error "Error dropping tenant #{database}: #{e.message}"
  end
end
