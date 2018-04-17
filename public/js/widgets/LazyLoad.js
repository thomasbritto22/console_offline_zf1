if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.LazyLoad = function(config, queueObj){
	if ("undefined" != typeof queueObj && null != queueObj){
		this.queue = queueObj;
		this.queue.lazyLoadObj = this;
	}
	
    // if any config values are passed in, override defaults
    if(config) for(var c in config) this.config[c] = config[c];
    this.init();
};

Lrn.Widget.LazyLoad.prototype = new Lrn.Widget();
Lrn.Widget.LazyLoad.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.LazyLoad.prototype.isScrolling = false;// scrolling state to make sure our logic isn't always running until the scroll is complete
Lrn.Widget.LazyLoad.prototype.isScrollingForTab = false;// scrolling state to make sure our logic isn't always running until the scroll is complete
Lrn.Widget.LazyLoad.prototype.ajaxCalled = false; //track if AJAX for this call has been already fired
Lrn.Widget.LazyLoad.prototype.loadContainer = null;
Lrn.Widget.LazyLoad.prototype.scrollInterval = null;
Lrn.Widget.LazyLoad.prototype.queue = null;
Lrn.Widget.LazyLoad.prototype.spinner = null; //DOM for the spinning gif that displays when waiting for the AJAX update
Lrn.Widget.LazyLoad.prototype.isIE8 = navigator.userAgent.match(/MSIE 8.0/) && navigator.userAgent.match(/MSIE 8.0/).length && navigator.userAgent.match(/MSIE 8.0/).length > 0 ? true : false;
Lrn.Widget.LazyLoad.prototype.scrollTop = function(){
	return this.isIE8 ? document.body.parentElement.scrollTop : $(window).scrollTop();
};

Lrn.Widget.LazyLoad.prototype.mandatoryHrShown = false;
Lrn.Widget.LazyLoad.prototype.optionalHrShown = false;
Lrn.Widget.LazyLoad.prototype.selectAnyHrShown = false;
 

Lrn.Widget.LazyLoad.prototype.config = {
	ajaxUrl: '/learn/lazyqueue',			//REST URL to get new elements
	params: {								//GET params for the REST URL
		maxPerPage: 10,
		start: 10
	},
	container: '#mqItemWrap',				//jQuery selector for the DOM container
	epsilon: 100,							//threshold in px to determine when to fire the lazy load
	loadItemCB: false,						//overriding callback to assemble the elements,
	spinSelector:'#mqSpinner',				//selector for the spinning gif
	displayMaxLength: 150
};
/**
 * init()
 */
Lrn.Widget.LazyLoad.prototype.init = function(){
	//first set the scrolling status to true for the first load
	this.isScrolling = true;
        this.isScrollingForTab = false;
	this.firstLoad = true;
	
	//set the container we'll be appending the new items to...
	this.loadContainer = $(this.config.container);
	this.spinner = $(this.config.spinSelector);
	
	//we need the window object to track mouse scrolling
	var $window = $(window);
	$('html').animate({ scrollTop: 0 }, 100);

	$window.off('scroll');
	$window.on('scroll',function(){this.onscrollLazyLoad();}.bind(this));
	$window.on('keydown',function(e){this.onTabLazyLoad(e);}.bind(this));
	
	this.scrollInterval = setInterval(this.onWindow.bind(this), 500);
	//this.scrollInterval = setInterval(this.onWindow,1500);
	
	this.loadItems = this.config.loadItemCB || this.loadItems;
	$('#hrShown').val('No');
        
        this.mandatoryHrShown = false;
        this.optionalHrShown = false;
        this.selectAnyHrShown = false;
};
/**
 * loadItems() -- builds the items on lazy load.
 * This is expected to be mutable -- just append your newly-created DOM elements to this.loadContainer
 * @param data
 */
Lrn.Widget.LazyLoad.prototype.loadItems = function(data){

	var siteLabels = this.queue.siteLabels;

	if(data.length > 0){
		//make sure the hide the empty text
		$(this.queue.htmlEmptyTextDivBoxId).hide();
	}
	
	var hrShown = $('#hrShown').val() == 'No' ? false : true;
                
        var lastSelectAnyGroup = 0;
        
	for(var i=0,l=data.length;i<l;++i){
		var href = data[i].destination;
		var dueDate = '';
		dueDate = '<p class="date contentTextIcons font-style4"';
		if(this.queue.optionalCourse(data[i])){
			dueDate += 'title + "' +siteLabels.Optional+ ' ">' +siteLabels.Optional;
		} else {
			dueDate += data[i].dueDate === null ? ' title="' +siteLabels.NoDueDate+ '">' + (true == this.queue.notACourse(data[i]) ? '' : siteLabels.NoDueDate) : 'title="' +data[i].dueDate+ '">' +data[i].dueDate;
		}
		dueDate += '</p>';
		
		var translations = '';
		var m = data[i].languages ? data[i].languages.length : 0;
		var defaultLangselected = '';
		var showCompletedHr = false;
                var showMandatoryHr = false;                
                var showSelectAnyHr = false;
                var showOptionalHr = false;
                
                 
    	if(!showCompletedHr) {
			if(this.queue.completed(data[i])){
				showCompletedHr = true;
				href = this.queue.buildCourseUrl(data[i]);
			}
		}
                
                if( !showMandatoryHr) {
                    if( this.queue.mandatoryCourse(data[i]) || data[i].category == "certRevise" || data[i].category == "certReview" || data[i].category == "aimSurvey") {
                       showMandatoryHr = true;
                    }
                }
                                               
                if( !showSelectAnyHr) {
                    if( this.queue.selectAnyCourse(data[i]) ) {
                        showSelectAnyHr = true;
                    }
                }
                
                if( !showOptionalHr) {
                    if( this.queue.optionalCourse(data[i]) ) {
                        showOptionalHr = true;
                    }
                }
    	var courseCustomDesc = data[i].customDesc;
		var courseDesc = data[i].desc;
		var courseTitle = data[i].name;
		var courseImg = data[i].img;
		if(m > 1){
			translations += '<div class="languageSection">' +
	        				'<select name="languageOptions" class="mqItemLangSelect font-style1">';
			var userLangEbld = 'N';
	    	var defOption = '';
	    	var userLangSystemId = '';
	    	var langSysId = '';
	    	var enSystemId = '';
	    	var enUKSystemId = '';
	    	var enIESystemId = '';
	    	
			for(var j=0;j<m;++j){
				if(data[i].userModulePrefLang != null && data[i].userModulePrefLang == data[i].languages[j].language){
	    			userLangEbld = 'Y';
	    			langSysId = data[i].languages[j].systemId;
	    		}
				if(this.queue.siteDefLang == data[i].languages[j].language){
					userLangSystemId = data[i].languages[j].systemId;
	    		}
				if(this.queue.DEFAULT_LANGUAGE_INTENG == data[i].languages[j].language){
	    			enIESystemId = data[i].languages[j].systemId;
	    		}
				if(this.queue.DEFAULT_LANGUAGE_UKENG == data[i].languages[j].language){
	    			enUKSystemId = data[i].languages[j].systemId;
	    		}
				if (data[i].systemId == data[i].languages[j].systemId){
					defOption = data[i].languages[j].systemId;
				}
			}
			
			if(userLangEbld == 'N'){
				if(userLangSystemId != ''){
	    			userLangEbld = 'Y';
	    			langSysId = userLangSystemId;
	    		} else if(enIESystemId != '')
					langSysId = enIESystemId;
				else if(enUKSystemId != '')
					langSysId = enUKSystemId;
				else
					langSysId = defOption;
			}
				
			
			for(var j=0;j<m;++j){
				var language = data[i].languages[j].label;
				var langval = data[i].languages[j].language;
				var courseLangDesc = data[i].languages[j].description;
				var courseLangCustomDesc  = data[i].languages[j].customDesc;
				
				var imgUrl = '';
				if(data[i].languages[j].newImage !='')
					imgUrl = data[i].languages[j].newImage;
				else {
					if(data[i].languages[j].courseImgURL != '/images/samples/defaultModuleImage.jpg'){
						if(data[i].languages[j].courseImgURL != null)
							imgUrl = data[i].imgurlbase + data[i].languages[j].courseImgURL;
						else
							imgUrl = CDN_IMG_URL + '/images/samples/defaultModuleImage.jpg';
					}
					else
						imgUrl = data[i].languages[j].courseImgURL;
				}
				
				if (langSysId == data[i].languages[j].systemId){
					defaultLangselected = 'selected';
					courseCustomDesc = data[i].languages[j].customDesc;
					courseDesc = data[i].languages[j].description;	
					courseTitle = data[i].languages[j].courseShortName;
					href = href.replace('systemId='+data[i].systemId, 'systemId='+langSysId);
					courseImg = imgUrl;
				}else{
					defaultLangselected = '';
				}
				var courseLangDesc = ((courseLangCustomDesc == '' || "undefined" == typeof courseLangCustomDesc || courseLangCustomDesc == "undefined") ? (courseLangDesc != null ? courseLangDesc : '') : courseLangCustomDesc);
				descriptions[data[i].languages[j].systemId] = unescapeHtml(courseLangDesc);
				
				translations += '<option data-systemid="'+data[i].languages[j].systemId+'" data-courseLink="' + href + '" data-onclick="document.location.href=\'' + href + '\'" data-cousename="'+escapeHtml(data[i].languages[j].courseShortName)+'" data-imgurl="'+imgUrl+'" value="'+langval+'" ' +defaultLangselected+ '>'+
								language+
								'</option>';
			}
		    translations += '</select>' +
		    				'</div>';
		    
		}
		
		var completedModHr = '';                
                var moduleTitleHr = '';
               
		if(showCompletedHr && !hrShown){
                    //completedModHr = '<h3 class="courseSeparator contentTextIcons borderBottomMedium">' +siteLabels.CoursesCompleted+ '</h3>';
                    $('#hrShown').val('Yes');
                    hrShown = true;
		}
                
                if(showMandatoryHr && !this.mandatoryHrShown ){
                    moduleTitleHr = '<h3 class="contentTextIcons courseSeparator borderBottomMedium">'+siteLabels.Mandatory+'</h1>';
                    this.mandatoryHrShown = true;
		}
        		
		if(showSelectAnyHr && !this.selectAnyHrShown ){
                    moduleTitleHr = '<h3 class="contentTextIcons courseSeparator borderBottomMedium">'+siteLabels.Selectany+'</h1>';
                    this.selectAnyHrShown = true;
		}

                if(showOptionalHr && !this.optionalHrShown ){
                    moduleTitleHr = '<h3 class="contentTextIcons courseSeparator borderBottomMedium">'+siteLabels.Optional+'</h1>';
                    this.optionalHrShown = true;
		}
                
                if( this.queue.selectAnyCourse( data[i] ) ) {                    
                    if($('#group_' + data[i].group).length == 0 && lastSelectAnyGroup != data[i].group ) {
                        //completedModHr = '<p class="font-style4 contentTextIcons courseSeparator font-margin">Complete '+ data[i].reqCourseCnt + ' of ' + data[i].totalModules + ' items from the list below : '+ data[i].modulesRemaining +' REMAINING</p>';
                        completedModHr = '<p class="font-style4 contentTextIcons courseSeparator font-margin" id="group_'+data[i].group+'">' + this.queue.builSelectAnyGroupingText( data[i]  )+ '</p>';
                        lastSelectAnyGroup = data[i].group;
                    }
                }
       
				
		var courseDesc = ((courseCustomDesc == '' || "undefined" == typeof courseCustomDesc || courseCustomDesc == "undefined") ? (courseDesc != null ? courseDesc : '') : courseCustomDesc);
        		
				
        var htmlCourseLinkClass = 'courseLink';
    	// If the ID is CertReview then append certReview at the end
    	if ( 'certReview'== data[i].id ){
    		htmlCourseLinkClass += data[i].id;
    	}
    	else {
    		// Restore Default otherwise
    		htmlCourseLinkClass = 'courseLink';
    	}
    	
		var template = moduleTitleHr+completedModHr + '<div id="' + data[i].id + '" class="column oneThirdColumn mqItem contentBgColor borders">' +
	            '<p class="courseNumber contentTextIcons font-style4">' +('undefined' != typeof (data[i].catalogId)? data[i].catalogId : '')+ '</p>' +
	            '<div class="mqItemImage contentImageBorder" tabindex="0">'+
	            '<a href="'+href+'" class="course-img-link ' + htmlCourseLinkClass + '" data-windowopen="' +this.queue.windowOpenStatus(data[i])+ '" data-certificationid="' +data[i].certificationId+ '">'+
	            '<img src="'+courseImg+'" alt="'+unescapeHtml(courseTitle)+'" class="course-img">'+
	            '<div class="arrowWrapper"><span class="fa fa-play"></span><i class="material-icons play">&#xE037;</i></div>'+
	            '</a>' +
	            '</div>' +
	            '<div class="mqItemInfo" tabindex="0">' +
		        '<h4>' +this.queue.buildChainIcon(data[i])+
		        	'<a href="'+ href +'" class="course-title-link ' + htmlCourseLinkClass + '" data-windowopen="' +this.queue.windowOpenStatus(data[i])+ '" data-certificationid="' +data[i].certificationId+ '">' +
		        		'<span class="course-title contentTitles font-style6">'+unescapeHtml(courseTitle)+'</span>' +
		        	'</a>' +
				'</h4>' +
				'<div class="contentTextIcons font-style3 customDescription courseDescription" id="courseDescription_'+data[i].id+'">' + unescapeHtml(courseDesc)+ '</div>' +
				'<div class="mqItemInfofade"></div>'+
	            '</div>' +
	        	'<div class="mqItemMeta secondaryBgColor">' +
	        		'<div class="infoLeft clearfix">' +this.queue.buildStatusIcons(data[i])+dueDate+ '</div>'+
	        		translations +
	        	'</div>'+
	   			'</div>';
		
		var $template = $(template);
		$template.css('visibility','hidden');
		$template.appendTo(this.loadContainer).hide();
		$template.css('visibility','visible');
		$template.fadeIn(500);
		
		//change the language as well if the listView have already changed language
		if("undefined" != typeof this.queue.rowSelectedLanguage['row'+data[i].id]){
			$template.find('select.mqItemLangSelect').val(this.queue.rowSelectedLanguage['row'+data[i].id]).trigger('change', false);
		}
	}
};
/**
 * onscrollLazyLoad() -- scrolling callback
 */
Lrn.Widget.LazyLoad.prototype.onscrollLazyLoad = function(e){
	//we'll set isScrolling to true -- boolean assignments are cheap
	this.isScrolling = true;
};
Lrn.Widget.LazyLoad.prototype.onTabLazyLoad = function(e){
	
    if ($('#mqItemWrap > div').last().find('.course-img-link').is(":focus") == true) {
       
        this.isScrollingForTab = true;
        this.isScrolling = true;
    }
    
};
/**
 * onWindow() -- callback for once scrolling has stopped
 */
Lrn.Widget.LazyLoad.prototype.onWindow = function(e){
	if(this.isScrolling && this.queue.mode == this.queue.queueModes.image.name){
		var $window = $(window);
		var $doc = $(document);
		if(true == this.firstLoad || this.scrollTop() + $window.height() > $doc.height() - this.config.epsilon || this.isScrollingForTab){
			if(false == this.firstLoad){
				this.spinner.fadeIn();
			}
			
			this.firstLoad = false;
                        this.isScrollingForTab = false;
			
			this.xhrLoadItems(this.queue.queueImageSearchData.slice(this.queue.getCursor(), this.queue.getCursor()+ this.config.params.maxPerPage));
			this.queue.setCursor(this.queue.getCursor()+ this.config.params.maxPerPage);
		}
		this.isScrolling = false;
	}
};
/**
 * xhrLoadItems() -- AJAX callback
 * 
 * NOTE: context has been enforced back to the LazyLoad object
 */
Lrn.Widget.LazyLoad.prototype.xhrLoadItems = function(data){
	if(false == this.firstLoad){
		this.spinner.fadeOut();
	}
	
	//if we've reached the end, disable all callbacks for lazyload
	if(!(data instanceof Array) || data.length < this.config.params.maxPerPage){
		var $window = $(window);
		//var noscroll = this.onWindow ? this.onWindow.bind(this) : false;
		var noscroll = this.onWindow ? true : false;
		
		if(noscroll){
			$window.off('scroll');
			clearInterval(this.scrollInterval);
			//this.onscrollLazyLoad = null;
			//this.onWindow = false;
			//this.scrollInterval = false;
		}
	}

	this.loadItems(data);
	this.config.params.start += this.config.params.maxPerPage;
	this.isScrolling = false;
};
