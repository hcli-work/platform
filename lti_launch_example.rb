class LtiLaunchController < ApplicationController

  def login
    redirect_uri='https://platformweb/lti/launch' # Configured as the Redirect URI in the Developer Key
    auth_params = {
      :scope => 'openid',  # OIDC Scope
      :response_type => 'id_token',  # OIDC response is always an id token
      :response_mode => 'form_post',  # OIDC response is always a form post
      :prompt => 'none',  # Don't prompt user on redirect
      :client_id => params[:client_id],
      :redirect_uri => redirect_uri,  # URL to return to after login
      :state => generateState(),  # State to identify browser session
      :nonce => generateNonce(),  # Prevent replay attacks 
      :login_hint =>  params[:login_hint], # Login hint to identify platform session
      :lti_message_hint => params[:lti_message_hint] # # LTI message hint to identify LTI context within the platform
    }
    redirect_to "https://canvas.instructure.com/api/lti/authorize_redirect?#{auth_params.to_query}"
  end

  def launch
    id_token_segments = params[:id_token].split('.')
    id_token_header = JWT::Base64.url_decode(id_token_segments[0])
    id_token_payload = JWT::Base64.url_decode(id_token_segments[1])
    id_token_signature = JWT::Base64.url_decode(id_token_segments[2])
    verifySignature(id_token_signature)
    json_payload = JSON.parse(id_token_payload)
    target_link_uri = json_payload["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"]
    custom_fields = json_payload["https://purl.imsglobal.org/spec/lti/claim/custom"]
    deep_link_settings = json_payload["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"]

    redirect_to target_link_uri
  end

  # This is a hack to allow the form to submit back a DeepLinkingResponse to canvas
  def deep_link_response
    #token = decoded_jwt_token(request)
    #platform_iss = token["iss"]
    #application_instance = current_application_instance
    #client_id = application_instance.application.client_id(platform_iss)

#    client_id = '160050000000000011'
    client_id = Rails.cache.fetch("lti_client_id")
    platform_iss = 'https://canvas.instructure.com'

    payload = {
      iss: client_id, # A unique identifier for the entity that issued the JWT
      aud: platform_iss, # Authorization server identifier
      iat: Time.now.to_i, # Timestamp for when the JWT was created
      exp: Time.now.to_i + 300, # Timestamp for when the JWT should be treated as having expired
      # (after allowing a margin for clock skew)
      azp: client_id,
      nonce: SecureRandom.hex(10),
      "https://purl.imsglobal.org/spec/lti/claim/message_type" => "LtiDeepLinkingResponse",
      "https://purl.imsglobal.org/spec/lti/claim/version" => "1.3.0",
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id" => Rails.cache.fetch("lti_deployment_id"),
      "https://purl.imsglobal.org/spec/lti-dl/claim/content_items" => content_items,
    }

#    if token["data"].present?
#      payload[LtiAdvantage::Definitions::DEEP_LINKING_DATA_CLAIM] = token["data"]
#    end

    jwt =  sign_tool_jwt(payload)
    jwt

#    render json: {
#      jwt: jwt,
#    }
  end

  def sign_tool_jwt(payload)
    # TODO: need to implement this.
    #jwk = jwk.create!
    #JWT.encode(payload, jwk.private_key, jwk.alg, kid: jwk.kid, typ: "JWT")
    Keypair.create!
    Keypair.jwt_encode(payload)
  end

  def content_items
    out = []

    # Note: If the HTML fragment renders a a single resource which is also addressable directly, the tool SHOULD use the link type with an embed code.
#    out << {
#        "type" => "html",
#        "html" => '<h1>Braven Deep Linked Resource</h1><iframe style="width: 100%; height: 100%;" src="https://stagingportal.bebraven.org/courses/58/assignments/1312" allowfullscreen></iframe>'
#        "html" => '<h1>Braven Deep Linked Resource</h1><br/><iframe style="width: 100%; height: 100%;" src="https://platformweb/course_contents/new" allowfullscreen></iframe>'
#        "html" => File.read("tmp.html")
#    }

#    out << {
#        "type" => "link",
#        "url" => "https://stagingportal.bebraven.org/courses/58/assignments/1312",
#        "iframe" => { 
#          "width" => 1000,
#          "height" => 1000,
#          "src" => "https://stagingportal.bebraven.org/courses/58/assignments/1312"
#        }
#    }

# See " 2.2 LTI Resource Link" of https://www.imsglobal.org/spec/lti-dl/v2p0#link for more options
    out << {
        "type" => "ltiResourceLink",
        "url" => "https://stagingportal.bebraven.org/courses/58/assignments/1312",
        "iframe" => { 
          "width" => 1000,
          "height" => 1000
        }
    }
    out
  end

end
