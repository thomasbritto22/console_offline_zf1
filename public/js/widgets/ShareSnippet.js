if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};


/**
 * --- SHARE SNIPPET ---
 * This class represents a UI component that allows a user
 * to select text and/or share parts/thoughts on a course
 * with other users. Users are able to select text and have it
 * stored for pre-population of a form. Users are not required
 * to select text before using. The snippet widget allows the user
 * to determine the destination of their share content, and when
 * clicked, it will launch the dialog pertaining to the chosen
 * share destination (message board, social network, notes, etc.)
 * @param config
 * @returns {Lrn.Widget.ShareSnippet}
 */
Lrn.Widget.ShareSnippet = function(config){
    // if any config values are passed in, override defaults
    this.config = {};
    
    // by default this widget has no text pre-selected.
    this.config.selectedText = null;

    // set up default config values
    this.config.username = 'Your Name';
    this.config.coursename = 'Share To Dialog';
    this.config.chatterstatus = 'NotSet';
    this.config.curriculumId = '';
    this.config.systemId = '';
    
    var host = 'https://' + document.location.host;
    host = host.replace(/\-lcec/, '-console');
    this.config.host = host.replace(/\.course/, '');
    
   
  
    if(config) for(var c in config) this.config[c] = config[c];
};

Lrn.Widget.ShareSnippet.prototype = new Lrn.Widget();
Lrn.Widget.ShareSnippet.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.ShareSnippet.prototype.init = function(container){
    var snippetMgr = this;
	
    var siteName = this.getValueFromURL('siteName');
    
    if( siteName !== '') {
        this.config.host = this.config.host.replace(/[a-zA-Z0-9]*\-console/, siteName + '-console');
    }
    
    // add the escape/closing background
    if(typeof this.widgetEscape == 'undefined') this.createWidgetEscape(container);
    
    // create the destination dialog first
    // so that we can attach events to the snippet widget
    if(typeof this.destinationDialog == 'undefined') this.createDestinationDialog(container);
    
    // create the snippet widget last to attach events
    if(typeof this.snippetWidget == 'undefined') this.createSnippetWidget(container);
    
     $.ajax({
    	url: Lrn.Widget.ShareSnippet.config.host + '/learn/getsocialmediaproperties',
    	dataType: 'jsonp',
    	async: false,
    	crossdomain: true
    }).done(function(data) {
    	Lrn.Widget.ShareSnippet.config.coursename = data.courseName;
    	Lrn.Widget.ShareSnippet.config.curriculumId = data.curriculumId;
    	Lrn.Widget.ShareSnippet.config.systemId = data.systemId;
    }); 
    
    
};


/**
 * --- CREATE WIDGET ESCAPE ---
 * creates a modal background that is used as a close for sharing snippets
 */
Lrn.Widget.ShareSnippet.prototype.createWidgetEscape = function(container){
    var snippetMgr = this;
    
    this.widgetEscape = document.createElement('div');
    this.widgetEscape.id = 'widgetEscape';
    container.appendChild(this.widgetEscape);
    
    $(this.widgetEscape).on('click', function(){
       snippetMgr.hideSnippetWidget(); 
    });
    
};

/**
 * --- CREATE SNIPPET WIDGET ---
 * Creates a place for the user to select where they want to 
 * share their snippet to. Then appends to container.
 * @param container
 */
Lrn.Widget.ShareSnippet.prototype.createSnippetWidget = function(container){
    var snippetMgr = this;
    
    // set default text, or show the user selected text
    var prepopText = 'Now you can select and share text right from the course! To try it:<br /><br />1) Click anywhere outside this box<br />2) Select some text<br />3) Click Participate and your selection will appear here.';
    if(snippetMgr.config.selectedText != null && snippetMgr.config.selectedText != "null"){
        prepopText = snippetMgr.config.selectedText;
        
        // XXX make sure the text is good HTML (this will be huge)
        //if(prepopText.indexOf('<p>') == 0) prepopText = '<p>' + prepopText;
        //if(prepopText.lastIndexOf('</p>') != prepopText.lastIndexOf())...finish later
    }
    
    //check if twitter and chatter are enabled by admin and add accordingly
    $.ajax({
    	url: snippetMgr.config.host + '/learn/socialstatus',
    	dataType: 'jsonp',
    	async: false,
    	crossdomain: true,
    	success:function(data){
   		
	    	// create a dialog so a user can choose where
	        // they want to share this snippet to.
	        snippetMgr.snippetWidget = document.createElement('div');
	        snippetMgr.snippetWidget.id = 'snippetWidget';
	        var chatterhtml = '', twitterhtml='';
	        if(data.chatterstatus == 1){    	
	        	chatterhtml =   '<li><a id="where_chatter" href="#"><span class="arrowIcon"></span><div class="where_chatter shareIcon">icon</div><div>Chatter</div></a></li>';
	        } 
	        if(data.twitterstatus == 1){
	        	twitterhtml =  '<li><a id="where_twitter" href="#"><span class="arrowIcon"></span><div class="where_twitter shareIcon">icon</div><div>Twitter</div></a></li>';
	        }
	        snippetMgr.snippetWidget.innerHTML = '<div class="header">'
	        	+ '<button id="swClose" class="close">close</button>'
	        	+ '<p class="closeText">Close</p>' 
	        	+ '</div>'
	            + '<ul class="destinationList">'
	            + '<li><a id="where_forum" href="#"><span class="arrowIcon"></span><div class="where_forum shareIcon">icon</div><div>Email</div></a></li>'
	            + chatterhtml + twitterhtml
	        	+ '</ul>';
	        if(snippetMgr.config.selectedText != null && snippetMgr.config.selectedText != "null"){
	            snippetMgr.snippetWidget.innerHTML += '<p>**the text you selected will be pasted automatically**</p>';
	        }
	        container.appendChild(snippetMgr.snippetWidget);
	        
	        // XXX This function needs to be changed to launch an email
	        $('#where_forum').on('click', function(event, ui){
	            event.preventDefault();
	            //snippetMgr.launchDestinationDialog('forum');
	            
	            var subject = '';
	            if(typeof Lrn.Widget.ShareSnippet.config.coursename !== "undefined" ) {
	            	subject = 'subject=' + Lrn.Widget.ShareSnippet.config.coursename + '&';
	            }
	            
	            var body = '';
	            if(Lrn.Widget.ShareSnippet.config.selectedText != null) {
	            	body = 'body=' + encodeURIComponent(Lrn.Widget.ShareSnippet.config.selectedText);
	            }
	            
	            window.location="mailto:?" + subject + body;
	        });
	        
	               
	      //Launch twitter
	        $('#where_twitter').on('click', function(event, ui){
	            event.preventDefault();
	            
	            var title = '';
	            if(typeof Lrn.Widget.ShareSnippet.config.coursename !== "undefined" ) {
	            	title = Lrn.Widget.ShareSnippet.config.coursename;
	            } 
	            
	            var curriculumId = '';
	            if(typeof Lrn.Widget.ShareSnippet.config.curriculumId !== null ) {
	            	curriculumId = Lrn.Widget.ShareSnippet.config.curriculumId;
	            }
	            
	            var systemId = '';
	            if(typeof Lrn.Widget.ShareSnippet.config.systemId !== null ) {
	            	systemId = Lrn.Widget.ShareSnippet.config.systemId;
	            }
	            
	            var description = '';
	            if(Lrn.Widget.ShareSnippet.config.selectedText != null && Lrn.Widget.ShareSnippet.config.selectedText != '') {
	            	description = encodeURIComponent(Lrn.Widget.ShareSnippet.config.selectedText);	
	            	if(description == 'null')
	            		description = '';
	            }
	            var text = '';	            
	            text =  description; 
	            //post the selected text to twitter
	            //window.open("https://twitter.com/share?text="+ text +"&title="+ title + "&url=",title,'width=500,height=250'); 
	            
	            //var urlParam = text,$.browser.msie ? '' : title + "&courseName="+title+"&curriculumId="+curriculumId+"&systemId="+systemId;
	            var urlParam = "tweet=" + text + "&courseName=" + title + "&curriculumId=" + curriculumId + "&systemId=" + systemId;
	            //The IE workaround for the title is due to fact that IE doesn't expect an actual name as the 2nd param
	            window.open(Lrn.Widget.ShareSnippet.config.host+"/oauth?"+ urlParam,'Tweet','width=1024,height=768'); 
	            snippetMgr.hideSnippetWidget();
	        });
	        
	        $('#where_chatter').on('click', function(event, ui){
	            event.preventDefault();
	            snippetMgr.launchDestinationDialog('chatter');
	        });
	        
	        // if they click on close, hide the snippet widget
	        $('#swClose').on('click', function(){
	            snippetMgr.hideSnippetWidget();
	        });
	        
	        
    	}
    });
    
    
};

/**
 * --- CREATE DESTINATION DIALOG ---
 * Create a dialog we can use for allowing users to choose
 * where they want to share their snippet with/to.
 * @param container
 */
Lrn.Widget.ShareSnippet.prototype.createDestinationDialog = function(container){
    // create a dialog so a user can choose where
    // they want to share this snippet to.
    this.destinationDialog = document.createElement('div');
    this.destinationDialog.id = 'destinationDialog';
    container.appendChild(this.destinationDialog);    
};

/**
 * --- SHOW SNIPPET WIDGET ---
 * This method accepts the selected text as passed from the flash player
 * and stores it in memory. This will be used later. And as the method says
 * we show the snippet widget.
 */
Lrn.Widget.ShareSnippet.prototype.showSnippetWidget = function(selectedText){
    // store the selected text, or an empty string
    if(selectedText == null) {
        selectedText = "";
    }
    this.config.selectedText = selectedText || "";
    
    // show the widget UI
    $(this.snippetWidget).show();
};

/**
 * --- HIDE SNIPPET WIDGET ---
 * This method basically hides the widget and the widgetEscape.
 */
Lrn.Widget.ShareSnippet.prototype.hideSnippetWidget = function(){
    $(this.widgetEscape).hide();
    $(this.snippetWidget).hide();
    $(this.destinationDialog).hide();
};

/**
 * --- LAUNCH DESTINATION DIALOG ---
 * This method is a fusebox of sorts in that it handles
 * the calling of specific launch methods depending on
 * what type of dialog is required/chosen by user.
 */
Lrn.Widget.ShareSnippet.prototype.launchDestinationDialog = function(type){
    switch(type){
        case 'forum':   this.initForumDialog();    break;
        case 'chatter': this.initChatterDialog();  break;
        case 'notes':   this.initNotesDialog();    break;
    }
};

/**
 * --- INIT FORUM DIALOG ---
 * Instanciates and populates the modal dialog pertaining
 * to sharing within the message board or "Dialog" space.
 */
Lrn.Widget.ShareSnippet.prototype.initForumDialog = function(){
    var snippetMgr = this;
    
    $(this.destinationDialog).css({
        display: 'block'
    });
    
    // make changes to the destination dialog
    // which should already be created
    this.destinationDialog.id = 'reviewDialog';
    this.destinationDialog.className = 'dialogWrapper';
    
    // create some default pre-population text,
    // otherwise use what user selected, and was passed in.
    var prepopText = '';
    if(this.config.selectedText != null) prepopText = this.config.selectedText;
    
    // add a "cardboard cutout" of the message board dialog
    this.destinationDialog.innerHTML = '' 
        + '<div id="reviewDialog" class="dialogWrapper">'
            + '<div class="header">'
                + '<h2>' + this.config.coursename + '</h2>'
                + '<button id="ssClose" class="close">close</button>'
            + '</div>'
            + '<div class="body">'
                + '<div class="reviewListWrapper" style="float:right;">'
                    + '<h3>Dialog</h3>'
                    + '<hr>'
                    + '<div class="listWrapper">'
                        + '<ul id="ssReviewList" class="reviewList">'
                            + '<li id="review_17054" class="reviewItem">'
                                + '<h5>May Test01<span class="reviewTime">6 hours ago</span></h5>'
                                + '<img src="' + this.config.host + '/images/icons/header/profile.png" alt="May Test01" title="May Test01">'
                                + '<p>Is this course awesome or what?!</p>'
                            + '</li>'
                            + '<li id="review_17055" class="reviewItem">'
                                + '<h5>Marsha Croft<span class="reviewTime">4 days ago</span></h5>'
                                + '<img src="' + this.config.host + '/images/icons/header/profile.png" alt="Marsha Croft" title="Marsha Croft">'
                                + '<p>Can someone please contact me, I have a question about this material. It might not apply to me.</p>'
                            + '</li>'
                            + '<li id="review_17056" class="reviewItem">'
                                + '<h5>Deepak Crowley<span class="reviewTime">2 weeks ago</span></h5>'
                                + '<img src="' + this.config.host + '/images/icons/header/profile.png" alt="Deepak Crowley" title="Deepak Crowley">'
                                + '<p>This is interesting because this scenario actually happened to me the other day. Now I know that I acted in accordance with the values of my mission.</p>'
                            + '</li>'
                        + '</ul>'
                    + '</div>'
                + '</div>'
                + '<div class="reviewFormWrapper" style="float:left;">'
                    + '<div class="section">'
                        + '<h3>Share Your Thoughts</h3>'
                        + '<ul style="padding: 0 0 0 20px;">'
                            + '<li style="list-style: disc;">Make a comment</li>'
                            + '<li style="list-style: disc;">Ask colleagues a question</li>'
                            + '<li style="list-style: disc;">Select an excerpt to share</li>'
                            + '<li style="list-style: disc;">Add a <strong>#hashtag</strong> to help keep the conversation going!</li>'
                        + '</ul>'
                        + '<form class="reviewForm" onsubmit="return false;">'
                            + '<fieldset>'
                                + '<label class="reviewInputLabel"></label>'
                                + '<textarea id="ssReviewInput" class="reviewInput">' + prepopText + '</textarea>'
                            + '</fieldset>'
                            + '<fieldset class="reviewFormButtons">'
                                + '<button>cancel</button>'
                                + '<button class="green" id="ssSubmitBtn">share</button>'
                            + '</fieldset>'
                        + '</form>'
                    + '</div>'
                + '</div>'
            + '</div>'
            + '<div class="footer"></div>'
        + '</div>';
    
    // add a little bit of functionality so the 'cutout' works... sort of
    $('#ssSubmitBtn').on('click', function(e,ui){
        // make sure not to submit
        e.preventDefault();
        
        // create a new entry and then PREpend it to the list
        $('#ssReviewList').prepend('<li id="review_17054" class="reviewItem">'
            + '<h5>' + snippetMgr.config.username + '<span class="reviewTime">Just Now</span></h5>'
            + '<img src="' + snippetMgr.config.host + '/images/icons/header/profile.png" alt="May Test01" title="May Test01">'
            + '<p>' + document.getElementById('ssReviewInput').value + '</p>'
            + '</li>'
        );
    });
    
    // if they close the Dialog dialog, then close everything
    $('#ssClose').on('click', function(){
        snippetMgr.hideSnippetWidget();
    });
    
    // now that we're done setting everything up,
    // hide the snippet widget and show this destination dialog.
    $(this.snippetWidget).hide();
    $(this.destinationDialog).show();
};

/**
 * --- INIT CHATTER DIALOG ---
 * Instanciates and populates the modal dialog pertaining
 * to sharing within a 'Chatter' social network.
 */
Lrn.Widget.ShareSnippet.prototype.initChatterDialog = function(){
	//post the snippet to the chatter app
	window.open(Lrn.Widget.ShareSnippet.config.host+'/chatter/share?snippet='+encodeURIComponent(Lrn.Widget.ShareSnippet.config.selectedText), '_chatter', 'height=600px,location=0,menubar=0,resizable=0,scrollbars=1,status=0,toolbar=0,width=1000px');
};

/**
 * --- INIT NOTES DIALOG ---
 * Instanciates and populates the modal dialog pertaining
 * to creating and saving personal notes within the system.
 */
Lrn.Widget.ShareSnippet.prototype.initNotesDialog = function(){};


/**
 * --- GET VALUE FROM URL ---
 * Get the param value from request URL
 */

Lrn.Widget.ShareSnippet.prototype.getValueFromURL = function(pname){
    
    var idx = window.top.location.href.indexOf('?');
    var pvalue = "";
    if (idx > 0)
    {
        var queryString = window.top.location.href.substring(idx + 1);
        idx = queryString.indexOf('#');
        if (idx > 0)
        {
            queryString = queryString.substring(0, idx);
        }

        var params = queryString.split("&");
        var params_len = params.length;

        for (i = 0; i < params_len; ++i)
        {
            var namevalue = params[i].split("=");
            var name = namevalue[0];
            var value = namevalue[1];

            if (name == pname)
            {
                pvalue = value;
                break;
            }
        }
    }
    return decodeURIComponent(pvalue);
};