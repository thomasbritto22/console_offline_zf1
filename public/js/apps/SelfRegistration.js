if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

Lrn.Application.SelfRegistration = function(){	
	this.config = {
	        siteLabels: {},
	        siteErrors: {},
	        siteInstructions : {},
	        regexArr: {}
	    };
};
/**
 * --- Self registration PROTOTYPE ---
 * We want to make Auth a subclass of Application so
 * we will set the Auth.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.SelfRegistration.prototype = new Lrn.Application();
Lrn.Application.SelfRegistration.prototype.superclass = Lrn.Application.prototype;

Lrn.Application.SelfRegistration.prototype.init = function(config){
	// first run the init for Lrn.Application. we wan
    this.superclass.init.apply(this);
    
    if(config) for(var c in config) this.config[c] = config[c] || null;
    
    this.setDatepicker();
    this.initTooltipster();
    
  	//initial the cancel button
	$('#cancelSelfRegist').click({regObj:this}, function(e){
		e.preventDefault();
		window.location.href='/auth/login';
	});
	
	//initial the save button
	$('#saveSelfRegist').click({regObj:this}, function(e){
		e.preventDefault();
		var form = $(e.target || e.srcElement).parents('form');
		var savingMsg = e.data.regObj.config.siteLabels.Saving;	
		
		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif" alt="'+savingMsg+'" width=50 height=50/></span>'+savingMsg+'</p>');
		$("#messageModal").dialog({
			   resizable: false,
			   minHeight:150,
			   width:150,
			   closeOnEscape: false,
			   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();}
			});
		$("#messageModal").removeClass('hidden');
		var field = '';
		var pageErrorsMsg = e.data.regObj.config.siteLabels.PageErrors;
		if(e.data.regObj.validateField(field)){
			//Check captcha only if it is on
			if($('#recaptcha_response_field').length){
				if($('#recaptcha_response_field').val() == ''){				
					e.data.regObj.emptyCaptcha('submit');
				} else{
					if($('#validateCap').val() == 'No'){					
						$('#saveSelfRegist').addClass('disabledBtn')
						.attr('disabled','disabled');
						e.data.regObj.saveUpdates(form);
					} else {
						$('#activeSubmit').val('Yes');
					}
				}
			} else{
				$('#saveSelfRegist').addClass('disabledBtn')
				.attr('disabled','disabled');
				e.data.regObj.saveUpdates(form);
			}
		} else {
			$("#messageModal").html('<p class="messageModalText"><i class="fa fa-times"></i>'+ pageErrorsMsg +'</p>');
			setTimeout(function(){
        		$("#messageModal").dialog("close");
        	}, 1000);
		}
			
	});
    
	$('.formField').on('focus blur',{regObj:this}, function(e){
		e.preventDefault();
		var field = $(e.target || e.srcElement);
		var action = e.type;
		e.data.regObj.validateField(field,action);
	});
	
	$('#recaptcha_response_field').live('blur',{regObj:this}, function(e){		
		e.preventDefault();
		var field = $('#recaptcha_response_field');
		if(field.val() == '')
			e.data.regObj.emptyCaptcha('check');
		else
			e.data.regObj.validateCaptcha();
	});
	

    
};

Lrn.Application.SelfRegistration.prototype.updateSelects = function (elemId,selectedDate)
{
	if(selectedDate != '') {
		var selectedDate = new Date(selectedDate);
		$('#'+elemId+'_d option[value=' + selectedDate.getDate() + ']').attr('selected', 'selected');
		$('#'+elemId+'_m option[value=' + (selectedDate.getMonth()+1) + ']').attr('selected', 'selected');
		$('#'+elemId+'_y option[value=' + (selectedDate.getFullYear()) + ']').attr('selected', 'selected');
	} else {
		$('#'+elemId+'_d option[value=""]').attr('selected', 'selected');
		$('#'+elemId+'_m option[value=""]').attr('selected', 'selected');
		$('#'+elemId+'_y option[value=""]').attr('selected', 'selected');
	}
};
Lrn.Application.SelfRegistration.prototype.formatDate = function (format,m,d,y)
{ 
	if(parseInt(d)<10) d = '0' + d;
	if('DD-MON-YYYY' == format || 'MON-DD-YYYY' == format)
		m = parseInt(m)- 1
	if(m<10) m = '0' + m;
	var monthNames =  ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
	var formatArr = { 'DD/MM/YYYY' : d + '/' + m + '/' + y, 'MM/DD/YYYY' : m + '/' + d + '/' + y,
			'YYYY/MM/DD' : y + '/' + m + '/' + d, 'DD-MON-YYYY' : d + '-' + monthNames[parseInt(m)] + '-' + y,
			'MON-DD-YYYY' : monthNames[parseInt(m)] + '-' + d + '-' + y };
	return formatArr[format];
};

Lrn.Application.SelfRegistration.prototype.setDatepicker = function(){
	var regObj = this;
	// listen for when the selects are changed and update the picker
	$('.d, .m, .y')
		.bind(
			'change', {regObj:this},
			function(e)
			{
				var div = $(this).closest('div[class^="dateField"]');				
				var fieldName = div.attr('data-field');				
				if($('#'+fieldName+'_y').val() !='' && $('#'+fieldName+'_m').val() != '' && $('#'+fieldName+'_d').val() != ''){
					var d = new Date(
								$('#'+fieldName+'_y').val(),
								$('#'+fieldName+'_m').val()-1,
								$('#'+fieldName+'_d').val()
							);
					var day = d.getDate();				
			        var month = d.getMonth()+1;
			        var year = d.getFullYear();
			        var frmtDate = month+'/'+day+'/'+year; //console.log('Date Select == '+month+'/'+day+'/'+year);
			        $('#'+fieldName+'_val').val(frmtDate);
			        var format = $('#'+fieldName).attr('data-format');
			        $('#'+fieldName).val(regObj.formatDate(format, month, day, year));		
			        //console.log('Value Select == '+$('#'+fieldName).val());
					var dataDiv = $('#'+fieldName+'_val').closest('div[class^="input-append"]');
					dataDiv.datepicker('update');	
				} else 
					$('#'+fieldName).val('');
			}
		);
	
	var date = new Date();
	var endDate = date.getMonth()+1+'/'+date.getDate()+'/'+date.getFullYear();
	$('.input-append.date').datepicker({
		startDate: '01/01/1900',
		//endDate: endDate,
		orientation: 'top left'
	}).on('changeDate', {regObj:this}, function (ev) {
		var elem = $(this);
		var elemId = elem.find('.date-hiddenField').attr('data-id');
		if(elem.find('.date-hiddenField').val() != ''){
			var d = new Date(elem.find('.date-hiddenField').val()); 
			var day = d.getDate();
	        var month = d.getMonth();
	        var year = d.getFullYear();
	        var format = $('#'+elemId).attr('data-format');
	        $('#'+elemId).val(regObj.formatDate(format, ++month, day, year));
	       // console.log('Value DP == '+$('#'+elemId).val());
			regObj.updateSelects(elemId,d);
		} else {
			$('#'+elemId).val('');
			regObj.updateSelects(elemId,'');
		}
	});

};


Lrn.Application.SelfRegistration.prototype.initTooltipster = function(){	
	$('.tooltipster').each(function(){
		$(this).tooltipster({
				theme: 'tooltipster-light',
				position: 'right',
				positionTracker: true,
				contentAsHTML: true,
				interactive: true,
				maxWidth: 400
			});
//		$(this).tooltipster({
//			theme: 'tooltipster-light',
//			position: 'right',
//			positionTracker: true,
//			contentAsHTML: true,
//			interactive: true,
//			trigger:'click',
//			maxWidth: 280
//		});
		$(this)
	    .focus(function(){
	        $(this).tooltipster('show');
	    })
	    .blur(function(){
	        $(this).tooltipster('hide');
	    });
	});
	
};

Lrn.Application.SelfRegistration.prototype.saveUpdates = function(form)
{
	var savedMsg = this.config.siteLabels.Saved;	
	var pageErrorsMsg = this.config.siteLabels.PageErrors;
	var userExistsMsg = this.config.siteErrors.CEA045;
	$.ajax({
		type : form.attr('method'),
		url : form.attr('action'),
		data : form.serialize(),
		dataType : 'json',
		success : function(response) {
			var error =  response.error;
			//var success = response[0].success;
			if(error == null){ 			
				$("#messageModal").html('<p class="messageModalText"><i class="fa fa-check"></i>'+ savedMsg +'</p>');
				window.location.href='/auth/newuser';
			} else {
				$("#messageModal").html('<p class="messageModalText"><i class="fa fa-times"></i>'+ pageErrorsMsg +'</p>');
    			setTimeout(function(){
            		$("#messageModal").dialog("close");
            	}, 1000);
    			if(error.catalystErrCd == 'CEA045'){
    				userExistsMsg = userExistsMsg.replace(/%SelfRegLoginName%/g, "'" + $('#Login_name').val() + "'");
    				var elem = '#GrpLogin_name';
    				var error = '<label for="Login_name" generated="true" class="error" style="color:red"><i class="fa fa-exclamation-triangle"></i><i class="material-icons">&#xE002;</i>'
    					+ userExistsMsg + '</label>';							
    					$(elem).find('.error').remove();
    					$(elem).append($(error));
    					$('#saveSelfRegist').removeClass('disabledBtn')
    					.removeAttr('disabled');
    			}
			}
		},
        error: function(errorObj){//console.log('Error');
        	alert(errorObj.error.message);
        	//do something with this
        }
	});
};

Lrn.Application.SelfRegistration.prototype.validateCaptcha = function()
{
	var regObj = this;
	var errorMsg = this.config.siteInstructions.texttypeddidntmatchtheimage;
	var pageErrorsMsg = this.config.siteLabels.PageErrors;
	var challenge = $('#recaptcha_challenge_field').val();
	var response = $('#recaptcha_response_field').val();
	var data = 'cha='+ challenge + '&res=' + response;
	var field = '';
	regObj.validateField(field);
	$.ajax({
		type : 'post',
		url : '/auth/testcaptcha',
		data : data,
		dataType : 'json',
		success : function(response) {
			var elem = '#Grprecaptcha_widget_div';			
			if(response.error == true){
				$('#validateCap').val('Yes');
				if($('#activeSubmit').val() == 'Yes'){
				$("#messageModal").html('<p class="messageModalText"><i class="fa fa-times"></i>'+ pageErrorsMsg +'</p>');
					setTimeout(function(){
						$("#messageModal").dialog("close");
					}, 1000);
				}
				var error = '<label for="recaptcha_widget_div" generated="true" class="error" style="color:red"><i class="fa fa-exclamation-triangle"></i><i class="material-icons">&#xE002;</i>'
				+ errorMsg + '</label>';							
				$(elem).find('.error').remove();
				$(elem).append($(error));
//				$('#saveSelfRegist').addClass('disabledBtn')
//				.attr('disabled','disabled');	
				$('a#recaptcha_reload_btn')[0].click();							
			} else{		
				$('#validateCap').val('No');
				$(elem).find('.error').remove();
				var form = $('#saveSelfRegist').parents('form');
				if($('#hasErrors').val() == 'No' && $('#activeSubmit').val() == 'Yes'){	
					$('#activeSubmit').val('No');
					$('#saveSelfRegist').addClass('disabledBtn')
					.attr('disabled','disabled');
					regObj.saveUpdates(form);
				}
			}
			
		},
        error: function(errorObj){
        	var response = {error:true};
        	return response;
        }
	});
};

Lrn.Application.SelfRegistration.prototype.validateField = function(field,action)
{
	var curFieldId = '';
	if(field != '')
		curFieldId = field.attr('id');
	var regexArray = this.config.regexArr;
	var hasErrors = false;
	var brkField = false;
	for(var i = 0; i< regexArray.length; i++){
		var fieldObj = $('#'+regexArray[i].columnName);
		var id = regexArray[i].columnName;
		var pwdminlength = regexArray[i].minlength;
		fieldObj.removeClass('errorField');
		if((id != curFieldId && !brkField) || (action =='blur' && id == curFieldId && !brkField)){	
			if(action =='blur' && id == curFieldId && !brkField)
				brkField = true;
			if ($('#' + id).prop('tagName') == 'INPUT' || $('#' + id).prop('tagName') == 'SELECT') {
				var error = '';
				if ($.trim(fieldObj.val()) == '' && regexArray[i].required == 1) {
					error = '<label for="'
							+ id
							+ '" generated="true" class="error" style="color:red"><i class="fa fa-exclamation-triangle"></i><i class="material-icons">&#xE002;</i>'
							+ regexArray[i].requiredmsg + '</label>';
					fieldObj.addClass('errorField');
				} else {
					if ($('#' + id).prop('tagName') == 'INPUT' && $.trim(fieldObj.val()) != ''){
						var regexp = regexArray[i].exp;
						var re = new RegExp(regexp);
						var match = re.test($.trim(fieldObj.val()));
						if(!match) {
							if(fieldObj.val() != '') {
								error = '<label for="' + id
										+ '" generated="true" class="error" style="color:red"><i class="fa fa-exclamation-triangle"></i><i class="material-icons">&#xE002;</i>'
										+ regexArray[i].msg + '</label>';							
								fieldObj.addClass('errorField');
							}
						} else {
							if(id == 'Confirmpassword'){
								var passNotMatchMsg = this.config.siteLabels.ConfPassMismatch;								
								if($('#'+id).val() != $('#Password').val()){
									error = '<label for="' + id
									+ '" generated="true" class="error" style="color:red"><i class="fa fa-exclamation-triangle"></i><i class="material-icons">&#xE002;</i>'
									+ passNotMatchMsg + '</label>';							
									fieldObj.addClass('errorField');
								}else if ($('#'+id).val().length < pwdminlength){
                                                                        error = '<label for="' + id
                                                                        + '" generated="true" class="error" style="color:red"><i class="fa fa-exclamation-triangle"></i><i class="material-icons">&#xE002;</i>'
                                                                        + this.config.siteErrors.CEA048 + '</label>';
                                                                        fieldObj.addClass('errorField');
                                                                }

									
							}
						}
					}
				}
				var elem = '#Grp' + id;			
				$(elem).find('.error').remove();
				if (error != '') {
					$(elem).append($(error));
					hasErrors = true;
				}
			}	
			
		} else {
			brkField = true;
			if ($.trim(fieldObj.val()) == '' && regexArray[i].required == 1) {
				hasErrors = true;
			} else {
				if ($('#' + id).prop('tagName') == 'INPUT' && $.trim(fieldObj.val()) != ''){
					var regexp = regexArray[i].exp;
					var re = new RegExp(regexp);
					var match = re.test($.trim(fieldObj.val()));
					if(!match) {
						hasErrors = true;
						}
					}
				}
		}		
	}
	
	if(hasErrors){
//		$('#saveSelfRegist').addClass('disabledBtn')
//							.attr('disabled','disabled');
		$('#hasErrors').val('Yes');
		return false;
	}
	else {		
		$('#hasErrors').val('No');
//		$('#saveSelfRegist').removeClass('disabledBtn')
//			.removeAttr('disabled');
	return true;
	}
};
Lrn.Application.SelfRegistration.prototype.emptyCaptcha = function(func)
{	
	var errorMsg = this.config.siteLabels.Required;	
	var pageErrorsMsg = this.config.siteLabels.PageErrors;
	var error = '<label for="recaptcha_widget_div" generated="true" class="error" style="color:red">'
		+ errorMsg + '</label>';
		var elem = '#Grprecaptcha_widget_div';	
		$(elem).find('.error').remove();
		$(elem).append($(error));
	if(func =='submit')	{
		$("#messageModal").html('<p class="messageModalText"><i class="fa fa-times"></i>'+ pageErrorsMsg +'</p>');
		setTimeout(function(){
			$("#messageModal").dialog("close");
		}, 1000);
	}
};
