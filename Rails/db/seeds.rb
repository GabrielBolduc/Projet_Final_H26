# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
begin
  Affectation.destroy_all 
rescue NameError, ActiveRecord::StatementInvalid
  #continue si aucune affectation
end


Performance.destroy_all
Stage.destroy_all
Artist.destroy_all
Festival.destroy_all
Task.destroy_all
Client.destroy_all
Admin.destroy_all
Staff.destroy_all
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

task_one = Task.create!(
    title: "Task #1",
    description: "Description of Task #1",
    difficulty: 3,
    priority: 1,
    reusable: true

)
task_one.file.attach(
  io: File.open(Rails.root.join('db/files/images.jpg')),
  filename: 'images.jpg',
  content_type: 'images/jpg'
)

task_tow = Task.create!(
    title: "installation de la scène",
    description: "Installation de la scène pour le concert",
    difficulty: 5,
    priority: 3,
    reusable: false
)
task_tow.file.attach(
  io: File.open(Rails.root.join('db/files/téléchargement (1).jpg')),
  filename: 'téléchargement (1).jpg',
  content_type: 'téléchargement (1)/jpg'
)

task_three = Task.create!(
    title: "reception du materiel",
    description: "receptionné la commande de projecteur de projecteur & co",
    difficulty: 1,
    priority: 5,
    reusable: true
)
task_tow.file.attach(
  io: File.open(Rails.root.join('db/files/meme-carre-chat-vibrant-simple_742173-4493.avif')),
  filename: 'meme-carre-chat-vibrant-simple_742173-4493.avif',
  content_type: 'meme-carre-chat-vibrant-simple_742173-4493/avif'
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
  start_at: Date.new(2025, 7, 10),
  end_at: Date.new(2025, 7, 12),
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

main_stage = Stage.create!(
    name: "Main stage",
    capacity: 15000,
    environment: "outdoor",
    technical_specs: "Big speaker"
)

b_stage = Stage.create!(
    name: "Secondary stage",
    capacity: 8000,
    environment: "indoor",
    technical_specs: "Medium stage"
)

c_stage = Stage.create!(
    name: "Small stage",
    capacity: 2000,
    environment: "covered",
    technical_specs: "Small speaker"
)


artist1 = Artist.create!(
    name: "Bob",
    genre: "Rock",
    popularity: 4,
    bio: "Good music"
)

artist2 = Artist.create!(
    name: "Louis",
    genre: "Hip hop",
    popularity: 3,
    bio: "Good music"
)

artist3 = Artist.create!(
    name: "Alice",
    genre: "Pop",
    popularity: 4,
    bio: "Good music"
)


Performance.create!(
  title: "First show",
  description: "Bon show.",
  price: 55.00,
  start_at: f.start_at.to_time.change(hour: 20, min: 0), 
  end_at: f.start_at.to_time.change(hour: 22, min: 0),
  festival: f, 
  stage: main_stage,
  artist: artist1 
)

Performance.create!(
  title: "Second show",
  description: "Good show",
  price: 45.00,
  start_at: f.start_at.to_time.change(hour: 21, min: 0), 
  end_at: f.start_at.to_time.change(hour: 23, min: 59),
  festival: f,
  stage: b_stage,
  artist: artist3
)

Performance.create!(
  title: "Last show",
  description: "Good show",
  price: 60.00,
  start_at: (f.start_at + 1.day).to_time.change(hour: 19, min: 0), 
  end_at: (f.start_at + 1.day).to_time.change(hour: 20, min: 30),
  festival: f,
  stage: main_stage,
  artist: artist2
)