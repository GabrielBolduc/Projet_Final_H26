# -*- encoding: utf-8 -*-
# stub: rgeo-activerecord 0.4.6 ruby lib

Gem::Specification.new do |s|
  s.name = "rgeo-activerecord".freeze
  s.version = "0.4.6".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Daniel Azuma".freeze]
  s.date = "2012-12-12"
  s.description = "RGeo is a geospatial data library for Ruby. RGeo::ActiveRecord is an optional RGeo module providing some spatial extensions to ActiveRecord, as well as common tools used by RGeo-based spatial adapters.".freeze
  s.email = "dazuma@gmail.com".freeze
  s.extra_rdoc_files = ["History.rdoc".freeze, "README.rdoc".freeze]
  s.files = ["History.rdoc".freeze, "README.rdoc".freeze]
  s.homepage = "http://dazuma.github.com/rgeo-activerecord".freeze
  s.required_ruby_version = Gem::Requirement.new(">= 1.8.7".freeze)
  s.rubygems_version = "1.8.24".freeze
  s.summary = "An RGeo module providing spatial extensions to ActiveRecord.".freeze

  s.installed_by_version = "4.0.3".freeze

  s.specification_version = 3

  s.add_runtime_dependency(%q<rgeo>.freeze, [">= 0.3.20".freeze])
  s.add_runtime_dependency(%q<activerecord>.freeze, [">= 3.0.3".freeze])
  s.add_runtime_dependency(%q<arel>.freeze, [">= 2.0.6".freeze])
end
