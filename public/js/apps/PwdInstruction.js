if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
Lrn.Application.passInstruction = {};

//Initial Global variable for Password Instruction page
Lrn.Application.passInstruction = function(config)
{
	if(config){
		this.lang = config.lang || '';
	    this.languageName = config.langName || '';
	}
    
};

/**
 * --- AUTH PROTOTYPE ---
 * We want to make Auth a subclass of Application so
 * we will set the Auth.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.passInstruction.prototype = new Lrn.Application();
Lrn.Application.passInstruction.prototype.superclass = Lrn.Application.prototype;



//initial Password Instruction JS
Lrn.Application.passInstruction.prototype.init = function()
{	
	var passInstruction = this;
	passInstruction.initLanguages();
	
	//initial load password instruction for English language
	passInstruction.passInstrLoad(passInstruction.lang);
	
	//attach click event to save button
	$('#pwdinstSubmit').click(function(){
		passInstruction.saveChange();
	});
	
	//enable the Password instruction when there is update
	$('#pwdinstructiontext').on("keyup paste cut change", function(){
		$('#pwdinstSubmit').removeClass('disabled').removeAttr('disabled','disabled');
	});
	
	//disabled save Password instructions
	$('#pwdinstSubmit').addClass('disabled').attr('disabled','disabled');
};

Lrn.Application.passInstruction.prototype.initLanguages = function()
{
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
	this.superclass.init.apply(this);
	
	//disable the notification first
	$('#langNotification').css('display', 'none');
	
	//changing the notice language box text
	$('#languageNameId').text(this.languageName);
	
	//setup the language dropbox box to inial the reload Password Instruction data
	if ($('#fieldLanguages').length > 0){
		//display the notication box
		$('#langNotification').css('display', 'block');
		
		$('#fieldLanguages').change((function(){
			
			//change language property when the dropdown box changed 
			this.lang = $('#fieldLanguages :selected').val();
			this.languageName = $('#fieldLanguages :selected').text();
			
			this.passInstrLoad(this.lang);
			
			//changing the notice language box text
			$('#languageNameId').text(this.languageName);

		}).bind(this));
	}
}

/*
 * Function to load the Password Instruction
 */
Lrn.Application.passInstruction.prototype.passInstrLoad = function(langCode)
{
	//Display loading spinner
	this.displayAlert('ajax-loader.gif','Loading');
	
	$('#pwdinstSubmit').attr("disabled", "disabled");
	$('#pwdinstructiontext').text('');
	
	//Start ajax loading Password Instruction request
    request = $.ajax({
        url: "/admin/updateinstructions",
        type: "post",
        data: {action:'getPassInstr', lang:langCode},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: (function(serviceResponse){
        	//closing the load spinner after success return by delay 200 msecond to close 
        	this.closeAlert(2000);

        	if (true == serviceResponse.response){
        		$('#pwdinstSubmit').removeAttr("disabled");
        		$('#pwdinstructiontext').val(serviceResponse.data.passInstr);
        		$('#pwdinstructiontext').attr("oldtext",serviceResponse.data.passInstr);
        		$('#translationId').val(serviceResponse.data.translationId);
        		$('#translationId').attr("oldtext",serviceResponse.data.translationId);
        	}else{
        		this.displayAlert('error.png', 'Failed to Load!');
        		this.closeAlert(1000);
        	}
        	
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	this.closeAlert(0);
        	
        	if ('timeout' === textStatus){
        		this.displayAlert('error.png', 'Connection Timeout!');
        	}else{
        		this.displayAlert('error.png', 'Connnection Failed!');
        	}
        	this.closeAlert(1000);
        	
        }).bind(this)
    });

}

/*
 * Function to call update Password Instruction
 */
Lrn.Application.passInstruction.prototype.saveChange = function()
{
	//Display saving spinner
	var pwddom = $('#pwdinstructiontext');
	var pwdval = pwddom.val();
	pwdval = pwdval === pwddom.attr('placeholder') ? '' : pwdval;
	this.displayAlert('ajax-loader.gif','Saving');
    request = $.ajax({
	    url: "/admin/updateinstructions",
	    type: "post",
	    data: {action:'updatePassInstr', lang:this.lang, pwdinstructiontext:pwdval, translationId:$('#translationId').val()},
	    dataType: "json",
	    async: false,
	    timeout: 10000,
	    success: (function(response){
	    	if (true == response.success){
	    		this.displayAlert('done.jpg', 'Saved');
	    		this.closeAlert(1000);
	    		
	    		//update the translationId hidden field
	    		$('#translationId').val(response.data[0].translationId);
	    		$('#translationId').attr("oldtext",response.data[0].translationId);
	    		$('#pwdinstructiontext').attr("oldtext",response.data[0].translationValue);
	    		
	    		//disable save button when saved succesfull
	    		$('#pwdinstSubmit').addClass('disabled').attr('disabled','disabled');
	    		
	    		//disable save all
	    		$('#saveAll').addClass('disabled').attr('disabled','disabled');
	    	}else{
	    		this.displayAlert('error.png', 'Failed');
	    		this.closeAlert(1000);
	    	}
	    }).bind(this),
	    error: (function(){
	    	this.displayAlert('error.png', 'Connection Failed!');
	    	this.closeAlert(1000);
	    }).bind(this)
    });
}

Lrn.Application.passInstruction.prototype.displayAlert = function(imageName, alertText)
{
	//Display loading spinner
	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/' +imageName+ '"  width=50 height=50/></span>' +alertText+ '</p>');
	$("#messageModal").dialog({
		   resizable: false,
		   width: 150,
		   height: 150,
		   closeOnEscape: false,
		   open: function(event, ui){
			   $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();
		   }
	});
}

Lrn.Application.passInstruction.prototype.closeAlert = function(delay)
{
	setTimeout(function(){
		$("#messageModal").dialog("close");
	}, delay);
}