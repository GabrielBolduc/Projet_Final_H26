require "test_helper"

class Api::UnitsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
  include ActiveJob::TestHelper 

  setup do
    @accommodation = accommodations(:one) # Grand Hotel
    @admin = users(:three) # admin@test.com
    @unit = units(:one)
    @image = fixture_file_upload('placeholder-image.jpg', 'image/jpeg')

    @unit.image.attach(@image) 
  end

  def test_index_success
    # Code http
    get api_accommodation_units_url(@accommodation), as: :json

    # Format json valide
    assert_response :success
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_kind_of Array, json_response["data"]
    assert json_response["data"].first.key?("image_url")

    # Validation de la cohérence de la base de données
    assert_equal @accommodation.units.count, json_response["data"].size
  end

  def test_show_unit_success
    perform_enqueued_jobs do
      @unit.image.attach(
        io: File.open(Rails.root.join('test/fixtures/files/placeholder-image.jpg')),
        filename: 'placeholder-image.jpg',
        content_type: 'image/jpeg'
      )
      @unit.save!
    end

    # 2. Code http
    get api_unit_url(@unit), as: :json

    # 3. Format json valide
    assert_response :success
    json_response = JSON.parse(response.body)

    # 4. Contenu du format json
    assert_equal "success", json_response["status"]
    assert_not_nil json_response["data"]["image_url"], "image_url is nil. Is @unit.image.attached? returning true in the controller?"
    
    # 5. Validation de la cohérence de la base de données
    assert @unit.reload.image.attached?
  end

  def test_create_unit_as_admin
    sign_in @admin

    # Code http
    post api_accommodation_units_url(@accommodation), params: {
      unit: {
        type: "Units::SimpleRoom",
        cost_person_per_night: 75.00,
        quantity: 12,
        wifi: true,
        water: "drinkable",
        electricity: true,
        parking_cost: 0.0,
        food_options: ["Room service"],
        image: @image
      }
    }

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "Units::SimpleRoom", json_response["data"]["type"]
    assert_equal 75.0, json_response["data"]["cost_person_per_night"].to_f

    # Validation de la cohérence de la base de données
    new_unit = Unit.find_by(cost_person_per_night: 75.00)
    assert_not_nil new_unit
    assert new_unit.image.attached?
    assert_equal "placeholder-image.jpg", new_unit.image.filename.to_s
  end

  def test_update_unit_as_admin
    sign_in @admin

    # Code http
    patch api_unit_url(@unit), params: {
      unit: { 
        quantity: 50,
        food_options: ["Canteen", "Restaurant"]
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal 50, json_response["data"]["quantity"]
    assert_includes json_response["data"]["food_options"], "Canteen"

    # Validation de la cohérence de la base de données
    @unit.reload
    assert_equal 50, @unit.quantity
    assert_equal "Canteen,Restaurant", @unit.read_attribute(:food_options)
  end

  def test_destroy_unit_as_admin
    sign_in @admin

    # Code http
    assert_difference("Unit.count", -1) do
      delete api_unit_url(@unit), as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "Unit deleted", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_not Unit.exists?(@unit.id)
  end
end
