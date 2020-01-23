if Rails.application.secrets.honeycomb_write_key && Rails.application.secrets.honeycomb_dataset
  if Gem.loaded_specs.has_key?('honeycomb-beeline')
    require "honeycomb-beeline"

    Rails.logger.info "Honeycomb Beeline detected. Initalizing setup."
    Honeycomb.configure do |config|
      config.write_key = Rails.application.secrets.honeycomb_write_key
      config.dataset = Rails.application.secrets.honeycomb_dataset
    end
  else
    Rails.logger.warn "Honeycomb Beeline is not install. Skipping initialization."
  end
end
