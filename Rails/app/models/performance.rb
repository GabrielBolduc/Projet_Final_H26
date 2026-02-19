class Performance < ApplicationRecord
  belongs_to :artist
  belongs_to :stage
  belongs_to :festival

  validates :start_at, :end_at, :price, presence: true
  validates :title, length: { maximum: 20 }
  validates :price, numericality: { greater_than_or_equal_to: 0 }
  validates :title, presence: true
  validate :end_at_after_start_at
  validate :within_festival_dates
  validate :no_stage_overlap
  validate :no_artist_overlap
  validate :festival_must_be_active

  private

  def end_at_after_start_at
    return if end_at.blank? || start_at.blank?
    if end_at <= start_at
      errors.add(:end_at, "END_BEFORE_START")
    end
  end

  def within_festival_dates
    return unless festival && start_at && end_at
    
    if start_at.to_date < festival.start_at || end_at.to_date > festival.end_at
      errors.add(:base, "OUTSIDE_FESTIVAL_DATES")
    end
  end

  def no_stage_overlap
    return unless stage && start_at && end_at
    if overlapping_query(stage_id: stage_id).exists?
      errors.add(:stage, "STAGE_OVERLAP")
    end
  end

  def no_artist_overlap
    return unless artist && start_at && end_at
    if overlapping_query(artist_id: artist_id).exists?
      errors.add(:artist, "ARTIST_OVERLAP")
    end
  end

  def overlapping_query(conditions)
    Performance.where(conditions)
               .where.not(id: id)
               .where("start_at < ? AND end_at > ?", end_at, start_at)
  end

  def festival_must_be_active
    if festival&.completed?
      errors.add(:festival_id, "FESTIVAL_COMPLETED")
    end
  end
end