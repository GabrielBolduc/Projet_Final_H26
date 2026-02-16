class Staff < User
    validates :ability, presence: true

    has_one :affiliation, dependent: :destroy
end