class Stage < ApplicationRecord
    has_many :performances, dependent: :restrict_with_error
    enum :environment, { indoor: "INDOOR", outdoor: "OUTDOOR", covered: "COVERED" }, validate: true

    validates :name, presence: true, length: { maximum: 100 }
    validates :capacity, presence: true, numericality: { only_integer: true, greater_than: 0 }
    validates :environment, presence: true
end
