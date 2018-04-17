if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
Lrn.Application.activeLabel = {};

//Initial valueMap for doing logic of checking value was changed or not
Lrn.Application.activeLabel = function(config)
{
    this.valueMap = [];
    this.deflang = '';
    this.lang = '';
    this.languageName = '';
    this.htmlTableId = '#labelList';
    this.htmlFrameTableId = '#dynamic';
    this.datatable = null;
    if(config){
    	//setting default language
    	this.lang = config.lang;
    	this.deflang = config.deflang;
    	this.languageName = config.langName;
    }
};

/**
 * --- activeLabel PROTOTYPE ---
 * We want to make Auth a subclass of Application so
 * we will set the activeLabel.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.activeLabel.prototype = new Lrn.Application();
Lrn.Application.activeLabel.prototype.superclass = Lrn.Application.prototype;

//initial the dataTable
Lrn.Application.activeLabel.prototype.init = function(){
	var activeLabel = this;
	activeLabel.initTable(this.htmlFrameTableId);
	
	//initial load data table to English language
	
	activeLabel.langLabelsLoad(activeLabel.lang, activeLabel.htmlTableId);
	activeLabel.hideColumnByLanguage(activeLabel.htmlTableId);
	
	//attach click event to save button
	$('#btnActiveLabelSave').click(activeLabel.saveChange.bind(activeLabel));
	Lrn.Applications = Lrn.Applications || {};
	Lrn.Applications.activeLabel = activeLabel;
};

Lrn.Application.activeLabel.prototype.initTable = function(frameTableId)
{
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
	this.superclass.init.apply(this);
	
	//disable the notification first
	$('#langNotification').css('display', 'none');
	
	//setting default language
	//this.lang = this.superclass.defaultLanguage;
	//this.languageName = this.superclass.defaultLanguageName;
	
	//changing the notice language box text
	$('#languageNameId').text(this.languageName);
	
	$(frameTableId).html('<table cellpadding="0" cellspacing="0" border="0" class="display" width="100%" id="labelList"></table>');
	this.datatable = $(this.htmlTableId).dataTable({
		"aaData": null,
		"bStateSave": true,
        "sPaginationType": "full_numbers",
		"aoColumns": [
			{"mData": "defaultField", "sTitle": "Default field name", "bSortable": true, "bSearchable": true},
			{"mData": "suggestTranlation", "sTitle": "Suggested translation", "bSortable": true, "bSearchable": true},
			{"mData": "customEng", "sTitle": "Custom english text", "bSortable": true, "bSearchable": true},
			{"mData": "customOtherLang", "sTitle": "Custom other text", "bSortable": false, "bSearchable": true}
		],
		"fnDrawCallback": function(oSettings){
			$('#labelList_previous').attr("class", "paginate_enabled_previous");
			$('#labelList_next').attr("class", "paginate_enabled_next");
			$("#labelList_paginate > span").attr("style", "float:left");
			$('#labelList_length').attr('class', 'secondaryBgColor dataTables_length');
			$('#labelList_filter').attr('class', 'secondaryBgColor dataTables_filter');
			$('#labelList > thead').attr('class', 'secondaryBgColor');
			
			var l = Math.ceil(oSettings.aoData.length/oSettings._iDisplayLength);
			var page = Math.ceil(oSettings._iDisplayStart/oSettings._iDisplayLength);
			
			if(page === 0){
				$('#labelList_previous').attr("class", "paginate_disabled_previous");
			}else if(page === l-1){
				$('#labelList_next').attr("class", "paginate_disabled_next");
			}
		}
	});
	
	//setup the language dropbox box to inial the reload active label data
	if ($('#selectLang').length > 0){
		//display the notication box
		$('#langNotification').css('display', 'block');
		
		$('#selectLang').change((function(){
			var reload = function(labelObject){
				//change language property when the dropdown box changed 
				labelObject.lang = $('#selectLang :selected').val();
				labelObject.languageName = $('#selectLang :selected').text();
				
				labelObject.langLabelsLoad(labelObject.lang, labelObject.htmlTableId);
				labelObject.hideColumnByLanguage(labelObject.htmlTableId, labelObject.lang);
				
				$('#btnActiveLabelSave').addClass("disabled").attr("disabled", "disabled");
				
				//changing the notice language box text
				$('#languageNameId').text(labelObject.languageName);			
			};
			
			if ($('#btnActiveLabelSave').is(':disabled')){
				reload(this);
			}else{
				this.saveConfirm(reload);
			}
		}).bind(this));
	}
	
	//Try to add the Sale All button to the navigation dataTable
	$('<input type="button" value="Save all" id="btnActiveLabelSave" class="button blue disabled" disabled>').insertAfter('#labelList_info');
};

Lrn.Application.activeLabel.prototype.langLabelsLoad = function(langCode, dataTableId)
{	
	//Display loading spinner
	this.displayAlert('ajax-loader.gif','Loading');
	
	//Start ajax loading Active labels request
    request = $.ajax({
        url: "/admin/langlabels",
        type: "post",
        data: {action:'getLabel', lang:langCode},
        dataType: "json",
        timeout: 10000,
        async: false,
        success: (function(response){
        	this.dynamicLoad(dataTableId, response);
        	
        	//closing the load spinner after success return by delay 200 msecond to close 
        	this.closeAlert(200);
    		
        	this.setupValueMap(response);
        }).bind(this),
        error: (function(jqXHR, textStatus, errorThrown){
        	//closing the load spinner when error happened
        	this.closeAlert(0);
        	
        	if ('timeout' === textStatus){
        		this.displayAlert('error.png', 'Connection Timeout!');
        	}else{
        		this.displayAlert('error.png', 'Connection Failed!');
        	}
        	this.closeAlert(1000);
        	
        }).bind(this)
    });
    
    /*
     * set the change event to every custom label input box
     */
	$('.activeLabelClass').live("change", this.valueMap, function(e){
		var target = e.target || e.srcElement;
		var $this = $(target);
		var tr = $this.parents('tr');
		//change the new update value to the valueMap
		e.data[$this.attr('id')].newValue = $this.val();
		
		if(tr[0]){
			var data = this.datatable.fnGetData(tr[0]);
			var idx = this.datatable.fnGetPosition( tr[0] );
			
			switch(tr.children().length){
			case 2:
				data.customEng = escapeHtml($this.val());
				data.customOtherLang = data.customOtherLang.replace(/value=\"[^\"]*\"/ig,'value="'+escapeHtml($this.val())+'"');
			break;
			default:
				data.customOtherLang = data.customOtherLang.replace(/value=\"[^\"]*\"/ig,'value="'+escapeHtml($this.val())+'"');
			break;
			}
			
			this.datatable.fnUpdate(data, idx, undefined, false, false);
		}
	}.bind(this));
	
	//enable SaveAll Button	
	$(this.htmlTableId).delegate("input", "keyup paste cut change", function(){
		$('#btnActiveLabelSave').removeClass("disabled").removeAttr("disabled");
	});

};

Lrn.Application.activeLabel.prototype.dynamicLoad = function(tableId, data)
{
	var oTable = $(tableId).dataTable();
    var oSettings = oTable.fnSettings();
     
    oTable.fnClearTable(this);

    for (var i in data.aaData){
    	var rowData = jQuery.extend({}, data.aaData[i]);
    	rowData.customOtherLang = '<input type="text" value="' +escapeHtml(data.aaData[i].customOtherLang)+ '" id="activeLabel' +data.aaData[i].translationKeyId+ '" class="activeLabelClass">';
    	oTable.oApi._fnAddData(oSettings, rowData);
    }

    oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
    oTable.fnDraw();
};

Lrn.Application.activeLabel.prototype.setupValueMap = function(response)
{
	//reset map value to empty
	this.valueMap = [];

	for (var i = 0; i < response.aaData.length; i++){
		this.valueMap['activeLabel' + response.aaData[i].translationKeyId] = {newValue:response.aaData[i].customOtherLang , oldValue:response.aaData[i].customOtherLang, translationKey:response.aaData[i].translationKey, translationId:response.aaData[i].translationId};
	}
	
};

Lrn.Application.activeLabel.prototype.checkChangedLabels = function(labelMapValue)
{
	if (typeof labelMapValue !== "undefined"){
		if (labelMapValue.oldValue != labelMapValue.newValue){
			return true;
		}
	}
	
	return false;
};

Lrn.Application.activeLabel.prototype.setLabelValue = function(translationKeyId, newValue)
{
	this.valueMap['activeLabel' + translationKeyId].newValue = newValue;
};

Lrn.Application.activeLabel.prototype.updateMapValueWithResponse = function(data)
{
	for (var i in data){
		this.valueMap['activeLabel' + data[i].translationKeyId].translationId = data[i].translationId;
		this.valueMap['activeLabel' + data[i].translationKeyId].oldValue = data[i].translationValue;
	}
};

/*
 * To hide the colums when it is default Enlish language
 */
Lrn.Application.activeLabel.prototype.hideColumnByLanguage = function(tableId, lang)
{
	var oTable = $(tableId).dataTable();
	var oSettings = oTable.fnSettings();
	
	if ("undefined" == typeof(this.lang) || this.deflang == this.lang){
		oTable.fnSetColumnVis(1, false);
		oTable.fnSetColumnVis(2, false);
		$($(tableId+' th')[1]).text('Custom English text');
	}else{
		oTable.fnSetColumnVis(1, true);
		oTable.fnSetColumnVis(2, true);
		$($(tableId+' th')[1]).text('Suggested translation');
		$($(tableId+' th')[2]).text('Custom English text');
		$($(tableId+' th')[3]).text('Custom ' +this.languageName+ ' text');
	}
	oTable.fnDraw();
};

/*
 * Process Save change only the updated Label when the Save button click
 */
Lrn.Application.activeLabel.prototype.saveChange = function()
{
	var postObj = [];
	
	for (var label in this.valueMap){
		if (this.checkChangedLabels(this.valueMap[label])){
			postObj.push({lang:this.lang, translationKey:this.valueMap[label].translationKey, translationId:this.valueMap[label].translationId, value:this.valueMap[label].newValue});
		}
	}
	
	if (0 < postObj.length){
	    request = $.ajax({
		    url: "/admin/langlabels",
		    type: "post",
		    data: {action:'saveLabel', customValues:postObj},
		    dataType: "json",
		    async: false,
		    timeout: 10000,
		    success: (function(response){
		    	if (true == response.success){
		    		this.displayAlert('done.jpg', 'Saved');
		    		this.closeAlert(1000);
		    		this.updateMapValueWithResponse(response.data);
		    		$('#btnActiveLabelSave').addClass("disabled").attr("disabled", "disabled");
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
	}else{
		//Showing successful save to user even nothing to save
		this.displayAlert('done.jpg', 'Saved');
		this.closeAlert(1000);
	}
};

Lrn.Application.activeLabel.prototype.displayAlert = function(imageName, alertText)
{
	//Display loading spinner
	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/' +imageName+ '"  width=50 height=50/></span>' +alertText+ '</p>');
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

Lrn.Application.activeLabel.prototype.closeAlert = function(delay)
{
	setTimeout(function(){
		$("#messageModal").dialog("close");
	}, delay);
};

Lrn.Application.activeLabel.prototype.saveConfirm = function(reload)
{	
	//Display asking save confirmation
	$("#messageModal").html('<p class="messageModalText">Do you want to save change?</p>');
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
				this.saveChange();
				reload(this);
			}).bind(this),
			"No": (function(){
				$("#messageModal").dialog("close");
				reload(this);
			}).bind(this),
			"Cancel": (function(){
				$("#messageModal").dialog("close");
				$('#selectLang').val(this.lang);
			}).bind(this)
		}
	});
};