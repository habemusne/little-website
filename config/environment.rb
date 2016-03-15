# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Markchen::Application.initialize!
config.action_dispatch.x_sendfile_header = "X-Sendfile"
