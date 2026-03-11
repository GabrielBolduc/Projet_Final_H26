class Order < ApplicationRecord
  belongs_to :user
  has_many :tickets, dependent: :destroy

  validates :user, presence: true

  scope :for_festival, ->(festival_id) { joins(tickets: :package).where(packages: { festival_id: festival_id }).distinct }

  def self.for_festival_and_categories(festival_id, categories = nil)
    scope = for_festival(festival_id)
    return scope unless categories.present?
    scope.where(packages: { category: categories })
  end

  def self.count_for_festival(festival_id, categories: nil)
    for_festival_and_categories(festival_id, categories).distinct.count
  end

  def self.total_discount_for_festival(festival_id, categories: nil)
    order_ids = for_festival_and_categories(festival_id, categories).select(:id)
    where(id: order_ids).sum(:discount)
  end

  def subtotal
    tickets.where(refunded_at: nil).sum(:price)
  end

  def total_price
    [ subtotal - discount, 0 ].max
  end
end
