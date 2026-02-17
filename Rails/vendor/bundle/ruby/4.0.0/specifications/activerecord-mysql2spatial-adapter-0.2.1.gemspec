# -*- encoding: utf-8 -*-
# stub: activerecord-mysql2spatial-adapter 0.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "activerecord-mysql2spatial-adapter".freeze
  s.version = "0.2.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Daniel Azuma".freeze]
  s.date = "2010-12-27"
  s.description = "This is an ActiveRecord connection adapter for MySQL Spatial Extensions. It is based on the stock MySQL2 adapter, but provides built-in support for spatial columns. It uses the RGeo library to represent spatial data in Ruby.".freeze
  s.email = "dazuma@gmail.com".freeze
  s.extra_rdoc_files = ["History.rdoc".freeze, "README.rdoc".freeze]
  s.files = ["History.rdoc".freeze, "README.rdoc".freeze]
  s.homepage = "http://virtuoso.rubyforge.org/activerecord-mysql2spatial-adapter".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 1.8.7".freeze)
  s.rubygems_version = "1.3.7".freeze
  s.summary = "An ActiveRecord adapter for MySQL Spatial Extensions, based on RGeo and the mysql2 gem.".freeze

  s.installed_by_version = "4.0.3".freeze

  s.specification_version = 3

  s.add_runtime_dependency(%q<rgeo-activerecord>.freeze, [">= 0.2.1".freeze])
  s.add_runtime_dependency(%q<mysql2>.freeze, [">= 0.2.6".freeze])
end
