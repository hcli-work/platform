# See this for why this is here: https://stackoverflow.com/questions/47064090/rails-postgres-migration-why-am-i-receiving-the-error-pgundefinedfunction
# Basically, everytime we migrate we make sure the extensions are enabled in case the extension is blown away on DB server restarts
class EnableExtensions < ActiveRecord::Migration[6.0]
  def change
    enable_extension 'uuid-ossp'
    enable_extension 'pgcrypto'
  end
end
