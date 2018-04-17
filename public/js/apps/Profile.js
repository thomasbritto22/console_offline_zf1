if (typeof (Lrn) == 'undefined')
	Lrn = {};
if (typeof (Lrn.Application) == 'undefined')
	Lrn.Application = {};
var popJson= {'autoclose':0,'timeclose':300 };
var selectedlanguage = "";

/**
 * --- PROFILE ---
 * This object is responsible for displaying the users
 * profile information.
 * @param config
 * @returns {Lrn.Application.Profile}
 */
Lrn.Application.Profile = function(config) {
	if (config) {
		this.user = config.user || null;
		this.siteConfigs = config.siteConfigs || null;
		this.siteLabels = config.siteLabels || null;
        this.siteErrors = config.siteErrors || null;
        this.siteInstructions = config.siteInstructions || null;
	}
	
	
	this.logoutLcec = false;
	this.logoutAim = false;
	this.logoutRam = false;
	this.siteState = new Lrn.Widget.SiteState();
};
/**
 * --- PROFILE PROTOTYPE ---
 * We want to make Profile a subclass of Application so
 * we will set the Profile.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Profile.prototype = new Lrn.Application();
Lrn.Application.Profile.prototype.superclass = Lrn.Application.prototype;

/**
 * --- PROFILE INITIALIZATION ---
 * This method redefines the method from Application by first
 * calling that method, then doing some extra Profile specific
 * functionality.
 */
Lrn.Application.Profile.prototype.init = function(){
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
    
    // to start, we only need to add event handlers
    // to the various controls on the profile page.
    this.initEvents();

    // call our nav loc functin to let the user
    // know where they are.
    this.initProfileLoc();
    
    $('#editCancelBtn').on('click', function(){
		location.reload();
	}); 
};
/**
 * --- INIT EVENTS ---
 * This is a sort of broad-spectrum method
 * used to attach event handlers to various
 * controls on the profile page (ex: change password,
 * change language, etc).
 */
Lrn.Application.Profile.prototype.initEvents = function() {
	// create var for 'this' for differently scoped methods
	var profileMgr = this;
	var stateObj = this.siteState;
        popJson.closeText = Lrn.Applications.Profile.siteLabels.close;
	// -- Refresh via Footer
	$('#footerRefreshData').css('display', 'none');

	function validateForm(form, buttonId) {
		// alert("in validate edit");
		$('#editableForm').validate({
			rules : {

			},
			showErrors : function(errorMap, errorList) {
				this.defaultShowErrors();
			}

		});
		
		var form = form.serializeArray();
		$('#editableForm').validate().form();
		var errCheck = false;
		var j = 0;
		
		$('.editableFieldsVal').each(function() {
			var fieldObj = $(this);
			var i = $(this).attr('data-id');
			var id = 'editablefield_' + i;

			if ($('#' + id).prop('tagName') == 'INPUT' || $('#' + id).prop('tagName') == 'SELECT') {
				var error = '';
				if (fieldObj.val() == '' && regexArray[i].required == 1) {
					error = '<label for="'
							+ id
							+ '" generated="true" tabindex="0" class="error" style="color:red">'
							+ regexArray[i].requiredmsg + '</label>';
					fieldObj.addClass('errorField');
                                        fieldObj.attr('aria-invalid',true);
				} else {
					if ($('#' + id).prop('tagName') == 'INPUT'){
						var regexp = regexArray[i].exp;
						var re = new RegExp(regexp);
						var match = re.test(fieldObj.val());
						if(!match) {
							if(fieldObj.val() != '') {
								error = '<label for="' + id
										+ '" generated="true" tabindex="0" class="error" style="color:red">'
										+ regexArray[i].msg + '</label>';							
								fieldObj.addClass('errorField');
                                                                fieldObj.attr('aria-invalid',true);
							}
						}
					}
				}
				if (error != '') {
					errCheck = true;
					var elem = '#fieldRow' + i;
					$(elem).prepend($(error));
				}                       
			}
		});
		
		if(errCheck) {
			//stateObj.open('error', Lrn.Applications.Profile.siteLabels.ChangesNotSavedError);
                        alertDialogBox('error',Lrn.Applications.Profile.siteLabels.ChangesNotSavedError,popJson);
                        //stateObj.close(10);
			return false;
		}
		
		return true;
	}

	//enable submit for all editable fields
	$('.fieldFormSubmit').on('click', function(e) {
		e.preventDefault();
		$('.error').remove();

                alertSaveBox(Lrn.Applications.Profile.siteLabels.Saving);
		var form = $(this).parents('form');
		if (validateForm(form, this.id)) {
			$.ajax({
				type : form.attr('method'),
				url : form.attr('action'),
				data : form.serialize(),
				dataType : 'json',
				success : function(response) {
					var error =  response.error;
					if(error == null){ 
                                                
                                                 setSiteLabelByLangId();
	    			} else {
                                        alertDialogBox('error',Lrn.Applications.Profile.siteLabels.ChangesNotSavedError,popJson);
	    			}
				},
	            error: function(errorObj){
	            	//alert(errorObj.error.message);
	            	//do something with this
	            }
			});
		}
	});
	
	function validatePasswdForm(form, buttonId) {
		
		$('#changePassForm').validate({
			rules : {

			},
			showErrors : function(errorMap, errorList) {
				this.defaultShowErrors();
			}

		});
		
		var form = form.serializeArray();
		$('#changePassForm').validate().form();
		
		var errCheck = false;
		var error = '';
		var fieldCurPasObj = $('#currentPass');
		var fieldNewPasObj = $('#newPass');
		var fieldConfirmPasObj = $('#confirmPass');		
		fieldCurPasObj.removeClass('errorField');
		fieldNewPasObj.removeClass('errorField');
		fieldConfirmPasObj.removeClass('errorField');
		$('#changePassForm').removeClass('errorField');	
                
			// if current or new or confirm password fields are empty                        
			if ($('#currentPass').val() == '' 
							|| $('#newPass').val() == ''
								|| $('#confirmPass').val() == '')
			{
				if ($('#currentPass').val() == '') {
                                    
					if ($('#currentPass').prop('tagName') == 'INPUT') {
						error = '<label id="'
							+ "currentPassLabel"
							+ '" generated="true"  class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEA029+'</label></span>';
						errCheck = true;
						fieldCurPasObj.addClass('errorField');
                                                $('#curPasField').find('.titles').addClass('title-error'); 
                                               $('#curPasField sup').addClass('title-error');
                                                fieldCurPasObj.attr('aria-invalid',true); 
                                                 fieldCurPasObj.attr('aria-labelledby','currentPassLabel');  
						$('#curPasField').prepend($(error));
                                                
					}
				}
				if ($('#newPass').val() == '') {
					if ($('#newPass').prop('tagName') == 'INPUT') {
						
						error = '<label id="'
							+ "newPassLabel"
							+ '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEA030+'</label>';
						errCheck = true;
						fieldNewPasObj.addClass('errorField');
                                                $('#newPasField').find('.titles').addClass('title-error');
                                                $('#newPasField sup').addClass('title-error');
                                                fieldNewPasObj.attr('aria-invalid',true);
                                                fieldNewPasObj.attr('aria-labelledby','newPassLabel'); 
						$('#newPasField').prepend($(error));
					}
				}
				if ($('#confirmPass').val() == '') {
					if ($('#confirmPass').prop('tagName') == 'INPUT') {
						
						error = '<label id="'
							+ "confirmPassLabel"
							+ '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEA031+'</label>';
						errCheck = true;
						fieldConfirmPasObj.addClass('errorField');
                                                $('#confirmPasField').find('.titles').addClass('title-error');
                                                $('#confirmPasField sup').addClass('title-error');
                                                fieldConfirmPasObj.attr('aria-invalid',true);
                                                 fieldConfirmPasObj.attr('aria-labelledby','confirmPassLabel'); 
						$('#confirmPasField').prepend($(error));
					}
				}

				// if current and new are the same
			} else if ($('#currentPass').val() == $('#newPass').val()) {
				if ($('#currentPass').prop('tagName') == 'INPUT') {
					error = '<label id="'
						+ "currentPassLabel1"
						+ '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEA032+'</label>';
					errCheck = true;
					fieldCurPasObj.addClass('errorField');
                                         $('#curPasField').find('.titles').addClass('title-error');
                                         $('#curPasField sup').addClass('title-error');
                                         fieldCurPasObj.attr('aria-invalid',true);
                                         fieldCurPasObj.attr('aria-labelledby','currentPassLabel1');
					$('#curPasField').prepend($(error));
                                        
				}
                            }

				// if new and confirm do not match
				else if ($('#newPass').val() != $('#confirmPass').val()) {
					if ($('#confirmPass').prop('tagName') == 'INPUT') {
						error = '<label id="'
							+ "confirmPassLabel1"
							+ '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteLabels.ConfPassMismatch+'</label>';
						errCheck = true;
						fieldConfirmPasObj.addClass('errorField');						
						$('#confirmPasField').find('.titles').addClass('title-error');
                                                $('#confirmPasField sup').addClass('title-error');
                                                fieldConfirmPasObj.attr('aria-invalid',true); 
                                                 fieldConfirmPasObj.attr('aria-labelledby','confirmPassLabel1');
						$('#confirmPasField').prepend($(error));
					}
				}
				else if ($('#newPass').val().length < pwdminlength) {
                                        // alert("Please fill in the empty password fields.");
                                        if ($('#newPass').prop('tagName') == 'INPUT') {

                                                error = '<label id="'
                                                        + "newPassLabel1"
                                                        + '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEA048+'</label>';
                                                errCheck = true;
                                                fieldNewPasObj.addClass('errorField');
                                                $('#newPasField').find('.titles').addClass('title-error');
                                                $('#newPasField sup').addClass('title-error');
                                                fieldNewPasObj.attr('aria-invalid',true); 
                                                 fieldNewPasObj.attr('aria-labelledby','newPassLabel1');
                                                $('#newPasField').prepend($(error));
                                        }
                                }	
				else if ($('#newPass').val().length > pwdlength) {
					// alert("Please fill in the empty password fields.");
					if ($('#newPass').prop('tagName') == 'INPUT') {
						
						error = '<label id="'
							+ "newPassLabel2"
							+ '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEA024+'</label>';
						errCheck = true;
						fieldNewPasObj.addClass('errorField');
                                                $('#newPasField').find('.titles').addClass('title-error');
                                                $('#newPasField sup').addClass('title-error');
                                                fieldNewPasObj.attr('aria-invalid',true); 
                                                fieldNewPasObj.attr('aria-labelledby','newPassLabel2');
						$('#newPasField').prepend($(error));
					}
				} else {
					var regexp = pwdregex;
					var re = new RegExp(regexp);
					var match = re.test($('#newPass').val());
					if(!match) {
						if($('#newPass').val != '') {
							error = '<label id="'
								+ "newPassLabel3"
								+ '" generated="true" class="error" style="color:red">'+Lrn.Applications.Profile.siteErrors.CEF004+'</label>';
							errCheck = true;
							fieldNewPasObj.addClass('errorField');
                                                        $('#newPasField').find('.titles').addClass('title-error');
                                                        $('#newPasField sup').addClass('title-error');
                                                        fieldNewPasObj.attr('aria-invalid',true); 
                                                        fieldNewPasObj.attr('aria-labelledby','newPassLabel3'); 
							$('#newPasField').prepend($(error));
						} 
					} 
				}

			if(errCheck) {
				//stateObj.open('error', Lrn.Applications.Profile.siteLabels.ChangesNotSavedError);
                                alertDialogBox('error',Lrn.Applications.Profile.siteLabels.ChangesNotSavedError,popJson);
				//stateObj.close(7000);
    			return false;
			}
			return true;                        
	}
      
	//change password submit
	$('.changePassFormSubmit').on('click', function(e) {   
		e.preventDefault();
		//stateObj.open('loading', Lrn.Applications.Profile.siteLabels.Saving);
                alertSaveBox(Lrn.Applications.Profile.siteLabels.Saving);
                 
		
    	var form = $(this).parents('form');
		if (validatePasswdForm(form, this.id)) {
			$.ajax({
				data : form.serialize(),
				dataType : 'json',
				type: 'post',
				url : '/profile/updatepassword',
				success : function(response) {
					var error = response.error;
					if (error == null) {
						// alert('sucess');
						
						$("#changePassForm")[0].reset();
						
						//stateObj.open('done', Lrn.Applications.Profile.siteLabels.PasswordSuccessfullyChanged);
                                                alertDialogBox('done',Lrn.Applications.Profile.siteLabels.PasswordSuccessfullyChanged,popJson)
						//stateObj.close(3000);
	        			
	    			} else {
	    				var errorCode = error.catalystErrCd;	    				
	    				var errorMsg = siteErrors[errorCode];
	    				error = '<label id="'
							+ "currentPassLabel3"+
                                                        '"generated="true"  class="error" style="color:red">' + errorMsg + '</label>';
					//errCheck = true;
                                                
                                                $('#currentPass').addClass('errorField');
                                                $('#currentPass').attr('aria-invalid',true);
                                                $('#curPasField').find('.titles').addClass('title-error');                                            
                                                $('#curPasField sup').addClass('title-error');
                                                $('#currentPass').attr('aria-labelledby','currentPassLabel3'); 
						$('#curPasField').prepend($(error));
						
						
                                                alertDialogBox('error',Lrn.Applications.Profile.siteLabels.ChangesNotSavedError,popJson)
						//stateObj.close(7000);
                                               
	    			}
					
					//reinitiate the placeholder for IE
				    if(!Modernizr.input.placeholder){
					    $('input').each(function(){
					      	if($(this).attr('placeholder')!=''){
					        	$(this).placeholder();
					      	}
					    });
					}
				},
	            error: function(errorObj){//console.log('Error');
	            	//console.log(errorObj);
	            	// alert(errorObj.error.message);
	            	//do something with this
	            }
			});
					
		} 
			
	});
		

	function validateQueueForm(form, buttonId) {
		// alert('here in queue');

		$('#myqueueLayoutForm').validate({
			rules : {

			},
			showErrors : function(errorMap, errorList) {
				this.defaultShowErrors();
			}

		});
		
		$('.error').remove(); 
		
		$('#layout2').removeClass('errorField');
		
		var form = form.serializeArray();
		// $('#myqueueLayoutForm').validate().form();
		var errCheck = false;

		var error = '';
		
		var layout = $("input[@name=layout]:checked").val();

		 
		// alert(layout);
		
		if (layout != "imgView" && layout != "listView"){
			// alert('here');
			error = '<label for="'
				+ "#layout2"
				+ '" generated="true" class="error" style="color:red">Please select one option.' + '</label>';
			errCheck = true;
			$('#layout2').addClass('errorField');
			$('#myqueueLayoutSection').append($(error));

		}
		if(errCheck) {
			stateObj.open('error', Lrn.Applications.Profile.siteLabels.ChangesNotSavedError);
			stateObj.close(7000);
			return false;
		}

		return true;

	}

	$('.layoutFormSubmit').on('click', function(e) {
		
		e.preventDefault();
		stateObj.open('loading', Lrn.Applications.Profile.siteLabels.Saving);
			
//	        alert(layout_id);
			var form = $(this).parents('form');
			// alert(this.id);
			if (validateQueueForm(form, this.id)) {
				$.ajax({
					type : form.attr('method'),
					url : form.attr('action'),
					data : form.serialize(),
					dataType : 'json',
					success : function(response) {
						//console.log(response);
						if(response != '') {   
							var error =  response.error;
			    			//var success = response[0].success;
			    			if(error == null){
			    				if(response.dataObject.userSettingsList.UserSettingDTO.id){
			    					$('#layout_id').val(response.dataObject.userSettingsList.UserSettingDTO.id);
			    					stateObj.open('done', Lrn.Applications.Profile.siteLabels.SuccessSaved);
			    					stateObj.close(3000);
			    				}
			    				
			    			} else {
			    				alert('An error occurred');
			    			}
						}
					}
				});
	        }
		
	
	});
	
	//Password placehoder attribute polyfill for browsers not supporting placeholder attribute	
	if(!Modernizr.input.placeholder){

		$('#changePassForm').find('input[type=password][placeholder]').each(function (index, current) {
			var $current = $(current),
			$dummy = $('<input>').attr({
				type: 'text',
				name: 'dummy_'+$current.attr('name'),
				value: $current.attr('placeholder')
			}).css({width : '50%'});

			$dummy.insertBefore($current);
			$current.hide();

			$dummy.focusin(function () {
				$(this).hide();
				$(this).next().show().focus();
			});

			$current.blur(function () {
				if ($(this).val() == '') {
					$(this).hide();
					$(this).prev().show();
				}
			});
		});
	}
};
/* --- INIT NAV LOCATION ---
 * We want our subnav on this page to show where
 * the user is. So we have a function that lets us
 * change the color of the link to reflect where
 * the user currently is.
 */
Lrn.Application.Profile.prototype.initProfileLoc = function(){
    var path = window.location.pathname.split('/');
    if(!path[2]) {
    	$('span.' + path[1]).addClass('activeSubnav');
    } else {
    	$('span.' + path[2]).addClass('activeSubnav');
    }
};
function setSiteLabelByLangId(){
   
     $.ajax({
        type: 'GET',
        url: '/index/getcurrenttranslation',
        dataType: 'json',
        success: function (response) {
            popJson.closeText = response.close;
            if (response != '') {
                alertDialogBox('done',response.SuccessSaved,popJson);
            } 
        }
    });
  
}