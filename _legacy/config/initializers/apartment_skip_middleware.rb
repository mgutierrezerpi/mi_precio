# Skip Apartment middleware during asset precompilation and other non-web contexts
Rails.application.configure do
  # Skip middleware during asset precompilation or rake tasks
  skip_apartment = ENV['SECRET_KEY_BASE_DUMMY'] == '1' || 
                   defined?(Rake) || 
                   File.basename($0) == 'rake' ||
                   ARGV.any? { |arg| arg.include?('assets:precompile') }
  
  unless skip_apartment
    Rails.logger.info "Loading Apartment subdomain middleware" if defined?(Rails.logger)
    begin
      require 'apartment/elevators/subdomain'
      config.middleware.use Apartment::Elevators::Subdomain
    rescue LoadError => e
      Rails.logger.warn "Could not load Apartment middleware: #{e.message}" if defined?(Rails.logger)
    end
  else
    Rails.logger.info "Skipping Apartment middleware loading" if defined?(Rails.logger)
  end
end