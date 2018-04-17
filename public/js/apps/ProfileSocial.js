

    // OAuth Configuration
    var loginUrl    = 'https://login.salesforce.com/';
    var clientId    = '3MVG9WQsPp5nH_EqSVYH0IIGS5IIcE.EPIscWUWrXENa9yfkn8txu73S5GAHRz_0OTGHFFPNxGOklODx36efW';
    var redirectUri = 'https://qatracking06-console.qa7.lrn.com/chatter/';
    var proxyUrl    = 'https://localhost/jsapp/proxy.php?mode=native';

    var client = new forcetk.Client(clientId, loginUrl, proxyUrl);

    var ajaxgif = "<img src='static/ajax.gif' />";

    var $dialog = null;
	


	$(document).ready(function() {
		
		
	});

	function getAuthorizeUrl(loginUrl, clientId, redirectUri){
	    return loginUrl+'services/oauth2/authorize?display=iframe'
	        +'&response_type=token&client_id='+escape(clientId)
	        +'&redirect_uri='+escape(redirectUri);
	}

	function hideButton(){
		$('#connect').html(ajaxgif+" connecting...");
	}

	function sessionCallback(oauthResponse) {
	    if (typeof oauthResponse === 'undefined'
	        || typeof oauthResponse['access_token'] === 'undefined') {
	        //$('#prompt').html('Error - unauthorized!');
	        errorCallback({
	            status: 0, 
	            statusText: 'Unauthorized', 
	            responseText: 'No OAuth response'
	        });
	    } else {
	        client.setSessionToken(oauthResponse.access_token, null,
	            oauthResponse.instance_url);

	        // Kick things off by doing a describe on Account...  
	        $('#prompt').html(ajaxgif+" loading metadata...");
	        client.describe('Account',metadataCallback, errorCallback);
	    }
	}
	
	
$('#chatter').live("click", function(e){
	e.preventDefault();
	window.open('/chatter/login','_blank','height=524,width=675,location=0,scrollbars=0,resizable=1,status=1');
})