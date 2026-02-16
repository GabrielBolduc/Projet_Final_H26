class Staff < User
    validates :ability, presence: true

    #has_many :affectation, dependent: :destroy
end