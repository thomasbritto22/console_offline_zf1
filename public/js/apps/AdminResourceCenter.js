if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
Lrn.Application.resourceCenter = {};

//Initial valueMap for doing logic of checking value was changed or not
Lrn.Application.resourceCenter = function(config)
{	
    this.valueMap = [];
    
    //validate error stack
    this.errorStack = {};
    
    //edit row click status
    this.editRowClickStatus = false;

    //source dataTable Data
    this.resourcesData = [];
    this.editResourceData = [];
    this.reorderData = [];
    
    //resource count by each type
    this.countResources = [];
    
    //dropdown type initialize
    this.visibilityType = config.visibilityType;
    this.resourceType = config.resourceType;
    
    //language
    this.lang = config.defLang;
    this.languageName = config.defLangName;
    
    this.frontFileTool = {};
    
    //baseUrl setup
    this.baseUrl = config.baseUrl;
    
    //float dataTable headers
    this.addDataTableHeader = null;
    this.editDataTableHeader = null;
    this.orderDataTableLoginHeader = null;
    this.orderDataTableRightSideHeader = null;
    this.orderDataTableResourceHeader = null;
    
    //element Ids
    this.htmlTableId = '#resourceList';
    this.htmlFrameTableId = '#dynamic';
    this.htmlFrameTableIdEdit = '#dynamicEdit';
    this.htmlTableIdEdit = '#resourceListEdit';
    this.htmlFrameTableIdLogin = '#dynamicLoginTable';
    this.htmlTableIdLogin = '#loginTable';
    this.htmlFrameTableIdRightSidebar = '#dynamicRightSidebarTable';
    this.htmlTableIdRightSidebar = '#rightSidebarTable';
    this.htmlFrameTableIdResourCenter = '#dynamicResourceCenterTable';
    this.htmlTableIdResourCenter = '#resourceCenterTable';
    this.htmlHeadCheckBoxId = '#headCheckBox';
    this.htmlAddResourceId = '#addResourceBtn';
    this.htmlCancelResourceId = '#cancelResourceBtn';
    this.htmlSaveResourceId = '#updateResourceBtn';
    this.htmlBulkActionBtnId = '#submitBulkAction';
    this.htmlBulkActionId = '#bulkAction';
    this.htmlPTagPlaceForShowRecord = '#showRecordNumber';
    this.htmlAddVideoBtnId = '#newRCVideocustomfileBtn';
    this.htmlAddVideoThumbnailBtnId = '#newRCThumbnailBtn';
    this.htmlHiddenVideoFieldId = '#newresourcecentervideocustomfile_id';
    this.htmlHiddenRCCustomFile = '#rewRCCustomfile';
    this.htmlHiddenRCThumbnailCustomFile = '#newRCVideoThumbnailcustomfile';
    this.htmlNewRCValueField = '#newResourceValue';
    this.htmlNewRCTypeField = '#newResourceType';
    this.htmlNewVideoThumbnail = '#newVideoImg';
    this.htmlLoginPageRCNumber = '#loginPageRCNumber';
    this.htmlRightSidebarRCNumber = '#rightSidebarRCNumber';
    this.htmlResourceCenterRCNumber = '#resourceCenterRCNumber';
    this.htmlUpdateThumbnailHiddenField = '#updateThumbnailRowFile_id';
    this.htmlUpdateThumbnailFilenameHiddenField = '#updateThumbnailRowFile_name';
    this.htmlTabsId = '#tabs';
    this.htmlAccordionLoginId = '#accordionLogin';
    this.htmlAccordionRightSideBar = '#accordionRightSideBar';
    this.htmlAccordionResourceCenter = '#accordionResourceCenter';
    this.htmlResourceHeaderTextId = '#resourceHeaderText';
    
    //constant
    this.clearImageText = "Clear image";
    this.addImageText = "Upload image";
    this.headerTexts = {'addTab':'Add resources', 'editTab':'Edit resources', 'reorderTab':'Reorder resources'};
};

Lrn.Application.resourceCenter.prototype = new Lrn.Application();
Lrn.Application.resourceCenter.prototype.superclass = Lrn.Application.prototype;

Lrn.Application.resourceCenter.prototype.init = function()
{
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
	this.superclass.init.apply(this);
	
	//disable the notification first
	$('#langNotification').css('display', 'none');
	
	//enable tabs
	$(this.htmlTabsId).tabs({ 
		select: (function(event, ui){
			selectedTabTitle = $(ui.tab).text();
			if ('Add' == selectedTabTitle){
				$('select[name=' +this.htmlTableIdEdit.replace(/[#]/g,'')+ '_length]').hide();
				$('select[name=' +this.htmlTableId.replace(/[#]/g,'')+ '_length]').show();
			}else if('Edit' == selectedTabTitle){
				$('select[name=' +this.htmlTableIdEdit.replace(/[#]/g,'')+ '_length]').show();
				$('select[name=' +this.htmlTableId.replace(/[#]/g,'')+ '_length]').hide();
			}else if ('Reorder' == selectedTabTitle){
				$('select[name=' +this.htmlTableIdEdit.replace(/[#]/g,'')+ '_length]').hide();
				$('select[name=' +this.htmlTableId.replace(/[#]/g,'')+ '_length]').hide();
			}
		}).bind(this)
	});
	
	//enable Collapse on reorder Tab
	this.reorderCollapseInitialize();	
	
	//changing the notice language box text
	$('#languageNameId').text(this.languageName);
	
	//render the datatable for add and edit table
	this.renderDatable(this.htmlFrameTableId, this.htmlTableId, false);
	this.renderDatable(this.htmlFrameTableIdEdit, this.htmlTableIdEdit, true);
	this.renderReorderTable(this.htmlFrameTableIdLogin, this.htmlTableIdLogin, 'loginPage');
	this.renderReorderTable(this.htmlFrameTableIdRightSidebar, this.htmlTableIdRightSidebar, 'rightSidebar');
	this.renderReorderTable(this.htmlFrameTableIdResourCenter, this.htmlTableIdResourCenter, 'resourcePage');
	
	//setup the language dropbox box to inial the reload resource data
	if ($('#fieldLanguagesRC').length > 0){
		//display the notication box
		$('#langNotification').css('display', 'block');
		
		$('#fieldLanguagesRC').change((function(){
			var reload = function(resourceObject){
				//change language property when the dropdown box changed 
				resourceObject.lang = $('#fieldLanguagesRC :selected').val();
				resourceObject.languageName = $('#fieldLanguagesRC :selected').text();
				
				resourceObject.langResourcesLoad(resourceObject.lang);
				
				//reset form to existing default value
				$('#resourceMgrForm')[0].reset();
				
			    //IE fix when form submit placeholder not placing back
				resourceObject.ie89PlaceholderFix();
				
				$('#newResourceType').change();
			};
			
			reload(this);
			
		}).bind(this));
	}
	
	//add click event to the add resource botton
	$(this.htmlAddResourceId).click((this.addResourceClick).bind(this));
	
	//initial the new resource type file upload
	this.addNewResourceUploadTypeInit();
	this.addNewResourceValueChangeInit();
	
	//initial bulk action
	this.bulkActionInit();
	
	//bind click to save button
	$(this.htmlSaveResourceId).click((function(){
		this.updateResource(this.getUpdateValues());
	}).bind(this));
	
	//add new method to validator plugin
	$.validator.addMethod(
	        "regex",
	        function(value, element, regexp) {
	            var re = new RegExp(regexp);
	            return this.optional(element) || re.test(value);
	        },
	        "URL is wrong format."
	);
	
	//setup validator for the addnew resource form
	this.setupNewResourceFormValidate();

	//check and uncheck the header check box
	$(this.htmlHeadCheckBoxId).live('click', {resourceObj:this}, function(e){
		if($(this).is(':checked')){
			$(e.data.resourceObj.htmlTableIdEdit).find('td input:checkbox').prop('checked', true);
		}else{
			$(e.data.resourceObj.htmlTableIdEdit).find('td input:checkbox').prop('checked', false);
		}
	});
	
	//render the cancel update button
	this.cancelUpdate();
	
	//update the update MapValue when the thumbnail selected
	$(this.htmlUpdateThumbnailHiddenField).on('change',(function(e){
		e.preventDefault();
		e.stopPropagation();
		
		//update the map value
		this.updateValueMap(true, $(this.htmlUpdateThumbnailHiddenField).prop('groupid'), 'thumbnail', $(this.htmlUpdateThumbnailHiddenField).val());
		
		//trigger clear tempory field and change the UI status of elements
		$(this.htmlUpdateThumbnailHiddenField).val('');
		$('#'+$(this.htmlUpdateThumbnailFilenameHiddenField).val()).data('thumbnailexisted', true);
		this.toggleClearAddVideoThumbBtn($('#'+$(this.htmlUpdateThumbnailFilenameHiddenField).val()).closest('td').find('.clearVideoThumbnailBtn'));
		$(this.htmlUpdateThumbnailFilenameHiddenField).val('');
		this.enableSaveBtn(true);
	}).bind(this));
	
	//trigger the floading DataTable header when the tab click but not IE8
	$('div.ui-tabs li a').click(function() {
		  if(parseInt($.browser.version, 10) !== 8 || !$.browser.msie){
			  this.handleFixedHeaders();
		  }
		  
		  this.handleChangeHeaderText();
	}.bind(this));
	
	//make sure the first tab is having the float header but not IE8
	if (parseInt($.browser.version, 10) !== 8 || !$.browser.msie){
		this.handleFixedHeaders();
	}
	
	//change the resource center text header
	this.handleChangeHeaderText();

}

Lrn.Application.resourceCenter.prototype.renderDatable = function(dynamicDiv, dataTableId, editable){
	$(dynamicDiv).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' +dataTableId.replace(/[#]/g,'')+ '"></table>');
	
	//building column header
	var aoColumns = new Array();
	if (true == editable){
		//disable the save button first
		this.enableSaveBtn(false);
		
		//add one more column for the check box
		aoColumns = [{"mData": "checkbox", "sTitle": '<input type="checkbox" id="' +this.htmlHeadCheckBoxId.replace(/[#]/g,'')+ '" />', "bSortable": false, "sClass": "recCheckbox"}]; 
	}
	aoColumns = $.merge(aoColumns , [
					{"mData": "visibilityText", "sTitle": "Visibility", "bSortable": true, "sClass": "recVisibility"},
					{"mData": "typeText", "sTitle": "Type", "bSortable": true, "sClass": "recType"},
	       			{"mData": "title", "sTitle": "Title", "bSortable": true, "sClass": "recTitle"},
	    			{"mData": "text", "sTitle": "Resource", "bSortable": false, "sClass": "recResource"},
	    			{"mData": "description", "sTitle": "Description", "bSortable": false, "sClass": "recDescription"}
	    		]);
	
	//render the dataTable
	var table = $(dataTableId).dataTable({
		"aaData": null,
		"aLengthMenu": [[-1, 15, 25, 50, 100],["Show all", 15, 25, 50, 100 ]],
		"aaSorting": [],
		"iDisplayLength" : -1,
		"oLanguage": {
			"sZeroRecords": "No resources to display",
			"sLengthMenu" : "_MENU_"
			},
        "sPaginationType": "full_numbers",
		"aoColumns": aoColumns,
		"bAutoWidth": false,
		"fnDrawCallback": (function(oSettings){
			$(dataTableId+ '_previous').attr("class", "paginate_enabled_previous");
			$(dataTableId+ '_next').attr("class", "paginate_enabled_next");
			$(dataTableId+ '_paginate > span').attr("style", "float:left");
			
			var l = Math.ceil(oSettings.aoData.length/oSettings._iDisplayLength);
			var page = Math.ceil(oSettings._iDisplayStart/oSettings._iDisplayLength);

			if(page === 0 &&  l <= 0){
				$(dataTableId +'_paginate').hide();
				$(dataTableId+ '_previous').attr("class", "paginate_disabled_previous");
				$(dataTableId+ '_next').attr("class", "paginate_disabled_next");
			}else if(page === 0){
				$(dataTableId+ '_previous').attr("class", "paginate_disabled_previous");
				if(page === l-1){
					$(dataTableId+ '_next').attr("class", "paginate_disabled_next");
				}
				
				$(dataTableId +'_paginate').show();
			}else if(page === l-1){
				$(dataTableId+ '_next').attr("class", "paginate_disabled_next");
				$(dataTableId +'_paginate').show();
			}else{
				$(dataTableId +'_paginate').show();
			}
			
			//render inline editor if the dataTable is supposed to
			if (true == editable){
				this.initInlineEditor();
				
				//disable Editor render when click on the checkbox
				$(dataTableId).find('td input:checkbox').click(function(e){
					e.stopPropagation();
				})
				
				//initiate the single row delete
				this.deleteRowInit();
				
				//hide edit filter dropdown
				$(dataTableId +'_length').find('label select').hide();
				
			}
			 
			
		}).bind(this)
	});
	
	//move the filter record to the top page
	$(dataTableId +'_length').find('label select').appendTo(this.htmlPTagPlaceForShowRecord);
	
	if (true == editable){
		//move the dataTable search
		$(dataTableId +'_filter').insertAfter('.editTabText');
	}
}

Lrn.Application.resourceCenter.prototype.renderReorderTable = function(dynamicDiv, dataTableId, visibility){
	$(dynamicDiv).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' +dataTableId.replace(/[#]/g,'')+ '" data-visibility="' +visibility+ '"></table>');
	
	//building column header
	var aoColumns = new Array();

	aoColumns = $.merge(aoColumns , [
	                {"mData": "index", "sTitle": "No.", "bSortable": false, "sClass": "recIndex"},
					{"mData": "visibilityText", "sTitle": "Visibility", "bSortable": false, "sClass": "recEditVisibility"},
					{"mData": "typeText", "sTitle": "Type", "bSortable": false, "sClass": "recEditType"},
	       			{"mData": "title", "sTitle": "Title", "bSortable": false, "sClass": "recEditTitle"},
	    			{"mData": "text", "sTitle": "Resource", "bSortable": false, "sClass": "recEditResource"},
	    			{"mData": "description", "sTitle": "Description", "bSortable": false, "sClass": "recEditDescription"}
	    		]);
	
	//render the dataTable
	$(dataTableId).dataTable({
		"aaData": null,
		"bPaginate": false,
		"bFilter": false,
		"aaSorting": [],
		"oLanguage": {"sZeroRecords": "No resources to display"},
		"aoColumns": aoColumns,
		"bAutoWidth": false,
		"fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
			if ("undefined" == typeof $(nRow).attr("data-position")){
			   $(nRow).attr("data-position",iDisplayIndex+1);
			   $(nRow).attr("data-groupid",aData.groupId);
			   
			   return nRow;
			}
		},
		"fnDrawCallback": (function(oSettings){
			//move the video image to default image if source not existed
			this.changeVideoThumnailToDefault();
		}).bind(this)
	});
	
	$(dataTableId).dataTable().rowReordering({submitFunction:(function(dt){
		var groupIds = [];
		var moveStatus = true;
		
		$(dt).find('tbody tr').each(function(){
			groupIds.push($(this).data('groupid'));
		});

		//start ajax call the save the other
		$.ajax({
		    url: "/admin/resources",
		    type: "post",
		    data: {action:'updateOrder', lang:this.lang, visibility:$(dt).data('visibility'), groupIds:groupIds },
		    dataType: "json",
		    async: false,
		    timeout: 10000,
		    success: function(response){
		    	if (false == response.success){
		    		moveStatus = false;
		    	}
		    },
		    error: function(){
		    	moveStatus = false;
		    }
	    });
		
		return moveStatus;
	}).bind(this), errorMessage: "couldn't connect to server!"});
	
	//bind change background on mousedown
	var highlightRowObj = null;
	$(dataTableId + ' tr:has(td)').live('mousedown', function(){
		highlightRowObj = this;
		$(this).css("background-color", "#0040FF");
	});
	$(dataTableId).live('mouseup', function(){
		$(highlightRowObj).css("background-color", "");
	});
}

Lrn.Application.resourceCenter.prototype.langResourcesLoad = function(langCode)
{
	this.loadServerData(langCode);
	this.enableSaveBtn(false);
	this.dynamicLoad(this.htmlTableId, this.resourcesData);
	this.dynamicLoad(this.htmlTableIdEdit, this.editResourceData);
	
	//initial the reorder tables
	this.dynamicLoad(this.htmlTableIdLogin, this.reorderData.loginPage);
	$(this.htmlLoginPageRCNumber).html(this.reorderData.loginPage.aaData.length);
	this.dynamicLoad(this.htmlTableIdRightSidebar , this.reorderData.rightSidebar);
	$(this.htmlRightSidebarRCNumber).html(this.reorderData.rightSidebar.aaData.length);
	this.dynamicLoad(this.htmlTableIdResourCenter, this.reorderData.resourcePage);
	$(this.htmlResourceCenterRCNumber).html(this.reorderData.resourcePage.aaData.length);
	
	//check the head checkbox bulk action
	$(this.htmlHeadCheckBoxId).prop('checked', false);
}

Lrn.Application.resourceCenter.prototype.dynamicLoad = function(tableId, data)
{
	var oTable = $(tableId).dataTable();
    oSettings = oTable.fnSettings();
     
    oTable.fnClearTable(this);
    
    for (var i in data.aaData){
    	var rowData = jQuery.extend(true, {}, data.aaData[i]);
    	
    	if ('video' == rowData['type']){
    		var path = '';
    		if ("" != rowData['thumbnailfilePath'] && null != rowData['thumbnailfilePath']){
    			path = this.baseUrl+rowData['thumbnailfilePath'];
    		}else{
    			path = this.resourceVideoImagePath(rowData['customfilePath']);
    		}

			rowData['text'] = '<div class="resourceVideoImg"><img class="videoImage" src="' +path+ '"/></div>';
    	}
    	
    	oTable.oApi._fnAddData(oSettings, rowData);
    }

    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
    oTable.fnDraw();
}

/*
 * Process Save change only the updated resource when the Save button click
 */
Lrn.Application.resourceCenter.prototype.updateResource = function(records)
{	
	//Display loading spinner
	this.displayAlert('ajax-loader.gif','Loading');
	
	if (0 < records.length && this.emptyError()){
	    request = $.ajax({
		    url: "/admin/resources",
		    type: "post",
		    data: {action:'updateResources', resources:records},
		    dataType: "json",
		    async: false,
		    timeout: 10000,
		    success: (function(response){
		    	if (true == response.success){
//		    		//this will be implement later
//		    		//start update the valueMap
//		    		for (var i = 0; i < records.length; i++){
//		    			this.updateValueMap(false, records[i].groupId, records[i].componentType, records[i].value, records[i].value);
//		    		}
		    		
		    		this.langResourcesLoad(this.lang);
		    		
		    		this.displayAlert('done.jpg', 'Saved');
		    		this.closeAlert(500);
		    	}else{
		    		this.displayAlert('error.png', 'Failed');
		    		this.closeAlert(500);
		    	}
		    }).bind(this),
		    error: (function(){
		    	this.displayAlert('error.png', 'Connection failed!');
		    	this.closeAlert(500);
		    }).bind(this)
	    });
	}else{
		//Showing successful save to user even nothing to save
		this.displayAlert('error.png', 'Couldn\'t be saved!');
		this.closeAlert(1000);
	}
}


Lrn.Application.resourceCenter.prototype.displayAlert = function(imageName, alertText)
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
}

Lrn.Application.resourceCenter.prototype.closeAlert = function(delay)
{
	setTimeout(function(){
		$("#messageModal").dialog("close");
	}, delay);
}

Lrn.Application.resourceCenter.prototype.deleteConfirm = function(deleteAction, parameter, text)
{	
	//Display asking save confirmation
	$("#messageModal").html('<p class="messageModalText">'+text+'</p>');
	$("#messageModal").dialog({
		resizable: false,
		height: 150,
		width: 300,
		closeOnEscape: false,
		modal: true,
		open: function(event, ui){
			$(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			$(".ui-dialog-titlebar", ui.dialog).hide();
		},
		buttons: {
			"Yes": (function(){
				$("#messageModal").dialog("close");
				deleteAction(parameter, this);
			}).bind(this),
			"Cancel": (function(){
				$("#messageModal").dialog("close");
			}).bind(this)
		}
	});
}

Lrn.Application.resourceCenter.prototype.addResourceClick = function(e){
	e.preventDefault();
	
	var resourceType = $('#newResourceType').val();
	
	//apply the rule change
	$("#newResourceValue").rules("remove");
	this.resourceRuleValidateChange("#newResourceValue", resourceType);
	
	
	//fix IE8-9 issue with placefolder
	if(true == $.browser.msie && ('8' == $.browser.version.substring(0,1) || '9' == $.browser.version.substring(0,1))){
		$('#resourceMgrForm').find('input[type=text], textarea').each(function (){
            if($(this).val() == $(this).attr('placeholder')){
                $(this).val('');
                $(this).removeClass('placeholder');
            }
        });
		
		$("#newResourceLabel").rules("add",{
			 required: true
		});
	}
	
	var validStatus = $('#resourceMgrForm').valid();

	if(true == validStatus){
		//Display loading spinner
		this.displayAlert('ajax-loader.gif','Loading');
		
		var serialFormData = $('#resourceMgrForm').serializeArray();

		//Start ajax save request
	    request = $.ajax({
	        url: "/admin/resources",
	        type: "post",
	        data: serialFormData.concat([{name:'lang', value:this.lang}]),
	        dataType: "json",
	        timeout: 10000,
	        async: false,
	        success: (function(response){
	        	if (true == response.success){
		    		this.displayAlert('done.jpg', 'Saved');
		    		this.closeAlert(1000);
		    		this.addNewRecordToDT(this.htmlTableId, $('#resourceMgrForm'));
		    		
		    		//temporary solution to refresh the data
		    		this.langResourcesLoad(this.lang);
		    		
		    		this.displayAlert('done.jpg', 'Saved');
		    		this.closeAlert(1000);
		    		

		    		//reset the add form
		    		$('#resourceMgrForm')[0].reset();
		    		//hide the fileupload UI
		    		$('#fileuploaddiv').hide();
		    		$('#videofileuploaddiv').hide();
		    		$(this.htmlNewVideoThumbnail).attr('src',CDN_IMG_URL +'/images/placeholders/video-placeholder.png');
		    		$(this.htmlNewVideoThumbnail).hide();
		    		$(this.htmlNewRCValueField).show();
		    		$('#newresourcecentercustomfile').text('Add document');
		    		
		    	}else{
		    		this.displayAlert('error.png', 'Failed');
		    		this.closeAlert(1000);
		    	}
	        	
	        	//regenerate the fixed dataTable header
	        	this.handleFixedHeaders();
		    	
	        	//closing the load spinner after success return by delay 200 msecond to close 
	        	this.closeAlert(200);
	        }).bind(this),
	        error: (function(jqXHR, textStatus, errorThrown){
	        	//closing the load spinner when error happened
	        	this.closeAlert(0);
	        	
	        	if ('timeout' === textStatus){
	        		this.displayAlert('error.png', 'Connection timeout!');
	        	}else{
	        		this.displayAlert('error.png', 'Connection failed!');
	        	}
	        	this.closeAlert(1000);
	        	
	        }).bind(this)
	    });

	    //IE fix when form submit placeholder not placing back
	    this.ie89PlaceholderFix();

	} 
}

//cancel button click
Lrn.Application.resourceCenter.prototype.cancelUpdate = function(){
	$(this.htmlCancelResourceId).click((function(){
		if (true == this.editRowClickStatus || $(this.htmlTableIdEdit).find('td input:checkbox:checked').length > 0){
			this.langResourcesLoad(this.lang);
			this.editRowClickStatus = false;
		}
	}).bind(this));
}

//delete resources function
Lrn.Application.resourceCenter.prototype.deleteResource = function(groupIds, resourceObj){
	//Display loading spinner
	resourceObj.displayAlert('ajax-loader.gif','Loading');
	
	//Start ajax delete request
    request = $.ajax({
        url: "/admin/resources",
        type: "post",
        data: {action:'deleteResources',groupId:groupIds},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: function(response){
    		//temporary solution to refresh the data
        	resourceObj.langResourcesLoad(resourceObj.lang);
    		
        	resourceObj.displayAlert('done.jpg', 'Saved');
        	resourceObj.closeAlert(1000);
        },
        error: function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	resourceObj.closeAlert(0);
        	
        	if ('timeout' === textStatus){
        		resourceObj.displayAlert('error.png', 'Connection timeout!');
        	}else{
        		resourceObj.displayAlert('error.png', 'Connection failed!');
        	}
        	resourceObj.closeAlert(1000);
        }
    });
}

Lrn.Application.resourceCenter.prototype.setupNewResourceFormValidate = function(){
	$('#resourceMgrForm').validate({
		rules:{
			newResourceVisibility : {
				required: true
			},
			newResourceType : {
				required: true
			},
			newResourceLabel : {
				required: true
			},
			newResourceValue : {
				required: true
			}
		},
		ignore: []
	});	
}

Lrn.Application.resourceCenter.prototype.addNewResourceUploadTypeInit = function(){
	$(this.htmlNewRCTypeField).on("change",{thisObj:this}, function(e){
		if($(e.data.thisObj.htmlNewRCTypeField).val() == 'email')
			$(e.data.thisObj.htmlNewRCValueField).attr('maxlength',80);
		else if($(e.data.thisObj.htmlNewRCTypeField).val() == 'phone')
			$(e.data.thisObj.htmlNewRCValueField).attr('maxlength',25);
		else 
			$(e.data.thisObj.htmlNewRCValueField).removeAttr('maxlength');
		var settings = $('#resourceMgrForm').validate().settings;
		if(settings.rules){
			$.each(settings.rules, function(index, element) {
				$("#"+index).rules("remove");				
			});
		}		
		
		//show and display the fileupload for document or video
		if('doc' == $(e.data.thisObj.htmlNewRCTypeField).val()){
			$('#fileuploaddiv').show();
			$('#videofileuploaddiv').hide();
			$('#newResourceValue').show();
			$('#newVideoImg').attr('src', CDN_IMG_URL  + '/images/placeholders/video-placeholder.png').hide();
			$('#newRCVideoThumbnailcustomfile').val('');
			$('#rewRCCustomfile').val('');
		}else if('video' == $(e.data.thisObj.htmlNewRCTypeField).val()){
			$('#videofileuploaddiv').show();
			$('#newRCVideocustomfileBtn').html('Add video');
			$('#fileuploaddiv').hide();
			$('#newResourceValue').hide();
			$('#newVideoImg').css('display','inline-block').show();
			$('#rewRCCustomfile').val('');
		}else{
			$('#fileuploaddiv').hide();
			$('#videofileuploaddiv').hide();
			$('#newResourceValue').show();
			$('#newVideoImg').attr('src',CDN_IMG_URL + '/images/placeholders/video-placeholder.png').hide();
			$('#newRCVideoThumbnailcustomfile').val('');
			$('#rewRCCustomfile').val('');
		}
		
		//regenerate the fix dataTable header due to header is change position when changing the resource type
		if(parseInt($.browser.version, 10) !== 8 || !$.browser.msie){
			e.data.thisObj.handleFixedHeaders();
		}
	});
	
	//initial the fileupload tool
	this.addVideoFileUploadInit();
}

//enable or disable the video thumbnail button
Lrn.Application.resourceCenter.prototype.addNewResourceValueChangeInit = function(){
	$(this.htmlNewRCValueField).on('change', (function(e){
		if('video' == $(this.htmlNewRCTypeField).val() && "" != $(this.htmlNewRCValueField)){
			$(this.htmlAddVideoThumbnailBtnId).show();
			$(this.htmlAddVideoBtnId).html('Replace video');
		}else{
			$(this.htmlAddVideoThumbnailBtnId).hide();
			$(this.htmlAddVideoBtnId).html('Add video');
		}
	}).bind(this));
	
	//regenerate the fix dataTable header due to header is change position when changing the video image thumbnail
	$(this.htmlNewVideoThumbnail).on('load',{thisObj:this}, function (e) {
		if(parseInt($.browser.version, 10) !== 8 || !$.browser.msie){
			e.data.thisObj.handleFixedHeaders();
		}
	});
}



//initiate the video upload 
Lrn.Application.resourceCenter.prototype.addVideoFileUploadInit = function(){
	//add video click
	$(this.htmlAddVideoBtnId).click((function(e){
		e.preventDefault();
		
		this.startFileUpload(this.htmlAddVideoBtnId, this.htmlHiddenRCCustomFile, this.htmlNewRCValueField);
	}).bind(this));
	
	$(this.htmlAddVideoThumbnailBtnId).click((function(e){
		e.preventDefault();
		
		this.startFileUpload(this.htmlAddVideoThumbnailBtnId, this.htmlHiddenRCThumbnailCustomFile);
	}).bind(this));
}

Lrn.Application.resourceCenter.prototype.addNewRecordToDT = function(tableId, addForm){
	var newRecord = {
		title : addForm.find('#newResourceLabel').val(),
		text : addForm.find('#newResourceValue').val(),
		description : addForm.find('#newResourceDescription').val(),
		visibilityText : addForm.find('#newResourceVisibility option:selected').text(),
		typeText : addForm.find('#newResourceType option:selected').text()
	};
	
	var oTable = $(tableId).dataTable();
    oSettings = oTable.fnSettings();

    oTable.oApi._fnAddData(oSettings, newRecord);
    oTable.fnDraw();
}

//function to refesh data from the server
Lrn.Application.resourceCenter.prototype.loadServerData = function(langCode){
	//Display loading spinner
	this.displayAlert('ajax-loader.gif','Loading');
	
	//Start ajax loading request
    request = $.ajax({
        url: "/admin/resources",
        type: "post",
        data: {action:'getResource', lang:langCode},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: (function(response){
        	this.resourcesData = this.htmlEncodeRecords(response);
        	this.editResourceData = this.buildEditSource(response);
        	this.reorderData = this.buildReorderSource(response);
        	this.setupValueMap(response);
        	//close the spinner loading
        	this.closeAlert(500);
			$('#newResourceLabel').val('');
			$('#newResourceDescription').val('');
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	this.closeAlert(0);
        	
        	if ('timeout' === textStatus){
        		this.displayAlert('error.png', 'Connection timeout!');
        	}else{
        		this.displayAlert('error.png', 'Connection failed!');
        	}
        	this.closeAlert(1000);
        	
        }).bind(this)
    });
}


//function build edit source data
Lrn.Application.resourceCenter.prototype.buildEditSource = function(resourceData){
	var tempRecords = jQuery.extend(true, {}, resourceData);
	
    for (var i in tempRecords.aaData){
    	var text = '';
    	if (tempRecords.aaData[i].type == 'video'){
    		var path = '';
    		var thumbnailExisted = false;
    		
    		if ("" != tempRecords.aaData[i].thumbnailfilePath  && null != tempRecords.aaData[i].thumbnailfilePath){
    			path = this.baseUrl+tempRecords.aaData[i].thumbnailfilePath;
    			thumbnailExisted = true;
    		}else{
    			path = this.resourceVideoImagePath(tempRecords.aaData[i].customfilePath);
    		}
    		
    		text = '<div class="resourceVideoImg"><img class="videoImage editThumbnailImage" data-thumbnailexisted="' +thumbnailExisted+ '" src="' +path+ '" id="vidimg'+tempRecords.aaData[i].groupId+'" title="Tip: Click on the image to replace thumbnail." data-defaultimage="'+this.resourceVideoImagePath(tempRecords.aaData[i].customfilePath)+'"></img></div><div class="textEdit" data-resource="true" style="display:none" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":' +tempRecords.aaData[i].textId+ ', "component":"text"}\'>' +escapeHtml(tempRecords.aaData[i].customfileTitle)+ '</div>';
    	}else{
    		text = '<div class="resourceVideoImg" style="display:none"><img class="videoImage editThumbnailImage" data-thumbnailexisted="false" src="'+CDN_IMG_URL+'/images/placeholders/video-placeholder.png" id="vidimg'+tempRecords.aaData[i].groupId+'" title="Tip: Click on the image to replace thumbnail." data-defaultimage="" ></img></div><div class="textEdit" data-resource="true" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":' +tempRecords.aaData[i].textId+ ', "component":"text"}\'>' +escapeHtml(tempRecords.aaData[i].text)+ '</div>';
    	}
    	
    	text += '<div class="editButtonPanel" style="display:none"><button class="replaceVideoBtn gradient adminBlueBtn">Replace video</button><button class="clearVideoThumbnailBtn gradient adminBlueBtn" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'"}\'>Clear image</button></div>';
    	
    	tempRecords.aaData[i].checkbox = '<input type="checkbox" class="checkBox" data-groupid="' +tempRecords.aaData[i].groupId+ '" data-visibiltyid=' +tempRecords.aaData[i].visibilityId+ ' data-position="' +tempRecords.aaData[i].position+ '"> <i class="fa fa-trash-o deleteSingleRow adminColor" data-groupid="' +tempRecords.aaData[i].groupId+ '" style="cursor:pointer"></i><i class="material-icons deleteSingleRow adminColor" data-groupid="' +tempRecords.aaData[i].groupId+ '" style="cursor:pointer">&#xE872;</i>';
    	tempRecords.aaData[i].text = text;
    	tempRecords.aaData[i].title = '<div class="textEdit" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":' +tempRecords.aaData[i].titleId+ ', "component":"title"}\'>' +escapeHtml(tempRecords.aaData[i].title)+ '</div>';
    	tempRecords.aaData[i].type = '<div class="dropDownTypeEdit" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":'+tempRecords.aaData[i].typeId+', "component":"type"}\'>' +escapeHtml(tempRecords.aaData[i].type)+ '</div>';
    	tempRecords.aaData[i].typeText = '<div class="dropDownTypeEdit" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":'+tempRecords.aaData[i].typeId+', "component":"type"}\'>' +escapeHtml(tempRecords.aaData[i].typeText)+ '</div>';
    	tempRecords.aaData[i].visibility = '<div class="dropDownVisibilityEdit" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":'+tempRecords.aaData[i].visibilityId+', "component":"visibility"}\'>' +escapeHtml(tempRecords.aaData[i].visibility)+ '</div>';
    	tempRecords.aaData[i].visibilityText = '<div class="dropDownVisibilityEdit" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":'+tempRecords.aaData[i].visibilityId+', "component":"visibility"}\'>' +escapeHtml(tempRecords.aaData[i].visibilityText)+ '</div>';
    	tempRecords.aaData[i].description = '<div class="textAreaEdit" data-prop=\'{"groupId":"'+tempRecords.aaData[i].groupId+'", "id":'+tempRecords.aaData[i].descriptionId+', "component":"description"}\'>' +escapeHtml(tempRecords.aaData[i].description)+ '</div>';
    }
    
    return tempRecords;
}

//function build reorder source datas
Lrn.Application.resourceCenter.prototype.buildReorderSource = function(resourceData){
	var tempRecords = jQuery.extend(true, {}, resourceData);
	var sourceData = {loginPage:{aaData:[]}, rightSidebar:{aaData:[]}, resourcePage:{aaData:[]}};
	var count = {loginPage:0, rightSidebar:0, resourcePage:0};
	
    for (var i in tempRecords.aaData){
    	if ("undefined" != typeof count[tempRecords.aaData[i].visibility]){
    		++count[tempRecords.aaData[i].visibility];
    		tempRecords.aaData[i]["DT_RowId"] = 'row_'+count[tempRecords.aaData[i].visibility];
    		tempRecords.aaData[i]["index"] = count[tempRecords.aaData[i].visibility];
    		sourceData[tempRecords.aaData[i].visibility].aaData.push(tempRecords.aaData[i]);
    		
    		if ('resourcePage' != tempRecords.aaData[i].visibility ){
    			++count['resourcePage'];
    			
    			var keytempRecords = jQuery.extend(true, {}, tempRecords.aaData[i]);
    			keytempRecords["DT_RowId"] = 'row_'+count['resourcePage'];
    			
    			sourceData['resourcePage'].aaData.push(keytempRecords);
    		}
    	}else{
    		$.each(count, function(key, value){
    			var keytempRecords = jQuery.extend(true, {}, tempRecords.aaData[i]);
    			
    			++count[key];
    			keytempRecords["DT_RowId"] = 'row_'+count[key];
    			keytempRecords["index"] = count[key];
    			sourceData[key].aaData.push(keytempRecords);
    		});
    	}
    }
    
    sourceData = this.sortReorderRecords(sourceData, tempRecords['positioning']);

    //assign the count to variable
    this.countResources = count;
    
    return sourceData;
}

Lrn.Application.resourceCenter.prototype.bulkActionInit = function(){
	$(this.htmlBulkActionBtnId).click((function(){
		var groupIds = [];
		var bulkUpdate = [];
		var lang = this.lang;
		var bulkAction = $(this.htmlBulkActionId).val();
		
		$(this.htmlTableIdEdit).find('td input:checkbox:checked').each(function(){
			groupIds.push($(this).data('groupid'));
			
			bulkUpdate.push({
				id: $(this).data('visibiltyid'),
				language: lang,
				type: 'visibility',
				value: bulkAction,
				postion: $(this).data('position'),
				groupId:$(this).data('groupid'), 
			});
		});

		if ('delete' == bulkAction){
			var deleteText = "You are about to delete the resources which will permanently remove it. Are you sure you want to do that?";
			
			if (groupIds.length > 0){
				this.deleteConfirm(this.deleteResource, groupIds, deleteText);
			}
		}else if("" != bulkAction) {
			if(bulkUpdate.length > 0){
				this.updateResource(bulkUpdate);
			}
		}
	}).bind(this));
}

Lrn.Application.resourceCenter.prototype.deleteRowInit = function(){
	$(this.htmlTableIdEdit).find('.deleteSingleRow').click({resourceObj:this},function(e){
		e.stopPropagation();
		
		var deleteText = "You are about to delete a resource which will permanently remove it. Are you sure you want to do that?";
		e.data.resourceObj.deleteConfirm(e.data.resourceObj.deleteResource, [$(this).data('groupid')], deleteText);
	});
}

Lrn.Application.resourceCenter.prototype.documentUpdateInit = function(clickedRow){
	var lunchFileTool = function(clickedField, resouceField, resourceObj){
		var resourceType = $(clickedField).closest('td').siblings().find('div.dropDownTypeEdit').find('select').val();
		resourceObj.frontFileTool.setFileType(resourceType);
		resourceObj.frontFileTool.refreshTab();
		
		if ('doc' == resourceType || 'video' == resourceType){
			//open the file upload
	        Lrn.Widgets.FileTool.updateConfigs({
	            returnField: $('#updateRowFile_id'),
	            returnFileNameField: $(resouceField),
	            configType: ('doc' == resourceType ? 'doc' : 'vid'),
	            getfile: 'Yes',
	            returnImg: 'Yes',
	            returnSourceFile: true
	        });
	        Lrn.Widgets.FileTool.open();
	        var titlebar = $(".ui-dialog-titlebar");
	        titlebar.show();
	        $('.ui-dialog-titlebar-close',titlebar).show();
		}
	}
	
	/*
	 * bind the lunch fileTool to click on resource field
	 */
	//unbind previous click action
	$(clickedRow).find('td div[data-resource=true]').find('input').unbind('click focus blur');
	$(clickedRow).find('td div[data-resource=true]').find('input').on('click focus', {resourceObj:this}, function(e){
		lunchFileTool(this, this, e.data.resourceObj);
	});
	
	/*
	 * bind the lunch fileTool to click the replace video button
	 */
	//unbind previous click action
	$(clickedRow).find('td button.replaceVideoBtn').unbind('click');
	$(clickedRow).find('td button.replaceVideoBtn').on('click', {resourceObj:this}, function(e){
		lunchFileTool(this, $(clickedRow).find('td div[data-resource=true]').find('input'), e.data.resourceObj);
	});
	
	//toggle the thumbnail button
	this.toggleClearAddVideoThumbBtn($(clickedRow).find('td button.clearVideoThumbnailBtn'));
	
	/*
	 * bind the clear video thumbnail button
	 */
	$(clickedRow).find('td button.clearVideoThumbnailBtn').unbind('click');
	$(clickedRow).find('td button.clearVideoThumbnailBtn').on('click', {resourceObj:this}, this.clearThumbnailClick);
	
	//display the replace and remove video buttons
	if('video' == $(clickedRow).find('div.dropDownTypeEdit select').val()){
		$(clickedRow).find('div.editButtonPanel').show();
	}
	
	//ie fix for fire focus when render the editor
	$(this.htmlTableIdEdit).find('td div[data-resource=true]').find('input').blur(function(e){
		$(this).unbind('blur');
		$('#fileTool').dialog('close');
	});
}

//will implement this later
//Lrn.Application.resourceCenter.prototype.updateDatatableSource = function(resourceData, updateRecord, editStatus){
//	var typeText = "";
//	if ('type' == updateRecord['componentType'] || 'visibility' == updateRecord['componentType']){
//		var typeText = updateRecord['componentType']+ 'Text';
//	}
//	
//	if(true != editStatus){
//		var value = "";
//		if("" != typeText){
//			value = updateRecord['value'];
//		}else{
//			value = updateRecord['value'];
//		}
//		resourceData.aaData[updateRecord['tableId']][updateRecord['componentType']] =  updateRecord['value'];
//	}
//}

//function to initiate the inline editor
Lrn.Application.resourceCenter.prototype.initInlineEditor = function(){

	$(this.htmlFrameTableIdEdit).find('tr').click({resourceObj:this}, function(e){
		//change the row status have clicked
		e.data.resourceObj.editRowClickStatus = true;
		
		//enable the whole row edit
		$(this).children().find('div:not(:has(> img,button))').dblclick().show();
		
		//bind the onchange to each row input
		$(e.data.resourceObj.htmlTableIdEdit).find("form > input, select, textarea").unbind("change keypress");
		$(e.data.resourceObj.htmlTableIdEdit).find("form > input, select, textarea").change({resourceObj:e.data.resourceObj}, function(e) {
			var updateValue = $(this).closest('div').data('prop');
			var updateStatus = false;
			
			/*
			 * apply validate rule to inline edit
			 */
			$(this).closest('form').validate();
			switch (updateValue.component){
				case 'title':
					$(this).rules("add",{
						 required: true
					});
					
					break;
					
				case 'text': //this is resource box
					e.data.resourceObj.resourceRuleValidateChange(this, $(this).closest('td').siblings().find('div.dropDownTypeEdit').find('select').val());
					
					break;
					
				case 'type':
					$(this).closest('td').siblings().find('div[data-resource=true] input').change();
					
					//handling the show or hide thumbnail imag tag
					if ('video' == $(this).val()){
						$(this).closest('td').siblings().find('div[data-resource=true]').siblings('div').show();
					}else{
						$(this).closest('td').siblings().find('div[data-resource=true]').siblings('div').hide();
					}
						
					break;
			}

			updateStatus = $(this).valid();
			
			if(updateStatus){
				//validate handle
				e.data.resourceObj.removeError(updateValue.component+updateValue.groupId);
				if(true == e.data.resourceObj.emptyError()){
					//enable save button when the is no more validate error
					e.data.resourceObj.enableSaveBtn(true);
				}
				
				e.data.resourceObj.updateValueMap(true, updateValue.groupId, updateValue.component, $(this).val());
			}else{
				//push one more error validate to the error store
				e.data.resourceObj.addError(updateValue.component+updateValue.groupId)
				
				//disable save button when there is error
				e.data.resourceObj.enableSaveBtn(false);
			}

			//when customfile have updated
			if (('doc' == $(this).closest('td').siblings().find('div.dropDownTypeEdit').find('select').val() || ('video' == $(this).closest('td').siblings().find('div.dropDownTypeEdit').find('select').val()))
					&& true == $(this).closest('div').data('resource')){
				e.data.resourceObj.updateValueMap(true, updateValue.groupId, 'customfile', $('#updateRowFile_id').val());
				
				//update image source for video if there is no customize image
				if('video' == $(this).closest('td').siblings().find('div.dropDownTypeEdit').find('select').val() && false == $(this).closest('div').siblings('div').find('img').data("thumbnailexisted")){
					$(this).closest('div').siblings('div').find('img').attr('src', $(this).val());
				}
				
				//extract only title
				if('video' == $(this).closest('td').siblings().find('div.dropDownTypeEdit').find('select').val()){
					
					//set the defaultImage data to new value
					$(this).closest('div').siblings('div').find('img').data('defaultimage', $(this).val());
					
					var n = $(this).val().search('title=');
					if(n > -1){
						$(this).val($(this).val().split('?title=').pop());
					}
				}
				
				$('#updateRowFile_id').val('');
			}
			
		});
		
		//when enter key it should fire change too
		$(e.data.resourceObj.htmlTableIdEdit).find("form > input, select, textarea").keypress(function(e){
			 if (e.which == 13) {
				  $(this).change();
				  return false;
			 }
		});
		
		//check for the type document to render the customfile util
		e.data.resourceObj.documentUpdateInit(this);
	});
    
	//start to render the editable editor
	$('.textEdit').editable('', {
    	type    : 'text',
    	onblur	: 'ignore',
    	event	: 'dblclick',
    	height	: 'none',
    	width   : '100%',
    	tooltip : '',
    	name    : 'new_value'
    });
    
    $('.dropDownTypeEdit').editable('', {
    	type    : 'select',
    	onblur	: 'ignore',
    	event	: 'dblclick',
    	data    : this.resourceType,
    	placeholder :''
    });
    
    $('.textAreaEdit').editable('', {
    	type    : 'textarea',
    	onblur	: 'ignore',
    	event	: 'dblclick',
    	rows    : 3,
    	height	: 'none',
    	placeholder :''
    });
    
    $('.dropDownVisibilityEdit').editable('', { 
        type    : 'select',
        onblur	: 'ignore',
        event	: 'dblclick',
        data    : this.visibilityType,
        placeholder :''
    });
    
    //initial the fileupload for the thumbnail image
	$('.editThumbnailImage').on("click", {updateFieldId:this.htmlUpdateThumbnailHiddenField, tempFieldImageId:this.htmlUpdateThumbnailFilenameHiddenField, frontFileTool:this.frontFileTool}, function(e){
		//update the property groupId for later use
		var updateValue = $(this).closest('div').siblings('div').data('prop');
		$(e.data.updateFieldId).prop('groupid', updateValue.groupId);
		$(e.data.tempFieldImageId).val($(this).prop('id'));
		var dims = {width:640,height:480};
		
		e.data.frontFileTool.setFileType('img');
		e.data.frontFileTool.setCropHeightWidth(dims.height, dims.width);
		e.data.frontFileTool.refreshTab();
		
		//open the file upload
        Lrn.Widgets.FileTool.updateConfigs({
            cropWidth: dims.width,
            cropHeight: dims.height,
            returnField: $(e.data.updateFieldId),
            returnFileNameField: null,
            configType: 'img',
            getfile: 'No',
            returnImg: this,
            returnSourceFile: true
        });
        
        Lrn.Widgets.FileTool.open();
        var titlebar = $(".ui-dialog-titlebar");
        titlebar.show();
        $('.ui-dialog-titlebar-close',titlebar).show();
	});
}

/*
 * group internal dataStructure Mapping Functions
 */
Lrn.Application.resourceCenter.prototype.setupValueMap = function(response)
{
	//reset map value to empty
	this.valueMap = [];

	for (var i = 0; i < response.aaData.length; i++){
		this.valueMap["gID" +response.aaData[i].groupId]={
			update: false,
			position: response.aaData[i].position,
			data: {
				title : {id: response.aaData[i].titleId, oldValue: response.aaData[i].title, newValue: response.aaData[i].title},
				text : {id: response.aaData[i].textId, oldValue: response.aaData[i].text, newValue: response.aaData[i].text},
				description : {id: response.aaData[i].descriptionId, oldValue: response.aaData[i].description, newValue: response.aaData[i].description},
				visibility : {id: response.aaData[i].visibilityId, oldValue: response.aaData[i].visibility, newValue: response.aaData[i].visibility},
				type : {id: response.aaData[i].typeId, oldValue: response.aaData[i].type, newValue: response.aaData[i].type},
				customfile : {id: response.aaData[i].customfileId, oldValue: response.aaData[i].customfile, newValue: response.aaData[i].customfile},
				thumbnail : {id: response.aaData[i].thumbnailfileId, oldValue: response.aaData[i].thumbnailfile, newValue: response.aaData[i].thumbnailfile},
				tableId: i
			}
		};
	}
}

Lrn.Application.resourceCenter.prototype.updateValueMap = function(updateStatus, groupId, component, newValue, oldValue){
	this.valueMap["gID" +groupId].update = updateStatus;
	this.valueMap["gID" +groupId].data[component].newValue = newValue;
	
	if("" != oldValue && "undefined" != typeof oldValue){
		this.valueMap["gID" +groupId].data[component].oldValue = oldValue;
	}
}

Lrn.Application.resourceCenter.prototype.getUpdateValues = function(){
	var updateValue = [];
	
	for (var resource in this.valueMap){
		if (true == this.valueMap[resource].update)
		{
			for (var component in this.valueMap[resource].data){
				if (this.valueMap[resource].data[component].newValue != this.valueMap[resource].data[component].oldValue 
				   && !(null == this.valueMap[resource].data[component].oldValue && "" == this.valueMap[resource].data[component].newValue)){
					updateValue.push({
						id: (this.valueMap[resource].data[component].id != null ? this.valueMap[resource].data[component].id: ''),
						language: this.lang,
						type: (component == 'type' ? 'rc_type' : component),
						value: this.valueMap[resource].data[component].newValue,
						postion: this.valueMap[resource].position,
						groupId: resource.substring(3)
					});
				}
			}
		}
	}
	
	return updateValue;
}

/*
 * reorder functions
 */

Lrn.Application.resourceCenter.prototype.reorderCollapseInitialize = function(resourceNumbers){
	var adminHeader = $('.adminSectionHeader');
    var adminContent = $('.adminSectionContent');

	$('.adminSection').accordion({
        active: false,
        collapsible: true,
        header: adminHeader,
        heightStyle: adminContent,
        activate: function(event, ui){
        	if(parseInt($.browser.version, 10) !== 8 || !$.browser.msie){
        		this.handleFixedHeaders();
        	}
        }.bind(this)
    });
}

Lrn.Application.resourceCenter.prototype.countResourceType = function(data){
	var rcCount=[];
	for (var i in data.aaData){
		if ("undefined" != typeof rcCount[data.aaData[i]["visibility"]]){
			++rcCount[data.aaData[i]["visibility"]];
		}else{
			rcCount[data.aaData[i]["visibility"]] = 1;
		}
	}
	
	return rcCount;
}

/*
 * end reorder function
 */

/*
 * helper function section
 */
//resource selector validate rule change according to the type change
Lrn.Application.resourceCenter.prototype.resourceRuleValidateChange = function(resourceInput, type){
	//remove all previous rules
	$(resourceInput).rules('remove');
	
	switch(type){
		case 'email':
			$(resourceInput).rules("add", {
				required:true,
				email: true,
			    maxlength: 80
			});
			break;
		case 'phone':
			$(resourceInput).rules("add", {
				required:true,
				maxlength: 25
			});
			break;
		case 'text':
			$(resourceInput).rules("add", {
				required:true
			});
			break;
		case 'url':
		case 'doc':
		case 'video':
			$(resourceInput).rules("add", {
				required:true,
				regex: "(^(http|https)://|mp4$|webm$)"
			});
			break;
	}
}

Lrn.Application.resourceCenter.prototype.enableSaveBtn = function(enable){
	if (true == enable){
		$(this.htmlSaveResourceId).removeClass("disabled").removeAttr("disabled");
	}else{
		$(this.htmlSaveResourceId).addClass("disabled").attr("disabled", "disabled");
	}
}

//error handeling function
Lrn.Application.resourceCenter.prototype.addError = function(key){
	this.errorStack[key] = true;
}

Lrn.Application.resourceCenter.prototype.removeError = function(key){
	delete this.errorStack[key];
}

Lrn.Application.resourceCenter.prototype.emptyError = function(){
	return $.isEmptyObject(this.errorStack);
}

Lrn.Application.resourceCenter.prototype.htmlEncodeRecords = function(records){
	var encodeRecords = jQuery.extend(true, {}, records);
	for (var i in encodeRecords.aaData){
		encodeRecords.aaData[i].text = escapeHtml(encodeRecords.aaData[i].text);
		encodeRecords.aaData[i].title = escapeHtml(encodeRecords.aaData[i].title);
		encodeRecords.aaData[i].description = escapeHtml(encodeRecords.aaData[i].description);
	}
	
	return encodeRecords;
}

Lrn.Application.resourceCenter.prototype.startFileUpload = function(btnId, returnElementFileId, returnElementFileValueId){
    // initialize file upload tool
    Lrn.Widgets.FileTool.init();
	this.frontFileTool.setFileType($(btnId).data('type'));
	this.frontFileTool.setCropHeightWidth(480, 640);
	this.frontFileTool.refreshTab();
    
    Lrn.Widgets.FileTool.updateConfigs({
        cropWidth: $(btnId).data('width'),
        cropHeight: $(btnId).data('height'),
        returnField: returnElementFileId,
        returnFileNameField: $(returnElementFileValueId),
        configType: $(btnId).data('type'),
        returnImg: this.htmlNewVideoThumbnail,
        getfile: 'Yes'
    });
    
    Lrn.Widgets.FileTool.open();

    var titlebar = $(".ui-dialog-titlebar");
    titlebar.show();
    $('.ui-dialog-titlebar-close',titlebar).show();
}

Lrn.Application.resourceCenter.prototype.sortReorderRecords = function(sourceRecord, positioning){
	$.each(sourceRecord, function(key, records){
		records.aaData.sort(function(a, b){
			var aGroupIndex = "undefined" != typeof positioning[key] ? positioning[key]['value'].indexOf(a['groupId']) : -1;
			var bGroupIndex = "undefined" != typeof positioning[key] ? positioning[key]['value'].indexOf(b['groupId']) : -1;
			
			if (aGroupIndex < 0 && bGroupIndex >= 0){
				return 1;
			}else if (aGroupIndex >= 0  && bGroupIndex < 0){
				return -1;
			}
			
			return aGroupIndex-bGroupIndex;
		});
		
		//rearrange the index
		for (var i in records.aaData){
			records.aaData[i].index = (i*1)+1;
		}

	});
	
	return sourceRecord;
}

Lrn.Application.resourceCenter.prototype.resourceVideoImagePath = function(rawPath){
	if ("" == rawPath || null == rawPath || "undefined" == typeof rawPath){
		return CDN_IMG_URL + '/images/placeholders/video-placeholder.png';
	} 
	
	var pathArr = rawPath.split('/');
	var filename = pathArr.pop();
		
	filename = filename.split('.')[0];
	return this.baseUrl+pathArr.join('/')+'/'+filename+'-00002.jpg';
}

Lrn.Application.resourceCenter.prototype.changeVideoThumnailToDefault = function(e){
	$('.videoImage').on('error',function(e){
		e.stopPropagation();
		e.preventDefault();
		$(this).attr('src', CDN_IMG_URL + '/images/placeholders/video-placeholder.png');
	});
}

Lrn.Application.resourceCenter.prototype.ie89PlaceholderFix = function(){
    //IE fix when form submit placeholder not placing back
	if(true == $.browser.msie && ('8' == $.browser.version.substring(0,1) || '9' == $.browser.version.substring(0,1))){
		$('#resourceMgrForm').find('input[type=text], textarea').each(function (){
			$(this).removeAttr("required");
			$(this).rules("remove");
			$(this).focus();
        });

		$('#addResourceBtn').focus();
	}
}

Lrn.Application.resourceCenter.prototype.clearThumbnailClick = function(e){
	if(true == $(this).closest('td').find('div img.videoImage').data('thumbnailexisted')){
		e.data.resourceObj.updateValueMap(true, $(this).data('prop').groupId, 'thumbnail', '');
		e.data.resourceObj.enableSaveBtn(true);
		
		$(this).closest('td').find('div img.videoImage').attr('src', $(this).closest('td').find('div img.videoImage').data('defaultimage'));
		$(this).closest('td').find('div img.videoImage').data('thumbnailexisted', false);
		e.data.resourceObj.toggleClearAddVideoThumbBtn(this);
	}else{
		//open the filetool by triger the Thumbnail Image click
		$(this).closest('td').find('.editThumbnailImage').click();
	}
}

Lrn.Application.resourceCenter.prototype.toggleClearAddVideoThumbBtn = function(button){
	if(false == $(button).closest('td').find('div img.videoImage').data('thumbnailexisted')){
		$(button).html(this.addImageText); 
	}else{
		$(button).html(this.clearImageText);
	}
}

Lrn.Application.resourceCenter.prototype.handleFixedHeaders = function() {
	//clear existing float headers
	this.clearAllDataTableFloatHeader();

	var tab = $(this.htmlTabsId).tabs('option', 'selected');
	
	switch (tab){
		case 0:
	        fh_0 = new FixedHeader($(this.htmlTableId).dataTable());
	        this.addDataTableHeader = $("div.FixedHeader_Cloned").children("table"+this.htmlTableId).parent();
	        $("div.FixedHeader_Cloned").addClass('addTabFixedHeader');
			break;
	    case 1:
	        fh_1 = new FixedHeader($(this.htmlTableIdEdit).dataTable());
	        this.editDataTableHeader = $("div.FixedHeader_Cloned").children("table"+this.htmlTableIdEdit).parent();
	        break;
	    case 2:
	    	if ('true' == $(this.htmlAccordionLoginId).find('div.ui-accordion-header').attr('aria-selected')){
	    		fh_2_1 = new FixedHeader($(this.htmlTableIdLogin).dataTable());
	    		this.orderDataTableLoginHeader = $("div.FixedHeader_Cloned").children("table"+this.htmlTableIdLogin).parent();
	    	}
	        
	    	if ('true' == $(this.htmlAccordionRightSideBar).find('div.ui-accordion-header').attr('aria-selected')){
	    		fh_2_2 = new FixedHeader($(this.htmlTableIdRightSidebar).dataTable());
	    		this.orderDataTableRightSideHeader = $("div.FixedHeader_Cloned").children("table"+this.htmlTableIdRightSidebar).parent();
	    	}
	        
	    	if ('true' == $(this.htmlAccordionResourceCenter).find('div.ui-accordion-header').attr('aria-selected')){
	    		fh_2_3 = new FixedHeader($(this.htmlTableIdResourCenter).dataTable());
	    		this.orderDataTableResourceHeader = $("div.FixedHeader_Cloned").children("table"+this.htmlTableIdResourCenter).parent();
	    	}
	        break;
	}
}

Lrn.Application.resourceCenter.prototype.handleChangeHeaderText = function(){
	var tab = $(this.htmlTabsId).tabs('option', 'selected');
	
	switch (tab){
		case 0:
			$(this.htmlResourceHeaderTextId).html(this.headerTexts.addTab);
			break;
	    case 1:
			$(this.htmlResourceHeaderTextId).html(this.headerTexts.editTab);
	        break;
	    case 2:
	    	$(this.htmlResourceHeaderTextId).html(this.headerTexts.reorderTab);
	        break;
	}
}

Lrn.Application.resourceCenter.prototype.clearAllDataTableFloatHeader = function() {
	//set back the header objects to null
	this.addDataTableHeader = null;
	this.editDataTableHeader = null;
	this.orderDataTableLoginHeader = null;
	this.orderDataTableRightSideHeader = null;
	this.orderDataTableResourceHeader = null;
	
	//remove existing float headers
	$("div.FixedHeader_Cloned").remove();
}

/*
 * end helper functions
*/
