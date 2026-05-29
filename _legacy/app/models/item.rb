class Item < ApplicationRecord
  belongs_to :list_version
  has_one_attached :picture

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :list_version, presence: true

  scope :ordered, -> { order(:position) }

  # Set position before create if not set
  before_create :set_position, unless: :position?

  private

  def set_position
    self.position = (list_version.items.maximum(:position) || -1) + 1
  end
end
