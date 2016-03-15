class HomeController < ApplicationController
  def index
    @ip = request.remote_ip
    @user = Visitor.new(:ip => @ip)
    @user.save
  end

  def resume
    pdf_filename = File.join(Rails.root, "public/resume_mark.pdf")
    send_file(pdf_filename, :filename => "resume_mark.pdf", :disposition => 'inline', :type => "application/pdf")
  end
end
