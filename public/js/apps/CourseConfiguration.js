if (typeof (Lrn) == 'undefined')
	Lrn = {};
if (typeof (Lrn.Application) == 'undefined')
	Lrn.Application = {};

Lrn.Application.CourseConfiguration = function(config) {
	if (!this.__proto__)
		this.__proto__ = this;
	for ( var i in this.__proto__) {
		if (this.__proto__.hasOwnProperty(i))
			this[i] = this.__proto__[i];
	}
	this.init(config);

};

/**
 * --- CourseConfiguration PROTOTYPE ---
 */
Lrn.Application.CourseConfiguration.prototype = new Lrn.Application();
Lrn.Application.CourseConfiguration.prototype.superclass = Lrn.Application.prototype;

/**
 * --- CourseConfiguration properties ---
 */
Lrn.Application.CourseConfiguration.prototype.table = null;
Lrn.Application.CourseConfiguration.prototype.baseJSONData = null;
Lrn.Application.CourseConfiguration.prototype.languages = null;
Lrn.Application.CourseConfiguration.prototype.searchable = true;
Lrn.Application.CourseConfiguration.prototype.sortable = true;
Lrn.Application.CourseConfiguration.prototype.sortDirection = 'asc';
Lrn.Application.CourseConfiguration.prototype.rawJSON = null;
Lrn.Application.CourseConfiguration.prototype.siteLabels = {};
Lrn.Application.CourseConfiguration.prototype.openArray = [];
Lrn.Application.CourseConfiguration.prototype.openModuleArray = [];
/**
 * --- CourseConfiguration methods ---
 */
Lrn.Application.CourseConfiguration.prototype.init = function(config) {
	// before we extend the superclass init method, 
	// we call the init method of the superclass (Application.js)
	this.superclass.init.apply(this);
	//initialize file upload tool
	Lrn.Widgets.FileTool = new Lrn.Widget.FileTool();
	Lrn.Widgets.FileTool.init();
	//copy the config here instead in the constructor
	if (config) {
		for ( var i in config) {
			this[i] = config[i];
		}
	}

	if (config.table) {
		this.createTable();
	}
};

Lrn.Application.CourseConfiguration.prototype.createTable = function(e) {
	var table = $(this.table);
	this.baseJSONData.bProcessing = true;
	this.baseJSONData.sPaginationType = "full_numbers";
	
	var select = '<select>' + '<option value="10">10</option>'
			+ '<option value="20">20</option>'
			+ '<option value="30">30</option>'
			+ '<option value="40">40</option>'
			+ '<option value="50">50</option>' +
			//    '<option value="-1">All</option>'+
			'</select>';
	var menu = "Show %numRecords% Entries";
	menu = menu.replace("%numRecords%", select);
	this.baseJSONData.oLanguage = {
		"sSearch" : "Search:",
		"sZeroRecords" : "No records to display",
		"sLengthMenu" : menu,
		"oPaginate" : {
			"sNext" : "Next",
			"sPrevious" : "Previous"
		}
	};

	var courseTitle = "Course Title";
	var moduleIdTitle = "Module ID";
	var courseLangTitle = "Language";

	this.baseJSONData.aoColumns = [
			{
				mDataProp : null,
				sClass : "control center closed contentTextIcons",
				sDefaultContent : "<div class=\"arrow\">&#9654;</div>"
			},
			{
				mDataProp : "Course Title",
				sClass : "courseTitle",
				mRender : function(data, type, full) {
					return "<a \" module-id=\"" + full['Module ID']
							+ "\">" + data + "</a>";
				}
			}, {
				mDataProp : 'desc',
				bVisible : false
			}

	];
	var eachOnclickControl = function(i, e) {
		e.onclick = null;
		//	e.onclick = this.onclickAccordion.bind(this);
		$(e).click(this.onclickAccordion.bind(this));
	}.bind(this);
	
	var expand = function(e) {
		$('td.control', table).each(eachOnclickControl);
		//	$('.arrow',table).each(eachOnclickControl);

		//$('td.details select',table).on('change',this.onselectLanguage.bind(this));
		this.closeAllAccordions(this);
	}.bind(this);

	this.baseJSONData.fnDrawCallback = function() {
		if (this.table instanceof jQuery) {
			expand();
			var prev = $('#courseconfigurationTable_previous');
			var next = $('#courseconfigurationTable_next');
			prev.on('click', expand);
			next.on('click', expand);
			
			$('#courseconfigurationTable_previous').attr("class", "paginate_enabled_previous");
			$('#courseconfigurationTable_next').attr("class", "paginate_enabled_next");
			$("#courseconfigurationTable_paginate > span").attr("style", "float:left");
			
			var oSettings = this.table.fnSettings();
			var l = Math.ceil(oSettings.aoData.length/oSettings._iDisplayLength);
			var page = Math.ceil(oSettings._iDisplayStart/oSettings._iDisplayLength);
			
			if(page === 0){
				$('#courseconfigurationTable_previous').attr("class", "paginate_disabled_previous");
			}else if(page === l-1){
				$('#courseconfigurationTable_next').attr("class", "paginate_disabled_next");
			}
		}
		
		$('#courseconfigurationTable_length').hide();
		$('#courseconfigurationTable').css({'width': '100%'});
		$('#courseconfigurationTable_length > label').addClass(
				'contentTextIcons');
		$('#courseconfigurationTable_filter').addClass('secondaryBgColor');
		$('#courseconfigurationTable_filter > label').addClass(
				'contentTextIcons');
		$('#courseconfigurationTable > tbody > tr')
				.addClass('secondaryBgColor');
		$('.arrow').hide();
		$('.control').html('<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-e"></span>');

	}.bind(this);

	this.table = table.dataTable(this.baseJSONData);
	this.table.fnDraw();
};

Lrn.Application.CourseConfiguration.prototype.onclickPageChange = function(e, i) {
	e.stopPropagation();
	e.stopImmediatePropagation();	
	this.closeAllAccordions(this,i,e);
};
Lrn.Application.CourseConfiguration.prototype.closeAllAccordions = function(thisObj,k,e) {
	thisObj.table.fnClose();
	var toCloseArr = thisObj.openModuleArray;
	if(toCloseArr.length > 0){
	for(var n=0;n<toCloseArr.length; n++){
		var button = $('#courseDataCancel'+toCloseArr[n]);
		button.click();
		if(n == toCloseArr.length-1){
			if(e != undefined && e != null){
				k = typeof (k) === 'number' ? k : parseInt(e.target.id.substr(8), 10) - 1;
				thisObj.table.fnPageChange(k);
				$('#gotoPage' + k).addClass('current');
			}
		}
	}
	} else {
		if(e != undefined && e != null){
			k = typeof (k) === 'number' ? k : parseInt(e.target.id.substr(8), 10) - 1;
			thisObj.table.fnPageChange(k);
			$('#gotoPage' + k).addClass('current');
		}
	}
};
Lrn.Application.CourseConfiguration.prototype.onclickAccordion = function(e) {
	e.stopPropagation();
	e.stopImmediatePropagation();
	var parent = $(e.target).parents('tr');
	var moduleId = parseInt(
			$(parent.children()[1]).find('a').attr('module-id'), 10);

	var i = $.inArray(parent[0], this.openArray);
	var modIndex = $.inArray(moduleId, this.openModuleArray);
	if (i === -1) {
		var nDetailsRow = this.table.fnOpen(parent[0], this.formatDropDown(
				parent[0], e.target), 'details');
		$(nDetailsRow).addClass('detailsRow borders');
		$('div.innerDetails', nDetailsRow).slideDown(
				500,
				function() {
					this.openArray.push(parent[0]);
					this.openModuleArray.push(moduleId);						
					parent.find('.arrow').html('&#9660;');
					$(parent.children()[0]).removeClass('closed');
					$('#courseconfigurationDataLang'+moduleId).on('change',
							this.onselectLanguage.bind(this));
					var editor = tinymce.EditorManager.get('desc' + moduleId);
					if (editor == undefined) {
						this.addTinymce(moduleId);
					}
					$('.getFile').on('click', this.ongetFile.bind(this));
					$('.clearLink').on('click', this.onclearImage.bind(this));
					$('#courseDataSubmit'+moduleId).on('click',
							this.onDataSubmit.bind(this));
					$('#courseDataPublish'+moduleId).on('click',
							this.onDataPublish.bind(this));
					$('#courseDataCancel'+moduleId).on('click',
							this.onChangesRevert.bind(this));
					$('#courseDataRestore'+moduleId).on('click',
							this.onChangesDelete.bind(this));
					$("input[type='checkbox'][name='ResourceVisibility"+moduleId+"[]']").live('change', this.onchangeForm.bind(this));
					$('#clearSave').live('click',
							this.saveDeleteContent.bind(this));
					$('#restoreSubmit').live('click',
							this.restoreDeleteContent.bind(this));
					$('#courseImg'+moduleId).bind('load', function() {
						 if($('#newImageLoad').val() == 'Yes'){
							$('#courseDataPublish'+moduleId).addClass('hidden');
							$('#courseDataSubmit'+moduleId).removeClass('hidden');
							$('#courseDataSubmit'+moduleId).removeAttr("disabled");
							$('#courseDataSubmit'+moduleId).removeClass("disabled");
							// $('#clearLink'+moduleId).removeAttr("disabled");
							// $('#clearLink'+moduleId).removeClass("disabled");
							this.initClearBtn();
						 }
						 
				      }.bind(this));

					
				}.bind(this));

	} else {
		$('div.innerDetails', parent.next()[0]).slideUp(500, function() {
			this.table.fnClose(parent[0]);
			this.openArray.splice(i, 1);
			this.openModuleArray.splice(modIndex);
			parent.find('.arrow').html('&#9654;');
			$(parent.children()[0]).addClass('closed');
			var editor = tinymce.EditorManager.get('desc' + moduleId);
			if (editor != undefined)
				editor.remove();
		}.bind(this));
	}
};
Lrn.Application.CourseConfiguration.prototype.addTinymce = function(moduleId) {
	var settings = {
		selector : '#desc' + moduleId,
		menubar : false,
		statusbar : false,
		inline_styles: false,
		formats: {
		    underline: { inline: 'u', exact : true }
		},
		plugins : "paste link maxchars",
		toolbar : "bold italic underline | bullist | link unlink | paste",
		paste_auto_cleanup_on_paste : true,
		paste_remove_styles : true,
		paste_remove_styles_if_webkit : true,
		paste_strip_class_attributes : "all",
		max_chars : 20,
		invalid_elements : "sub,span",
		setup : function(ed) {
			ed.settings.max_chars = $('#' + ed.id).data('maxlength');
			var tinymce_placeholder = $('#' + ed.id);
			var attr = tinymce_placeholder.attr('placeholder');
			var placeholder = '<span style="color: #999;">' + attr + '</span>';
			ed.on('init', function() {
				this.getDoc().body.style.fontSize = '12px';
				this.getDoc().body.style.textAlign = 'left';
				var cont = ed.getContent();
				if (cont.length == 0) {
					ed.setContent(placeholder);
					// Get updated content
					cont = placeholder;
				} else {
					cont = cont.replace(/(<([^>]+)>)/ig, '');
					if (cont == attr)
						ed.setContent(placeholder);
					return;
				}

			});

			ed.on('click focus', function(e) {
				var cont = ed.getContent();
				cont = cont.replace(/(<([^>]+)>)/ig, '');
				cont = cont.replace(/&nbsp;/g, '');
				cont = cont.replace(/\n/g, '');
				//console.log("Content"+cont+cont.length);  
				if (cont == attr) {
					ed.setContent('');
					ed.selection.select(ed.getBody(), true);
					ed.selection.collapse(false);
				}

			});
			ed.on('change', function(e) {
				var textId = ed.id;
				var moduleId = textId.replace('desc','');
				$('#courseDataPublish'+moduleId).addClass('hidden');
				$('#courseDataSubmit'+moduleId).removeClass('hidden');
				$('#courseDataSubmit'+moduleId).removeAttr("disabled");
	        	$('#courseDataSubmit'+moduleId).removeClass("disabled");
			});
			ed.on("blur", function(e) {
				var cont = ed.getContent();
				cont = cont.replace(/(<([^>]+)>)/ig, '');
				cont = cont.replace(/&nbsp;/g, '');
				cont = cont.replace(/\n/g, '');
				//console.log("placeholder = "+placeholder);  
				if (cont.length == 0) {//console.log("On Blur when length = 0 : "+cont+cont.length);
					ed.setContent(placeholder);
				}
				e.target.save();
			});
		}
	};
	tinymce.init(settings);
}
Lrn.Application.CourseConfiguration.prototype.formatDropDown = function(parent,
		target) {

	var oData = this.table.fnGetData(parent);
	var src = typeof (oData.courseImg) === 'string' ? oData.courseImg.replace(
			'http://', 'https://') : CDN_IMG_URL + "/images/samples/defaultModuleImage.jpg";//console.log(oData.courseImg);
	var defaultSrc = typeof (oData.courseImgURL) === 'string' ? oData.courseImgURL.replace(
					'http://', 'https://') : CDN_IMG_URL + "/images/samples/defaultModuleImage.jpg";
	var opts = '';
	var data = oData.Language;
	var langKey = defaultLangKey = langEnIntKey = langEnUKKey = 0;
	var defaultLangExists = langEnIntExists = langEnUKExists = false;
	var defaultLang = $('#defaultLanguage').val();
	var langEnInt = $('#langEnInt').val();
	var langEnUK = $('#langEnUK').val();
	if (data.length > 1) {
		opts = '<select id="courseconfigurationDataLang'+oData['Module ID']+'" class="langSelect">';
		for ( var i = 0, l = data.length; i < l; ++i) {
			if(defaultLang == data[i].language){
				defaultLangKey = i;
				defaultLangExists = true;
			} else if(langEnInt == data[i].language){
				langEnIntKey = i;
				langEnIntExists = true;
			} else if(langEnUK == data[i].language){
				langEnUKKey = i;
				langEnUKExists = true;
			}			
		}
		if(defaultLangExists == true){
			langKey = defaultLangKey;
		}else if(langEnIntExists == true){
			langKey = langEnIntKey;
		}else if(langEnUKExists == true)
			langKey = langEnUKKey;
		
		for ( var i = 0, l = data.length; i < l; ++i) {
			var selected = '';
			if(langKey == i)
				selected = 'selected';
			var tmp = '<option value="' + data[i].language + '" ' + selected + '>'
					+ data[i].longLang + '</option>';
			opts += tmp;
		}
		opts += "</select>";
	}
	var disabled = '';
	if(oData['customDataId'] == ''){
		disabled = 'disabled';
	}
	var visibilityTypes = oData.visibilityTypes;
	var visibilityTypesStatus = oData.visibilityTypesStatus;
	var visibilityTypesHtml = '';
	if (visibilityTypes.length > 1) {
		for ( var i = 0, l = visibilityTypes.length; i < l; ++i) {
			var checked = '';
			var idStatus = '';
			if (visibilityTypesStatus[visibilityTypes[i].id] != undefined) {
				if (visibilityTypesStatus[visibilityTypes[i].id].visibility == 1)
					checked = 'checked ="checked"';
				idStatus = visibilityTypesStatus[visibilityTypes[i].id].id;
			}
			visibilityTypesHtml += '<input type="checkbox" id="'
					+ visibilityTypes[i].id + oData['Module ID'] + '" value="'
					+ visibilityTypes[i].id + '" name="ResourceVisibility' + oData['Module ID'] + '[]"'
					+ checked + '/>' + visibilityTypes[i].name;
			visibilityTypesHtml += '<input type="hidden" id="'
					+ visibilityTypes[i].id + oData['Module ID']
					+ '_id" name="' + visibilityTypes[i].id
					+ oData['Module ID'] + '_id" value="' + idStatus + '" /><br/>';
		}
	}
	var submitStatus = '';
	if (oData.infoStatus.id == 0 && oData['customDataId']!= '') {
		submitStatus = '<button type="submit" id="courseDataPublish'
				+ oData['Module ID']
				+ '" class="courseDataPublish adminBlueBtn gradient" module-id="'
				+ oData['Module ID']
				+ '">Publish</button><button type="submit" id="courseDataSubmit'
				+ oData['Module ID']
				+ '" class="courseDataSubmit hidden adminBlueBtn gradient" module-id="'
				+ oData['Module ID']
				+ '">Save</button>';
	} else {
		var disabledSubmit = '';
		var disabledClass = '';
		if(oData.infoStatus.id == 1 && oData['customDataId']!= ''){
			disabledClass = 'disabled';
			disabledSubmit = 'disabled="disabled"';
		}
		submitStatus = '<button type="submit" id="courseDataPublish'
				+ oData['Module ID']
				+ '" class="courseDataPublish hidden adminBlueBtn gradient" module-id="'
				+ oData['Module ID']
				+ '">Publish</button><button type="submit" id="courseDataSubmit'
				+ oData['Module ID']
				+ '" class="courseDataSubmit adminBlueBtn gradient '+disabledClass+'" '+ disabledSubmit +' module-id="'
				+ oData['Module ID']
				+ '">Save</button>';
	}
	var disabledCancel = '';
	var disabledCancelClass = '';
	if(oData['newImageId'] == ''){
		disabledCancelClass = 'disabled';
		disabledCancel = 'disabled="disabled"';
	}
	var placeholderSrc = oData['newImageId'] == '' ? src : CDN_IMG_URL + "/images/samples/defaultModuleImage.jpg";
	var sOut = '<div class="innerDetails" style="display:none">'
					+'<sub class="pbInstructions">Image modifications will appear across the site. Text modifications will appear in all the areas you select' 
					+ ' under visibility.</sub>'
					+'<form action="/admin/savecoursecustomizeddata" method="post">'
					+ opts
					+ '<a  module-id = "'+ oData['Module ID']+ '" >'
						+ '<p class="pbLabel">Module image <span class="dimension">(Recommended image dimensions: 726 x 362 pixels)</p>'
						+ '<div class="courseImgWrap clearfix imageWrap">'
							+ '<img class="customfile courseImg courseImg'+ oData['Module ID']+ 'customfile" src="'+ src+ '" data-image="'
							+ src
							+ '" data-placeholder="'+ defaultSrc+ '" id="courseImg'
							+ oData['Module ID']
							+ '"  style="display: inline; background-color: transparent; width: auto; height: 100%; margin-left: -12px;"/>'
						+ '</div>'
						+ '<fieldset>'
							+ '<input type="hidden" name="courseImg'
							+ oData['Module ID']
							+ 'customfile" value="'
							+ oData['newImageId']
							+ '" />'
							+ '<input type="hidden" id="systemId'
							+ oData['Module ID']
							+ '"	name="systemId'
							+ oData['Module ID']
							+ '" value="'
							+ oData['systemId']
							+ '" />'
							+ '<input type="hidden" id="courseCustomization_id'
							+ oData['Module ID']
							+ '"	name="courseCustomization_id'
							+ oData['Module ID']
							+ '" value="'
							+ oData['customDataId']
							+ '" />'
							+ '<input type="hidden" id="courseStatus'
							+ oData['Module ID']
							+ '"	name="courseStatus'
							+ oData['Module ID']
							+ '" value="'
							+ oData.infoStatus.id
							+ '" />'
							+ '<input type="hidden" id="createUserId'
							+ oData['Module ID']
							+ '"	name="createUserId'
							+ oData['Module ID']
							+ '" value="'
							+ oData.createUserId
							+ '" />'
							+ '<button id="courseImg'+ oData['Module ID']+ 'customfile" name="courseImg'+ oData['Module ID']+ 'customfile" class="getFile customfile pbSave adminBlueBtn gradient"	data-width="726" data-height="362" data-type="img">Upload image</button>'
							+ '<button id="clearLink'
							+ oData['Module ID']
							+ '" class="clearLink adminGreyBtn gradient '+disabledCancelClass+'" '+disabledCancel+'>Clear image</button>'
						+ '</fieldset>'
						+ '<div class="courseDesc contentTextIcons">'
							+ '<p class="pbLabel">Customized module description <span class="charLimit">(Recommended: 1,000 characters)</span></p>'
							+ '<div class="headerDisplayOptions">'
								+ '<div class="formElements clearfix">'		
									+ '<textarea class="rteDesc dataField" id="desc'
										+ oData['Module ID']
										+ '" name="desc'
										+ oData['Module ID']
										+ '" cols="100" rows="3" placeholder="Your custom text will appear above the default LRN module description on all pages you select." data-length="999" data-maxLength="1000"'
										//+ ' data-value="' +(escapeHtml(oData.desc) || "")
										+ '">'
										+ (oData.desc || "")
									+ '</textarea>'
								+ '</div>'
							+ '</div>'
						+ '</div>'
					+ '<div class="visibilityTypes" id="visibility'+ oData['Module ID']+ '">'
						+ '<p class="pbLabel">Visibility</p>'
						+ visibilityTypesHtml
					+ '</div><div class="formOptions visibility'+ oData['Module ID']+ '">'
						+ submitStatus
						+ '<button id="courseDataCancel'
						+ oData['Module ID']
						+ '" class="courseDataCancel adminCancelBtn gradient" module-id="'
						+ oData['Module ID']
						+ '">Cancel</button>'
						+ '<button id="courseDataRestore'
						+ oData['Module ID']
						+ '" class="courseDataRestore adminGreyBtn gradient '+disabled+'" module-id="'
						+ oData['Module ID']
						+ '" '+disabled+'>Restore defaults</button>'
					+ '</div></a></form></div>';
	$('#newImageLoad').val('No');
	var img = new Image();
	img.src = src;
	img.onerror = function() {
		img.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
		img.onload = null;
		img.onerror = null;
		var courseimg = $('#courseImg' + oData['Module ID']);
		courseimg.attr('src', this.src);
		courseimg.attr('data-placeholder', CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg');
		delete img;
	};
	img.onload = function() {
		delete img;
	};	
	return sOut;
};

Lrn.Application.CourseConfiguration.prototype.onselectLanguage = function(e) {
	e.preventDefault();
	e.stopPropagation();
	var $target = $(e.target);
	var $parent1 = $target.parents('tr');
	var $parent = $target.parents('tr').prev('tr');

	if ($parent.length > 0) {
		var moduleId = parseInt($($parent1.children()[0]).find('a').attr(
				'module-id'), 10);
		var pos = this.table.fnGetPosition($parent[0]);

		var courseTitle = this.baseJSONData.siteLabels.CourseTitle
				|| "Module Title";

		$parent[0].id = '#courseconfigurationRow' + pos;
		e.target.id = "#courseconfigurationDataLang" + moduleId;

		var xlat = this.getTranslation(this.rawJSON[moduleId], $target.val(),
				pos);		

		//this.table.fnUpdate(xlat, pos, undefined, true, false);
//
//		var settings = this.table.fnSettings();
//		var page = Math.ceil((pos + 1) / settings._iDisplayLength) - 1;
//		this.onclickPageChange(e, page);
		var src = typeof (xlat.courseImg) === 'string' ? xlat.courseImg
				.replace('http://', 'https://')
				: CDN_IMG_URL + "/images/samples/defaultModuleImage.jpg";

		$parent.find('.courseTitle').find('a').html(
				xlat.catId + ': ' + escapeHtml(xlat[courseTitle]));
		var next = $parent.next();
		
		if (next.length > 0) {
			if (next.hasClass('odd') || next.hasClass('even')) {
				$parent.find('.arrow').html('&#9654;');
			} else {//var desc = next.find('.courseDesc');
				var img = next.find('img');
				img.attr('src', src);
				img.attr('data-placeholder', xlat.courseImgURL);
				img.attr('data-image', src);
				$('#systemId' + moduleId).val(xlat.systemId);
				$('#courseCustomization_id' + moduleId).val(xlat.customDataId);
				$('[name=courseImg' + moduleId+'customfile]').val(xlat.newImageId);
				var editor = tinymce.EditorManager.get('desc' + moduleId);
				var content = $('<div />').html(xlat.desc).text();
				var tinymce_placeholder = $('#' + 'desc' + moduleId);
				var attr = tinymce_placeholder.attr('placeholder');
				var placeholder = '<span style="color: #999;">' + attr
				+ '</span>';
				if (content == '')
					content = placeholder;
				else
					content = xlat.desc;
				if (editor != undefined) {
				editor.setContent(content);
				editor.save();
				//$('#'+'desc' + moduleId).val(content);
//				editor.selection.select(ed.getBody(), true);
//        		ed.selection.collapse(false);
//				$('#'+'desc' + moduleId).val(content);
//				editor.load();
					//tinymce.remove('#desc' + moduleId);
					//this.addTinymce(moduleId);
//					var editor = tinymce.EditorManager.get('desc' + moduleId);
//					var tinymce_placeholder = $('#' + 'desc' + moduleId);
//					var attr = tinymce_placeholder.attr('placeholder');
//					var placeholder = '<span style="color: #999;">' + attr
//							+ '</span>';
//					if (content == '')
//						content = placeholder;
//					editor.setContent(content);
				}
				$('#newImageLoad').val('No');
				var img = new Image();
				img.src = src;
				img.onerror = function() {
					img.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
					img.onload = null;
					img.onerror = null;
					var courseimg = $('#courseImg' + moduleId);
					courseimg.attr('src', this.src);
					courseimg.attr('data-image', this.src);
					courseimg.attr('data-placeholder', CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg');
					delete img;
				};
				img.onload = function() {
					delete img;
				};
				
				var visibilityTypes = xlat.visibilityTypes;
				var visibilityTypesStatus = xlat.visibilityTypesStatus;
				var visibilityTypesHtml = '<p class="pbLabel">Visibility</p>';
				if (visibilityTypes.length > 1) {
					for ( var i = 0, l = visibilityTypes.length; i < l; ++i) {
						var checked = '';
						var idStatus = '';
						if (visibilityTypesStatus[visibilityTypes[i].id] != undefined) {
							if (visibilityTypesStatus[visibilityTypes[i].id].visibility == 1)
								checked = 'checked ="checked"';
							idStatus = visibilityTypesStatus[visibilityTypes[i].id].id;
						}
						visibilityTypesHtml += '<input type="checkbox" id="'
								+ visibilityTypes[i].id + moduleId + '" value="'
								+ visibilityTypes[i].id + '" name="ResourceVisibility'  + moduleId + '[]"'
								+ checked + '/>' + visibilityTypes[i].name;
						visibilityTypesHtml += '<input type="hidden" id="'
								+ visibilityTypes[i].id  + moduleId
								+ '_id" name="' + visibilityTypes[i].id
								 + moduleId + '_id" value="' + idStatus + '" /><br/>';
					}
				}
				$('#visibility' + moduleId).html(visibilityTypesHtml);

				if (xlat.infoStatus.id == 0 && xlat.customDataId != '') {
					$('#courseDataPublish' + moduleId).removeClass('hidden');
					$('#courseDataPublish'+moduleId).removeAttr("disabled");
        			$('#courseDataPublish'+moduleId).removeClass("disabled");
					$('#courseDataSubmit' + moduleId).addClass('hidden');
				} else {
					$('#courseDataSubmit' + moduleId).removeClass('hidden');
					$('#courseDataPublish' + moduleId).addClass('hidden');
					
				}
				$('#courseStatus'+ moduleId).val(xlat.infoStatus.id);
				$('#createUserId'+ moduleId).val(xlat.createUserId);
				if(xlat.customDataId != ''){
					$('#courseDataRestore'+moduleId).removeAttr("disabled");
        			$('#courseDataRestore'+moduleId).removeClass("disabled");
				}
        			else{
        				$('#courseDataRestore'+moduleId).attr("disabled","disabled");
            			$('#courseDataRestore'+moduleId).addClass("disabled");
        			}
				if(xlat.newImageId != ''){
					$('#clearLink'+moduleId).removeAttr("disabled");
		        	$('#clearLink'+moduleId).removeClass("disabled");
				} else{
					$('#clearLink'+moduleId).attr("disabled","disabled");
		        	$('#clearLink'+moduleId).addClass("disabled");
				}
					
        				
				//console.log(editor.getContent());
				//$('#desc'+moduleId).html(content);	
				//this.updateContent(moduleId,content);
				$parent.find('.arrow').html('&#9660;');
			}
		}
	}
};

Lrn.Application.CourseConfiguration.prototype.ongetFile = function(e) {
	e.preventDefault();
	var $this = $(e.target || e.srcElement);
	var fileObj = $this.attr('id');
	var fileObj1 = fileObj;
	var thumObjName = fileObj.replace('customfile', 'thumbnail');
	var getfile = 'No';
	var $this = $(e.target || e.srcElement);
	Lrn.Widgets.FileTool.updateConfigs({
		cropWidth : $this.data('width'),
		cropHeight : $this.data('height'),
		returnField : $this.siblings('input[name="' + fileObj + '"]'),
		returnFieldThumb : $this.siblings('input[name="' + thumObjName + '"]'),
		returnImg : $this.closest('div').find('img.' + fileObj1),
		configType : $this.data('type'),
		getfile : getfile,
		clickThumbnailButton : $this.siblings('button[name="' + thumObjName
				+ '"]'),
		fixedSize:false
	});
	Lrn.Widgets.FileTool.open();
	
    //set file type
    frontFileTool.setFileType($this.data('type'));
    frontFileTool.setCropHeightWidth($this.data('height'), $this.data('width'));
    frontFileTool.fixedSize = true;
    frontFileTool.refreshTab();
	
	$('#newImageLoad').val('Yes');
	//console.log(Lrn.Widgets.FileTool, $(".ui-dialog-titlebar"));
	var titlebar = $(".ui-dialog-titlebar");
	titlebar.show();
	$('.ui-dialog-titlebar-close', titlebar).show();
	//    $(".ui-dialog-titlebar", ui.dialog).show();
};

Lrn.Application.CourseConfiguration.prototype.onclearImage = function(e) {
	e.preventDefault();
	var $this = $(e.target || e.srcElement);
	var imgToClear = $this.closest('div').find('img');
	if(imgToClear.attr('src') != imgToClear.attr('data-placeholder')){
		$('#newImageLoad').val('Yes');		
		imgToClear.attr('src', imgToClear.attr('data-placeholder'));
		// $this.attr("disabled", "disabled");
		// $this.addClass("disabled");
	}
	 else{
	 	$('#newImageLoad').val('Yes');		
	 	imgToClear.attr('src', imgToClear.attr('data-image'));
	 }
//	 if(imgToClear.attr('data-placeholder') == imgToClear.attr('src')){
//	 	$this.attr("disabled", "disabled");
//	 	$this.addClass("disabled");		
//	 }
	imgToClear.css('margin', '0');
	var classList = imgToClear.attr('class').split(/\s+/);
	for ( var i = 0; i < classList.length; i++) {
		if (classList[i] !== 'customfile') {
			$('input[name="' + classList[i] + '"]').val('');
		}
	}
	this.initClearBtn();
};

Lrn.Application.CourseConfiguration.prototype.initClearBtn = function() {
	var clearEl = $('.clearLink');
	var checkEl = clearEl.closest('div').find('img');
	$('.clearLink').each(function() {
		var clearEl = $('.clearLink');
		var checkEl = clearEl.closest('div').find('img');
		if(checkEl.attr('src') == checkEl.attr('data-placeholder')) {
			$(this).attr("disabled", "disabled");
			$(this).addClass('disabled');
		} else {
			$(this).removeAttr('disabled');
			$(this).removeClass('disabled');
		}
	});
};

Lrn.Application.CourseConfiguration.prototype.onDataSubmit = function(e) {
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	button.attr("disabled", "disabled");
	var dataTable = this;	
	this.saveCustomizedData(button,0,dataTable);
};

Lrn.Application.CourseConfiguration.prototype.onchangeForm = function(e) {
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	var moduleId = button.attr('id').replace(button.val(),'');
	$('#courseDataPublish'+moduleId).addClass('hidden');
	$('#courseDataSubmit'+moduleId).removeClass('hidden');
	$('#courseDataSubmit'+moduleId).removeAttr("disabled");
	$('#courseDataSubmit'+moduleId).removeClass("disabled");
};

Lrn.Application.CourseConfiguration.prototype.onDataPublish = function(e) {
	var dataTable = this;
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	button.attr("disabled", "disabled");
	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
	$("#messageModal").dialog({
		   resizable: false,
		   minHeight:150,
		   width:150,
		   closeOnEscape: false,
		   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
		   $(".ui-dialog-titlebar", ui.dialog).hide();}
		});
	var moduleId = button.attr('module-id');
	var data = 'courseCustomizationid='+$('#courseCustomization_id'+moduleId).val();
	var parent = button.parents('tr').prev('tr');
	data += '&systemid='+$('#systemId'+moduleId).val();
	$.ajax({
        type: 'post',
        url: '/admin/customdatapublish',
        data: data,
        dataType: 'json',
        success: function(response){ 
        	if(response){
        		dataTable.updateDatatable(response,dataTable,moduleId,parent);
        		$('#courseStatus'+moduleId).val(response.status.id);
        		if(response.status.id == 1){
	        		button.attr("disabled", "disabled");
	        		button.addClass('hidden');
	        		$('#courseDataRestore'+moduleId).removeAttr("disabled");
	        		$('#courseDataRestore'+moduleId).removeClass("disabled");
	        		$('#courseDataSubmit'+moduleId).removeClass('hidden');
	        		$('#courseDataSubmit'+moduleId).attr("disabled", "disabled");
	        		$('#courseDataSubmit'+moduleId).addClass("disabled");
	        	}
        		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
    			setTimeout(function(){
            		$("#messageModal").dialog("close");
            	}, 1000);
	        } else{
	        	button.removeAttr("disabled");
	        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
    			setTimeout(function(){
            		$("#messageModal").dialog("close");
            	}, 1000);
	        }
        	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	button.removeAttr("disabled");     
        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
			setTimeout(function(){
        		$("#messageModal").dialog("close");
        	}, 1000);
        }
    }); 
};

Lrn.Application.CourseConfiguration.prototype.onChangesDelete = function(e) {
	var dataTable = this;
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	var dataTable = this;	
	var moduleId = button.attr('module-id');
	$("#innerMessageModal").html('<p class="messageModalText"><fieldset><p class="contentTextIcons font-style3"> <br/>You are about to restore the module image and description to their default values. All of your customizations will be removed.<br/><br/>Do you wish to continue?<br/><br/></p></fieldset><fieldset class="updateButtons"><input type="hidden" name="pushClose" id="pushClose" value="Yes" /><button type="submit" id="restoreSubmit" data-id="'+moduleId+'" class="blue">Submit</button></fieldset></p>');
	$('#pushClose').val('Yes');
	$('#innerMessageModal').dialog({
         title: 'Confirm',
		 modal: true,
  	     width : 500,
  	     height : 240,
  	     resizable: false,
  	     open: function(event, ui) { 
  	    	$(".ui-dialog-titlebar-close", ui.dialog).show(); 
			   $(".ui-dialog-titlebar", ui.dialog).show();
		 },
		 close: function(){
				if($('#pushClose').val() == 'Yes'){
					$('#pushClose').val('No');
				    $( '#innerMessageModal' ).dialog( "close" ); 
				}
			},
  	     buttons: [ { text: 'Cancel', click: function() {
	  	    	 if($('#pushClose').val() == 'Yes'){
					$('#pushClose').val('No');
					$( '#innerMessageModal' ).dialog( "close" ); 
					var button = $('#courseDataCancel'+$('#restoreSubmit').attr('data-id'));
					button.click();
	  	    	 }
  	    	 } } ]
	    }).bind(this);
		button.removeAttr("disabled");
};

Lrn.Application.CourseConfiguration.prototype.onChangesRevert = function(e) {
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	var parent =button.parents('tr');
	var moduleId = button.attr('module-id');
	var i = $.inArray(parent[0], this.openArray);
	$('div.innerDetails', parent).slideUp(500, function() {
		this.table.fnClose(parent[0]);
		this.openArray.splice(i, 1);
		this.initClearBtn();
		parent.prev('tr').find('.arrow').html('&#9654;');
		$(parent.prev('tr').children()[0]).addClass('closed');
		var editor = tinymce.EditorManager.get('desc' + moduleId);
		if (editor != undefined)
			editor.remove();
	}.bind(this));	
};

Lrn.Application.CourseConfiguration.prototype.restoreDeleteContent = function(e) {
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	var dataTable = this;
	var moduleId = button.attr('data-id');
	var saveButton = $('#courseDataCancel'+moduleId);
		$( '#innerMessageModal' ).dialog( "close" ); 
		// console.log('test'+$('#courseCustomization_id'+moduleId).val());
		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
		$("#messageModal").dialog({
			   resizable: false,
			   minHeight:150,
			   width:150,
			   closeOnEscape: false,
			   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();}
			});
		var data = 'systemid='+$('#systemId'+moduleId).val();
		var parent = saveButton.parents('tr').prev('tr');
		var parent1 =saveButton.parents('tr');
		$.ajax({
	        type: 'post',
	        url: '/admin/customdatadelete',
	        data: data,
	        dataType: 'json',
	        success: function(response){ 
	        	if(response){
	        		dataTable.updateDatatable(response,dataTable,moduleId,parent);
	        		button.removeAttr("disabled");   
		        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
	    			setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            	}, 1000);
	    			var i = $.inArray(parent1[0], dataTable.openArray);
	    			$('div.innerDetails', parent1).slideUp(500, function() {
	    				dataTable.table.fnClose(parent1[0]);
	    				dataTable.openArray.splice(i, 1);
	    				parent1.prev('tr').find('.arrow').html('&#9654;');
	    				$(parent1.prev('tr').children()[0]).addClass('closed');
	    				var editor = tinymce.EditorManager.get('desc' + moduleId);
	    				if (editor != undefined)
	    					editor.remove();
	    			}.bind(dataTable));
		        } else{
		        	button.removeAttr("disabled");
		        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src=" ' +CDN_IMG_URL+ ' /images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
	    			setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            	}, 1000);
		        }
	        	
	        },
	        error: function(jqXHR, textStatus, errorThrown){
	        	button.removeAttr("disabled");     
	        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
				setTimeout(function(){
	        		$("#messageModal").dialog("close");
	        	}, 1000);
	        }
	    });		
};

Lrn.Application.CourseConfiguration.prototype.saveDeleteContent = function(e) {
	e.preventDefault();
	e.stopPropagation();
	e.stopImmediatePropagation();
	var button = $(e.target || e.srcElement);
	var dataTable = this;
	var moduleId = button.attr('data-id');
	var saveButton = $('#courseDataCancel'+moduleId);
	var parent = saveButton.parents('tr').prev('tr');
	if($('#courseCustomization_id'+moduleId).val() != ''){
		var data = 'systemid='+$('#systemId'+moduleId).val();
		$( '#innerMessageModal' ).dialog( "close" ); 
		// console.log('test'+$('#courseCustomization_id'+moduleId).val());
		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
		$("#messageModal").dialog({
			   resizable: false,
			   minHeight:150,
			   width:150,
			   closeOnEscape: false,
			   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();}
			});
		$.ajax({
	        type: 'post',
	        url: '/admin/customdatadelete',
	        data: data,
	        dataType: 'json',
	        success: function(response){ 
	        	if(response){
	        		dataTable.updateDatatable(response,dataTable,moduleId,parent);
	        		$('#courseCustomization_id'+moduleId).val('');
	        		$("input[type='checkbox'][name='ResourceVisibility"+moduleId+"[]']").each(function() {
	        			$('#'+$(this).attr('id')+'_id').val('');		
	        			$(this).removeAttr('checked');	
	        		});
	        		$('#courseDataRestore'+moduleId).removeAttr("disabled");
	        		$('#courseDataRestore'+moduleId).removeClass("disabled");
		        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
	    			setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            	}, 1000);		    			
		        } else{
		        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src=" ' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
	    			setTimeout(function(){
	            		$("#messageModal").dialog("close");
	            	}, 1000);
		        }
	        	
	        },
	        error: function(jqXHR, textStatus, errorThrown){	        	 
	        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
				setTimeout(function(){
	        		$("#messageModal").dialog("close");
	        	}, 1000);
	        }
	    }); 
	} 	
};

Lrn.Application.CourseConfiguration.prototype.saveCustomizedData = function(button,mode,dataTable) {
	
	var moduleId = button.attr('module-id');
	if($('#courseStatus'+moduleId).val() == 1){
		$('#courseStatus'+moduleId).val(0);
		$('#courseCustomization_id'+moduleId).val(-1);
		$("input[type='checkbox'][name='ResourceVisibility"+moduleId+"[]']").each(function() {
			$('#'+$(this).attr('id')+'_id').val('');			
		});
	}
	var form = button.parents('form');
	var values = form.serializeArray();
	// Find and replace `content` if there
	var tinymce_placeholder = $('#desc' + moduleId).attr('placeholder');
	var descEmpty = false;
	var imageEmpty = false;
	var visibilityEmpty = true;
	for (index = 0; index < values.length; ++index) {
	    if (values[index].name == 'desc' + moduleId) {
	    	var cont = values[index].value.replace(/(<([^>]+)>)/ig, '');
	    	if (cont == tinymce_placeholder){
	    		values[index].value = '';
	    	}
	    	if(values[index].value == '')
	    		descEmpty = true;	        
	    }
	    if (values[index].name == 'courseImg' + moduleId + 'customfile') {
	    	if(values[index].value == '')
	    		imageEmpty = true;
	    }
	    if( values[index].name == 'ResourceVisibility'+moduleId+'[]')
	    	visibilityEmpty = false;
	}
	var parent = button.parents('tr').prev('tr');
	if(imageEmpty == true && descEmpty == true && $('#courseCustomization_id'+moduleId).val() != ''){
		var dataTable = this;			
		$("#innerMessageModal").html('<p class="messageModalText"><fieldset><p class="contentTextIcons font-style3">You are about to save this module without any custom content. Doing so will restore the module image and description to their default values.<br/><br/>Do you wish to continue?<br/><br/></p></fieldset><fieldset class="updateButtons"><input type="hidden" name="pushClose" id="pushClose" value="Yes" /><button type="submit" id="clearSave" data-id="'+moduleId+'" class="blue">Continue</button></fieldset></p>');
		$('#pushClose').val('Yes');
		$('#innerMessageModal').dialog({
	         title: 'Confirm',
			 modal: true,
	  	     width : 500,
	  	     height : 240,
	  	     resizable: false,
	  	     open: function(event, ui) { 
	  	    	$(".ui-dialog-titlebar-close", ui.dialog).show(); 
				   $(".ui-dialog-titlebar", ui.dialog).show();
			 },
			 close: function(){
					if($('#pushClose').val() == 'Yes'){
						$('#pushClose').val('No');
					    $( '#innerMessageModal' ).dialog( "close" ); 
					}
				},
	  	     buttons: [ { text: 'Cancel', click: function() {
		  	    	 if($('#pushClose').val() == 'Yes'){
						$('#pushClose').val('No');
						$( '#innerMessageModal' ).dialog( "close" ); 
						var button = $('#courseDataCancel'+$('#clearSave').attr('data-id'));
						button.click();
		  	    	 }
	  	    	 } } ]
		    }).bind(this);
			button.removeAttr("disabled");
	}else if(imageEmpty == true && descEmpty == true && $('#courseCustomization_id'+moduleId).val() == ''){		
		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>You will need to supply a module image or description to save.</p>');
		$("#messageModal").dialog({
			   resizable: false,
			   minHeight:150,
			   width:250,
			   closeOnEscape: false,
			   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();}
			});
		setTimeout(function(){
			$("#messageModal").dialog("close");
		}, 3000);
	}else if(visibilityEmpty == true) {
		button.removeAttr("disabled");
		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>You will need to select at least one module visibility to save.</p>');
		$("#messageModal").dialog({
			   resizable: false,
			   minHeight:150,
			   width:250,
			   closeOnEscape: false,
			   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();}
			});
		setTimeout(function(){
			$("#messageModal").dialog("close");
		}, 3000);
	} else{
		$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/ajax-loader.gif"  width=50 height=50/></span>Saving</p>');
		$("#messageModal").dialog({
			   resizable: false,
			   minHeight:150,
			   width:150,
			   closeOnEscape: false,
			   open: function(event, ui) { $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
			   $(".ui-dialog-titlebar", ui.dialog).hide();}
			});
	
	// Convert to URL-encoded string
	data = jQuery.param(values);
	data += '&module-id='+moduleId;
	
	$.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: data,
        dataType: 'json',
        success: function(response){ 
        	if(response){
        		dataTable.updateDatatable(response,dataTable,moduleId,parent);
        		$('#courseCustomization_id'+moduleId).val(response.id);
        		$('#courseStatus'+moduleId).val(response.status.id);
        		$('#createUserId'+moduleId).val(response.createUserId);
        		var fnGetData = dataTable.table.fnGetData(parent[0]);
        		var visibilityTypes = fnGetData.visibilityTypes;
        		var visibilityTypesStatus = response.courseVisibilityList.CourseVisibilityDTO;
        		if (visibilityTypes.length > 1) {
					for ( var i = 0, l = visibilityTypes.length; i < l; ++i) {
						var checked = '';
						var idStatus = '';
						if (visibilityTypesStatus[visibilityTypes[i].id] != undefined) {							
							idStatus = visibilityTypesStatus[visibilityTypes[i].id].id;
						}
						$('#' + visibilityTypes[i].id + moduleId + '_id').val(
								idStatus);
					}
				}
	        	if(response.status.id == 0){
	        		button.attr("disabled", "disabled");
	        		button.addClass('hidden');
	        		$('#courseDataRestore'+moduleId).removeAttr("disabled");
	        		$('#courseDataRestore'+moduleId).removeClass("disabled");
	        		$('#courseDataPublish'+moduleId).removeAttr("disabled");
	        		$('#courseDataPublish'+moduleId).removeClass('hidden');
	        	}
	        	button.removeAttr("disabled");   
	        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/done.jpg"  width=50 height=50/></span>Saved</p>');
    			setTimeout(function(){
            		$("#messageModal").dialog("close");
            	}, 1000);
	        } else{
	        	button.removeAttr("disabled");
	        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
    			setTimeout(function(){
            		$("#messageModal").dialog("close");
            	}, 1000);
	        }        	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	button.removeAttr("disabled");     
        	$("#messageModal").html('<p class="messageModalText"><span class="messageModalImg"><img src="' +CDN_IMG_URL+ '/images/backgrounds/error.png"  width=50 height=50/></span>An error occurred</p>');
			setTimeout(function(){
        		$("#messageModal").dialog("close");
        	}, 1000);
        }
    });
}
	
};


Lrn.Application.CourseConfiguration.prototype.updateDatatable = function(response,dataTable,moduleId,parent) {
	var fnGetData = dataTable.table.fnGetData(parent[0]);
	if(fnGetData.systemId == response.systemId){	
		if(response.customFileDTO != null){
			fnGetData.newImageId = response.customFileDTO.id;
			fnGetData.courseImg = $('#courseImg'+moduleId).attr('src');
		}
		else{
			fnGetData.newImageId = '';
			fnGetData.courseImg = fnGetData.courseImgURL;
		}
		fnGetData.customDataId = response.id;
		fnGetData.desc = response.description;
		fnGetData.infoStatus.id = response.status.id;
		fnGetData.visibilityTypesStatus = response.courseVisibilityList.CourseVisibilityDTO;
	}
	var pos = dataTable.table.fnGetPosition(parent[0]);
	var aaData = dataTable.baseJSONData.aaData[pos];
	if(aaData.systemId == response.systemId){		
		if(response.customFileDTO != null){
			aaData.newImageId =response.customFileDTO.id;
			aaData.courseImg = $('#courseImg'+moduleId).attr('src');
		}
		else{
			aaData.newImageId = '';
			aaData.courseImg = aaData.courseImgURL;
		}
		aaData.customDataId = response.id;
		aaData.desc = response.description;
		aaData.infoStatus.id = response.status.id;
		aaData.visibilityTypesStatus = response.courseVisibilityList.CourseVisibilityDTO;
		//console.log(dataTable.baseJSONData.aaData[pos]);
	}    
	var moduleData = dataTable.rawJSON[moduleId];
	for ( var i = 0; i < moduleData.length; ++i) {
		if (response.systemId == moduleData[i].systemId) {			
			if(response.customFileDTO != null){
				moduleData[i].newImageId =response.customFileDTO.id;
				moduleData[i].newImage = $('#courseImg'+moduleId).attr('src');
			}
			else{
				moduleData[i].newImageId = '';
				moduleData[i].newImage = moduleData[i].courseImgURL;
			}
			moduleData[i].customDataId = response.id;
			moduleData[i].description = response.description;
			moduleData[i].infoStatus = {id:response.status.id};
			moduleData[i].visibilityTypesStatus = response.courseVisibilityList.CourseVisibilityDTO;
			break;
			
		}
	}
};

Lrn.Application.CourseConfiguration.prototype.getTranslation = function(module,
		lang, pos) {
	var mlist = [];
	var data = [];

	var courseTitle = this.baseJSONData.siteLabels.CourseTitle
			|| "Course Title";

	for ( var i = 0, l = module.length; i < l; ++i) {
		if (lang === module[i].language) {
			data = this.baseJSONData.aaData[pos];
			data[courseTitle] = escapeHtml(module[i].title);
			data.desc = module[i].description;
			data.url = module[i].coursePath;
			data.systemId = module[i].systemId;
			data.createUserId = module[i].createUserId;
			data.infoStatus.id = module[i].infoStatus.id;
			data.customDataId = module[i].customDataId;
			data.newImageId = module[i].newImageId;
			if (module[i].newImage != '')
				data.courseImg = module[i].newImage;
			else
				data.courseImg = module[i].courseImgURL;
			data.courseImgURL = module[i].courseImgURL;
			data.visibilityTypesStatus = module[i].visibilityTypesStatus;
			data.visibilityTypes = module[i].visibilityTypes;
			break;
		}
	}

	var stop = i;

	mlist[stop] = module[i === 0 ? l - 1 : i - 1];
	for ( var i = 1; i < l; ++i) {
		if (i < stop)
			mlist[i] = module[i - 1];
		else if (i > stop)
			mlist[i] = module[i];
	}

	mlist[0] = module[stop];

	data.Language = mlist;
	return data;
};
