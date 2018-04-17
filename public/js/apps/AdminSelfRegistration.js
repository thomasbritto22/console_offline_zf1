if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

Lrn.Application.Admin.valueMap = null;
Lrn.Application.Admin.adminGlobalData = null;

Lrn.Application.Admin.prototype.selfRegistInit = function(lang, languageName){
	 var adminObj = this;
	 this.valueMap = [];
	 this.checkboxSlidder = null;
	 this.userRegistrationCaptchaFieldName = 'userRegistrationCaptcha';
	 this.userRegistrationTopMessageFieldName = 'userRegistrationTopMessage';
	 this.userRegistrationBottomMessageFieldName = 'userRegistrationBottomMessage';
	 this.userRegistrationCongratsMessageFieldName = 'userRegistrationCongratsMessage';
	 this.globalGroups = {fieldList:'fieldLists', component:'components', label:'labels'};
	 this.userRegistrationCongratsMessageInstructionKey = 'CongratulationsFormCompleted';
	 
	 //this is status for js to know which mode the form should be
	 //value should be edit/edited/published
	 this.modes = {edit:'Edit', publish:'Publish', published:'Published'};
	 this.formMode = {selfRegistration:this.modes.edit};
	 this.previousMode= this.modes.edit;
	 
	 //setting default language
	 this.lang = lang;
	 this.languageName = languageName;
	 
	 var settings = {
		selector : 'div.editableInstructions, p.editableInstructions',
		menubar : false,
		statusbar : false,
		theme: "modern",
		inline_styles : false,
		inline : true,
		formats : {
			underline : {
				inline : 'u',
				exact : true
			}
		},
		plugins : "paste link maxchars lists",
		toolbar : "bold italic underline | bullist | link unlink | paste",
		paste_auto_cleanup_on_paste : true,
		paste_remove_styles : true,
		paste_remove_styles_if_webkit : true,
		paste_strip_class_attributes : "all",
		forced_root_block : false,
		//max_chars : 20,
		invalid_elements : "sub,span",
		setup : function(ed) {
			var tinymce_placeholder = $('#' + ed.id);
			var attr = tinymce_placeholder.attr('placeholder');
			var displayHolder = tinymce_placeholder.attr('displayPlaceholder');
			var placeholder = '<span style="color: #999;">' + ("undefined" !== typeof attr ? attr : '') + '</span>';
			var content = tinymce_placeholder.html();
			
			ed.settings.max_chars = 1000;//set it to 1000 characters for max chars
			
			ed.on('init', function() {
				this.getDoc().body.style.fontSize = '12px';
				this.getDoc().body.style.textAlign = 'left';

				if (content.length == 0) {
					ed.setContent(placeholder);
					// Get updated content
					cont = placeholder;
				} else {
					var SynContent = content.replace(/(<([^>]+)>)/ig, '');
					if (SynContent.trim() == attr){
						ed.setContent(placeholder);
					}else{
						ed.setContent(content);
					}
					return;
				}
			});

			ed.on('click focus', function(e) {
				var cont = ed.getContent();
				cont = cont.replace(/&nbsp;/g, '').replace(/(<([^>]+)>)/ig, '');
				cont = cont.replace(/\n/g, '');
				if (cont.trim() == attr) {
					ed.setContent('');
				}
			});
			
			ed.on("blur", function(e) {
				var cont = ed.getContent();
				cont = cont.replace(/\n/g, '');
				
				var updateObj = null;
				
				updateObj = adminObj.buildUpdateRecord('#'+ ed.id, cont);

				//trigger the update valueMap
				adminObj.updateMapData(updateObj);
				
				//update the tooltip elements
				$('#'+ ed.id).siblings('div.formPreview.tooltip').attr('title', cont);
				$('#'+ ed.id).siblings('.formPreview:not(.tooltip)').html(cont);

				//set the placeholder back when the value is empty
				if (cont.replace(/(<([^>]+)>)/ig, '').length == 0) {
					ed.setContent(placeholder);
				}
				
				e.target.save();
			});
			
            ed.on('change' , function(e){
        		adminObj.toggleSaveAllBtn(true);
            });
		}
	};
	 
	tinymce.init(settings);
	
	//initial the checkbox slidder
	this.initCheckSlider();
	
	//loading the default language
	this.loadSelfRegistrationData(this.lang);
	
	//initial the cancel button
	$('#cancelSelfRegist').click({adminObj:this}, function(e){
		e.preventDefault();
		e.data.adminObj.cancelClick($(this).closest('form').data('group'));
	});
	
	//initial the save button
	$('#saveSelfRegist').click({adminObj:this}, function(e){
		e.preventDefault();
		e.data.adminObj.saveUpdates($(this).closest('form').data('group'));
	});
	
	//initial the edit button
	$('#editSelfRegist').click({adminObj:this}, function(e){
		e.preventDefault();
		e.data.adminObj.setFormMode($(this).closest('form').data('group'), e.data.adminObj.modes.edit);
	});
	
	//initial publish button
	$('#publishSelfRegist').click({adminObj:this}, function(e){
		e.preventDefault();
		e.data.adminObj.publish($(this).closest('form').data('group'));
	});
	
	//initial clear button
	$('#clearSelfRegist').click({adminObj:this}, function(e){
		e.preventDefault();
    	//reset for the selfRegistration FieldList ValueMap
		e.data.adminObj.resetFieldListValueMap($(this).closest('form').data('group'), e.data.adminObj.globalGroups.fieldList);
		
    	//reset the element text
		e.data.adminObj.updateTheElementValues(e.data.adminObj.adminGlobalData);
		
		//set the form mode to previous mode
		e.data.adminObj.setFormMode('selfRegistration', e.data.adminObj.previousMode);
		
		//collapse content
		$('#cancelSelfRegist').click();
	});
	
};

Lrn.Application.Admin.prototype.loadSelfRegistrationData = function(langCode)
{
	$.ajax({
        url: "/admin/selfregist",
        type: "post",
        dataType: "json",
        data: {action:'getSelfRegist', lang:langCode},
        timeout: 10000,
        async: false,
        success: function(response){
        	this.adminGlobalData = response;
        	
        	//hide the tooltip if there was before
        	this.hideTooltipster();
        	
        	//reset for the selfRegistration FieldList ValueMap
        	this.resetFieldListValueMap('selfRegistration', this.globalGroups.fieldList);
        	
        	this.updateTheElementValues(this.adminGlobalData);
        	
        	//determine the mode when loading data
        	for(field in this.adminGlobalData[this.globalGroups.fieldList]){
        		if(this.adminGlobalData[this.globalGroups.fieldList][field].userColumnInstructionIsActive == 1){
        			this.setFormMode('selfRegistration', this.modes.published);
        			this.previousMode = this.modes.published;
        		}else if(this.adminGlobalData[this.globalGroups.fieldList][field].userColumnInstructionIsActive == 0){
        			this.setFormMode('selfRegistration', this.modes.publish);
        			this.previousMode = this.modes.publish;
        		}else{
        			this.setFormMode('selfRegistration', this.modes.edit);
        			this.previousMode = this.modes.edit;
        		}
        		break;
        	}
        	
        }.bind(this),
        error: function(jqXHR, textStatus, errorThrown){
        	
        }
    });
};

Lrn.Application.Admin.prototype.updateTheElementValues = function(globalData)
{
	var adminObj = this;
	$('.dataElement').each(function(){
		adminObj.setupValueToElement(this, globalData);
	});
};

/*
 * to update Map value before send the update to the services
 * options variables list
 * @formGroup: to identify the form that going to update (required)
 * @globalDataGroup: group name of the data source from the server (required)
 * @updateValue: new value that going to update
 * @section: section of component
 * @subSection: Subsection of component
 * @componentType: type of component
 * @id: id
 * @groupId: component groupId
 * @fieldName: field name of selfRegistration
 */
Lrn.Application.Admin.prototype.updateMapData = function(options)
{
	//setup the valueMap element that is not existed
	if("undefined" == typeof this.valueMap[options.formGroup]) this.valueMap[options.formGroup] = [];
	if("undefined" == typeof this.valueMap[options.formGroup][options.globalDataGroup]) this.valueMap[options.formGroup][options.globalDataGroup] = [];
	
	if(this.globalGroups.component == options.globalDataGroup){
		//create object if not existed
		if("undefined" == typeof this.valueMap[options.formGroup][options.globalDataGroup][options.section]) this.valueMap[options.formGroup][options.globalDataGroup][options.section] = [];
		if("undefined" == typeof this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection]) this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection] = [];
		if("undefined" == typeof this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection][options.componentType]) this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection][options.componentType] = [];
		
		this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection][options.componentType]['oldValue'] = this.adminGlobalData[options.globalDataGroup][options.section][options.subSection][options.componentType].value;
		this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection][options.componentType]['newValue'] = options.updateValue;
		this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection][options.componentType]['id'] = options.id;
		this.valueMap[options.formGroup][options.globalDataGroup][options.section][options.subSection][options.componentType]['groupId'] = options.groupId;
	}else if(this.globalGroups.fieldList == options.globalDataGroup){
		//create object if not existed
		if("undefined" == typeof this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]) this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]= [];
		
		//set oldValue to empty first
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['oldValue'] = '';
		
		//set instruction record id to -1 mean record not yet existed
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['id'] = '-1';
		
		if ("undefined" != typeof this.adminGlobalData[options.globalDataGroup][options.fieldName]){
			if(null != this.adminGlobalData[options.globalDataGroup][options.fieldName].userColumnInstructionId){
				this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['id'] = this.adminGlobalData[options.globalDataGroup][options.fieldName].userColumnInstructionId;
			}
			
			if (null != this.adminGlobalData[options.globalDataGroup][options.fieldName].instructionText){
				this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['oldValue'] = this.adminGlobalData[options.globalDataGroup][options.fieldName].instructionText;
			}
		}
		
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['newValue'] = options.updateValue;
	}else if(this.globalGroups.label == options.globalDataGroup){
		//create object if not existed
		if("undefined" == typeof this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]) this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]= [];
		
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['id'] =  this.adminGlobalData[options.globalDataGroup][options.fieldName].translationKeyId;
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['translationKey'] =  this.adminGlobalData[options.globalDataGroup][options.fieldName].translationKey;
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['oldValue'] = this.extractLabelTextByLanguage(options.globalDataGroup, options.fieldName, this.lang);
		this.valueMap[options.formGroup][options.globalDataGroup][options.fieldName]['newValue'] = options.updateValue;
	}

};

Lrn.Application.Admin.prototype.saveUpdates = function(formGroup)
{
	var saveData = [];
	saveData= {lang: this.lang, action:'saveSelfRegist', data:[]};

	for(var dataGroup in this.valueMap[formGroup]){
		for(var record in this.valueMap[formGroup][dataGroup]){
			saveData.data.push({
				id: this.valueMap[formGroup][dataGroup][record].id,
                fieldName: record,
                value: this.valueMap[formGroup][dataGroup][record].newValue,
                dataGroup: dataGroup
            });
		}
	}

	if(saveData.data.length > 0){
		//Display loading spinner
		this.displayAlert('ajax-loader.gif','Saving');
		
		if(saveData['data'].length > 0){
		    request = $.ajax({
		        url: "/admin/selfregist",
		        type: "post",
		        data: saveData,
		        dataType: "json",
		        timeout: 10000,
		        async: false,
		        success: (function(response){
		        	if(true == response.success){
		        		this.updateGlobalData(this.globalGroups.fieldList, response.data);
		        		this.resetFieldListValueMap(formGroup, this.globalGroups.fieldList);
		        		
		        		//update the form mode
		        		this.setFormMode(formGroup, this.modes.publish);
		        		this.previousMode = this.modes.publish;
		        		
		        		//disable the save all button when successfully save
		        		this.toggleSaveAllBtn(false);
		        		
		        		this.closeAlert(200);
		        	}else{
		            	//closing the load spinner after success return by delay 200 msecond to close 
		        		this.displayAlert('error.png', 'Couldn\'t be saved!');
		        		this.closeAlert(500);
		        	}
		        }).bind(this),
		        error: (function(jqXHR, textStatus, errorThrown){
		        	//closing the load spinner when error happened
		        	if ('timeout' === textStatus){
		        		this.displayAlert('error.png', 'Connection timeout!');
		        	}else{
		        		this.displayAlert('error.png', 'Connection failed!');
		        	}
		        	this.closeAlert(1000);
		        	
		        }).bind(this)
		    });
		}
	}
};

Lrn.Application.Admin.prototype.publish = function(formGroup)
{
	//Display loading spinner
	this.displayAlert('ajax-loader.gif','Publishing');

    request = $.ajax({
        url: "/admin/selfregist",
        type: "post",
        data: {lang: this.lang, action:'publishSelfRegist'},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: (function(response){
        	if(true == response.success){
        		this.updateGlobalData(this.globalGroups.fieldList, response.data);
        		this.resetFieldListValueMap(formGroup, this.globalGroups.fieldList);
        		
        		//update the form mode
        		this.setFormMode(formGroup, this.modes.published);
        		this.previousMode = this.modes.published;
        		
        		this.closeAlert(200);
        	}else{
            	//closing the load spinner after success return by delay 200 msecond to close 
        		this.displayAlert('error.png', 'Couldn\'t be saved!');
        		this.closeAlert(500);
        	}
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	if ('timeout' === textStatus){
        		this.displayAlert('error.png', 'Connection Timeout!');
        	}else{
        		this.displayAlert('error.png', 'Connection Failed!');
        	}
        	this.closeAlert(1000);
        	
        }).bind(this)
    });
};

Lrn.Application.Admin.prototype.updateGlobalData = function(globalDataGroup, responseData)
{
	if(globalDataGroup == this.globalGroups.fieldList){
		if("undefined" != typeof this.adminGlobalData[globalDataGroup]){
			for(i in responseData){
				if("undefined" == typeof this.adminGlobalData[globalDataGroup][responseData[i].columnName]){
					this.adminGlobalData[globalDataGroup][responseData[i].columnName] = {columnName: responseData[i].columnName};
				}

				this.adminGlobalData[globalDataGroup][responseData[i].columnName]['instructionText'] = responseData[i].instruction;
				this.adminGlobalData[globalDataGroup][responseData[i].columnName]['userColumnInstructionIsActive'] = responseData[i].isActive;
				this.adminGlobalData[globalDataGroup][responseData[i].columnName]['userColumnInstructionId'] = responseData[i].id;
			}
		}
	}
};

Lrn.Application.Admin.prototype.initCheckSlider = function(){
	var adminObj = this;
	var slideToggle = $('.checkSlidder');

    // create a slide toggle wrapper (to hold the slider)
    var slideWrapper = document.createElement('div');
    slideWrapper.className = 'slideToggleWrapper ui-corner-all verificationToggle';
    slideToggle.after(slideWrapper);
    
    // element for the true side (turn on)
    var trueSide = document.createElement('span');
    trueSide.className = 'trueSide ui-corner-left';
    $(trueSide).html($(this).attr('show-label') || 'ON');
    $(slideWrapper).append(trueSide);
    
    // element for false side (turn off)
    var falseSide = document.createElement('span');
    falseSide.className = 'falseSide ui-corner-right';
    $(falseSide).html($(this).attr('hide-label') || 'OFF');
    $(slideWrapper).append(falseSide);
    
    // element to slide back and forth
    var slider = document.createElement('span');
    slider.className = 'slider ui-corner-all';
    $(slideWrapper).append(slider);
    
    // first click turns on, second turns off
    $(slider).toggle(
    		function(e){
		        slideToggle.prop('checked', true);
		        slideToggle.attr('checked', 'checked');
		        $('.enabledMsg').hide();
		        $('.disabledMsg').show();
		        $(this).animate({ left: '50px' });
		        $(slider).css({ 'padding-left': '10px'});

				updateObj = adminObj.buildUpdateRecord($(slider).closest('.slideToggleWrapper').siblings('input[type=checkbox].checkSlidder'), 'on');
				//trigger the update valueMap
				adminObj.updateMapData(updateObj);
				
				//show the captcha
				$(slider).closest('p').siblings('p.captcha').css({'display': 'inline-block', 'visibility': 'visible'});
				
				adminObj.toggleSaveAllBtn(true);
		    },
		    function(e){
		        slideToggle.prop('checked', false);
		        slideToggle.removeAttr('checked');
		        $(this).animate({ left: 0 });
		        
				updateObj = adminObj.buildUpdateRecord($(slider).closest('.slideToggleWrapper').siblings('input[type=checkbox].checkSlidder'), 'off');
				//trigger the update valueMap
				adminObj.updateMapData(updateObj);
				
				//hide the captcha
				$(slider).closest('p').siblings('p.captcha').css({'display': 'inline-block', 'visibility': 'hidden'});
				
				adminObj.toggleSaveAllBtn(true);
		    }
    );
	
    // hide the checkbox from the user
    $(slideToggle).hide();
    
    //set the slidder to admin object
    this.checkboxSlidder = $(slider);
}

Lrn.Application.Admin.prototype.setCheckSlider = function(status)
{
    if(('on' == status || '' == status || null == status) && false == $('.checkSlidder').is(":checked")){
    	this.checkboxSlidder.click();
    }else if('off' == status && true == $('.checkSlidder').is(":checked")){
    	this.checkboxSlidder.click();
    }else if('off' == status && false == $('.checkSlidder').is(":checked")){
        //hide captcha
    	$('p.captcha').css({'display': 'inline-block', 'visibility': 'hidden'});
    }
};

Lrn.Application.Admin.prototype.cancelClick = function(formGroup)
{
	var adminObj = this;
	
	//fieldList dataType
	if ("undefined" != typeof this.valueMap[formGroup] && "undefined" != typeof this.valueMap[formGroup][this.globalGroups.fieldList]){
		for(var key in this.valueMap[formGroup][this.globalGroups.fieldList]){
			$('form[data-group=' +formGroup+ ']').find('.dataElement').each(function(){
				var propData = $(this).data('prop');
				if(propData.groupName == adminObj.globalGroups.fieldList && propData.fieldName == key){
					if('' == adminObj.valueMap[formGroup][adminObj.globalGroups.fieldList][key].oldValue){
						$(this).html($(this).attr('placeholder'));
					}else{
						$(this).html(adminObj.valueMap[formGroup][adminObj.globalGroups.fieldList][key].oldValue);
					}
					
					//handle differently for the captcha toggle button
					if (key = adminObj.userRegistrationCaptchaFieldName){
						adminObj.setCheckSlider('' == adminObj.valueMap[formGroup][adminObj.globalGroups.fieldList][key].oldValue ? 'on' : adminObj.valueMap[formGroup][adminObj.globalGroups.fieldList][key].oldValue);
					}
				}
			});
		};
	}
	
	//component dataType
	//TODO: will do it later
	
	//clean the updateMap
	this.refreshMapData(formGroup);
	
	//make sure the saveAll button is disable
	this.toggleSaveAllBtn(false);
};

/*
 * helper functions
 */
Lrn.Application.Admin.prototype.refreshMapData = function(formGroup, globalDataGroup)
{	
	if("undefined" == typeof formGroup || 0 >= this.valueMap.length){
		this.valueMap = [];
	}else{
		if ("undefined" != typeof this.valueMap[formGroup] && "undefined" == typeof globalDataGroup){
			delete this.valueMap[formGroup];
		}else{
			if("undefined" != typeof this.valueMap[formGroup] && "undefined" != typeof this.valueMap[formGroup][globalDataGroup]){
				delete this.valueMap[formGroup][globalDataGroup];
			}
		}
	}
};

Lrn.Application.Admin.prototype.buildUpdateRecord = function(htmlElementSelector, newUpdateValue)
{
	var elementObj = $(htmlElementSelector);
	
	var updateObj = {
		globalDataGroup: elementObj.data('prop').groupName,
		formGroup: elementObj.closest('form').data('group'),
		updateValue: newUpdateValue
	};
	
	if (this.globalGroups.fieldList === elementObj.data('prop').groupName){
		updateObj['fieldName'] = elementObj.data('prop').fieldName;
	}else if(this.globalGroups.component === elementObj.data('prop').groupName){
		updateObj['subSection'] = elementObj.data('prop').subSection;
		updateObj['section'] = elementObj.data('prop').section;
		updateObj['componentType'] = elementObj.data('prop').componentType;
		updateObj['id'] = "undefined" != typeof elementObj.data('id') ? elementObj.data('id') : '';
		updateObj['groupId'] = "undefined" != typeof elementObj.data('groupId') ? elementObj.data('groupId') : '';
	}
	
	return updateObj;
};

Lrn.Application.Admin.prototype.setupValueToElement = function(htmlElement, data){
	var elementObj = $(htmlElement);
	var dataByGroup = data[elementObj.data('prop').groupName];
	var formGroup = elementObj.closest('form').data('group');
	var groupId = '';
	var id = '';
	var fieldKey = '';
	
	if (this.globalGroups.fieldList === elementObj.data('prop').groupName){
		if("undefined" != typeof dataByGroup[elementObj.data('prop').fieldName]){
			if(this.userRegistrationCaptchaFieldName === dataByGroup[elementObj.data('prop').fieldName].columnName){
				//is it explicit for the Captcha checkbox
				this.setCheckSlider(dataByGroup[elementObj.data('prop').fieldName].instructionText);
				
				//make sure the save all button is disabled
				this.toggleSaveAllBtn(false);
			}else{
				if('' != dataByGroup[elementObj.data('prop').fieldName].instructionText && null != dataByGroup[elementObj.data('prop').fieldName].instructionText){
					elementObj.html(dataByGroup[elementObj.data('prop').fieldName].instructionText);
					//update the preview as well
					elementObj.siblings('div.formPreview.tooltip').attr('title', dataByGroup[elementObj.data('prop').fieldName].instructionText);
					elementObj.siblings('.formPreview:not(.tooltip)').html(dataByGroup[elementObj.data('prop').fieldName].instructionText);
				}else{
					elementObj.html(elementObj.attr('placeholder'));
					//update the preview as well
					elementObj.siblings('div.formPreview.tooltip').attr('title', '');
					elementObj.siblings('.formPreview:not(.tooltip)').html('');
				}
			}
		}
	}else if(this.globalGroups.component === elementObj.data('prop').groupName){
		if ("undefined" != typeof dataByGroup[elementObj.data('prop').section] &&
			"undefined" != typeof dataByGroup[elementObj.data('prop').section][elementObj.data('prop').subSection] &&
			"undefined" != typeof dataByGroup[elementObj.data('prop').section][elementObj.data('prop').subSection][elementObj.data('prop').componentType]){
			
			if ("undefined" != typeof dataByGroup[elementObj.data('prop').section][elementObj.data('prop').subSection][elementObj.data('prop').componentType]['groupId']){
				groupId = dataByGroup[elementObj.data('prop').section][elementObj.data('prop').subSection][elementObj.data('prop').componentType]['groupId'];
			}
			
			if ("undefined" != typeof dataByGroup[elementObj.data('prop').section][elementObj.data('prop').subSection][elementObj.data('prop').componentType]['id']){
				id = dataByGroup[elementObj.data('prop').section][elementObj.data('prop').subSection][elementObj.data('prop').componentType]['id'];
			}
		}
	}else if (this.globalGroups.label === elementObj.data('prop').groupName){
		if("undefined" != typeof dataByGroup[elementObj.data('prop').fieldName]){
			var labelText = this.extractLabelTextByLanguage(elementObj.data('prop').groupName, elementObj.data('prop').fieldName, this.lang);
			
			id = dataByGroup[elementObj.data('prop').fieldName]['translationKeyId'];
			elementObj.html(labelText);
			elementObj.siblings('.formPreview').html(labelText);
		}
	}
	
	elementObj.data('id', id);
	elementObj.data('groupId', groupId);
	elementObj.data('key', fieldKey);
}

Lrn.Application.Admin.prototype.resetFieldListValueMap = function(formGroup, globalDataGroup)
{
	var FieldListData = this.adminGlobalData[globalDataGroup];
	
	//make sure everything is deleted 
	if ("undefined" != typeof this.valueMap[formGroup] && "undefined" != typeof this.valueMap[formGroup][globalDataGroup]){
		this.refreshMapData(formGroup, globalDataGroup);
	}
	
	for(field in FieldListData){
		var updateObj = {
				globalDataGroup: globalDataGroup,
				formGroup: formGroup,
				fieldName: FieldListData[field].columnName,
				updateValue: (null != FieldListData[field].instructionText ? FieldListData[field].instructionText : '')
		};
		
		this.updateMapData(updateObj);
	}
};

Lrn.Application.Admin.prototype.resetLabelValueMap = function(formGroup, globalDataGroup)
{
	var labelData = this.adminGlobalData[globalDataGroup];
	
	//make sure everything is deleted 
	if ("undefined" != typeof this.valueMap[formGroup] && "undefined" != typeof this.valueMap[formGroup][globalDataGroup]){
		this.refreshMapData(formGroup, globalDataGroup);
	}
	
	for(labelKey in labelData){
		var updateObj = {
				globalDataGroup: globalDataGroup,
				formGroup: formGroup,
				fieldName: labelKey,
				updateValue: this.extractLabelTextByLanguage(globalDataGroup, labelKey, this.lang)
		};
		
		this.updateMapData(updateObj);
	}
};

Lrn.Application.Admin.prototype.setFormMode = function(formGroup, mode)
{
	this.formMode[formGroup] = mode;
	
	//trigger the form change interface mode
	this.changeTheFormInterfaceMode(formGroup, mode);
};

Lrn.Application.Admin.prototype.changeTheFormInterfaceMode = function(formGroup, mode)
{
	var formElement =  $('form[data-group=' +formGroup+ ']');
	
	if (mode == this.modes.publish){
		formElement.find('div.slideToggleWrapper.verificationToggle').hide();
		formElement.find('span.verificationToggle').hide();
		formElement.find('.formPreview,.btnPublish').show();
		this.showTooltipster();
		formElement.find('.dataElement,.btnSave,.btnClear').hide();
		formElement.find('.btnPublish').removeAttr("disabled").removeClass('disabled');
		$('#cancelSelfRegist').show();
	}else if(mode == this.modes.edit){
		formElement.find('div.slideToggleWrapper.verificationToggle').show();
		formElement.find('span.verificationToggle').show();
		this.hideTooltipster();
		formElement.find('.formPreview,.btnPublish').hide();
		formElement.find('.btnPublished').attr("disabled", "disabled").addClass('disabled').show();
		formElement.find('.dataElement,.btnSave,.btnClear').not('.notShow').show();
		$('#cancelSelfRegist').hide();
	}else if(mode == this.modes.published){
		formElement.find('div.slideToggleWrapper.verificationToggle').hide();
		formElement.find('span.verificationToggle').hide();
		formElement.find('.formPreview,.btnPublish').show();
		this.showTooltipster();
		formElement.find('.dataElement,.btnSave,.btnClear').hide();
		formElement.find('.btnPublished').attr("disabled", "disabled").addClass('disabled');
		$('#cancelSelfRegist').show();
	}
};

Lrn.Application.Admin.prototype.displayAlert = function(imageName, alertText)
{
	//Display loading spinner
	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="'+CDN_IMG_URL+'/images/backgrounds/' +imageName+ '"  width=50 height=50/></span>' +alertText+ '</p>');
	$("#messageModal").dialog({
		   resizable: false,
		   width: 150,
		   height: 150,
		   buttons: {},
		   closeOnEscape: false,
		   open: function(event, ui){
			   $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();
		   }
	});
};

Lrn.Application.Admin.prototype.closeAlert = function(delay)
{
	setTimeout(function(){
		$("#messageModal").dialog("close");
	}, delay);
};

Lrn.Application.Admin.prototype.initTooltipster = function(){
	$('.tooltip').tooltipster({
		theme: 'tooltipster-light'
	});
};

Lrn.Application.Admin.prototype.showTooltipster = function(){
	$('.tooltip').each(function(){
		if("" != $(this).attr('title') && "undefined" != typeof $(this).attr('title')){
			$(this).tooltipster({
				theme: 'tooltipster-light',
				position: 'right',
				positionTracker: true,
				contentAsHTML: true,
				interactive: true,
				autoClose: false,
				offsetX: '-300px',
				offsetY: '-10px',
				maxWidth: 285,
				functionReady: function(origin, tooltip){
					// var tHeight = tooltip.outerHeight();
					// $(this).parent().css({'height': tHeight + 'px'});
					// $(this).css({'height': tHeight + 'px'});
					// if ($.browser.msie  && parseInt($.browser.version, 10) === 8) {
						// $(this).tooltipster('hide');
					var content = tooltip.find('.tooltipster-content').html();
					var ieTooltip = '<div class="tooltipWrap">' +
									'<div class="tooltipContent">' + content + '</div>' +
									'<div class="tooltipArrow"><span class="tooltipArrowBorder" style="margin-left: -1px;"></span><span class="innerTooltipArrow"></span></div>' +
									'</div>';
					$(ieTooltip).appendTo(origin);
					tooltip.css({"display":"none"});
					tooltip.find('.tooltipster-arrow').css({"display":"none"});
					// }
				}
			});
			
			$(this).tooltipster('show');
		}
	});
};

Lrn.Application.Admin.prototype.hideTooltipster = function(){
	$('.tooltip.tooltipstered').each(function(){
		$(this).tooltipster('destroy');
	});
	// for ie8 fix
	$('.tooltipWrap').hide();
};

Lrn.Application.Admin.prototype.extractLabelTextByLanguage = function(globalDataGroup, fieldKey, lang){
	if(this.defaultLanguage == lang){
		//for default english language
		return ("" != this.adminGlobalData[globalDataGroup][fieldKey].customEng ? this.adminGlobalData[globalDataGroup][fieldKey].customEng : this.adminGlobalData[globalDataGroup][fieldKey].suggestTranlation);
	}else{
		//for other language
		return ("" != this.adminGlobalData[globalDataGroup][fieldKey].customOtherLang ? this.adminGlobalData[globalDataGroup][fieldKey].customOtherLang : this.adminGlobalData[globalDataGroup][fieldKey].suggestTranlation);
	}
};

Lrn.Application.Admin.prototype.toggleSaveAllBtn = function(enable){
	if(true === enable){
		$('#saveAll').removeClass('disabled').removeAttr("disabled");
		$('.cancelAllLink').removeClass('disabled').removeAttr("disabled");
	}else{
		$('#saveAll').addClass("disabled").attr("disabled", "disabled");
		$('.cancelAllLink').addClass("disabled").attr("disabled", "disabled");
	}
}

/*
 * end helpers functions
 */ 