$(document).ready(function() {
	var urlParams;
	(window.onpopstate = function () {
	    var match,
	        pl     = /\+/g,  // Regex for replacing addition symbol with a space
	        search = /([^&=]+)=?([^&]*)/g,
	        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	        query  = window.location.search.substring(1);

	    urlParams = {};
	    while (match = search.exec(query))
	       urlParams[decode(match[1])] = decode(match[2]);
	})();
	$("#authLogin").submit(function() {
		var tweet = '';
		var commentText='';
		tweet = urlParams.tweet;
		commentText = $('textarea#user_msg').val();
		if(commentText == $('textarea#user_msg').attr('placeholder')){
			commentText = '';
			$('textarea#user_msg').val('');
		}
		
		if(tweet == '' && commentText == ''){
			$("#messageModal").html('<br/><span class="messageModal">&nbsp;&nbsp;&nbsp;Please enter your comments.</span>');
	    	$("#messageModal").dialog({
	    			title: 'Error',
	    		   resizable: false,
	    		   width : 300,
	    		   height : 150,
	    		   closeOnEscape: false,
	    		   open: function(event, ui) { 
					 },
			  	     //buttons: [ { text: "close", click: function() { $( '#messageModal' ).dialog( "close" ); } } ]
    		});
	    	setTimeout(function(){
                $("#messageModal").dialog("close");
            }, 1000);
	    	return false;
		}
		if(commentText.length > $('textarea#user_msg').attr('maxlength')){
			$("#messageModal").html('<br/><span class="messageModal">&nbsp;&nbsp;&nbsp;User Comments should should not exceed &nbsp;&nbsp;&nbsp;' + $('textarea#user_msg').attr('maxlength') + ' characters.</span>');
	    	$("#messageModal").dialog({
	    			title: 'Error',
	    		   resizable: false,
	    		   width : 300,
	    		   height : 150,
	    		   closeOnEscape: false,
	    		   open: function(event, ui) { 
					 },
			  	     //buttons: [ { text: "close", click: function() { $( '#messageModal' ).dialog( "close" ); } } ]
    		});
	    	return false;
		}
		
	});
	var ie = (function(){
	    var undef, v = 3, div = document.createElement('div');

	    while (
	        div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
	        div.getElementsByTagName('i')[0]
	    );

	    return v> 4 ? v : undef;
	}());
	if (ie) {
		$('textarea#user_msg').focus(function() {
			 var input = $(this);
			if (input.val() == input.attr('placeholder')) {
			    input.val('');
			    input.removeClass('placeholder');
			  }
		}).blur(function() {
				  var input = $(this);
				  if (input.val() == '' || input.val() == input.attr('placeholder')) {
				    input.addClass('placeholder');
				    input.val(input.attr('placeholder'));
				  }
				});
			
		var commentTxt = $('textarea#user_msg').val();
		if(commentTxt == ''){
			$('textarea#user_msg').val($('textarea#user_msg').attr('placeholder'));
			$('textarea#user_msg').addClass('placeholder');
		}
	}
});
