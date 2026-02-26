# test/integration/Alexandre/Accommodations/accommodations_invalid_create.rb
require "test_helper"

class Api::AccommodationsControllerInvalidCreateTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three) 
    @user = users(:one)   
  end

  def test_create_denied_for_non_admin
    sign_in @user

    # Code http
    post api_accommodations_url, params: {
      accommodation: { name: "Unauthorized Hotel", category: "hotel" }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_equal "Access denied: Admin privileges required.", json_response["message"]

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "Unauthorized Hotel")
  end

  def test_create_fails_when_no_festival_is_ongoing
    sign_in @admin
    Festival.update_all(status: 'completed')

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "No Festival Hotel", 
        category: "hotel", 
        address: "123 St",
        latitude: 45, longitude: -73,
        time_car: "00:10:00", time_walk: "00:30:00"
      }
    }, as: :json

    # Format json valide
    assert_response :ok 
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "No festival is currently ongoing"

    # Validation de la cohérence de la base de données
    assert_equal 0, Accommodation.where(name: "No Festival Hotel").count
  end

  def test_create_fails_with_excessive_commission
    sign_in @admin

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "High Fee Hotel", 
        category: "hotel", 
        commission: 35.00, 
        address: "Rich St",
        latitude: 45.0, longitude: -73.0,
        time_car: "00:05:00", time_walk: "00:15:00"
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "must be less than 30"

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "High Fee Hotel")
  end

  def test_create_fails_with_invalid_category_enum
    sign_in @admin

    # Code http
    assert_raises(ArgumentError) do
      post api_accommodations_url, params: {
        accommodation: { name: "Glamping", category: "glamping" }
      }, as: :json
    end

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "Glamping")
  end

  def test_create_fails_with_missing_coordinates
    sign_in @admin

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "Floating Hotel", 
        category: "hotel", 
        address: "Ocean",
        time_car: "00:05:00", time_walk: "00:15:00"
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    messages = Array(json_response["message"]).join(", ")
    assert_includes messages, "Latitude can't be blank"
    assert_includes messages, "Longitude can't be blank"

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "Floating Hotel")
  end

  def test_create_fails_with_invalid_time_format
    sign_in @admin

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "Time Warp Inn", 
        category: "hotel", 
        address: "123 St",
        latitude: 45.0, longitude: -73.0,
        time_car: "not-a-time", 
        time_walk: "30 minutes" 
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "can't be blank"

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "Time Warp Inn")
  end

  def test_create_ignores_manual_festival_id_injection
    sign_in @admin
    completed_festival = festivals(:two)

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "Hijacked Hotel", 
        category: "hotel", 
        address: "123 St",
        latitude: 45, longitude: -73,
        time_car: "00:10:00", time_walk: "00:30:00",
        festival_id: completed_festival.id 
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    
    # Contenu du format json
    # Validation de la cohérence de la base de données
    new_acc = Accommodation.find_by(name: "Hijacked Hotel")
    assert_equal festivals(:one).id, new_acc.festival_id
    assert_not_equal completed_festival.id, new_acc.festival_id
  end

  def test_create_fails_with_negative_commission
    sign_in @admin

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "Discount Inn", category: "hotel", address: "123 St",
        latitude: 45, longitude: -73,
        time_car: "00:05:00", time_walk: "00:20:00",
        commission: -1.5 
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "must be greater than or equal to 0"

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: "Discount Inn")
  end

  def test_create_fails_with_too_long_name
    sign_in @admin
    long_name = "A" * 101

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: long_name, category: "hotel", address: "123 St",
        latitude: 45, longitude: -73,
        time_car: "00:05:00", time_walk: "00:20:00"
      }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "error", json_response["status"]
    assert_includes Array(json_response["message"]).join, "is too long"

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(name: long_name)
  end

  def test_create_strips_whitespace_from_address
    sign_in @admin
    messy_address = "   123 Jazz St   "

    # Code http
    post api_accommodations_url, params: {
      accommodation: { 
        name: "Clean Hotel", category: "hotel", address: messy_address,
        latitude: 45.1, longitude: -73.1,
        time_car: "00:10:00", time_walk: "00:30:00"
      }
    }, as: :json

    # Format json valide
    assert_response :ok

    # Contenu du format json
    # Validation de la cohérence de la base de données
    new_acc = Accommodation.find_by(name: "Clean Hotel")
    assert_equal "123 Jazz St", new_acc.address
  end
end
