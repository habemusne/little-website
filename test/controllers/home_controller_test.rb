require 'test_helper'

class HomeControllerTest < ActionController::TestCase
  test "should get resume" do
    get :resume
    assert_response :success
  end

end
