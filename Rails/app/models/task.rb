class Task < ApplicationRecord
    validates :title, presence: true
    validates :description, presence: true

    validates :difficulty, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }
    validates :priority,  numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }

    has_many :affectations, dependent: :destroy

    has_one_attached :file

    def file_url
        Rails.application.routes.url_helpers.rails_blob_path(file, only_path: true) if file.attached?
    end

    def affectations_count
        affectations.count
    end


    def completed
        affectations.exists? && affectations.where(end: nil).none?
    end

    def ongoing
        affectations.where.not(start: nil).exists? &&
        affectations.where(end: nil).exists?
    end


    def awaiting
    affectations.where.not(start: nil).none?
    end
end
