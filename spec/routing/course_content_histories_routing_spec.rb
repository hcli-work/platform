require "rails_helper"

RSpec.describe CourseContentHistoriesController, type: :routing do
  let(:course_content) { create(:course_content) }
  describe "routing" do
    it "routes to #index" do
      expect(:get => "/course_contents/#{course_content.id}/versions").to route_to("course_content_histories#index",
          :course_content_id => course_content.id.to_s)
    end

    it "routes to #show" do
      expect(:get => "/course_contents/#{course_content.id}/versions/1").to route_to("course_content_histories#show",
          :id => "1", :course_content_id => course_content.id.to_s)
    end
  end
end
