class Order < ApplicationRecord
  belongs_to :user
  has_many :tickets, dependent: :destroy

  validates :user, presence: true

  scope :for_festival, ->(festival_id) { joins(tickets: :package).where(packages: { festival_id: festival_id }).distinct }

  def self.total_discount_for_festival(festival_id)
    for_festival(festival_id).sum(:discount)
  end

  def subtotal
    tickets.sum(:price)
  end

  def total_price
    [ subtotal - discount, 0 ].max
  end
end
