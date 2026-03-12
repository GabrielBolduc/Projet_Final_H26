# test/integration/Alexandre/Reservations/reservations_test_valid.rb
require "test_helper"

class Api::ReservationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @client = users(:one)
    @reservation = reservations(:one)
    @unit = units(:one)
    @festival = festivals(:one)
  end

  def test_index_as_admin_returns_all
    sign_in @admin

    # Code http
    get api_reservations_url, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_kind_of Array, json_response["data"]

    # Validation de la cohérence de la base de données
    assert_equal Reservation.count, json_response["data"].size
  end

  def test_index_as_client_returns_only_own_active
    sign_in @client

    # Code http
    get api_reservations_url, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert json_response["data"].all? { |r| r["user_id"] == @client.id }

    # Validation de la cohérence de la base de données
    assert_equal @client.reservations.active.count, json_response["data"].size
  end

  def test_show_reservation_success
    sign_in @client

    # Code http
    get api_reservation_url(@reservation), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal @reservation.id, json_response["data"]["id"]

    # Validation de la cohérence de la base de données
    assert_not_nil json_response["data"]["unit_id"]
  end

  def test_create_reservation_success
    sign_in @client
    festival_start = @festival.start_date

    # Code http
    assert_difference("Reservation.count", 1) do
      post api_reservations_url, params: {
        reservation: {
          unit_id: @unit.id,
          arrival_at: festival_start, # Match the festival start exactly
          departure_at: festival_start + 2.days,
          nb_of_people: 1,
          reservation_name: "John Doe",
          phone_number: "555-0123"
        }
      }, as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "John Doe", json_response["data"]["reservation_name"]

    # Validation de la cohérence de la base de données
    new_res = Reservation.last
    assert_equal @client.id, new_res.user_id
    assert_equal @festival.id, new_res.festival_id
  end

  def test_update_reservation_success
    sign_in @client

    # Code http
    patch api_reservation_url(@reservation), params: {
      reservation: { reservation_name: "Updated Reservation Name" }
    }, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    puts json_response["errors"] if json_response["status"] == "error"

    assert_equal "success", json_response["status"]
    assert_equal "Updated Reservation Name", json_response["data"]["reservation_name"]

    # Validation de la cohérence de la base de données
    @reservation.reload
    assert_equal "Updated Reservation Name", @reservation.reservation_name
  end

  def test_destroy_reservation_soft_deletes
    sign_in @client

    # Code http
    assert_no_difference("Reservation.count") do
      delete api_reservation_url(@reservation), as: :json
    end

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_equal "Cancelled", json_response["message"]

    # Validation de la cohérence de la base de données
    @reservation.reload
    assert @reservation.cancelled?
  end
end
