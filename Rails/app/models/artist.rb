class Artist < ApplicationRecord
  has_one_attached :image
  has_many :performances, dependent: :restrict_with_error

  scope :alphabetical, -> { order(name: :asc) }
  scope :search, ->(query) { where("name LIKE ?", "%#{query}%") }
  scope :by_genre, ->(genre) { where("genre LIKE ?", "%#{genre}%") }
  scope :headliners, -> { where(popularity: [ 4, 5 ]).order(popularity: :desc) }

  before_validation :strip_whitespace

  validates :name, presence: true, length: { maximum: 100 }, uniqueness: true
  validates :genre, presence: true, length: { maximum: 50 }
  validates :bio, length: { maximum: 1600 }
  validates :popularity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }

  validate :validate_image_format

  def image_url
    if image.attached?
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
    else
      nil
    end
  end

  private

  def strip_whitespace
    self.name = name&.strip
    self.genre = genre&.strip
    self.bio = bio&.strip
  end

  def validate_image_format
    return unless image.attached?

    allowed_types = %w[image/jpeg image/png image/webp image/avif]
    unless image.content_type.in?(allowed_types)
      errors.add(:image, "doit etre un format d'image valide")
    end

    if image.byte_size > 5.megabytes
      errors.add(:image, "doit faire moins de 5 mo")
    end
  end
end
