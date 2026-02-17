# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Performance.destroy_all
Stage.destroy_all
Artist.destroy_all
Festival.destroy_all
Task.destroy_all
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

f = Festival.create!(
  name: "Festify 2026",
  start_at: Date.new(2026, 7, 15),
  end_at: Date.new(2026, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582, 
  longitude: -72.73930869816652,
  status: "ONGOING",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

f1 = Festival.create!(
  name: "Festify 2025",
  start_at: Date.new(2025, 7, 15),
  end_at: Date.new(2025, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  coordinates: GeoPoint.new(46.52673340326582, -72.73930869816652),
  status: "COMPLETED",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)

f2 = Festival.create!(
  name: "Festify 2024",
  start_at: Date.new(2024, 7, 15),
  end_at: Date.new(2024, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582, 
  longitude: -72.73930869816652,
  status: "COMPLETED",
  satisfaction: 4,
  other_income: 15000.00,
  other_expense: 5000.00,
  comment: "Bon festival"
)
