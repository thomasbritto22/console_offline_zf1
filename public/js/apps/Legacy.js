if(typeof(Lrn) == 'undefined') Lrn = {};

/**
 * --- LEGACY ---
 * This class is used when dealing with the legacy LRN
 * applications such as LCEC, AIM, RAM, etc. It's primary
 * purpose is to verify SAML authentication has been done,
 * and then to load an iframe with the appropriate URL.
 * While method names are generic, the comment title says
 * which legacy app this method is currently associated with.
 * 
 * This object is not a subclass of Application, so does NOT
 * require its prototype = new Application(), instead Application
 * instanciates Legacy.
 * @returns {Lrn.Legacy}
 */
Lrn.Legacy = function(config){
    if(config){
        this.siteConfigs = config.siteConfigs || null;
        this.SAMLResponse = config.SAMLResponse || null;
    }
};

Lrn.Legacy.prototype = {
            
    /**
     * --- DO SAML AUTHENTICATION ---
     * This method is responsible for loading our pass thru
     * iframe with a page that submits a form for SAML authentication.
     * This provides targetURI as the place to redirect to
     * after authentication. SAML will handle this redirection
     * inside the iframe.
     * @param attr
     */
    doSAMLAuthentication: function(attr){
    	document.getElementById('legacyFrame').src = attr.src 
            + '?postURI=' + escape(attr.postURI)
            + '&targetURI=' + escape(attr.targetURI)
            + '&SAMLResponse=' + this.SAMLResponse;
    },
    
    /**
     * --- LAUNCH LEGACY APPLICATION ---
     * If we have been authenticated by SAML, then this
     * method is run to load the legacy app into our
     * passthru iframe.
     * @param attr
     */
    launchLegacyApp: function(frameSrc){
          document.getElementById('legacyFrame').src = frameSrc;
    },
    
    /**
     * --- GET LEGACY APP ---
     * Based on which legacy app we are using (lcec, aim, ram)
     * we are going to need to get the host. The host name is a
     * constant that is set in ApplicationController, passed to
     * Application.js, where it's passed to Legacy object, to here.
     * @param legacyAppName
     * @returns {String}
     */
    getLegacyAppUrl: function(legacyAppName) {
        // based on the app name, return the appropriate host URL
        switch(legacyAppName){
            case 'aim': return this.siteConfigs.legacyHostAIM;
            case 'ram': return this.siteConfigs.legacyHostRAM;
            case 'lcec':
            default:
                return this.siteConfigs.legacyHostLCEC;
        }
    },
    
    /**
     * --- CHECK LEGACY PASSTHRU ---
     * This method puts together a URL that redirects
     * us to the legacy pass thru page. It sends a few
     * pieces of information that we will need in order
     * to do the saml integration.
     * @param legacyApp
     * @param callbackURL
     */
    checkLegacyPassThru: function(legacyApp, targetURI, overrideURL) {
        window.location = (this.getLegacyPassThruURL(legacyApp, targetURI, overrideURL));    
    },
    
    /**
     * --- GET LEGACY URL ---
     * creates the legacy app url to load
     * @param legacyApp
     * @param targetURI
     * @param overrideURL
     */
    getLegacyPassThruURL: function(legacyApp, targetURI, overrideURL) {
    	//get the legacy app url for redirection 
    	var host = this.getLegacyAppUrl(legacyApp);
    	
        // if we are not already authenticated, we'll need to do a pass thru
        var authenticated = this.isSAMLAuth(legacyApp);
        
        // by default we are using LCEC passthru
        var consoleLegacyUrl = '/learn/legacy';
       
        // if we have an override url, use it
        // otherwise use app name to get legacy url
        if(typeof(overrideURL) != 'undefined'){
            consoleLegacyUrl = overrideURL;
        }
        else {
            if(legacyApp == 'aim') consoleLegacyUrl = '/survey/legacy';
            if(legacyApp == 'ram') consoleLegacyUrl = '/assessment/legacy';
        }
        
        // stores the url in the variable, which will be used later
        var URL = consoleLegacyUrl + '?isAuth=' + authenticated + '&host=' + escape(host) + '&targetURI=' + escape(targetURI);

        return URL;
    },
    
    /**
     * --- IS SAML AUTHENTICATED ---
     * Simply checks for the saml-auth cookie for
     * the legacy app in question. Used when launching
     * the course in new window directly from /course/preview.
     * @param legacyApp
     * @returns bool
     */
    isSAMLAuth: function(legacyApp){    	
        var docCookies = document.cookie.split(";");
        for (var i=0;i<docCookies.length;i++)
        {
            var cookieName = docCookies[i].substr(0,docCookies[i].indexOf("="));
            var cookieValue = docCookies[i].substr(docCookies[i].indexOf("=")+1);
            cookieName = cookieName.replace(/^\s+|\s+$/g,"");
            if(cookieName == legacyApp + '-saml-auth'){
                var cookieVars = cookieValue.split("&");
                for (var j=0;j<cookieVars.length;j=j+2)
                {
                    if(cookieVars[j] == "siteId" && cookieVars[j+1] == this.siteConfigs.siteId) return 1;
                }
            }
        }
        return 0;
    },
    
    /**
     * --- PLAY COURSE (LCEC) ---
     * Loads the URL to play a course. Provides
     * the courses system_id and which format to play.
     * By default, we are going to use the enhanced version.
     * @param systemId
     * @param playbackMode
     */
    playCourse: function(systemId, playbackMode) {
        // get the courseURL we'll be using.
        var targetURL = this.getCourseURL(systemId, playbackMode, true);
        
        // pass it all and check our authentication
        this.checkLegacyPassThru('lcec', targetURL);
    },
    
    /**
     * --- GET COURSE URL ---
     * This is a sort of alias to playCourse(), but instead
     * of calling checkLegacyPassThru, it simply returns the
     * URL for the course. Used when launching courses in
     * a new window directly from /channel/preview.
     * @param systemId
     * @param playbackMode
     * @returns {String}
     */
    getCourseURL: function(systemId, playbackMode, trackingOn){
        // we will need to translate playbackMode into
        // something that courseware will understand.
        // by default, media is 'on' == 'enhanced playback'
        var media = 'on';
        if(playbackMode == 'basic') media = 'off';
        
        // set the url we want to use as the callback
        return '/app/redirector/course?trackingOn='+trackingOn+'&course_id='+systemId+'&media='+media+'&fromConsole=true';
    },

    /**
     * --- PRINT COMPLETION CERT (LCEC) ---
     * Loads the URL to print a completion certificate.
     * Passes the userID and the certificateID.
     * XXX need strUserId from somewhere
     * @param certId
     */
    printCompletionCert: function(userId, certId) {
        // set the url we want to use as the callback
        var targetURL = '/app/certificate2/ViewCertificate?selectedUserID='+userId+'&certificate_id='+certId;
        
        // pass it all and check our authentication
        this.checkLegacyPassThru('lcec', targetURL, 'learn/completioncert');
    },

    /**
     * --- PRINT COMPLETION CERT LIST (LCEC) ---
     * Loads the URL to show a list of completion certs
     * that have been submitted recently.
     */
    printCompletionHistory: function(range) {
        // set the url we want to use as the callback
        var targetURL = '/app/completionhistory/history/list/'+range;
        
        // pass it all and check our authentication
        this.checkLegacyPassThru('lcec', targetURL);
    },
    
        
    /**
     * --- DO LAUNCH COURSE ---
     * Does the work to launch the course: gets the URL, checks
     * SAML authentication, opens new window with course URL or
     * SAML pass thru page.
     */
    doLaunchCourse: function(systemId, playbackMode, trackingOn){
        
        // we will use the legacy object to get some information
        // about the passthru. the host, and wether we are authorized
        // to use it just yet. if we are not authorized, we will have
        // to do a little redirect magic. finally, we will also get
        // the courses URL. We will use this for final redirect.
        var legacyHost = this.getLegacyAppUrl('lcec');
        var isAuth = this.isSAMLAuth('lcec');
        var courseURL = this.getCourseURL(systemId, (playbackMode || 'enhanced'), trackingOn);
        
        // if user is not SAML authorized yet, we will need to
        // first load a console page into the new window that will
        // submit a form for SAML Authentication. SAML will then
        // take care of the final redirect to the courses URL.
        if(isAuth == 0){
            // configure URL for SAML Authentication redirect
            var passThruURL = '/html/lrnconsole_samlredirect.html';
            passThruURL += '?postURI=' + escape(legacyHost + '/app/samlsso/consume');
            passThruURL += '&targetURI=' + escape(courseURL);
            passThruURL += '&SAMLResponse=' + this.SAMLResponse;
            
            // load with all options explicitly set
            window.open(
                passThruURL,
                'courseWindow',
                "channelmode=0,directories=0,fullscreen=0,width=800,height=600,top=0,left=0,menubar=0,resizable=0,scrollbars=0,status=0,titlebar=0,toolbar=0"
            );
        }
        
        // if user is SAML authorized, then just load the
        // courses URL into the new window.
        else {
            window.open(
                legacyHost + courseURL,
                'courseWindow',
                "channelmode=0,directories=0,fullscreen=0,width=800,height=600,top=0,left=0,menubar=0,resizable=0,scrollbars=0,status=0,titlebar=0,toolbar=0"
            );
        }
    }
        
};