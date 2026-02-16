class Performance < ApplicationRecord
  belongs_to :artist
  belongs_to :stage
  belongs_to :festival

  validates :start_at, :end_at, :price, presence: true
  validates :title, length: { maximum: 20 }
  validates :price, numericality: { greater_than_or_equal_to: 0 }

  validate :end_at_after_start_at
  validate :within_festival_dates
  validate :no_stage_overlap
  validate :no_artist_overlap

  ef end_at_after_start_at
    return if end_at.blank? || start_at.blank?
    if end_at <= start_at
      errors.add(:end_at, "Doit etre apres l'heure de debut")
    end
  end

  def within_festival_dates
    return unless festival && start_at && end_at
    
    if start_at.to_date < festival.start_date || end_at.to_date > festival.end_date
      errors.add(:base, "La performance doit avoir lieu pendant les dates du festival")
    end
  end

  def no_stage_overlap
    return unless stage && start_at && end_at
    if overlapping_query(stage_id: stage_id).exists?
      errors.add(:stage, "Deja utiliser sur ce creanau")
    end
  end

  def no_artist_overlap
    return unless artist && start_at && end_at
    if overlapping_query(artist_id: artist_id).exists?
      errors.add(:artist, "joue déjà ailleurs sur ce créneau")
    end
  end
end
