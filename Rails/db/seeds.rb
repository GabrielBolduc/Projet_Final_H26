# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

User.destroy_all

Client.create!(
    email: "client@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Client #1",
    phone_number: "555-555-5555"
)

Admin.create!(
    email: "admin@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Admin",
    phone_number: "222-222-2222"
)

Staff.create!(
    email: "staff@test.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Staff #1",
    phone_number: "666-666-6666",
    ability: "Gestion des réservations"
)

Task.create!(
    title: "Task #1",
    description: "Description of Task #1",
    difficulty: 3,
    priority: 1,
    reusable: true
)

Task.create!(
    title: "installation de la scène",
    description: "Installation de la scène pour le concert",
    difficulty: 5,
    priority: 3,
    reusable: false
)

Task.create!(
    title: "reception du materiel",
    description: "receptionné la commande de projecteur de projecteur & co",
    difficulty: 1,
    priority: 5,
    reusable: true
)

Staff.create!(
    email: "cuisto@staff.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Cuisine",
    phone_number: "666-666-6666",
    ability: "Gestion de l'alimentation, préparation des repas, gestion des stocks"
)

Staff.create!(
    email: "regi@staff.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Regisseur",
    phone_number: "666-666-6666",
    ability: "Gestion de la logistique, coordination des équipes, supervision des opérations sur le terrain"
)

Staff.create!(
    email: "handyman@staff.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "Handy",
    phone_number: "666-666-6666",
    ability: " Gestion de la maintenance, réparation des équipements, gestion des installations techniques"
)

Staff.create!(
    email: "security@staff.com",
    password: "qwerty",
    password_confirmation: "qwerty",
    name: "hight admiral Brash",
    phone_number: "666-666-6666",
    ability: "Gestion de la sécurité, coordination des forces de l'ordre, gestion des menaces"
)