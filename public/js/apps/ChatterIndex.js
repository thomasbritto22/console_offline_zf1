	$(document).ready(function() {
		
		var hash = $.deparam.fragment(location.hash);
		if(typeof hash.access_token != 'undefined'){
			//post the access token to catalyst to save it to the user's account
			$.ajax({
				url: '/chatter/app',
				data: 'authToken='+hash.access_token,
				dataType: 'json',
				type: 'POST',
				success: function(response){
					if(response.success == true)
					{
						window.location.href='/chatter/share?state=hasToken';
					}
					else{
					//error from catalyst
					}
				},
			
				error: function(qXHR, textStatus, errorThrown){
				
				}
			});
		}
		else {
			window.close();
		}
	});