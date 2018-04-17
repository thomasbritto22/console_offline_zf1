if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};
Lrn.Application.Catalog = function(config){
	if(!this.__proto__)
		this.__proto__ = this;
	for(var i in this.__proto__){
		if(this.__proto__.hasOwnProperty(i))
			this[i] = this.__proto__[i];
	}
    this.init(config);
    
};



/**
 * --- Catalog PROTOTYPE ---
 */
Lrn.Application.Catalog.prototype = new Lrn.Application();
Lrn.Application.Catalog.prototype.superclass = Lrn.Application.prototype;

/**
 * --- Catalog properties ---
 */
Lrn.Application.Catalog.prototype.table = null;
Lrn.Application.Catalog.prototype.baseJSONData = null;
Lrn.Application.Catalog.prototype.languages = null;
Lrn.Application.Catalog.prototype.searchable = true;
Lrn.Application.Catalog.prototype.sortable = true;
Lrn.Application.Catalog.prototype.sortDirection = 'asc';
Lrn.Application.Catalog.prototype.rawJSON = null;
Lrn.Application.Catalog.prototype.siteLabels = {};
Lrn.Application.Catalog.prototype.openArray = [];
/**
 * --- Catalog methods ---
 */
Lrn.Application.Catalog.prototype.init = function(config){
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
    
    //copy the config here instead in the constructor
	if(config){
	    for(var i in config){
			this[i] = config[i];
        }
    }
	
	if(config.table){
		this.createTable();
	}
};

Lrn.Application.Catalog.prototype.createTable = function(e){
	var table = $(this.table);
	this.baseJSONData.bProcessing = true;
	this.baseJSONData.sPaginationType = "full_numbers";
	
	var select =  '<select>'+
    '<option value="10">10</option>'+
    '<option value="20">20</option>'+
    '<option value="30">30</option>'+
    '<option value="40">40</option>'+
    '<option value="50">50</option>'+
//    '<option value="-1">All</option>'+
    '</select>';
	var menu = this.baseJSONData.siteLabels.ShowEntries;
	menu= menu.replace("%numRecords%",select);
	this.baseJSONData.oLanguage = {
		       "sSearch": this.baseJSONData.siteLabels.Search+":",
		       "sZeroRecords": this.baseJSONData.siteLabels.NoModsToDisplay,
		       "sLengthMenu": menu,
		       "oPaginate": {
		           "sNext": this.baseJSONData.siteLabels.Next,
		           "sPrevious":this.baseJSONData.siteLabels.Previous
		       }
		   };
	var siteDefLang = this.baseJSONData.siteDefLang;
	var DEFAULT_LANGUAGE_INTENG =  this.baseJSONData.DEFAULT_LANGUAGE_INTENG;
	var DEFAULT_LANGUAGE_UKENG =  this.baseJSONData.DEFAULT_LANGUAGE_UKENG;
	var courseTitle = this.baseJSONData.siteLabels.ModuleTitle || "Course Title";
	var moduleIdTitle = this.baseJSONData.siteLabels.ModuleID || "Module ID";
	var courseLangTitle = this.baseJSONData.siteLabels.Language || "Language";
	
	this.baseJSONData.aoColumns = [
       {
           mDataProp:  null,
           sTitle: "",
           sWidth: "10%",
           sClass: "control center closed contentTextIcons",
           sDefaultContent: "<div class=\"arrow\">&#9654;</div>"
        },
        { 
        	mDataProp: "Course Title",
        	sTitle: courseTitle,
        	sWidth: "50%",
        	sClass: "courseTitle",
        	mRender: function ( data, type, full ) {
        		return "<a href=\"/learn/preview?curriculumId=-1&moduleId="+full['Module ID']+"&systemId="+full.systemId+"\" class=\"contentTitles\">"+data+"</a>";
        	}
        },
        { 
        	mDataProp: "Module ID",
        	sTitle: moduleIdTitle,
        	sWidth: "30%",
        	sClass: "courseModuleId",
        	mRender: function ( data, type, full ) {
        		return "<a href=\"/learn/preview?curriculumId=-1&moduleId="+data+"&systemId="+full.systemId+"\" module-id =\""+data+"\" class=\"contentTitles\">"+full.catId+"</a>";
        	}
        },
        { 
        	mDataProp: "Language",
        	sTitle: courseLangTitle,
        	sWidth: "10%",
        	sClass: "courseLanguage contentTitles",
        	mRender : function ( data, type, full ) {
        		var opts = data[0].longLang;
        		
        		if(data.length > 1){
        			var defLangCode = '';
        			var enIELangCode = '';
        	    	var enUKLangCode = '';
        	    	
        			for(var i=0,l=data.length; i<l; ++i){
        				if(data[i].language == siteDefLang){
        					defLangCode = siteDefLang;
        				} else if(data[i].language == DEFAULT_LANGUAGE_INTENG){
        					enIELangCode = DEFAULT_LANGUAGE_INTENG;
        				}else if(data[i].language == DEFAULT_LANGUAGE_UKENG){
        					enUKLangCode = DEFAULT_LANGUAGE_UKENG;
        				}
        			}
        			if(defLangCode == '')
        				defLangCode = enIELangCode;
        			if(defLangCode == '')
        				defLangCode = enUKLangCode;
        			
        			opts = "<select>";
        			for(var i=0,l=data.length; i<l; ++i){
        				var selected = defLangCode == data[i].language ? 'selected' : '';
        				var tmp = '<option value="' + data[i].language + '" '+selected+'>' + data[i].longLang + '</option>';
        				opts += tmp;
        			}
        			opts += "</select>";
        		}

        		return opts;
        	}
        },
        { 
        	mDataProp: 'desc',
        	bVisible: false
        }
        
    ];
	var eachOnclickControl = function(i,e){
		e.onclick = null;
	//	e.onclick = this.onclickAccordion.bind(this);
		$(e).click(this.onclickAccordion.bind(this));
	}.bind(this);
	var expand = function(e){
		$('td.control',table).each(eachOnclickControl);
	//	$('.arrow',table).each(eachOnclickControl);
		$('select', table).on('change',this.onselectLanguage.bind(this));
	}.bind(this);
	
	this.baseJSONData.fnDrawCallback = function(){
		if(this.table instanceof jQuery){
			expand();
			var prev = $('#catalogTable_previous');
			var next = $('#catalogTable_next');
			prev.on('click',expand);
			next.on('click',expand);
			prev[0].className = "paginate_enabled_previous";
			next[0].className = "paginate_enabled_next";
			
			var settings = this.table.fnSettings();
			var total = settings.fnRecordsDisplay();
			var l = Math.ceil(total/settings._iDisplayLength);
			var page = Math.ceil(settings._iDisplayStart/settings._iDisplayLength)+1;

			if(page === 1){
				prev[0].className = "paginate_disabled_previous";
				if(l === 1)
					next[0].className = "paginate_disabled_next";
			}else if(page === l ){
				next[0].className = "paginate_disabled_next";
			}
		}
		
		// $("#catalogTable_paginate").addClass('clearfix');
		// $("#catalogTable_paginate > a.paginate_enabled_previous").addClass('contentTitles');
		// $("#catalogTable_paginate > a.paginate_enabled_next").addClass('contentTitles');
		// $("#catalogTable_paginate > span > a").addClass('borders contentTitles');
		// $("#catalogTable_paginate > a.first").addClass('contentTitles fa fa-step-backward').html('');
		// $("#catalogTable_paginate > a.last").addClass('contentTitles fa fa-step-forward').html('');
		// $("#catalogTable_paginate > span").attr("style", "float:left");
		$('#catalogTable_length').addClass('secondaryBgColor');
		$('#catalogTable_length > label').addClass('contentTextIcons');
		$('#catalogTable_filter').addClass('secondaryBgColor');
		$('#catalogTable_filter > label').addClass('contentTextIcons');
		// $('#catalogTable > thead').addClass('secondaryBgColor');
		$('#catalogTable > tbody > tr').addClass('secondaryBgColor borderBottomThin');
		$('#catalogTable > thead > tr > th.control').css({'width': '7.5%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
		$('#catalogTable > thead > tr > th.courseTitle').css({'width': '42%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
		$('#catalogTable > thead > tr > th.courseModuleId').css({'width': '19%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});
		$('#catalogTable > thead > tr > th.courseLanguage').css({'width': '30%', 'display': 'inline-block', 'vertical-align': 'middle', 'float': 'left', 'padding': '0'});

	}.bind(this);
	
	this.table = table.dataTable(this.baseJSONData);
	this.table.fnDraw();
};

Lrn.Application.Catalog.prototype.onclickPageChange = function(e,i){
	i = typeof(i) === 'number' ? i : parseInt(e.target.id.substr(8),10) - 1;
	this.table.fnPageChange(i);
	$('#gotoPage'+i).addClass('current');
};

 

Lrn.Application.Catalog.prototype.onclickAccordion = function (e) {
    
//	e.stopPropagation();
	var parent = $(e.target).parents('tr');
	
	var i = $.inArray( parent[0], this.openArray );
	if ( i === -1 ) {            
		var nDetailsRow = this.table.fnOpen( parent[0], this.formatDropDown(parent[0], e.target), 'details' );
		$('div.innerDetails', nDetailsRow).slideDown(500, function(){
			this.openArray.push( parent[0] );			
			parent.find('.arrow').html('&#9660;');
                        parent.find('.arrow').addClass("downicon");
		}.bind(this));
	} else {                
		$('div.innerDetails', parent.next()[0]).slideUp( 500,function () {
			this.table.fnClose( parent[0] );
			this.openArray.splice( i, 1 );
			parent.find('.arrow').html('&#9654;');
                        parent.find('.arrow').removeClass("downicon");                        
		}.bind(this));
	}
};

Lrn.Application.Catalog.prototype.formatDropDown = function ( parent, target ){
	var selectedLang = $(parent).find('select').val();
	var pos = this.table.fnGetPosition(parent);
	var oData = this.table.fnGetData( parent );
	var xlat = ("undefined" !== typeof selectedLang ? this.getTranslation(this.rawJSON[oData['Module ID']], selectedLang, pos) : oData);
	
	var src = typeof(xlat.courseImg) === 'string' ? xlat.courseImg.replace('http://','https://')  : CDN_IMG_URL + "/images/samples/defaultModuleImage.jpg";
//	var src = typeof(oData.courseImg) === 'string' ? oData.courseImg.replace('http://','https://') : "/images/samples/defaultModuleImage.jpg";
	var sOut = '<div class="innerDetails borderLeftThin borderBottomThin borderRightThin contentBgColor clearfix" style="display:none">'+
		'<a href="/learn/preview?curriculumId=-1&moduleId=' + oData['Module ID'] + '&systemId=' + xlat.systemId + '" class="clearfix">'+
			'<div class="courseDesc contentTextIcons">'+
			'<div class="courseImgWrap secondaryBgColor clearfix">'+
			'<img class="courseImg" src="'+ src + '" id="courseImg'+oData['Module ID']+'" />'+
			'</div>'+
			 (xlat.desc || "") + '</div>'+
		'</a>'+
	'</div>';

	var img = new Image();
	img.onerror = function(){
		img.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
		img.onload = null;
		img.onerror = null;
		var courseimg = $('#courseImg'+oData['Module ID']);
		courseimg.attr('src',this.src);
		delete img;
	};
	img.onload = function(){
		delete img;
	};
	img.src = src;
	return sOut;
};

Lrn.Application.Catalog.prototype.onselectLanguage = function ( e ) {
	e.stopPropagation();
	var $target = $(e.target);
	var $parent = $target.parents('tr');
	
	if($parent.length > 0){
		var moduleId = parseInt($($parent.children()[2]).find('a').attr('module-id'),10);
		var pos = this.table.fnGetPosition($parent[0]);
		
		var courseTitle = this.baseJSONData.siteLabels.CourseTitle || "Course Title";
		
		$parent[0].id = '#catalogRow' + pos;
		e.target.id = "#catalogDataLang" + pos;
		
		var xlat = this.getTranslation(this.rawJSON[moduleId], $target.val(), pos);
		
		//this.table.fnUpdate(xlat,pos,undefined,true,false);
		
		var settings = this.table.fnSettings();
		var page = Math.ceil((pos+1)/settings._iDisplayLength)-1;
		this.onclickPageChange(e, page);
		
		$parent.find('.courseTitle').find('a').html(xlat[courseTitle]);
		$parent.find('.courseTitle').find('a').attr('href',$parent.find('.courseTitle').find('a').attr('href').replace(/systemId=[A-Z0-9]+/,'systemId='+xlat.systemId));
		$parent.find('.courseModuleId').find('a').attr('href',$parent.find('.courseModuleId').find('a').attr('href').replace(/systemId=[A-Z0-9]+/,'systemId='+xlat.systemId));

		var next = $parent.next();
		var src = typeof (xlat.courseImg) === 'string' ? xlat.courseImg
				.replace('http://', 'https://')
				: CDN_IMG_URL + "/images/samples/defaultModuleImage.jpg";
		if(next.length > 0){
			if(next.hasClass('odd') || next.hasClass('even')){
				$parent.find('.arrow').html('&#9654;');
			}else{
				var desc = next.find('.courseDesc');
				var img = desc.find('img');
				img.attr('src', src);
				var wrap = $('<div class="courseImgWrap secondaryBgColor clearfix">');
				desc.empty();
				
				img.appendTo(wrap);
				wrap.appendTo(desc);
				var img = new Image();
				img.onerror = function(){
					img.src = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
					img.onload = null;
					img.onerror = null;
					var courseimg = $('#courseImg'+moduleId);
					courseimg.attr('src',this.src);
					delete img;
				};
				img.onload = function(){
					delete img;
				};
				img.src = src;
				
				next.find('a').attr('href',next.find('a').attr('href').replace(/systemId=[A-Z0-9]+/,'systemId='+xlat.systemId));
	
				desc.html(desc.html()+xlat.desc);
				$parent.find('.arrow').html('&#9660;');
			}
		}
		
	}
};

Lrn.Application.Catalog.prototype.getTranslation = function ( module, lang, pos ) {
	var mlist = [];
	var data = [];
	
	var courseTitle = this.baseJSONData.siteLabels.CourseTitle || "Course Title";
	
	for(var i=0,l=module.length;i<l;++i){
		if(lang === module[i].language){
			data = this.baseJSONData.aaData[pos];
			data[courseTitle] = module[i].title;
			data.desc = module[i].description;
			data.url = module[i].coursePath;
			data.systemId = module[i].systemId;
			if (module[i].newImage != undefined && module[i].newImage != '')
				data.courseImg = module[i].newImage;
			else
				data.courseImg = module[i].courseImgURL;
			break;
		}
	}

	var stop = i;
	
	mlist[stop] = module[i === 0 ? l-1 : i-1];
	for(var i=1;i<l;++i){
		if(i<stop)
			mlist[i] = module[i-1];
		else if(i>stop)
			mlist[i] = module[i];
	}
	
	mlist[0] = module[stop];
	
	data.Language = mlist;
	return data;
};

