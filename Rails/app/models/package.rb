class Package < ApplicationRecord
  belongs_to :festival
  has_many :tickets, dependent: :restrict_with_error

  has_one_attached :image

  scope :for_festival, ->(festival_id) { where(festival_id: festival_id) }
  scope :for_festival_status, ->(status) { joins(:festival).where(festivals: { status: status }) }
  scope :for_categories, ->(category_values) { where(category: category_values) }
  scope :search_by_title, ->(query) do
    search = "%#{sanitize_sql_like(query.downcase)}%"
    where("LOWER(packages.title) LIKE :search OR LOWER(packages.description) LIKE :search", search: search)
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
    general: "GENERAL",
    daily: "DAILY",
    evening: "EVENING"
  }, default: :general, validate: true

  validates :title, presence: true, length: { maximum: 50 }
  validates :description, length: { maximum: 100 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :quota, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validates :valid_at, :expired_at, presence: true

  # L'ordre des validations est important
  validate :expired_date_after_valid_date
  validate :image_format_validation
  validate :validity_must_be_within_festival_dates
  validate :validate_category_dates
  validate :quota_not_less_than_sold
  validate :quota_cross_validation

  validates :discount_rate,
    numericality: { greater_than: 0, less_than_or_equal_to: 1 },
    allow_nil: true

  validates :discount_min_quantity,
    numericality: { only_integer: true, greater_than: 1 },
    allow_nil: true

  validate :discount_fields_both_or_neither

  def self.admin_scope(festival_id: nil, status: nil, query: nil, sort: nil, categories: nil, sold_out: nil)
    relation = includes(:festival, image_attachment: :blob).preload(:tickets)

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

    if sold_out.to_s == "true"
      relation = relation.joins(:tickets)
                         .where(tickets: { refunded_at: nil })
                         .group("packages.id")
                         .having("COUNT(tickets.id) >= packages.quota")
    elsif sold_out.to_s == "false"
      relation = relation.left_joins(:tickets)
                         .group("packages.id")
                         .having("packages.quota > COUNT(CASE WHEN tickets.refunded_at IS NULL THEN tickets.id END)")
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
  private_class_method :sanitize_category_filters

  def self.filter_by_weekdays(packages, raw_weekdays)
    weekdays = parse_weekday_filters(raw_weekdays)
    return packages if weekdays.empty?

    packages.select { |package| package_includes_weekday?(package, weekdays) }
  end

  def self.parse_weekday_filters(raw_weekdays)
    values = Array(raw_weekdays)
      .flat_map { |value| value.to_s.split(",") }
      .map { |value| value.to_s.strip }
      .reject(&:blank?)

    values.map { |value| Integer(value, exception: false) }
          .compact
          .select { |day| day.between?(0, 6) }
          .uniq
  end
  private_class_method :parse_weekday_filters

  def self.package_includes_weekday?(package, weekdays)
    return false unless package.valid_at && package.expired_at

    start_day = package.valid_at.to_date
    end_day = package.expired_at.to_date
    return false if end_day < start_day

    current = start_day
    0.upto(60) do
      return true if weekdays.include?(current.wday)
      current += 1
      break if current > end_day
    end

    false
  end
  private_class_method :package_includes_weekday?

  def sold_count
    if tickets.loaded?
      tickets.count { |t| t.refunded_at.nil? }
    else
      tickets.where(refunded_at: nil).count
    end
  end

  def sold_out?
    sold_count >= quota
  end

  def self.for_festival_and_categories(festival_id, categories = nil)
    scope = where(festival_id: festival_id)
    return scope unless categories.present?
    scope.where(category: categories)
  end

  def self.total_tickets_sold_for_festival(festival_id, categories: nil)
    for_festival_and_categories(festival_id, categories)
      .joins(:tickets)
      .where(tickets: { refunded_at: nil })
      .count
  end

  def self.total_revenue_for_festival(festival_id, categories: nil)
    for_festival_and_categories(festival_id, categories)
      .joins(:tickets)
      .where(tickets: { refunded_at: nil })
      .sum("tickets.price")
  end

  def self.total_refunds_for_festival(festival_id, categories: nil)
    for_festival_and_categories(festival_id, categories)
      .joins(:tickets)
      .where.not(tickets: { refunded_at: nil })
      .sum("tickets.price")
  end

  def self.total_refund_count_for_festival(festival_id, categories: nil)
    for_festival_and_categories(festival_id, categories)
      .joins(:tickets)
      .where.not(tickets: { refunded_at: nil })
      .count
  end

  private

  def quota_not_less_than_sold
    return unless quota
    current_sold = sold_count
    if quota < current_sold
      errors.add(:quota, "ne peut pas être inférieur au nombre de billets déjà vendus (#{current_sold})")
    end
  end

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

  def validate_category_dates
    return unless category && valid_at && expired_at

    case category.to_sym
    when :general
      if valid_at.strftime("%H:%M") != "00:00"
        errors.add(:valid_at, "doit commencer à 00:00 pour un forfait général.")
      end
      if expired_at.strftime("%H:%M") != "23:59"
        errors.add(:expired_at, "doit se terminer à 23:59 pour un forfait général.")
      end
    when :daily
      if valid_at.to_date != expired_at.to_date
        errors.add(:base, "Le forfait journalier doit se limiter à une seule journée.")
      end

      start_hour = valid_at.hour + (valid_at.min / 60.0)
      end_hour = expired_at.hour + (expired_at.min / 60.0)
      if start_hour < 6 || end_hour > 18
        errors.add(:base, "Le forfait journalier doit être compris entre 06:00 et 18:00.")
      end
    when :evening
      start_date = valid_at.to_date
      end_date = expired_at.to_date
      day_span = (end_date - start_date).to_i

      if day_span < 0 || day_span > 1
        errors.add(:base, "Le forfait soirée doit se limiter au même jour ou au lendemain (maximum 06:00).")
        return
      end

      if seconds_since_midnight(valid_at) < 18.hours
        errors.add(:valid_at, "doit commencer à 18:00 ou après pour un forfait soirée.")
      end

      if day_span == 1 && seconds_since_midnight(expired_at) > 6.hours
        errors.add(:expired_at, "doit se terminer à 06:00 maximum le lendemain.")
      end
    end
  end

  def quota_cross_validation
    return unless festival && quota && valid_at && expired_at
    return if errors[:valid_at].any? || errors[:expired_at].any? || errors[:base].any?

    if category.to_s.downcase == "general"
      validate_general_quota
    else
      validate_daily_evening_quota
    end
  end

  def validate_general_quota
    duration = (festival.end_at.to_date - festival.start_at.to_date).to_i + 1
    general_capacity = festival.daily_capacity * duration

    existing_general_quota = festival.packages
                                     .where(category: :general)
                                     .where.not(id: id)
                                     .sum(:quota)

    if (existing_general_quota + quota) > general_capacity
      remaining = general_capacity - existing_general_quota
      errors.add(:quota, "total pour les forfaits généraux dépasse la capacité globale (#{general_capacity}). Maximum possible : #{remaining}")
    end
  end

  def validate_daily_evening_quota
    days_to_check = if category.to_sym == :evening
      [ valid_at.to_date ]
    else
      (valid_at.to_date..expired_at.to_date).to_a
    end

    existing_non_general = festival.packages
                                 .where.not(category: :general)
                                 .where.not(id: id)
                                 .to_a

    days_to_check.each do |day|
      existing_quota_sum = existing_non_general.sum do |existing_package|
        quota_capacity_days_for(existing_package).include?(day) ? existing_package.quota.to_i : 0
      end

      if (existing_quota_sum + quota) > festival.daily_capacity
        remaining = festival.daily_capacity - existing_quota_sum
        errors.add(:quota, "pour le #{day} dépasse la capacité journalière pour les billets individuels. Maximum possible : #{remaining} (Capacité: #{festival.daily_capacity}, déjà alloué: #{existing_quota_sum})")
      end
    end
  end

  def image_format_validation
    return unless image.attached?

    acceptable_types = [ "image/jpeg", "image/png", "image/webp" ]

    unless acceptable_types.include?(image.content_type)
      errors.add(:image, "doit être au format JPEG, PNG ou WEBP")
    end

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

  def seconds_since_midnight(value)
    value.hour * 3600 + value.min * 60 + value.sec
  end

  def quota_capacity_days_for(package)
    case package.category.to_sym
    when :evening
      [ package.valid_at.to_date ]
    when :daily
      (package.valid_at.to_date..package.expired_at.to_date).to_a
    else
      []
    end
  end

  def discount_fields_both_or_neither
    if discount_rate.present? ^ discount_min_quantity.present?
      errors.add(:base, "Discount rate and minimum quantity must both be set or both be empty")
    end
  end
end
