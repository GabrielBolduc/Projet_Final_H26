# test/integration/Alexandre/Accommodations/accommodations_invalid_index.rb
require "test_helper"

class Api::AccommodationsControllerInvalidIndexTest < ActionDispatch::IntegrationTest

  def test_index_with_invalid_category_returns_empty
    # Code http
    get api_accommodations_url(category: 99), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_empty json_response["data"]

    # Validation de la cohérence de la base de données
    assert_nil Accommodation.find_by(category: 99)
  end

  def test_index_returns_empty_when_no_festivals_ongoing
    Festival.update_all(status: 'completed')

    # Code http
    get api_accommodations_url, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_empty json_response["data"], "Should not return accommodations if no festival is ongoing"

    # Validation de la cohérence de la base de données
    assert_equal 0, Accommodation.joins(:festival).merge(Festival.ongoing).count
  end

  def test_index_ignores_malformed_category_param
    # Code http
    get api_accommodations_url(category: 'all'), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    assert_equal "success", json_response["status"]
    assert_not_empty json_response["data"]
    assert_includes json_response["data"].map { |a| a["name"] }, "Grand Hotel"
  end

  def test_index_with_non_ongoing_festival_id_filter
    completed_festival = festivals(:two)
    
    # Code http
    get api_accommodations_url(festival_id: completed_festival.id), as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    returned_ids = json_response["data"].map { |a| a["id"] }
    assert_not_includes returned_ids, accommodations(:two).id
  end

  def test_index_excludes_draft_festivals
    draft_festival = festivals(:three)
    draft_hotel = Accommodation.create!(
        name: "Hidden Draft Inn", 
        festival: draft_festival, 
        category: 1, address: "789 Secret St",
        latitude: 46, longitude: -71,
        time_car: "00:10:00", time_walk: "00:30:00"
    )

    # Code http
    get api_accommodations_url, as: :json

    # Format json valide
    assert_response :ok
    json_response = JSON.parse(response.body)

    # Contenu du format json
    returned_names = json_response["data"].map { |a| a["name"] }
    assert_not_includes returned_names, "Hidden Draft Inn"

    # Validation de la cohérence de la base de données
    assert_equal "draft", draft_festival.status
  end
end
