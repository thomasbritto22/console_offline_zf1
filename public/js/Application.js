if(typeof(Lrn) == 'undefined') Lrn = {};

var agentType = navigator.userAgent.match(/msie|firefox|chrome|android|ipad|iphone|safari|Trident\/7/i)[0];

//only for IE 11
if ("Trident/7" == agentType){
	agentType = "MSIE";
}

Lrn.Browser = {
	type: agentType,
	version: null,
	init: function(){
		this.version = this.getVersion();
		this.testFont();
	},
	getVersion: function(){
		var reg = new RegExp(this.type+'(\/|\s|\ )[0-9]+','i');
		var match = navigator.userAgent.match(reg);
		var version = 0;
		if(!match || !match.length || match.length > 2){
			match = navigator.userAgent.match(/version\/[0-9]+/i);
			if(match && match.length && match.length > 0)
				version = match[0].substr(8);
		}else
			version = match[0].replace(this.type,'').substr(1);
		return parseInt(version,10);
	},
    // This needs to be redone when we refactor admin.js and find where
    // it is hanging when you go to site customization  || 'undefined' === typeof $.cookie('IEFont') 
    //removed the if condition which used cookie to set value 1 . Removed cookie from rest controller too.
	testFont: function(){
		$(document.body).addClass('notshow');
                $(document.body).removeClass('notshow');
                $(document.body).addClass('show');
	},
	webfonts: true
};
// make sure to change back to $(window).load() once we figure out the admin.js issue
$(window).load(function(){Lrn.Browser.init();});


/**
 * --- LRN APPLICATION ---
 * Application is the base prototype for the entire app. All other
 * JS objects for this application inherit from Application.
 * Any methods or objects that need to be accessible from
 * anywhere in the app should be instanciated or appended
 * to this object class. Other apps use this object by setting
 * their prototype = new Lrn.Application();
 * @returns {Lrn.Application}
 */
Lrn.Application = function(config){
    if(config){
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
        this.SAMLResponse = config.SAMLResponse || null;
        this.edgeAuthCookieDomain = config.edgeAuthCookieDomain || '.lrn.com';
    }
//    document.domain = "lrn.com";
    this.siteState = new Lrn.Widget.SiteState();
    this.mobileNavigation = new Lrn.Widget.MobileNavigation();
};

Lrn.Application.prototype = {
    
    user: null,
    legacy: null,
    messageQueue: null,
    messageQueueIdx: 0,
    /**
     * --- APPLICATION INIT ---
     * This starts of the process. Makes sure that the
     * header links are active, that we have a preloader
     * to use when waiting for server responses, and sets
     * up a Legacy object we can use for passthru to 
     * the various legacy applications (LCEC, AIM, RAM).
     */
    init: function(){
        // instanciate the legacy object used by 
        // other objects for legacy app passthru
        this.legacy = new Lrn.Legacy({
            siteConfigs: this.siteConfigs,
            SAMLResponse: this.SAMLResponse
        });

        this.initNavLoc();

        this.adminMenuClick();
        
        //enable click the lcec passthru menu and open new window
        this.initLcecPassThruClick();

        this.initClickLogout();
        
        // this.initFooter();

        this.setSiteLogo();
        this.initEmailResourcefix();
        this.initRemoveSettingsLink();        
        
        
        // open lightbox for themeing UI
        $('[href="/admin/theme"]').colorbox({
        	iframe:true,
        	width:"997",
        	height:"680",
        	opacity:".75",
        	scrolling: false,
        	overlayClose: false
        });
        
        $(document).bind('cbox_closed', function(){ location.reload(); });
        $("#button_cancel").click(function() {
            parent.$.colorbox.close();
            return false;
        });

        // if($(window).width() <= '767') {
        //     this.mobileNavigation.init();
        // }
        // window.addEventListener('resize', this.mobileNavigation.init());
        // var resizeTime;
        // $(window).resize(function() {
        //     clearTimeout(resizeTime);
        //     resizeTime = setTimeout(this.mobileNavigation.init(), 400);
        // }.bind(this));

    },
     
    /**
     * --- APPEND TO SELECT ---
     * Because IE has problems adding nodes directly to
     * select elements, we need to have a method that can
     * do this via a workaround. Works in all browsers.
     * @param selectObj
     * @param optionObj
     */
    appendToSelect: function(selectObj, optionObj){
        if(selectObj != null && selectObj.options != null){
            // create a new option using four parameters (needed for IE quirkiness)
            var newOpt = new Option(optionObj.text, optionObj.value, false, optionObj.isSelected); 
            // add new option to the options array for the select object
            selectObj.options[selectObj.options.length] = newOpt;
        }
    },
    
    /**
     * --- INITIALIZE SYSTEM MESSAGES ---
     * Starts the display of queued messages to the user.
     */
    initSystemMessages: function(){
        // create a var for 'this' for different scopes
        var appMgr = this;
        
        $('#footer .close').on('click',function(){
            // in order to get the message ribbon to slide down
            // we will need to use .hide() with a 'slide' effect arg.
            // but since this will also raise the black ribbon, we
            // will have to set display to 'block' (hide() sets to 'none')
            // but keep invisible by setting visibility to 'hidden'
            // this keeps black footer seated on bottom of screen.
            $('#f_top').fadeOut();
        });
        
        // play the queue of messages. if we call the method
        // directly from setInterval, then 'this' becomes 'window'
        // so we need to call a function which then calls our
        // update method. Keeps 'this' scoped to Application.
        this.messageQueueInterval = setInterval(function(){            
            appMgr.updateSystemMessage();
        }, 5000);
    },
    
    /**
     * --- ENQUEUE MESSAGES ---
     * Adds a message (with optional icon) to the array
     * of messages that should be displayed to the user.
     * Each message is a JSON object containing the message
     * and an optional icon image.
     * @param config
     */
    enqueueMessage: function(msgObj){
        // make sure our queue is an array we can append to
        if(this.messageQueue == null) this.messageQueue = [];
        
        // add the message to the queue
        this.messageQueue.push(msgObj);
        
        // figure out the index of the last message in the queue
        // we can use this to start showing new messages instead
        // of starting at the beginning. basically, it shows newly
        // added messages instantly.
        this.messageQueueIdx = this.messageQueue.length-1;
        
        // start the queue up again, starting at this message
        this.initSystemMessages();
    },
    
    /**
     * --- UPDATE SYSTEM MESSAGE ---
     * Updates the message space with messages from the
     * message queue. Fades out, changes, then fades in.
     */
    updateSystemMessage: function(){
        // set a var for 'this' for different scopes
        var appMgr = this;

        // if we've reached the end of our list or no list exists,
        // clear the interval leaving the last message visible.
        if(appMgr.messageQueue == null || appMgr.messageQueueIdx >= appMgr.messageQueue.length){
            clearInterval(appMgr.messageQueueInterval);
            // you may want to reset idx to start at the beginning
            // of the list the next time this runs...
            // DO NOT reset messageQueueIdx because you will
            // never meet the conditions to stop the interval!
        }
        else {
            // use the message index to get the current message from queue
            var message = this.messageQueue[this.messageQueueIdx];   
            
            // we will use the thumbs up icon if none is sent.
            var icon = message.icon || 'images/icons/thumb-up.png';
            
            // fade current message out, change it, then fade in
            $('#footerMessage').fadeOut(600, function(){
                $('#footerMessage').css('background', "url(" + icon + ") no-repeat 12px 7px");
                $('#footerMessage').html(message.message);
                $('#f_top').fadeIn(600);
                $('#footerMessage').fadeIn(600);
                
                // increment the index for the next message
                // or to clear the interval on next run.
                appMgr.messageQueueIdx++;
            });
        }
    },

    scaleImage: function(e,el){
    	if(e && e.target)
    		e.target = e.target && e.target.naturalWidth ? e.target : (el && el.className ? this.getNaturalDims(el) : this.getNaturalDims(e.srcElement));
    	else{
    		e = e || {};
    		e.target = this.getNaturalDims(el);
    	}
    	$target = $(e.target);
    	var $width = $target.parent().width();
    	var $height = $target.parent().height();
    	var scale = e.target.naturalHeight > $height || e.target.naturalWidth > $width;
    	var aspect = $width/$height;
    	var aligned = $target.hasClass('aligned');
    	var extended = $target.hasClass('extended');
    	var factor = 1;
    	if(aspect > 1){
    		if(scale && !extended){
	    		$target.css('width','auto');
	    		$target.css('height','100%');
	      		factor = e.target.naturalHeight/$height;
    		}else if(extended){
    			$target.css({'max-width':'','max-height':''});
    			var w = $width;
    			var h = $height;
    			aspect = w/h;
    			if(w > h){
    				h = Math.ceil(e.target.naturalHeight*w/e.target.naturalWidth);
    			}else{
    				w = Math.ceil(e.target.naturalWidth*h/e.target.naturalHeight);
    			}
    			$target.css('margin-left','0px');
    			$target.css('margin-top','0px');
    			$target.css('width',w+'px');
	    		$target.css('height',h+'px');
	    		$target.attr('width',w);
	    		$target.attr('height',h);
	    		$target.css('max-height',h+'px');
	    		$target.css('max-width',w+'px');
    		}else{
    			$target.css('width',e.target.naturalWidth+'px');
	    		$target.css('height',e.target.naturalHeight+'px');
	    		var mt = $target.css('margin-top');
				mt = mt && mt.length && mt.length > 0 && !mt.match(/\%/) && mt !== 'auto' ? parseInt(mt,10) : false;
				$target.css('margin-top', (($height - e.target.naturalHeight)/2)+'px');
    		}
    		if(!(extended || aligned)){
	    		var ml = $target.css('margin-left');
				ml = ml && ml.length && ml.length > 0 && !ml.match(/\%/) && ml !== 'auto' ? parseInt(ml,10) : false;
				var mt = $target.css('margin-top');
    			mt = mt && mt.length && mt.length > 0 && !mt.match(/\%/) === 0 && mt !== 'auto' ? parseInt(mt,10) : false;
				$target.css('margin-left', (ml || (($width - e.target.naturalWidth/factor)/2))+'px');
    		}
     	}else{
    		if(scale && !extended){
	    		$target.css('height','auto');
	    		$target.css('width','100%');
	    		factor = e.target.naturalWidth/$width;
    		}else if(extended){
    			$target.css({'max-width':'','max-height':''});
    			var w = $width;
    			var h = $height;
    			aspect = w/h;
    			if(w > h){
    				h = Math.ceil(e.target.naturalHeight*w/e.target.naturalWidth);
    			}else{
    				w = Math.ceil(e.target.naturalWidth*h/e.target.naturalHeight);
    			}
    			
    			$target.css('margin-left','0px');
    			$target.css('margin-top','0px');
    			$target.css('width',w+'px');
	    		$target.css('height',h+'px');
	    		$target.attr('width',w);
	    		$target.attr('height',h);
	    		$target.css('max-height',h+'px');
	    		$target.css('max-width',w+'px');
    		}else if(!aligned){
    			var ml = $target.css('margin-left');
    			ml = ml && ml.length && ml.length > 0 && !ml.match(/\%/) === 0 && ml !== 'auto' ? parseInt(ml,10) : false;
    			var mt = $target.css('margin-top');
    			mt = mt && mt.length && mt.length > 0 && !mt.match(/\%/) === 0 && mt !== 'auto' ? parseInt(mt,10) : false;
    			$target.css('width',e.target.naturalWidth+'px');
	    		$target.css('height',e.target.naturalHeight+'px');
    			$target.css('margin-left', ( ml ||  (($width - e.target.naturalWidth)/2))+'px');
    		}
    		if(!extended){
				var mt = $target.css('margin-top');
				mt = mt && mt.length && mt.length > 0 && !mt.match(/\%/) && mt !== 'auto' ? parseInt(mt,10) : false;
	    		$target.css('margin-top', (($height - e.target.naturalHeight/factor)/2)+'px');
    		}
     	}
    },
    getNaturalDims: function(img){
    	img = $(img);
    	img = (img && img[0] && img[0].src) ? img[0] : false;

    	var tmp = new Image();
    	tmp.src = img.src;
    	
    	img.naturalWidth = img.naturalWidth || tmp.width;
    	img.naturalHeight = img.naturalHeight || tmp.height;
    	return img;
    },
    eachCustomFileImg: function(idx,el){
    	$el = $(el);
    	$el.hide();
    	$el.css('background-color','transparent');
    	$el.on('load',this.scaleImage.bind(this));
    	$el.show();
    	$el.on('change',this.scaleImage.bind(this));
    	if(navigator.userAgent.match(/MSIE/)){
    		var e = {};
    		e.target =  el && el.naturalWidth ? el : this.getNaturalDims(el);
    		this.scaleImage(null,e);
    	}	
    },

    /**
     * --- ASSIGN ACTIVE CLASS TO CURRENT LOCATION ---
     * Find out where on the site we are and assign the
     * active class to the corresponding location in
     * the Nav menu
     */
    initNavLoc: function() {
    	
        // get our url and store it in a variable
        var path = window.location.pathname.length > 1 ? window.location.pathname.substring(1).replace(/\/$/,'') : ($('nav .fa-home').length > 0 ? 'index' : 'learn/queue');

        // get our url and split so we can check for admin later
        var adminPath = path.split('/')[0];

        // pass the active class to the respective parties
        $('ul.nav > li > a[href^="/' + path + '"]').parent().addClass('active');
        $('.adminNav>li>a[href^="/' + path + '"]').parent().addClass('active');
        
        // if this is in the admin section, make sure that section is displayed block
        if(adminPath === 'admin') {
            $('.adminNav').css({ 'display': 'block'});
        }
    },

    /**
     * --- ASSIGN A CLASS TO THE ADMIN SECTION WHEN CLICKED ---
     * This function is for mobile/iPad devices.  Since there is
     * no hover state on those devices, we simply assign a CSS class
     * to the LI.  We then style that class how we need.
     */
    adminMenuClick: function() {
       
        // get the admin settings li and assign a click
        // function to it
        $('#adminSectionLink').click(function() {

            // add the 'clicked' class to that li
            $('#adminSectionLink').addClass('clicked');
            
        });
    },

    /**
     * click the LCEC PassThru link and open the new popup window
     */
    initLcecPassThruClick: function(){
    	
    	var title = 'LCECAdmin';
    	var passThruWindow = null;
    	
    	$('#lcecPassThru').unbind('click');
    	$('#lcecPassThru').click(function(e){
    		e.preventDefault();
    		e.stopPropagation();
            
    		passThruWindow = window.open('/samlredirect?app=lcec&targetURI=/app/page/AdminTools', title, "resizable=1,width=" +($(document).width()-50)+ ",height=800,scrollbars=1,status=1,toolbar=1,location=1");
    	});
    	
    	$(window).unload(function(e) {
    		if (null != passThruWindow && false == passThruWindow.closed){
    			passThruWindow.close();
    		}
    	});
    	
    	$(window).on('beforeunload', function(e){
    		var path = location.pathname.split("/");
    		
    		if (null != passThruWindow && false == passThruWindow.closed && !(path[1] == "profile" && path[2] == "edit")){
    			return "Your LCEC Admin window will be closed. Please save your changes!";
    		}
    	});    	
    },

    initFooter: function(){
        var footerWidth = $('#footerWrapper').outerWidth( false );
        var fImagesWidth = $('#footerImages').outerWidth();
        var fLinksWidth = $('#footerLinks').outerWidth();
        var totalWidth = fImagesWidth + fLinksWidth;
        var x = footerWidth / 2;
        var y = - + Math.round(x);

        $('#footerWrapper').css({"margin-left": + y + 'px', "width": + totalWidth + 'px'});
    },

    setSiteLogo: function(){
        var containerPosition = $('#contentWrapper').offset();
        var siteLogoElement = $('#siteLogo');
        var siteLogo = $('#siteLogo').outerWidth();
        var x = siteLogo / 2;
        var y = - + Math.round(x);

        if(siteLogo != '' && siteLogo <= 960 && siteLogoElement.hasClass('logoCenter')) {
            siteLogoElement.css({"margin-left": + y + 'px', 'left': '50%'});
        }
    },

    initMessage: function(imageName, alertText, idString){
        var bg = document.createElement('div');
        bg.className = 'messageBackground';
        bg.id = idString;

        var messageIconWrapper = document.createElement('div');
        messageIconWrapper.className = 'spinner';

        var messageIcon = document.createElement('img');
        messageIcon.setAttribute('src', CDN_IMG_URL + '/images/backgrounds/' + imageName);

        var message = document.createElement('p');
        var text = document.createTextNode(alertText);
        message.appendChild(text);
        message.className = 'siteMessage';
        
        messageIconWrapper.appendChild(messageIcon);
        messageIconWrapper.appendChild(message);
        bg.appendChild(messageIconWrapper);
        document.body.appendChild(bg);
    },

    removeMessage: function(delay, idString){
        setTimeout(function(){
            $('#' + idString).remove();
        }, delay);
    },

    /** 
     * --- INIT EMAIL RESOURCES ---
     * This function checks all the email
     * links that are in the right sidebar
     * and fixes any Ampersands so that
     * the mail client doesn't freak out
     **/
    initEmailResourcefix: function(){
        $('.emailLink').click(function(){
            var oldLink = $(this).attr('href');
            var emailFriendlyUrl = oldLink.replace(/&/g, '%26');  
            $(this).attr('href', emailFriendlyUrl);
        });
    },
    /**
     * --- REMOVE SETTINGS LINK ON DEVICES ---
     * This function checks to see if the user
     * is on some kind of device.  If they are
     * then we do not want them to have access
     * to the admin area.  So we want to remove
     * the settings link if they are on a device.
     **/
    initRemoveSettingsLink: function(){
        if(isMobile.any()) {
            $('#adminSectionLink').hide();
        }
    },
    
    //delete the edge-auth cookie when logout
    initClickLogout: function(){
    	$('#menuLogout').click(function(){
    		document.cookie="edge-auth=deleted; path=/; domain=" +edgeAuthCookieDomain; 
                if (window.localStorage){
                    localStorage.clear(); // remove the local storage data
                 }
    	});
    },

    initMyStatus: function() {
        //do an ajax request to get the module status
        $.ajax({
            //dataType: 'json',
            type: 'GET',
            url: '/mystatus/index',
            success: function(response){
                $('#myQueueInfo').html(response);
                if( window.location.href.match(/learn\/queue/) != null ) {
                    $('#myQueueInfo .linkRight').hide();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 500) {
                    console.log('Internal error: ' + jqXHR.responseText);
                } else {
                    console.log('Unexpected error.');
                }
            },            
        });
    }

    /* Commented as of 02/18/2015
    // Getting ASession
    getASsession: function(dat){
    	
    	
        // do an AJAX call to retrieve the list of components
        $.ajax({
            //dataType: 'json',
        	type: 'post',
        	data: dat,
        	url: '/cgi-bin/generateLCECSession.cgi',
            success: function(response){
           	
            	 $.ajax({
            	        //dataType: 'json',
            	    	type: 'post',
            	    	data: 'asVal='+response,
            	    	url: '/app/assession',
            	        success: function(res){
            	        	return res;
            	        },
            	        error: function (jqXHR, textStatus, errorThrown) {
            	            if (jqXHR.status == 500) {
            	                console.log('Internal error: ' + jqXHR.responseText);
            	            } else {
            	                console.log('Unexpected error.');
            	            }
            	        },
            	        complete: function(){
          
            	        }
            	 });
            	
            },
            
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 500) {
                    console.log('Internal error: ' + jqXHR.responseText);
                } else {
                    console.log('Unexpected error.');
                }
            },
            
            
        });
        }
    */
};

