class List < ApplicationRecord
  belongs_to :tenant
  has_many :list_versions, dependent: :destroy
  has_many :items, through: :list_versions

  validates :name, presence: true
  validate :only_one_show_on_index_per_tenant

  scope :published, -> { where(published: true) }
  scope :for_index, -> { where(show_on_index: true) }

  # Get the current published version
  def current_version
    list_versions.where(published: true).order(version_number: :desc).first
  end

  # Get the latest version (published or not)
  def latest_version
    list_versions.order(version_number: :desc).first
  end

  # Create a new version
  def create_new_version(attributes = {})
    next_version_number = (latest_version&.version_number || 0) + 1
    list_versions.create!(
      version_number: next_version_number,
      name: attributes[:name] || "Version #{next_version_number}",
      published: false
    )
  end

  private

  def only_one_show_on_index_per_tenant
    if show_on_index? && tenant.lists.where(show_on_index: true).where.not(id: id).exists?
      errors.add(:show_on_index, "can only have one list shown on index per tenant")
    end
  end
end
