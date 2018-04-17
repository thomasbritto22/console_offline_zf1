if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

/**
 * --- AUTHORIZATION ---
 * This class is responsible for handling
 * everything about the authorization process.
 * Including login, forgot password, remember
 * settings, branding and messaging, slideshow and video tour.
 */
Lrn.Application.Auth = function(formType){
    this.formType = formType || 'login';
    // this.initCarousel();
    
    this.config = {
        siteLabels: {},
        siteErrors: {}
    };
};

/**
 * --- AUTH PROTOTYPE ---
 * We want to make Auth a subclass of Application so
 * we will set the Auth.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Auth.prototype = new Lrn.Application();
Lrn.Application.Auth.prototype.superclass = Lrn.Application.prototype;

/**
 * --- AUTH INITIALIZATION ---
 * This method redefines the method from Application by first
 * calling that method, then doing some extra Auth specific
 * functionality.
 */
Lrn.Application.Auth.prototype.init = function(config){
    // first run the init for Lrn.Application. we wan
    this.superclass.init.apply(this);
    
    // if any config values are passed in, override defaults
    if(config) for(var c in config) this.config[c] = config[c] || null;
    
    // the auth page can be used for multiple
    // types of authentication pages. Depending
    // on what type of form we want, we need to
    // init different functionality.
    
    // default form to use
    if(this.formType == 'login'){
        this.initLogin();
    }
    
    // the forgot password form needs to init the
    // form and handlers for buttons as well
    if(this.formType == 'forgotpassword'){
        this.initForgotPassword();
    }
    
    // if users have used the forgot password feature
    // and are returning to change their password
    if(this.formType == 'changepassword'){
        this.initChangePassword();
    }
    
    // some users are required to reset their
    // password when they first log in.
    if(this.formType == 'resetpassword'){
        this.initResetPassword();
    }
    
    // make sure that our messages area is ready
    this.initMessageArea();
    
    // initialize language selection
    this.initLanguageSelection();

    // fix the height of background images container so that it
    // goes the full height of its parent
    this.initBgHeight();

    // if the user has not typed anything into the 
    // username/password field then the login button
    // will not be active
    // please note, that IE11 now returns undefined again for window.chrome
    var isChromium = window.chrome,
        vendorName = window.navigator.vendor;
    if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
        // is Google chrome 
        setTimeout(function(){
            switch (this.formType) {
                case 'login':
                    this.initLoginBtn();
                    break;
                case 'forgotpassword':
                    this.initForgotBtn();
                    break;
                case 'changepassword':
                    this.initChangeBtn();
                    break;
            };    
        }.bind(this), 1000);
    } else { 
       // not Google chrome 
       switch (this.formType) {
            case 'login':
                this.initLoginBtn();
                break;
            case 'forgotpassword':
                this.initForgotBtn();
                break;
            case 'changepassword':
                this.initChangeBtn();
                break;
        };
    }

    initPlaceholderText();
    
    //if the user has not typed anything into resigtration
    // field the continue button will be disabled
    if(this.formType == 'selfregistration'){
    	this.initRegVerifyPassword();
    }

    // initialize the background left align image
    this.initBgLeftAlignImage();

    $(window).on('orientationchange', function() {
        // store the bg-repeat property so we can check against it
        var repeat = $('#bgLeftAlign').css('background-repeat');

        // store the image source
        var image = $('#bgLeftAlign').css('background-image');
        
        // split the url so that all we have is the actual path to the image
        var imageUrlArray = image.split('"');

        // if image is not repeating then add bg-size property as well as
        // a filter for IE8
        if(repeat == 'no-repeat') {
            $('#bgLeftAlign').css({'background-size': 'cover', 'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imageUrlArray[1] + '", sizingMethod="scale")', '-ms-filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imageUrlArray[1] + '", sizingMethod="scale")'});
        } else {
            $('#bgLeftAlign').css({'background-size': 'cover'});
        }
    });
};

/**
 * --- INIT BACKGROUND CONTAINER HEIGHT ---
 * Sets the height of bgLeftAlign to whatever the 
 * contentWrapper or rightColumn height is.
 */

Lrn.Application.Auth.prototype.initBgHeight = function(){
    
    // store the height of the right column 
    var rightColumn = $('#rightColumn').height();
    // store the height of the content wrapper
    var wrapperHeight = $('#contentWrapper').outerHeight();

    // there is a 40px difference because of the padding that
    // right side has so we want to add 40 to make it even
    var totalHeight = rightColumn + 40;
    
    // check to see if the content wrapper height is larger than
    // the right column
    if(totalHeight < wrapperHeight) {
        // assign the content wrapper height to left aligned image
        // if the right column is shorter than the content wrapper
        $('#bgLeftAlign').css({'height': + wrapperHeight  + 'px'});
    } else {
        // assign the right column height if it is taller than
        // the content wrapper
        $('#bgLeftAlign').css({'height': + totalHeight  + 'px'});
    }
};
/**
 * --- SET THE BACKGROUND-SIZE PROPERTY FOR OUR LEFT ALIGNED IMAGE ---
 * This function will check the bg left aligned image to see if it is
 * repeating.  If it's not then we want it to be the full height of
 * it's container so we want to add the background-size property.
 */
Lrn.Application.Auth.prototype.initBgLeftAlignImage = function() {
    
    // store the bg-repeat property so we can check against it
    var repeat = $('#bgLeftAlign').css('background-repeat');

    // store the image source
    var image = $('#bgLeftAlign').css('background-image');
    
    // split the url so that all we have is the actual path to the image
    var imageUrlArray = image.split('"');

    // if image is not repeating then add bg-size property as well as
    // a filter for IE8
    if(repeat == 'no-repeat') {
        $('#bgLeftAlign').css({'background-size': 'cover', 'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imageUrlArray[1] + '", sizingMethod="scale")', '-ms-filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + imageUrlArray[1] + '", sizingMethod="scale")'});
    } else {
        $('#bgLeftAlign').css({'background-size': 'cover'});
    }
},

/**
 * --- INIT LOGIN FORM ---
 * Sets up the event handlers for login form elements.
 */
Lrn.Application.Auth.prototype.initLogin = function(){
    var that = this;

    // initialize the sign in button on the welcome page
    // this.initLoginBtn();
    
    // assign the user name input field focus
    // $('#username').focus();

    // handler for login submit button
    $('#authSubmit').on('click', function(e){
    
        var errorMsg = $('form > fieldset > p:first');
        // hide the message area for now. Assume the user
        // has just corrected/has no errors.
        errorMsg.hide();

        var username = $('#username').val();
        var password = $('#password').val();
        
        if(username == '' || password == ''){
            errorMsg.html(that.config.siteLabels['BlankLoginSubmit']);
            errorMsg.show();
            errorMsg.addClass('errorMessage');
            //alert('Please enter both your User Name and Password.');
            $('#username').addClass('errorField');
            $('#password').addClass('errorField');
            e.preventDefault();
        }
    });

    $('.tooltipster').tooltipster({
		theme: 'tooltipster-light',
		position: 'top',
		positionTracker: true,
		contentAsHTML: true,
		interactive: true
	});
};

/**
 * --- INIT FORGOT PASSWORD FORM ---
 * Sets up event handlers for forgot password form.
 */
Lrn.Application.Auth.prototype.initForgotPassword = function(){
    var that = this;

    // assign the user name input field focus
    // $('#authSubmit').addClass('customDisabledBtn').attr('disabled', 'disabled');

    $('#authSubmit').on('click', function(e){
        
    	var errorMsg = $('form > fieldset > p.messageField');
        // hide the message area for now. Assume the user
        // has just corrected/has no errors.
        errorMsg.hide();
        
        var username = escape($('#username').val());
        var email = escape($('#email').val());
        var atpos = email.indexOf('@');
        var dotpos = email.lastIndexOf('.');

        
        // use AND because only one is required
        if(username == '' && email == ''){
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteLabels['BlankForgotSubmit']);
            errorMsg.addClass('errorMessage red');
            errorMsg.show();
            $('#username').addClass('errorField');
            $('#email').addClass('errorField');
            e.preventDefault();
        } 
        // check to see if the email field has the @ and .
        else if (username == '' && atpos < 1 || username == '' && dotpos < atpos + 2 || username == '' && dotpos + 2 >= email.length){
        	errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CEA010']);
            errorMsg.addClass('errorMessage red');
        	errorMsg.show();
        	$('#username').removeClass('errorField');
        	$('#email').addClass('errorField');
        	e.preventDefault();
        }
    });
};

/**
 * --- INIT CHANGE PASSWORD ---
 * Attaches event handlers to change password form elements
 */
Lrn.Application.Auth.prototype.initChangePassword = function() {
    var that = this;

    // assign the user name input field focus
    // $('#username').focus();

    $('#authSubmit').on('click', function(e){
        
    	var errorMsg = $('form > fieldset > p.messageField');
        // hide the message area for now. Assume the user
        // has just corrected/has no errors.
        errorMsg.hide();
        
        var username = escape($('#username').val());
        var newPass = escape($('#newPassword').val());
        var confirmPass = escape($('#rePassword').val());
        if(username == '' || newPass == '' || confirmPass == ''){
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CES001']);
            errorMsg.addClass('errorMessage red');
            errorMsg.show();
            e.preventDefault();
        } else if(newPass != confirmPass){
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteLabels['ConfPassMismatch']);
            errorMsg.addClass('errorMessage red');
            errorMsg.show();
            e.preventDefault();
        	$('#newPassword').addClass('errorField');
			$('#rePassword').addClass('errorField');
	}else if ($('#newPassword').val().length < pwdminlength) {
                        errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CEA048']);
            errorMsg.addClass('errorMessage red');
                        errorMsg.show();
                        e.preventDefault();
                        $('#newPassword').addClass('errorField');
        }else if ($('#newPassword').val().length > pwdlength) {
			errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CEA024']);
            errorMsg.addClass('errorMessage red');
			errorMsg.show();
			e.preventDefault();
			$('#newPassword').addClass('errorField');
	} else {
			var regexp = pwdregex;
			var re = new RegExp(regexp);
			var match = re.test($('#newPassword').val());
			if (!match) {
				if ($('#newPassword').val() != '') {
					errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CEA025']);
            errorMsg.addClass('errorMessage red');
					errorMsg.show();
					e.preventDefault();
					$('#newPassword').addClass('errorField');
				}
			}
		}
    });
};

/**
 * --- INIT RESET PASSWORD ---
 * Attaches event handlers to reset password form elements.
 */
Lrn.Application.Auth.prototype.initResetPassword = function() {
    var that = this;

    // assign the old pass input field focus
    // $('#oldPass').focus();
    
    $('#resetPassSubmit').on('click', function(e){
        
        // hide the message area for now. Assume the user
        // has just corrected/has no errors.
        //errorMsg.hide();
    	
        var errorMsg = $('form > fieldset > p.messageField');
        var errorMsgIcon = $('form > fieldset > p.messageField > i');
        var oldPass = escape($('#oldPass').val());
        var newPass = escape($('#newPass').val());
        var confirmPass = escape($('#confirmPass').val());
       
        errorMsg.hide();
       // alert(newPass.length);
        
        if(oldPass == '' || newPass == '' || confirmPass == ''){
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CES001']);
            errorMsg.addClass('errorMessage red');
            errorMsg.show();
            e.preventDefault();
        }
        else if(oldPass == newPass){
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
        	errorMsg.append(that.config.siteLabels['CannotUseSamePass']);
            errorMsg.addClass('errorMessage red');
        	errorMsg.show();
            e.preventDefault();
        }
        else if(newPass != confirmPass){
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
        	errorMsg.append(that.config.siteLabels['ConfPassMismatch']);
            errorMsg.addClass('errorMessage red');
        	errorMsg.show();
            e.preventDefault();
            $('#newPass').addClass('errorField');
			$('#confirmPass').addClass('errorField');
	}else if ($('#newPass').val().length < pwdminlength) {
                        errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
            errorMsg.append(that.config.siteErrors['CEA048']);
            errorMsg.addClass('errorMessage red');
                        errorMsg.show();
                        e.preventDefault();
                        $('#newPass').addClass('errorField');
        } else if ($('#newPass').val().length > pwdlength) {
            errorMsg.html('');
            errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
			errorMsg.append(that.config.siteErrors['CEA024']);
            errorMsg.addClass('errorMessage red');
			errorMsg.show();
			e.preventDefault();
			$('#newPass').addClass('errorField');
		} else {
			var regexp = pwdregex;
			var re = new RegExp(regexp);
			var match = re.test($('#newPass').val());
			if (!match) {
				if ($('#newPass').val() != '') {
                    errorMsg.html('');
                    errorMsg.html('<i class="fa fa-exclamation-triangle"></i>');
					errorMsg.append(that.config.siteErrors['CEA025']);
                    errorMsg.addClass('errorMessage red');
					errorMsg.show();
					e.preventDefault();
					$('#newPass').addClass('errorField');
				}
			} 
		}
    });
};


/**
 * --- INIT SELF REGISTRATION PASSWORD ---
 * Attaches event handlers to verify regirataion site password 
 */
Lrn.Application.Auth.prototype.initRegVerifyPassword = function() {
	var that = this;
	var submitBtn = $('#regSubmit');
	$('#regCancelBtn').on('click', function(e){
		e.preventDefault();
		window.location.href='/auth/login';
	});
	
	//disable continue button if password textbox is empty
    if($('#regPassword').val() == '' && $('#regPassword').val() == ''){
        submitBtn.attr('disabled', 'disabled');
        submitBtn.addClass('customDisabledBtn');
        submitBtn.removeClass('customButton');
    }
    $('#regPassword').bind('keyup click mousedown paste', this.checkPassword);	
    $('#regPassword').bind('blur', that, function(e){
    	var target = "regPassword";
    	var elem = '#msgReg';
    	$(elem).find('.errorMessage').remove();
    	// that.validatePassword(target);
    });	
    submitBtn.bind('click', that, function(e){
    	e.preventDefault();
    	e.stopPropagation();
    	e.stopImmediatePropagation();
    	var target = "submitBtn";
    	that.validatePassword(target);
    });	
    $('#regPassword').keypress(function(e) {
        if(e.which == 13) {
        	e.preventDefault();
        	e.stopPropagation();
        	e.stopImmediatePropagation();            
            $('#regSubmit').trigger('click');
        }
    });
};

Lrn.Application.Auth.prototype.validatePassword = function(target){
	var response = $('#regPassword').val();
	var data = 'regPassword='+ response;
	var invalidLabel = this.config.siteLabels['Invalidpassword'];
	$.ajax({
		type : 'post',
		url : '/auth/doselfreglogin',
		data : data,
		dataType : 'json',
		success : function(response) {
			var elem = '#msgReg';			
			if(response.error == true){
				var error = '<p class="errorMessage" style="display: block;"><i class="fa fa-exclamation-triangle red"></i><i class="material-icons">&#xE002;</i>'+invalidLabel+'</p>';	
				$(elem).find('.errorMessage').remove();
				$(elem).append($(error));
				$('#regSubmit').addClass('customDisabledBtn').attr('disabled','disabled');
                $('#regSubmit').removeClass('customButton');
                $('#msgReg').show();
			} else{				
				$(elem).find('.errorMessage').remove();
				$('#regSubmit').removeClass('customDisabledBtn').removeAttr('disabled');	
                $('#regSubmit').addClass('customButton');
                $('#msgReg').hide();
				if(target == 'submitBtn')
					window.location.href='/auth/selfregistration';
			}
			
		},
        error: function(errorObj){
        	var response = {error:true};
        	return response;
        }
	});
}

Lrn.Application.Auth.prototype.emptyPassword = function(e){
	e.preventDefault();
	$('#regPassword').val('');
	// $('#regPassword').focus();
	this.checkPassword();
}

Lrn.Application.Auth.prototype.checkPassword = function(e){
	var submitBtn = $('#regSubmit');
	//disable continue button if password textbox is empty
	if ($('#regPassword').val() != '' || $('#regPassword').val() != '') {
         submitBtn.removeAttr('disabled');
         submitBtn.removeClass('customDisabledBtn');
         submitBtn.addClass('customButton');
     } else {
         submitBtn.attr('disabled', 'disabled');
         submitBtn.addClass('customDisabledBtn');
         submitBtn.removeClass('customButton');
     };
}

/**
 * --- INIT MESSAGE AREA ---
 * Just a quick method to either show or hide the message box
 * depending on if there is a message inside.
 */
Lrn.Application.Auth.prototype.initMessageArea = function(){
	var errorMsg = $('form > fieldset > p:first');
    var msgContent = errorMsg.length > 0 ? errorMsg.html().replace(/<i[^>]+><\/i>/,'').replace(/[\s]+/,'') : '';

    if(msgContent != '') {
        errorMsg.show();    
    } else {
        errorMsg.hide();
    }
};

/**
 * --- INIT LANGUAGE SELECTION ---
 * Basically applies our dropdown plugin to
 * the language selection dropdown. This is mostly
 * because our language selection was designed with
 * the little flags next to the language.
 * XXX disabled for now because IE is not playing nicely
 * with our layout AND the dropdown. Layout is more important.
 */
Lrn.Application.Auth.prototype.initLanguageSelection = function(){
	var that = this;
    var stateObj = this.siteState;
	var loading = 'Loading';
	if(that.config.siteLabels.Loading != undefined)
		loading = that.config.siteLabels.Loading;
    // init the language selection
    $('#languageSelect').change(function(){
                //get user selected language
                
                var chosenLang = $('#languageSelect option:selected').val();
                var data = 'lang='+chosenLang; 
                //update session data according to users selected language
                $.ajax({
                    type: 'post',
                    url: '/auth/updatedata',
                    data: data,
                    dataType: 'json',
                    success: function(response){
                        if(response.change == 'Yes'){
                            // location.reload();
                            stateObj.open('loading', loading);
                            stateObj.close(4000);
                            setTimeout(function(){
                                location.reload();
                            }, 3000);
                        }
                        else
                            // $("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="/images/backgrounds/done.jpg"  width=50 height=50/></span>Done</p>');
                            stateObj.open('done', 'Done');
                            stateObj.close(7000);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        //do something with this
                    }
                });
            });
};

/**
 * --- INIT LOGIN BUTTON ---
 * If there is no value in either the username
 * or password field, the login button will
 * be disabled.
 * BUG-34060 fix
 */
Lrn.Application.Auth.prototype.initLoginBtn = function(){
    var submitBtn = $('#authSubmit');
    var THIS = this;
    $('#username').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') && !THIS.checkIfInputFieldIsBlank('password')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    $('#password').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') && !THIS.checkIfInputFieldIsBlank('password')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    
    if($('#username').val() == '' && $('#password').val() == ''){
        submitBtn.attr('disabled', 'disabled');
        submitBtn.addClass('customDisabledBtn');
    }
};

/**
 * --- INIT FORGOT BUTTON ---
 * If there is no value in either the username
 * or email field, the reset my password button will
 * be disabled.
 * BUG-34060 fix
 */
Lrn.Application.Auth.prototype.initForgotBtn = function(){
    var submitBtn = $('#authSubmit');
    var THIS = this;
    $('#username').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') || !THIS.checkIfInputFieldIsBlank('email')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    
    $('#email').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') || !THIS.checkIfInputFieldIsBlank('email')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    
    if($('#username').val() == '' && $('#email').val() == ''){
        submitBtn.attr('disabled', 'disabled');
        submitBtn.addClass('customDisabledBtn');
    }
};

/**
 * --- INIT CHANGE BUTTON ---
 * If there is no value in either the username, new password
 * or resumit password field, the change password button will
 * be disabled.
 * BUG-34060 fix
 */
Lrn.Application.Auth.prototype.initChangeBtn = function(){
    var submitBtn = $('#authSubmit');
    var THIS = this;
    $('#username').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') && !THIS.checkIfInputFieldIsBlank('newPassword') && !THIS.checkIfInputFieldIsBlank('rePassword')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    
    $('#newPassword').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') && !THIS.checkIfInputFieldIsBlank('newPassword') && !THIS.checkIfInputFieldIsBlank('rePassword')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    
    $('#rePassword').bind('keyup click mousedown paste input propertychange change drop',function(){
        if (!THIS.checkIfInputFieldIsBlank('username') && !THIS.checkIfInputFieldIsBlank('newPassword') && !THIS.checkIfInputFieldIsBlank('rePassword')) {
            submitBtn.removeAttr('disabled');
            submitBtn.removeClass('customDisabledBtn');
            submitBtn.addClass('customButton');
        } else {
            submitBtn.attr('disabled', 'disabled');
            submitBtn.addClass('customDisabledBtn');
        };
    });
    
    if($('#username').val() == '' && $('#newPassword').val() == '' && $('#rePassword').val() == ''){
        submitBtn.attr('disabled', 'disabled');
        submitBtn.addClass('customDisabledBtn');
    }
};

/*
 * Production Issue change - BUG-34060
 */
Lrn.Application.Auth.prototype.checkIfInputFieldIsBlank = function(strField){
    if ($('#'+strField).val() == '' || $('#'+strField).val() == $('#'+strField).attr('placeholder')) return true;
};