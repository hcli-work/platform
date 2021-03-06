if Rails.application.secrets.honeycomb_write_key && Rails.application.secrets.honeycomb_dataset
  if Gem.loaded_specs.has_key?('honeycomb-beeline')
    require "honeycomb-beeline"

    Rails.logger.info "Honeycomb Beeline detected. Initalizing setup."
    Honeycomb.configure do |config|
      config.write_key = Rails.application.secrets.honeycomb_write_key
      config.dataset = Rails.application.secrets.honeycomb_dataset
      config.notification_events = %w[
        sql.active_record
        render_template.action_view
        render_partial.action_view
        render_collection.action_view
        process_action.action_controller
        send_file.action_controller
        send_data.action_controller
        deliver.action_mailer
      ].freeze
    end
  else
    Rails.logger.warn "Honeycomb Beeline is not install. Skipping initialization."
  end
end
