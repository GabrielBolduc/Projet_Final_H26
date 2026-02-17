class Accommodation < ApplicationRecord
  belongs_to :festival

  enum :category, { camping: 0, hotel: 1 }

  validates :name, presence: true, length: { maximum: 100 }
  validates :address, presence: true
  validates :commission, numericality: { greater_than_or_equal_to: 0, less_than: 30 }
  composed_of :coordinates, class_name: 'GeoPoint', mapping: [%w(latitude latitude), %w(longitude longitude)]
  
  before_validation :strip_fields

  private

  def strip_fields
    self.name = name&.strip
    self.address = address&.strip
  end
end