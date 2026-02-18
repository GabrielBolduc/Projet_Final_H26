class Task < ApplicationRecord

    validates :title, presence: true
    validates :description, presence: true

    validates :difficulty, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }
    validates :priority, presence: true

    has_many :affectations, dependent: :destroy

    has_one_attached :file

    def file_url
        Rails.application.routes.url_helpers.rails_blob_path(file, only_path: true) if file.attached?
    end
end
