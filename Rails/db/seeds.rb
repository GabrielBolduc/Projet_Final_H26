# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
ActiveRecord::Base.connection.execute("SET FOREIGN_KEY_CHECKS = 0;")

begin
  Affectation.delete_all
  Reservation.delete_all
  Order.delete_all
  Ticket.delete_all
  Package.delete_all
  Unit.delete_all
  Accommodation.delete_all
  Performance.delete_all
  Stage.delete_all
  Task.delete_all
  Artist.delete_all
  Festival.delete_all 
  Client.delete_all
  Admin.delete_all
  Staff.delete_all
  User.delete_all
ensure
  ActiveRecord::Base.connection.execute("SET FOREIGN_KEY_CHECKS = 1;")
end


c = Client.create!(
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

# GabrielB
f = Festival.create!(
  name: "Festify 2026",
  start_at: Date.new(2026, 7, 15),
  end_at: Date.new(2026, 7, 20),
  daily_capacity: 5000,
  address: "123 Rue rue, Shawinigan, QC",
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "ongoing",
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
  latitude: 46.52673340326582,
  longitude: -72.73930869816652,
  status: "completed",
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
  status: "completed",
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

# Alexandre
acc1 = Accommodation.create!(
  name: "Grand Royal Hotel",
  category: :hotel,
  address: "123 Festival Lane, Palm Springs, CA",
  latitude: 33.8121,
  longitude: -116.5165,
  shuttle: true,
  time_car: Time.parse("00:15:00"),
  time_walk: Time.parse("01:00:00"),
  commission: 12.50,
  festival: f
)

acc2 = Accommodation.create!(
  name: "Wildwood Luxury Camping",
  category: :camping,
  address: "North Gate, Sector B, Glastonbury",
  latitude: 51.1557,
  longitude: -2.5859,
  shuttle: false,
  time_car: Time.parse("00:05:00"),
  time_walk: Time.parse("00:10:00"),
  commission: 5.00,
  festival: f
)

unit1 = Units::SimpleRoom.new(
  accommodation: acc1,
  cost_person_per_night: 55.00,
  quantity: 10,
  wifi: true,
  water: 2 ,
  electricity: true,
  parking_cost: 0.00,
  food_options: "Room service,Restaurant"
)


# Racine

p_general = Package.create!(
  title: "Passeport Festival",
  description: "Accès complet à toutes les scènes pour toute la durée du festival. Inclut un accès prioritaire.",
  price: 150.00,
  quota: 500,
  category: "general",
  valid_at: f.start_at,
  expired_at: f.end_at,
  festival: f
)

p_daily = Package.create!(
  title: "Billet Journalier",
  description: "Accès pour une seule journée de festivités.",
  price: 60.00,
  quota: 1000,
  category: "daily",
  valid_at: f.start_at.to_time.change(hour: 10),
  expired_at: f.start_at.to_time.change(hour: 17),
  festival: f
)

p_evening = Package.create!(
  title: "Billet Soirée",
  description: "Pour les spectacles du soir !",
  price: 72.99,
  quota: 2400,
  category: "evening",
  valid_at: f.start_at.to_time.change(hour: 19),
  expired_at: f.start_at.to_time.change(hour: 23),
  festival: f
)

# Attachement des images
images = {
  p_general => 'general-ticket.webp',
  p_daily   => 'daily-ticket.webp',
  p_evening => 'evening-ticket.jpg',
  unit1 => 'placeholder-image.jpg'
}

images.each do |package, filename|
  path = Rails.root.join('db', 'files', filename)
  
  if File.exist?(path)
    # Détermine le type d'image
    content_type = filename.end_with?('.jpg', '.jpeg') ? 'image/jpeg' : 'image/webp'

    package.image.attach(
      io: File.open(path),
      filename: filename,
      content_type: content_type 
    )
  else
    puts "Image non trouvée : #{filename}"
  end
end

unit1.save!


# Laurent

res1 = Reservation.create!(
  arrival_at: Date.new(2026, 7, 15),
  departure_at: Date.new(2026, 7, 17),
  nb_of_people: 1,
  reservation_name: "Jean Daniel",
  phone_number: "8195338888",
  user: c,
  unit: unit1,
  festival: f
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
  io: File.open(Rails.root.join('db/files/test.txt')),
  filename: 'test.txt',
  content_type: 'test/txt'
)

task_three = Task.create!(
    title: "reception du materiel",
    description: "receptionné la commande de projecteur de projecteur & co",
    difficulty: 1,
    priority: 5,
    reusable: true
)
task_three.file.attach(
  io: File.open(Rails.root.join('db/files/meme-carre-chat-vibrant-simple_742173-4493.avif')),
  filename: 'meme-carre-chat-vibrant-simple_742173-4493.avif',
  content_type: 'meme-carre-chat-vibrant-simple_742173-4493/avif'
)

Affectation.create!(
    user: Staff.first,
    task: task_one,
    festival: f,
    responsability: "Affectation de la tache 1",
    expected_start: f.start_at.to_time.change(hour: 8, min: 0),
    expected_end: f.start_at.to_time.change(hour: 12, min: 0)
)

Affectation.create!(
    user: Staff.first,
    task: task_tow,
    festival: f,
    responsability: "Assurer la bonne installation de la scène",
    expected_start: f.start_at.to_time.change(hour: 13, min: 0),
    expected_end: f.start_at.to_time.change(hour: 17, min: 0)
) 

Affectation.create!(
    user: Staff.first,
    task: task_three,
    festival: f,
    responsability: "Receptionné la commande de projecteur de projecteur & co",
    expected_start: f.start_at.to_time.change(hour: 9, min: 0),
    expected_end: f.start_at.to_time.change(hour: 10, min: 0)
) 
