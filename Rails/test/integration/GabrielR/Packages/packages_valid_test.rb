require "test_helper"

class PackagesValidTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup do
    @admin = users(:three)
    @package = packages(:one)

    @valid_params = {
      package: {
        title: "Passeport VIP",
        description: "Accès total pour tout le festival",
        price: 150.00,
        quota: 500,
        category: "general",
        valid_at: "2026-08-01T12:00:00Z",
        expired_at: "2026-08-01T23:59:00Z",
        festival_id: festivals(:one).id
      }
    }
  end

  # --- INDEX ---
  test "public should list all packages" do

    # modif ou non
    assert_no_difference("Package.count") do
      get api_packages_url, as: :json
    end

    # code
    assert_response :ok

    # format reponse
    json = JSON.parse(response.body)

    # donne reponse
    assert_equal "success", json["status"]
    assert_not_nil json["data"]
  end

  test "index should return packages ordered by price ascending" do
    get api_packages_url, as: :json
    json = JSON.parse(response.body)
    
    prices = json["data"].map { |p| p["price"].to_f }
    assert_equal prices.sort, prices, "Les forfaits ne sont pas triés par prix croissant"
  end

  # --- SHOW ---
  test "public should show a specific package" do
    assert_no_difference("Package.count") do
      get api_package_url(@package), as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)

    assert_equal "success", json["status"]
    assert_equal @package.title, json["data"]["title"]
  end

  # --- CREATE ---
  test "admin should create a new package" do
    sign_in @admin

    assert_difference("Package.count", 1) do
      post api_packages_url, params: @valid_params, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)

    assert_equal "success", json["status"]
    assert_equal "Passeport VIP", json["data"]["title"]
    assert_equal 150.00, json["data"]["price"].to_f
  end

  # --- UPDATE ---
  test "admin should update a package" do
    sign_in @admin

    assert_no_difference("Package.count") do
      put api_package_url(@package), params: { package: { title: "Titre Modifié", price: 99.99 } }, as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)

    assert_equal "success", json["status"]
    assert_equal "Titre Modifié", json["data"]["title"]
    assert_equal 99.99, json["data"]["price"].to_f
  end

  # --- DESTROY ---
  test "admin should delete a package" do
    sign_in @admin

    package_to_delete = Package.new(
      title: "Package à supprimer",
      description: "Test",
      price: 50.0,
      quota: 100,
      category: "general",
      valid_at: "2026-08-01T10:00:00Z",
      expired_at: "2026-08-01T23:00:00Z",
      festival: festivals(:one)
    )
    
    # sauvegarde dans la base de données en ignorant les validations
    package_to_delete.save(validate: false)

    # teste la suppression
    assert_difference("Package.count", -1) do
      delete api_package_url(package_to_delete), as: :json
    end

    assert_response :ok
    json = JSON.parse(response.body)
    assert_equal "success", json["status"]
  end
end