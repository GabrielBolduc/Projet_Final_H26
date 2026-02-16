class Affectation < ApplicationRecord
  belongs_to :festival
  belongs_to :task
  belongs_to :user
end
