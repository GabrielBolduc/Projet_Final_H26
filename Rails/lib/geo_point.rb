GeoPoint = Struct.new(:latitude, :longitude) do
  def to_s
    "#{latitude}, #{longitude}"
  end
end