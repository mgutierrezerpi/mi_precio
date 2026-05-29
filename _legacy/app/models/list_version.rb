class ListVersion < ApplicationRecord
  belongs_to :list
  has_many :items, dependent: :destroy

  validates :version_number, presence: true, uniqueness: { scope: :list_id }
  validates :list, presence: true

  scope :published, -> { where(published: true) }
  scope :ordered, -> { order(version_number: :desc) }

  # Publish this version and unpublish others
  def publish!
    transaction do
      # Unpublish other versions of the same list
      list.list_versions.where.not(id: id).update_all(published: false, published_at: nil)

      # Publish this version
      update!(published: true, published_at: Time.current)
    end
  end

  # Unpublish this version
  def unpublish!
    update!(published: false, published_at: nil)
  end

  # Copy items from another version
  def copy_items_from(source_version)
    source_version.items.order(:position).each do |source_item|
      items.create!(
        name: source_item.name,
        price: source_item.price,
        description: source_item.description,
        position: source_item.position
      )
    end
  end
end
