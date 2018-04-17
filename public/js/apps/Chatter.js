if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
/**
 * --- Chatter ---
 * The Chatter object is intended to handle all things
 * that relate to Chatter in the Application. 
 * @param config
 * @returns {Lrn.Application.Chatter}
 */
Lrn.Application.Chatter = function(config){
    if(config){
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
        this.siteLabels = config.siteLabels || null;
        this.siteErrors = config.siteErrors || null;
        this.siteInstructions = config.siteInstructions || null;
    }
};

/**
 * --- Chatter PROTOTYPE ---
 * We want to make Chatter a subclass of Application so
 * we will set the Chatter.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Chatter.prototype = new Lrn.Application();
Lrn.Application.Chatter.prototype.superclass = Lrn.Application.prototype;


$(function() {
	$('#cancel').on('click', function(e){
		if(e.preventDefault) e.preventDefault();
		else e.returnValue = false;
		
		window.close();
		return false;
	});
	
	var formSubmit = $("#formSubmit");
	if(formSubmit.length > 0){
		formSubmit.validate({
			 submitHandler: function(){
				 pageForm = $("#formSubmit");
				 $.ajax({
			            type: "POST",
			            url: "/chatter/post",
			            dataType: "json",
			            data: pageForm.serialize(),
			            success: function(response){
			            	if(typeof response.error != undefined){
			            		//close window or hide modal
			            		$('.shareRound').remove();
			            		$('#formSubmit').append('<div class="shareRound">'+Lrn.Applications.Chatter.siteLabels.MessageSent+'</div>');
			            		$('#formSubmit').append('<button id="exit" name="exit">'+Lrn.Applications.Chatter.siteLabels.Exit+'</div>');
			            		
			            		$('#exit').on('click', function(e) { e.preventDefault(); window.close(); });
			            	}
			            	else{
//			            		var error = response.error;
			            		alert(response.error);
			            		window.close();
			            	}
			            },
			            error: function(jqXHR,textStatus,errorThrown ){
			            	//console.log(textStatus)
			            }
				 		
				 });
				 
				 $('.shareForm').remove();
				 $('#formSubmit fieldset').remove();
				 $('#formSubmit').append('<div class="shareRound">'+Lrn.Applications.Chatter.siteLabels.Sharing+'</div>');
			 },
			 errorHandler: function(){}
		 });
	} 
	 // Submission of Chatter secret key in Admin area
	var chatterSubmit = $('#chatterSubmit');
	if(chatterSubmit.length > 0){
		chatterSubmit.on("click", function(e){
			 pageForm = $("#form");
			 e.preventDefault();
			 $.ajax({
		            type: pageForm.attr('method'),
		            url: pageForm.attr('action'),
		            dataType: "json",
		            data: pageForm.serialize(),
		            success: function(response){
		            	//console.log(response)
		            	if(typeof response.error == 'undefined'){
		            		//close window or hide modal
		            		window.close();
		            	}
		            	else{
//		            		var error = response.error
		            		alert(response.error);
		            	}
		            },
		            error: function(jqXHR,textStatus,errorThrown ){
		            //	console.log(textStatus)
		            }
			 		
			 });
		 });
	}
	 
	// Profile button to 'Add Chatter to your profile'
	var chatter = $('#chatter');
	if(chatter.length > 0){
		chatter.on("click", function(e){
			 pageForm = $("#form");
			 e.preventDefault();
			 $.ajax({
		            type: pageForm.attr('method'),
		            url: pageForm.attr('action'),
		            dataType: "json",
		            data: pageForm.serialize(),
		            success: function(response){
		            	//console.log(response)
		            	if(typeof response.error != undefined){
		            		//close window or hide modal
		            		window.close();
		            	}
		            	else{
		            		var error = response.error;
		            		alert(error);
		            	}
		            },
		            error: function(jqXHR,textStatus,errorThrown ){
		            	//console.log(textStatus)
		            }
			 		
			 });
		 });
	}
	 
	//Share page submit form 
	var submitPost = $("#submitPost");
	if(submitPost.length > 0){
		submitPost.on("click", function(e){
			pageForm = $("#formSubmit");
			pageForm.find('input[placeholder], textarea[placeholder]').each(removePhClass);
			// e.preventDefault();
		 });
	}
	// Create a dummy element for feature detection
	 if(!('placeholder' in $('<input>')[0])) {
		 
		 // Select the elements that have a placeholder attribute
		 $('input[placeholder], textarea[placeholder]').blur(addPhClass).focus(removePhClass).each(addPhClass);
		 
		 // Remove the placeholder text before the form is submitted
		 $('form').submit(function(){
	        $(this).find('input[placeholder], textarea[placeholder]').each(removePhClass);
	     });
	 }
});
 
 
 
 // Function to add placeholder class
 function addPhClass() {
	if($(this).val() === ''){
		$(this).val($(this).attr('placeholder')).addClass('placeholder');
	}
}
 
 // Function to remove placeholder class
 function removePhClass() {
	if($(this).val() === $(this).attr('placeholder')){
		$(this).val('').removeClass('placeholder');
	}
}	