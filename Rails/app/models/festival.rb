class Festival < ApplicationRecord
  has_many :performances, dependent: :destroy
  has_many :affectations, dependent: :destroy
  has_many :packages, dependent: :destroy
  has_many :accommodations, dependent: :destroy

  scope :recent, -> { order(start_at: :desc) }
  enum :status, { draft: "draft", ongoing: "ongoing",  completed: "completed" }, default: :draft, validate: true
  scope :filter_by_status, ->(status) { where(status: status) }
  scope :publicly_visible, -> { ongoing }

  before_destroy :prevent_destroy_if_active_or_archived

  validates :name, presence: true, length: { maximum: 100 }
  validates :start_at, :end_at, :status, :address, :latitude, :longitude, presence: true

  validates :daily_capacity, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :satisfaction, numericality: {  only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5, allow_nil: true }
  validates :other_income, :other_expense, numericality: { allow_nil: true }

  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }

  validate :end_at_after_start_at
  validate :only_one_ongoing_festival
  validate :start_at_cannot_be_in_the_past, unless: :completed?

  composed_of :coordinates, class_name: "GeoPoint", mapping: [ %w[latitude latitude], %w[longitude longitude] ]

  private

  def end_at_after_start_at
    return if end_at.blank? || start_at.blank?

    if end_at < start_at
      errors.add(:end_at, "doit etre apres la date de debut")
    end
  end

  def only_one_ongoing_festival
    if ongoing? && Festival.ongoing.where.not(id: id).exists?
      errors.add(:status, "festival ongoing en cours")
    end
  end

  def prevent_destroy_if_active_or_archived
    if ongoing? || completed?
      errors.add(:base, "impossible de supprimer un festival ongoing ou completed")
      throw(:abort)
    end
  end

  def start_at_cannot_be_in_the_past
    if start_at_changed? && start_at.present? && start_at < Date.today
      errors.add(:start_at, "ne peut pas être dans le passé (sauf pour une archive)")
    end
  end

  def self.statistics_report
    festivals = includes(performances: [:artist, :stage])

    festivals.map do |festival|
      perfs = festival.performances

      perf_count = perfs.size
      artist_count = perfs.map(&:artist_id).uniq.size

      stage_counts = perfs.group_by(&:stage).transform_values(&:size)
      
      top_stage, top_count = stage_counts.max_by { |_stage, count| count }

      avg_pop = 0.0
      env = "N/A"

      if top_stage
        artists_on_stage = perfs.select { |p| p.stage_id == top_stage.id }.map(&:artist)
        
        if artists_on_stage.any?
          avg_pop = (artists_on_stage.sum(&:popularity).to_f / artists_on_stage.size).round(1)
        end
        env = top_stage.respond_to?(:environment) ? top_stage.environment : "Standard"
      end
      
      {
        id: festival.id,
        name: festival.name,
        year: festival.start_at&.year || Time.current.year,
        artist_count: artist_count,
        performance_count: perf_count,
        top_stage_name: top_stage&.name || "Aucune",
        top_stage_perf_count: top_count || 0,
        top_stage_avg_pop: avg_pop,
        top_stage_env: env
      }
    end
  end
end
