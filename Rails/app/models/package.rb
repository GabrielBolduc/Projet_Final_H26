class Package < ApplicationRecord
  belongs_to :festival
  has_many :tickets, dependent: :restrict_with_error

  # ACTIVESTORAGE
  has_one_attached :image

  scope :for_festival, ->(festival_id) { where(festival_id: festival_id) }
  scope :for_festival_status, ->(status) { joins(:festival).where(festivals: { status: status }) }
  scope :for_categories, ->(category_values) { where(category: category_values) }
  scope :search_by_title, ->(query) do
    where("LOWER(packages.title) LIKE ?", "%#{sanitize_sql_like(query.downcase)}%")
  end
  scope :sorted_for_admin, ->(sort_key) do
    case sort_key
    when "date_asc"
      order(valid_at: :asc)
    when "date_desc"
      order(valid_at: :desc)
    when "price_desc"
      order(price: :desc)
    else
      order(price: :asc)
    end
  end

  enum :category, {
    general: 'GENERAL',
    daily: 'DAILY',
    evening: 'EVENING'
  }, default: :general, validate: true

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 100 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quota, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validates :valid_at, :expired_at, presence: true

  validate :expired_date_after_valid_date
  validate :image_format_validation
  validate :quota_cannot_exceed_daily_capacity
  validate :validity_must_be_within_festival_dates

  def self.admin_scope(festival_id: nil, status: nil, query: nil, sort: nil, categories: nil)
    relation = includes(:festival, :tickets)

    if festival_id.present?
      relation = relation.for_festival(festival_id)
    else
      festival_status = status.to_s.downcase.presence || Festival.statuses[:ongoing]
      relation = relation.for_festival_status(festival_status)
    end

    relation = relation.search_by_title(query) if query.present?

    if categories.present?
      category_values = sanitize_category_filters(categories)
      relation = category_values.any? ? relation.for_categories(category_values) : relation.none
    end

    relation.sorted_for_admin(sort)
  end

  def self.sanitize_category_filters(raw_categories)
    values = Array(raw_categories)
      .flat_map { |value| value.to_s.split(",") }
      .map { |value| value.to_s.strip.downcase }
      .reject(&:blank?)
      .uniq

    valid_keys = values.select { |value| categories.key?(value) }
    valid_keys.map { |key| categories[key] }
  end

  private

  def validity_must_be_within_festival_dates
    return unless festival && valid_at && expired_at

    festival_start_limit = festival.start_at.beginning_of_day

    festival_end_limit = festival.end_at.end_of_day

    if valid_at < festival_start_limit
      errors.add(:valid_at, "ne peut pas être avant le début du festival (#{festival.start_at})")
    end

    if expired_at > festival_end_limit
      errors.add(:expired_at, "ne peut pas être après la fin du festival (#{festival.end_at})")
    end
  end

  def quota_cannot_exceed_daily_capacity
    return unless festival && quota
    if quota > festival.daily_capacity
      errors.add(:quota, "ne peut pas dépasser la capacité journalière du festival (#{festival.daily_capacity})")
    end
  end

  # Validation du format d'image (JPEG, PNG, WEBP)
  def image_format_validation
    return unless image.attached?

    # formats acceptés
    acceptable_types = ["image/jpeg", "image/png", "image/webp"]
    
    unless acceptable_types.include?(image.content_type)
      errors.add(:image, "doit être au format JPEG, PNG ou WEBP")
    end
    
    # Validation de la taille (ex: Max 5MB)
    if image.byte_size > 5.megabytes
      errors.add(:image, "est trop volumineuse (max 5MB)")
    end
  end

  def expired_date_after_valid_date
    return if valid_at.blank? || expired_at.blank?

    if expired_at < valid_at
      errors.add(:expired_at, "doit être ultérieure à la date de début")
    end
  end
end
