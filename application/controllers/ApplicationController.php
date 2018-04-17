<?php

require_once('Zend/Log.php');
//require_once('Zend/Translate.php');
require_once('Zend/Registry.php');
require_once('Php/mobileDetect/Mobile_Detect.php');
require_once("../application/soapModels/SAMLService/SAML.php");
require_once("../application/soapModels/LRNService/User.php");
require_once("../application/soapModels/LRNService/AccessControl.php");
require_once("../application/soapModels/LRNService/Site.php");
require_once("../application/soapModels/LRNService/Modules.php");
require_once("../application/soapModels/LRNService/UserProfile.php");

require_once("../application/soapModels/CatalystService/AdminSwitch.php");
require_once("../application/soapModels/CatalystService/Component.php");
require_once("../application/soapModels/CatalystService/Translation.php");
require_once("../application/soapModels/CatalystService/ConsoleSite.php");

require_once("../application/soapModels/AIMService/_AimService.php");
require_once("../application/soapModels/AIMService/PermissionAIM.php");
require_once ("../application/soapModels/CatalystService/CourseCustomization.php");

use Zend\Cache;

class ApplicationController extends Zend_Controller_Action {

    protected $sess;
	protected $memcache;
	protected $cache;
    protected $constant;
	protected $siteId;
	protected $flashMessenger;
        const CACHE_KEY_COMPONENT_SECTION_SUFFIX = 'componentSections';
        const CACHE_KEY_COMPONENT_NO_DATA = 'noDataForSite';
        const CACHE_KEY_ALL_COMPONENT_SECTIONS = 'allComponentSections';
        const CACHE_KEY_ALL_COMPONENT_TYPE = 'allComponentType';

        public function init() { 
                      
               $actionName = Zend_Controller_Front::getInstance()->getRequest()->getActionName();
               if (!empty($actionName)) {
                    if (!method_exists($this, $actionName . 'Action')) {
                        throw new Zend_Controller_Action_Exception('Page Not Found', 404);
                    }
                }
                try{
                    $this->flashMessenger = $this->_helper->getHelper('FlashMessenger');
                }catch(Exception $e){
                    $this->consoleLog($e);
                }
        /* Initialize global view variables here */
    	// add session variables to view
                $this->decodeUrlParams();
                $this->cache = Zend_Registry::get('memcache');
                //$this->cache->clean();
		//************************************************************************//
		//use memcache server for production / staging / qa environments where load balancers are used.
		if(MEMCACHE_USE_MEMCACHE && ((getEnv('APPLICATION_ENV')) == 'production' || (getEnv('APPLICATION_ENV')) == 'staging' || (getEnv('APPLICATION_ENV')) == 'qa' )) {

			$value = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);

			$this->memcache = new Memcache;
			$this->memcache->connect(MEMCACHE_SERVER_IP, MEMCACHE_SERVER_PORT);
			$key = Zend_Session::getId();
			$this->memcache->set($key, $value);

			$this->sess = $this->memcache->get($key);


		} else { // if development, just use Apache server. Because no php_memcache extension is available in development
			$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		}

		//************************************************************************//
		$this->_redirector = $this->_helper->getHelper('Redirector');

                // only get the siteConfigs if we don't have them already
		if(empty($this->sess->siteConfigs) || $this->sess->siteName != $this->sess->siteConfigs['DefaultGroup']){

			// get the site configs from service, parse into simple array
    		// then add to view->siteConfigs for use in UI.
    		$siteService = new SiteSoapModel();
    		
    		$siteServiceConfigs = $siteService->getSiteConfigs();    		
                
    		$this->sess->siteConfigs = array_merge($this->sess->siteConfigs, $siteServiceConfigs);
    		$this->sess->siteConfigs['availableLang'] = array();
    		$this->sess->siteConfigs['enabledLang'] = array();
                
    		/**
    		 * To check if site is internationalized.
    		 * According to site build documentation, there are three values to be checked:
    		 *
    		 * 'ProfileColumn' should be set to "Language"
    		 * 'ProfileDefaultColumn' should not be null (default value is 'en')
    		 * 'DefaultLanguage' should not be null (default value is 'en')
    		 */
    		$this->sess->siteConfigs['isSiteInternationalized'] = false;
    		$isValid_profileColumn = ($this->sess->siteConfigs['ProfileColumn'] == 'Language');
    		$isValid_profileColumnDefault = !empty($this->sess->siteConfigs['ProfileColumnDefault']);
    		$isValid_defaultLanguage = !empty($this->sess->siteConfigs['DefaultLanguage']);
    		$this->sess->siteConfigs['ConfigsDefaultLanguage'] = !empty($this->sess->siteConfigs['DefaultLanguage'])?$this->sess->siteConfigs['DefaultLanguage']:DEFAULT_LANGUAGE;
    		if($isValid_profileColumn && $isValid_profileColumnDefault && $isValid_defaultLanguage){
    			$this->sess->siteConfigs['isSiteInternationalized'] = true;
    		}
    		//added siteId to siteconfig so that we can cehck the value in legacy-edge-auth cookie
    		//XXX this should only be part of siteConfigs
    		//$this->view->siteConfigs['siteId'] = $this->getSiteId();

    		



            // put the soap service constants in siteConfigs
    		// to keep everything together.
    		$siteDefLangName = '';
    		$this->sess->siteConfigs['legacyHostLCEC'] = str_replace('<site>', $this->sess->siteName, LEGACY_HOST_LCEC);
    		$this->sess->siteConfigs['legacyHostAIM'] = str_replace('<site>', $this->sess->siteName, LEGACY_HOST_AIM);
    		$this->sess->siteConfigs['legacyHostRAM'] = str_replace('<site>', $this->sess->siteName, LEGACY_HOST_RAM);
    		$this->sess->siteConfigs['catalystHost'] = str_replace('<site>', $this->sess->siteName, HOST_CATALYST);
    		$this->sess->siteConfigs['contentHostCatalyst'] = str_replace('<site>', $this->sess->siteName, CONTENT_HOST_CATALYST);
    		
    		if($this->sess->siteConfigs['isSiteInternationalized']){
	    		$this->sess->siteConfigs['availableLang'] = $siteService->getAvailableLanguagesBySiteId();
	    		$this->sess->siteConfigs['enabledLang'] = $this->getEnabledSiteLanguages();
	    		if(isset($this->sess->siteConfigs['availableLang']) && count($this->sess->siteConfigs['availableLang'])>0){
		    		foreach($this->sess->siteConfigs['availableLang'] as $lang){
		    			if($lang->language == $this->sess->siteConfigs['ConfigsDefaultLanguage']){
		    				$siteDefLangName = $lang->enName;
		    			}
		    		}
	    		}
    		}
    		
    		$this->sess->siteConfigs['ConfigsDefaultLanguageName'] = $siteDefLangName!= '' ?$siteDefLangName:DEFAULT_LANGUAGE_NAME;
    		// make sure we get the branding for every page.
    		// this will be added to the $this->view->siteConfigs array
    		$this->getSiteBranding();

		}
		if(!isset($_COOKIE['siteSetLanguage'.$this->sess->siteName])) {
			$exp = time()+3600*24*30;
			if($this->sess->siteConfigs['isSiteInternationalized'])
				$val = $this->sess->siteConfigs['DefaultLanguage'];
			else
				$val = DEFAULT_LANGUAGE;
			setrawcookie('siteSetLanguage'.$this->sess->siteName, "$exp|$val", $exp, '/', COOKIE_DOMAIN, true, COOKIE_HTTPONLY);
		}

		if(isset($_COOKIE['siteSetLanguage'.$this->sess->siteName])){
			list($exp, $val) = explode('|', $_COOKIE['siteSetLanguage'.$this->sess->siteName], 2);
			if($val != '' && $this->sess->siteConfigs['DefaultLanguage'] != $val)
				$this->sess->siteConfigs['DefaultLanguage'] = $val;
			if($this->sess->siteConfigs['DefaultLanguage'] == '')
				$this->sess->siteConfigs['DefaultLanguage'] = DEFAULT_LANGUAGE;
		}

		// set cookie to default language if user is not logged in and his selected language is not enabled.
		if(!isset($this->sess->user)){
			// find out what the default language is
			$defaultLang = $this->sess->siteConfigs['DefaultLanguage'];
			$langAvailable = $this->sess->siteConfigs['enabledLang'];
			$langAvail = false;
			if(isset($langAvailable) && count($langAvailable)>0) {
				foreach($langAvailable as $l){
					if($l->language == $defaultLang)
						$langAvail = true;
			 	}
			 }
			 if(!$langAvail) {
			 	list($exp, $val) = explode('|', $_COOKIE['siteSetLanguage'.$this->sess->siteName], 2);
			 	$val = $this->sess->siteConfigs['ConfigsDefaultLanguage'];
			 	$expires = intval($exp);
			 	if(empty($expires))
			 		$expires = time()+3600*24*30;
			 	setrawcookie('siteSetLanguage'.$this->sess->siteName, "$expires|$val", $expires, '/', COOKIE_DOMAIN, true, COOKIE_HTTPONLY);
			 	$this->sess->siteConfigs['DefaultLanguage'] = $this->sess->siteConfigs['ConfigsDefaultLanguage'];
			 }
		}
		
		// make sure each view has access to the site settings
		$this->view->siteConfigs = $this->sess->siteConfigs;
        
		//build the global welcomePage element that need for every controller
		$this->globaleWelcomePageElement();
		
		//filter out the siteInfo messages out of siteErrors and siteLabels
		$this->view->siteTrans = $this->sess->siteTranslations;
		$this->view->siteInstr = $this->sess->siteInstructions;
		$this->view->siteLabels = $this->sess->siteLabels;
		$this->view->siteErrors = $this->sess->siteErrors;
		$this->view->siteInfo = $this->sess->siteInfo;
		
		// only make the call to get the component sections
		// and component types once.
		//XXX we may only need to get this when an admin
                 $this->view->components = $this->sess->components;

    	// add authenticated user variables to every view
    	$auth = Console_Auth::getInstance();

        if(($auth->hasIdentity()) && !isset($this->sess->user)){
        	$this->sess->user = $auth->getStorage()->read();
		}
		
                if(APPLICATION_ENV != 'unitTesting'){
                    //add log for current request
                    $this->addReqLog();
                }
		
		if(isset($this->sess->user)){
			if(!isset($this->sess->user->labels)) {
				$LCECUserSM = new UserServiceSoapModel();
				
				$this->sess->user->labels = $LCECUserSM->getCustomLabelsByUserIdAndComp($this->sess->user->userId, $this->sess->siteName);
			}

			if(!isset($this->sess->user->courseLangDefaults)){
				$this->sess->user->courseLangDefaults = array();
			}

			$this->flashWrapperGet('forcePasswordChange',$this->sess->user->mustResetPass,true);
			// include the user data in the view
			$this->view->user = $this->sess->user;
			//Zend_Debug::Dump($this->sess->user); exit();

			$this->view->userMyQueueStatus = $this->getMyQueueStatus();
		}

		$this->view->siteName = $this->sess->siteName;

		if(!isset($this->sess->languages) || empty($this->sess->languages)){
			$translationSM = new TranslationSoapModel();
			
			$this->sess->languages = $translationSM->getAllLanguages();
		}

		// call loading theming data which loads both default site theming as well as current site theming into session
		$this->loadTheming();
		// call the helper to set the css globally according to the values fetched from db above
		// $this->_helper->themerender = $this->_helper->getHelper('CustomTheme');
		$themeview = $this->_helper->customTheme($this->sess->componentThemingList, $this->sess);
		 // print_r($themeview);exit;

		// if user needs to reset their password, don't let them
		// go anywhere else until they reset it. Make sure we
		// don't redirect if they are in another auth page.
		if(isset($this->view->user->mustResetPass)
		    && $this->view->user->mustResetPass == "true"
		    && strpos($_SERVER['REQUEST_URI'], '/auth') === false
		){
		    $this->_helper->redirector('resetpassword','auth');
		}
		// set default end title, this will act as a sort of
		// breadcrumb in the title bar. We may want to just show
		// a represenation of the absolute path back to /, instead
		// of a history.

        if( empty( $this->sess->partnerName ) ) {
            // use the site service to get partner name
            $site = new SiteSoapModel();
            $this->sess->partnerName = $site->getPartnerNameBySiteId();
        }

        $this->view->headTitle($this->sess->partnerName);
        $this->view->headTitle()->setSeparator(' > ');
        $actionName = Zend_Controller_Front::getInstance()->getRequest()->getActionName();
        $controllerName =   Zend_Controller_Front::getInstance()->getRequest()->getControllerName();

        // add css files for application, widget and util

        $this->view->headLink(array('rel' => 'dns-prefetch',
                                  'href' => CDN_IMG_URL),
                                  'PREPEND');
        
        $this->view->headLink(array('rel' => 'dns-prefetch',
                                  'href' => CDN_CSS_JS_URL),
                                  'PREPEND');
        
        $this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/jqueryUI/jquery-ui-1.9.1.custom.css');
		$this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/jqueryUI/jquery-ui-1.10.3.custom.css');
        $this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/_core.css?'.FILES_VERSION, 'all');
        $catalystSiteService = new ConsoleSiteSoapModel();
        $catalystSiteVD = $catalystSiteService->getSiteSetting('visualDesign');    
        
        $this->sess->siteConfigs['catalystSiteConfigs']['visualDesign'] = $catalystSiteVD != false && $catalystSiteVD->value != null ? $catalystSiteVD->value : 0;
        
        $this->view->headLink()->appendStylesheet( '/css/main.css?'.FILES_VERSION);
        $this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/_widget.css?'.FILES_VERSION);
        $this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/_util.css?'.FILES_VERSION);

        $this->view->headLink()->appendStylesheet('/css/font-awesome.css?'.FILES_VERSION);
        $this->view->headLink()->appendStylesheet('/css/error.css?'.FILES_VERSION);

        
        $cdnScript = 'var CDN_IMG_URL = "'.CDN_IMG_URL .'";'
                . 'var CDN_CSS_JS_URL = "'.CDN_CSS_JS_URL .'";';
        
        $this->view->headScript()->appendScript( $cdnScript );        
        unset($cdnScript);
        
        // add Modernizr to make older browsers work
        // with newer HTML elements and CSS
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/modernizr/modernizr.2.6.2-min.js', 'text/javascript');

        // add jQuery to every page
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/jquery/jquery-1.7.1.min.js', 'text/javascript');
        
        $this->view->headScript()->appendScript('$(document).ready(function(){$.ajaxSetup({    			
        		 beforeSend: function(xhr){
        		      xhr.setRequestHeader("CSRFToken", "'.$this->sess->csrfkey.'");
	             }
			});});'); 

        // add jQuery Easing to every page
        // we should check to see if this
        // is really necessary on every
        // page
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/jquery/jquery.easing.min.js', 'text/javascript');
                
        //comment this file back in when submitting.
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/jquery/jquery-ui-1.9.1.custom.min.js', 'text/javascript');
        
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/jquery/jquery.cookie.js', 'text/javascript');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/jquery-ui.Lrn.DialogExtend.js?'.FILES_VERSION);

        // add the placeholder widget to deal with form elements that have placeholders
        // MUST add this before Application.js
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/jquery/jquery.addplaceholder.js', 'text/javascript');

        // Application, Util and Widget are foundation
        // objects and need to be on every page.
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/Widget.js?'.FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/Util.js?'.FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/Application.js?'.FILES_VERSION, 'text/javascript');
        

        // include Legacy.js to help with pass thrus to legacy apps
        // Application.js creates a child Legacy upon initialization.
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/apps/Legacy.js?'.FILES_VERSION, 'text/javascript');
        
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/colorbox/jquery.colorbox-min.js', 'text/javascript');

        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/SiteState.js?'.FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/MobileNavigation.js?'.FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/apps/Language.js?'.FILES_VERSION,'text/javascript');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL .'/js/apps/CustomError.js?'.FILES_VERSION,'text/javascript');
         
        // Build all header items and return the array
        $headerArr = $this->_helper->header($this->sess);

        $this->view->baseImgUrl = $this->_helper->welcomeScreen->setSiteName($this->sess->siteName)->baseImgURL();

        // CSS for the header banner
        $this->view->cssStr .= $headerArr['banner'];

        // set up the breadcrumb
        $this->view->breadcrumb = $this->_helper->Breadcrumb();

        if(isset($_GET['clearSession']) || getEnv('APPLICATION_ENV') == 'production'){
        	error_reporting(0);
        	ini_set('display_errors', 'off');

        	//we don't want users to clear session vars in production
        	if(isset($_GET['clearSession']) && getEnv('APPLICATION_ENV') != 'production'){
        		$this->clearSession();
        	}
        }

        if($_SERVER['REDIRECT_URL'] !== "/admin/theme"){
        	$this->getResponse()->setHeader('Content-type', 'text/html; charset=utf-8');
        	$this->view->headStyle()->appendStyle($themeview);
	        $cssName = "/css/partner/".md5($this->sess->siteConfigs['legacyHostAIM'].$this->sess->siteConfigs['legacyHostLCEC'].$this->sess->siteConfigs['legacyHostRAM'].$this->sess->siteConfigs['SiteName']).".css";
	        
	        if(file_exists(getcwd().$cssName) && filesize(getcwd().$cssName) > 0){
			   $cssUrl = $_SERVER['DOCUMENT_ROOT'] . $cssName;
               $mod_date= date("Ymdhis", filemtime($cssUrl));
               $this->view->customCSSFile = $cssName . "?version=".$mod_date;
	        }
        }
		if(!isset($this->sess->userRejectLangSel))
			$this->sess->userRejectLangSel = 'No';
        //get Users Language settings
        $this->getUserLangSettings();

        //resource center count
        $this->_helper->resourceCenter($this->sess);
        $this->view->resourcesNumber = $this->_helper->resourceCenter->countResources();
        
        //send view the Homepage is available or not
        if(empty($this->sess->welcomeScreen['vip']) && empty($this->sess->welcomeScreen['carousel']))
        {
           $this->view->homepageAvailable = false;
        }
        else
        {
           $this->view->homepageAvailable = true;
        }
        // dashboard status
            $this->view->dashboardStatus = $this->sess->dashBoardStatus;
        
       /* Asession commented as of 02/18/2015.
        * This is the triggering point.
        * Files being used for Asession: ApplicationController, AppController, AuthController,
        * CourseLaunch Helper and Application.js of public/js
        * 
        // Get aSession processing - Start
                
        if ( !empty($this->sess) 
        	&& !empty($this->sess->user) ){
        	
        	if ( empty($this->sess->asession) ){

        		$dataSent = $this->getASessionData();
        		 
        		// Pass it to view
        		$this->view->docReadyJS .= "
        		as = new Lrn.Application();
				as.getASsession('" . $dataSent . "');
       			";
        		 
        	}
        	
        }
        
        // Get aSession processing - End 
        */		
        
        // always make sure that Lrn.Applications is created
        $this->view->docReadyJS .= "
            if(typeof Lrn == 'undefined') Lrn = {};
            if(typeof Lrn.Applications == 'undefined') Lrn.Applications = {};
            if(typeof Lrn.Widgets == 'undefined') Lrn.Widgets = {};

            /*setup global edge-auth cookie domain name*/
            edgeAuthCookieDomain = '" .AKAMAI_COOKIE_DOMAIN. "';   
            
			/* --- GA --- */
			  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			  ga('create', 'UA-43420914-1', 'lrn.com');
			  ga('send', 'pageview');
			  ga('set', 'anonymizeIp', true);
          /* ---  End GA --- */
          
          $.getScript('/js/respond/respond.min.js');
		  
          Lrn.Applications.Language = new Lrn.Application.Language({
        		siteConfigs: " . json_encode($this->view->siteConfigs) . ",
        		siteLabels: " . json_encode($this->sess->siteLabels) . ",
        		siteErrors: " . json_encode($this->sess->siteErrors) . ",
        		siteInstructions: " . json_encode($this->sess->siteInstructions) . "
        	});
          Lrn.Applications.Language.init();
		  
		  $('html').addClass('".$this->sess->siteConfigs['DefaultLanguage']."');
                  $('html').attr('lang','".$this->view->userProfileSiteLangVal."');    
        	
        	$.ajaxSetup({    			
        		 beforeSend: function(xhr){
        		      xhr.setRequestHeader('CSRFToken', '".$this->sess->csrfkey."');
	             }
			});
                        
            $( document ).ajaxComplete(function( event, xhr, settings ) {
                try {
                    var response = JSON.parse( xhr.responseText );                
                    
                    if( typeof response.systemError !== 'undefined' ) {
                        
                        var siteStateObj = new Lrn.Widget.SiteState();
                        siteStateObj.open('error', Lrn.Applications.Profile.siteLabels.ChangesNotSavedError);
			siteStateObj.close(7000);
                    }
                } catch(e) {
                
                }
            });
            
            $('a, #adminSectionLink span').live('keyup', function(e){
                if($(this).is(':focus')){
                    $('a, #adminSectionLink span').removeClass('linkFocus');
                    $(this).addClass('linkFocus');
                }
            });
            $('input[type=\"text\"], select').live('keyup', function(e){
                if($(this).is(':focus')){
                    $('input[type=\"text\"], select').removeClass('inputFocus');
                    $(this).addClass('inputFocus');
                }
            });
            $('input[type=\"password\"], select').live('keyup', function(e){
                if($(this).is(':focus')){
                    $('input[type=\"password\"], select').removeClass('inputFocus');
                    $(this).addClass('inputFocus');
                }
            });
            $('a, #adminSectionLink span').live('keydown', function(e){
                $('a, #adminSectionLink span').removeClass('linkFocus');
            });
            $('input[type=\"text\"], select').live('keydown', function(e){
                $('input[type=\"text\"], select').removeClass('inputFocus');
            });
            $('input[type=\"password\"], select').live('keydown', function(e){
                $('input[type=\"password\"], select').removeClass('inputFocus');
            });
            
        ";
    }

    /**
     * Function to decode request params
     */
    public function decodeUrlParams() {
        
        $request = $this->getRequest();
        $params = $request->getParams();
        
        unset($params['module'], $params['controller'], $params['action']);
       
        array_walk_recursive($params, function(&$value, $key, $request) {
            
            if (!is_object($value) && !$request->isPost()) {
                
                $request->setParam($key, urldecode($value));
                $_REQUEST[$key] = urldecode($value);
                $_GET[$key] = urldecode($value);
                
            }
        }, $request);
    }

    //add request info to logs
    public function addReqLog(){
    	$ip = '';
    	if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    		$ip = $_SERVER['HTTP_CLIENT_IP'];
    	} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    		$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    	} else {
    		$ip = $_SERVER['REMOTE_ADDR'];
    	}
    	$userId = '';
    	$uname = '';
    	if(isset($this->sess->user)) {
    		$userId = $this->sess->user->userId;
    		$uname = $this->sess->user->username;
    	}
    	$request = $this->getRequest();
    	$url = $request->getHeader('referer');
    	$logStr = 'New Request == '.'Server Ip : '.$_SERVER['SERVER_ADDR']. ' ,Client IP = '. $ip . ' ,Requesturi = '. $request->getRequestUri().
    	', Site Name =  '.$this->sess->siteName. ', SiteId = '.$this->sess->siteId . ', User Id = '.$userId. ', User Name = '.$uname;
    	error_log($logStr);
    }
    
    public function getUserLangSettings(){
    	//get site available languages and user selected language on login page
    	$this->view->siteLangs = array();
    	$this->view->siteDefLang = $this->sess->siteConfigs['DefaultLanguage'];
    	if(isset($this->sess->siteConfigs['availableLang']))
    		$this->view->siteLangs = $this->sess->siteConfigs['availableLang'];

    	//get user progile language
    	$userProfile = new UserProfileServiceSoapModel();
    	
    	$fields = $userProfile->getUserProfileDetails($this->sess->user->userId, $this->sess->siteConfigs['DefaultLanguage']);
    	
    	$this->sess->userProfileSettings = $fields;
    	$this->view->userProfileLang = '';
    	$this->view->userProfileLangVal = '';
        $this->view->userProfileSiteLangVal = $this->sess->siteConfigs['DefaultLanguage'];
    	if(isset($fields->customColumnList->CompanyUsersColumnDTO)){
    		foreach($fields->customColumnList->CompanyUsersColumnDTO as $field){
    			if($field->propertyName == 'language'){
    				$this->view->userProfileLang = $field->displayValue;
    				$this->view->userProfileLangVal = $field->value;
    			}
    		}
    	}
    	if(isset($this->sess->userRejectLangSel) && $this->sess->userRejectLangSel == 'Yes'){
    		$this->view->userProfileLangVal = $this->sess->siteConfigs['DefaultLanguage'];
    	}
        if(isset($this->view->userProfileLangVal) && $this->view->userProfileLangVal != ''){
    		$this->view->userProfileSiteLangVal = $this->view->userProfileLangVal;
    	}

    }

    public function getEnabledSiteLanguages(){
    	$statusLangList = array();
    	$languageListTemp = array();
    	$siteAvailLangList = array();
    	$adminSM = new AdminSwitchSoapModel();
    	if($adminSM->getEnabledSiteLanguages() != null && count($adminSM->getEnabledSiteLanguages() > 0)) {
    	   $languageListTemp = $adminSM->getEnabledSiteLanguages();
    	}
    	if(!empty($languageListTemp)){
    		foreach($languageListTemp as $key => $val)
    			$statusLangList[$val->language] = $val;
    	}
    	if(isset($this->sess->siteConfigs['availableLang']))
    		$siteAvailLangList = $this->sess->siteConfigs['availableLang'];
    	$languageList = array();
    	if (isset($siteAvailLangList) && count($siteAvailLangList)>0) {
    		foreach ($siteAvailLangList as $lang){
    			if(array_key_exists($lang->language,$statusLangList) && $statusLangList[$lang->language]->enabled == 1){
    				$languageList[] = $lang;
    			}
    		}
    	}
    	return $languageList;
    }

    public function getTranslations(){
    	// get the site translations from service, parse into simple array
    	// then add to view->siteTranslations for use in UI
        
        $siteTransItems = $this->sess->getSiteTranslations();
       
    	$this->sess->siteTranslations = $siteTransItems;
         
    	list($siteLabels, $siteErrors, $customPublishedLabels, $siteInstructions) = $this->sess->getSiteTransItems($siteTransItems);
        
        $this->sess->siteLabels = $siteLabels;
        $this->sess->siteErrors = $siteErrors;
        $this->sess->customPublishedLabels = $customPublishedLabels;
        $this->sess->siteInstructions = $siteInstructions;
        
        unset($siteLabels, $siteErrors, $customPublishedLabels, $siteInstructions);

        $this->sess->parseInfo($this->sess->siteLabels);
    	$this->sess->parseInfo($this->sess->customPublishedLabels);
    }

	/**
	 * --- CONSOLE LOG ---
	 * Outputs PHP data into the Javascript console for debugging purposes
	 * @param mixed $data - The PHP variable you want to write to the Javascript console
	 */
    public function consoleLog (){
    	//First, make sure we aren't outputting this on production.
    	if(getEnv('APPLICATION_ENV') !== 'production') {
    		//We'll allow an unlimited number of params instead of one
    		$data = func_get_args();

    		//We also want to output a stack trace into our output
	    	$trace = debug_backtrace();

	    	//If the data is an class object, typecast it to an array
	    	//$out = is_object($data) ? (array)$data : $data;

	    	//Write out to JS console...
	    	$this->view->docReadyJS .= "\r\nconsole.log(".json_encode($data).",".json_encode($trace).");\r\n";
    	}
    }

    public function kill () {
    	if(getEnv('APPLICATION_ENV') !== 'production') {
    		//We'll allow an unlimited number of params instead of one
    		$data = func_get_args();

    		//If the data is an class object, typecast it to an array
    		//$out = is_object($data) ? (array)$data : $data;

    		//stop PHP and output the params
    		die('<pre>'.print_r($data,1).'</pre>');
    	}
    }

    public function sortArrayByKey () {
    	$keys = func_get_args();
    	return function ($a, $b) use ($keys) {
    		$a = (array)$a;
    		$b = (array)$b;
    		for($i=0,$l=count($keys);$i<$l;++$i){
    			if($a[$keys[$i]] !== $b[$keys[$i]]){
    				if(is_numeric($a[$keys[$i]]) && is_numeric($b[$keys[$i]]))
    					return $a[$keys[$i]] - $b[$keys[$i]];
    				else
	    				return strnatcmp($a[$keys[$i]], $b[$keys[$i]]);
    			}
    		}
    		return 0;
    	};
    }
    protected function getSiteId () {
    	return $this->sess->siteId;
    }
    
    protected function getPartnerSiteId() {
        $siteId = $this->sess->siteId;
        if (!empty($this->sess->parentSiteId)) {
            $siteId = $this->sess->parentSiteId;
        }
        return $siteId;
    }

    protected function getPartnerSiteName () {
        $siteName = $this->sess->siteName;
        if (!empty($this->sess->parentSiteName)) {
            $siteName = $this->sess->parentSiteName;
        }
        return $siteName;
    }

    //get saved data for courses
    public function getCoursesSavedData($systemIdArr,$visibilityName){
    	//course customized data object
    	$courseConfigurationModel = new CourseCustomizationSoapModel();

    	//get visibility Id for MyQueue Page
    	$visibilityId = '';
    	
    	$courseVisibilityTypes = $courseConfigurationModel->getAllCourseVisibilityTypes($this->sess->siteId);
    	
    	foreach($courseVisibilityTypes as $visibility){
    		if($visibility->name == $visibilityName)
    			$visibilityId = $visibility->id;
    	}
        
        $chunkedSystemIdArr = array();
        if( count( $systemIdArr ) > 500 ) {
            $chunkedSystemIdArr = array_chunk($systemIdArr, 500);
        }
        
        if( count( $chunkedSystemIdArr ) ) {
            $coursesSavedData = array();
            foreach( $chunkedSystemIdArr as $csystemIdArr) {
        	//get customized data for myqueue page courses if exists
                $coursesSavedDataLimited = $courseConfigurationModel->getActiveCourseCustomizationBySiteIdSystemIdList($this->sess->siteId, $csystemIdArr);
        
                if( is_array($coursesSavedDataLimited) ) {
                    $coursesSavedData = $coursesSavedData + $coursesSavedDataLimited;
                }
            }
        } else {
            //get customized data for myqueue page courses if exists
            $coursesSavedData = $courseConfigurationModel->getActiveCourseCustomizationBySiteIdSystemIdList($this->sess->siteId, $systemIdArr);            
        }
        
    	$pageCoursesData = array();
    	//create data array with courses visible on my queue page
    	if(!empty($coursesSavedData)){
    		foreach($coursesSavedData as $courseData){
    			if(!is_array($courseData->courseVisibilityList->CourseVisibilityDTO)){
    				if(isset($courseData->courseVisibilityList->CourseVisibilityDTO->courseVisibilityTypeId) && $courseData->courseVisibilityList->CourseVisibilityDTO->courseVisibilityTypeId == $visibilityId)
    					$pageCoursesData[$courseData->systemId] = $courseData;
    			}else{
    				foreach($courseData->courseVisibilityList->CourseVisibilityDTO as $visiData)
    				if(isset($visiData->courseVisibilityTypeId) && $visiData->courseVisibilityTypeId == $visibilityId)
    					$pageCoursesData[$courseData->systemId] = $courseData;
    			}
    		}
    	}

    	return $pageCoursesData;
    }

    //get user myqueue status
    protected function getMyQueueStatus () {
    	$componentSM = new ComponentSoapModel();
    	
        $cacheKeyArray = $params = array('my_queue','my_status',DEFAULT_LANGUAGE);//
        $componentDataMyStatus = $this->cache->getItemsFromCache($componentSM, 'getComponentSettingsBySiteBySectionByLanguage', $params, $cacheKeyArray);
    	
    	$userStatus = 'Off';

    	if(isset($componentDataMyStatus[0]->value) && $componentDataMyStatus[0]->value == 'on') {
            $userStatus = $componentDataMyStatus[0]->value;
        }
    	return $userStatus;
    }

    protected function getMyQueueInfo()
    {
    	$modulesService = new ModulesServiceSoapModel();   	
     	$myQueueInfo = $modulesService->getMyQueueUserModulesStatusCounts();
      
    	return $myQueueInfo;
    }
    protected function getLoggedInUser () {
    	$user = new stdClass();
    	$user->userId = Console_Auth::getInstance()->getStorage()->read()->userId;
    	return $user;
    }

	public function ajaxCallAction () {
		$this->_helper->viewRenderer->setViewScriptPathSpec('ajax/:action.:suffix');
        $this->_helper->viewRenderer('ajax-view');
		$this->_helper->layout()->setLayout('json_layout');

		$request = $this->getRequest()->getParam('request');
		$this->getResponse()->setHeader('Content-type', 'application/json');

		$r = new stdClass();

		try {
		   $r->data = $this->$request($this->getRequest());
		} catch (Exception $e) {
			$r->error = new stdClass();
			$r->error->message = $e->getMessage();
		}
		$this->view->data  = $r;
    }

    // TODO: Need clean up
    public function soapCallTestAction () {
    	$this->_helper->viewRenderer('soap-test');
    	$this->_helper->viewRenderer->setViewScriptPathSpec('ajax/:action.:suffix');
    	$this->view->serviceName = $this->getRequest()->getParam('service');
    	$this->view->callName = $this->getRequest()->getParam('call');
    	$this->view->controllerName = $this->getRequest()->getControllerName();
    	$this->view->params = "";
    	$i = 0;
    	while ($this->getRequest()->getParam('in' . $i) != Null) {
			$key = 'in' . $i;
			$this->view->params =$this->view->params . "&" . $key ."=".$this->getRequest()->getParam($key);
			$i++;
		}
    }

    // TODO: Need clean up
    public function soapCallAction (){

    	$this->_helper->viewRenderer->setViewScriptPathSpec('ajax/:action.:suffix');
    	$this->_helper->viewRenderer('ajax-view');
		$this->_helper->layout()->setLayout('json_layout');
		$this->getResponse()->setHeader('Content-type', 'application/json');

		$soapModelName = $this->getRequest()->getParam('service'). 'SoapModel';
		$callName = $this->getRequest()->getParam('call');

		$r = new stdClass();

		try {
			$service = new $soapModelName();
			$params = array();
			$i = 0;
			while ($this->getRequest()->getParam('in' . $i) != Null) {
				$key = 'in' . $i;
				$params[$key] = $this->getRequest()->getParam('in' . $i);
				$i++;
			}
			$call = 'testSoapCall';
			$r->data = $service->$call($callName,$params);

		} catch (Exception $e) {
			$r->error = new stdClass();
			$r->error->message = $e->getMessage();
		}
		$this->view->data  = $r;
    }

    public function getLog() {
      	$log = null;
    	try {
    		$log = Zend_Registry::getInstance()->get(LOGGER);
    	} catch(Exception $e) {}
    	if (!$log) {
    		require_once('Zend/Log/Writer/Stream.php');
    		$writer = new Zend_Log_Writer_Stream(sys_get_temp_dir() . "/" . LOG_FILE);
    		require_once('Zend/Log.php');
    		$log = new Zend_Log($writer);
    		Zend_Registry::getInstance()->set(LOGGER, $log);
    	}
    	return $log ? $log : false;
    }

    public function addLog($msg) {
    // Log exception, if logger available
		if ($log = $this->getLog()) {
			$log->crit($this->view->message, $msg);
			$log->log($this->view->message . "exception: " . $msg, Zend_Log::CRIT);
		}
    }

    public function translate($label) {
    	$locale = new Zend_Locale();
    	$language = $locale->getLanguage();
    	//TODO: Remove later, this is for testing Spanish labels.
    	//$language = 'es';
    	if (strcmp($language, 'en')==0)
    		return $label;
    	$log = $this->getLog();
    	$translate = null;
    	try {
    		$translate = Zend_Registry::getInstance()->get(TRANSLATOR);
    	} catch(Exception $e) {}
    	if (!$translate) {
    		require_once('Zend/Locale.php');
    		require_once('Zend/Translate.php');
    		$translate = new Zend_Translate(
    			'tmx',
    			APPLICATION_PATH . '/configs/languages/languages.tmx',
    			$language
    		);
    		//echo "Registering translator<br/>";
    		Zend_Registry::getInstance()->set(TRANSLATOR, $translate);
    	}
    	return $translate ? $translate->_($label) : $label;
    }

    public function initAjaxResponse($isHTML = false) {
    	$this->_helper->layout->disableLayout();
    	$this->_helper->viewRenderer->setNoRender();
    	// Added to ensure our AJAX calls are recognized as JSONP/JSON unless we explicitly tell the method to use 'text/html' as the MIME type
    	$this->getResponse()->setHeader('Content-Type', $isHTML ? 'text/html' : (isset($_REQUEST['callback']) ? 'application/javascript' : 'application/json'));
    }

    /**
     * --- GET SITE BRANDING ---
     * For now, this method gets the welcome text and logo
     * for the partner site. Stores them in $this->view->siteConfigs
     * so that all sitewide values are in the same place.
     */
    public function getSiteBranding() {
        // set defaults
//         $sitename = @$this->sess->siteName;
//         $this->view->siteConfigs['partnerBranding'] = $sitename;
//         $this->view->siteConfigs['welcomeText'] = "<p>Welcome to " . $sitename . "'s Ethics &amp; Compliance Training Portal. If you have not yet used this login screen, please put your ". $sitename ." badge number and your ". $sitename ." primary work email address in the \"Forgot your Password\" box to the left. Within a few minutes, you will be emailed instructions as to complete your login process in the upper-left \"Login\" box.</p>
//             <p>Once inside, you will see your personal list of required training courses. NOTE: There might be other training courses required by other departments or your manager, outside of these designated ethics and compliance courses. Please be sure to ask your manager or HR representative if there are other topics you need to complete and where you can access those courses.</p>
//             <p>Questions can be sent to <a href=\"mailto:ethics_education@". $sitename .".com\">ethics_education@". $sitename .".com</a>.</p>
//             <p>Thank you in advance for your commitment to completing this important training on time. It's part of How We Win!</p>";

        // use the site service to get branding info
	    $site = new SiteSoapModel();
	    
	    $siteBranding = $site->getSiteBranding();

	    // set welcome text if custom by partner
// 	    if(isset($siteBranding->welcomeText)) {
// 	        $this->view->siteConfigs['welcomeText'] = $siteBranding->welcomeText;
// 	    }

	    // set partner logo/branding if available
	    //XXX this will need to be made into an image with the right URL.
 	    if(isset($siteBranding->logo)) {
 	        $this->sess->siteConfigs['partnerBranding'] = $siteBranding->logo;
 	    }
	}

	/**
     * --- GET VALUES OF ADMIN SWITCHES ---
     * Gets the status 0/1(enabled/disabled) of the settings available on site.
     */
    public function getAdminSwitches($switches){

        $response = array('response' => '');

		$adminSwitches = new AdminSwitchSoapModel();
		
        $adminSwitchValues = $adminSwitches->getSwitches($this->getSiteId(), $switches);
 
		if($adminSwitchValues->success){
			if(!empty($adminSwitchValues->dataObject->entry)){
			    $adminSwitchVals = array();
    			if(!is_array($adminSwitchValues->dataObject->entry)) $adminSwitchVals[] = $adminSwitchValues->dataObject->entry;
    			else $adminSwitchVals = $adminSwitchValues->dataObject->entry;

    			foreach ($adminSwitchVals as &$adminSwitchVal){
    				/*convert the data came from services to the format needed by JS*/
    				$data[] = array(
						"key" => $adminSwitchVal->key,
						"value" => $adminSwitchVal->value
					);
    			}
    			$response = array(
    				'success' => $adminSwitchValues->success,
                    'data' => $data
                );
			}else{
			    $response = array(
                	'success' => false,
                    'error' => 'Admin switch not found'
                );
			}
        }
        else{
            $response = array(
            	'success' => $adminSwitchValues->success,
                'error' => $adminSwitchValues->error->message
            );
        }

		return $response;
    }

    public function loadTheming() {

//     	if (!isset($this->sess->componentThemingList) || empty($this->sess->componentThemingList) || isset($_GET['cleartheme'])) {
    		unset($this->sess->componentThemingList);
    		$this->sess->componentThemingList = array();

    		$componentService = new ComponentSoapModel();

	   		// separate to 2 different arrays with site id null and specific site id
 			$themingComponents = $componentService->getComponentSettingsByTypeForTheming('theming');

			$themingComponentsList = array();

			if(count($themingComponents) > 0) {
				foreach($themingComponents->dataObject->componentSettings->ComponentSettingDTO as $setting){
					$themingComponentsList[$setting->section] = $setting;
				}
			}
			$themingComponentsList['partnerBrandingImgUrl'] = new stdClass();
			$themingComponentsList['partnerBrandingImgUrl']->value = $this->sess->siteConfigs['partnerBrandingImgUrl'];

			foreach($themingComponentsList as $key => $val){
			 	$this->view->{$key} = $val->value;
			}

			$this->sess->componentThemingList = $themingComponentsList;
// 	    }

	}

    /**
     * --- CREATE SERVICE ERROR STRING ---
     * create a service error string that can be displayed as error
     * @param Object $serviceResponse - dataObject of a service response
     * @param String $additionalMessage - additional error message that we want to add
     */
    public function setServiceError ($serviceResponse, $additionalMessage = null, $session = null, $key) {
    	$errormsg = isset($serviceResponse->error->message) ?
    									$serviceResponse->error->message . " " :
    									($additionalMessage ? $additionalMessage . " " : "");
    	if (!isset($this->view->serviceError)){
    		$this->view->serviceError = "Service Error : ";
    	}
    	$this->view->serviceError .= $errormsg;

    	if(isset($session))
    		$session->errorMsg = $errormsg;

    	$this->sess->ssoErrorMsg = $errormsg;
    }

    /**
     * --- BUILD SUBNAV UL ---
     * build the subnav ul based on the passed array of links
     * @param Array $linkArr
     */
    public function buildContentSubNav($linkArr = null) {
        // create the wrapping array for the UL(s)
        $ul = array(
            array(
                'ulId' => 'contentSubNav',
                'liArr' => array()
            )
        );

        // these will be prepended to the passed links
        $liPrepend = array(
            array(
                'liClass' => 'skip',
                'href' => '#',
                'text' => 'Skip Content Navigation'
            )
        );

        // these will be appended to the passed links
        $liAppend = array(
            array(
                'liClass' => 'rightAlign',
                'href' => '/learn/queue/',
                'hrefClass' => 'close',
                'text' => 'Close'
            )
        );

        // run through each of the arrays (prepend, passed links, and append)
        // and add each item to the liArr in $ul
        foreach($liPrepend as $l) array_push($ul[0]['liArr'], $l);
        foreach($linkArr as $l) array_push($ul[0]['liArr'], $l);
        foreach($liAppend as $l) array_push($ul[0]['liArr'], $l);

        // build the ul based on the array of data received
        // and consolidated above
        return self::buildUlLinkList($ul);

    }

    /**
     * --- BUILD LEFT COLUMN SUBNAV ---
     * Builds the UL list for the left column navigation
     * based on an array of link items.
     * @param Array $linkArr
     * @return string
     */
    public function buildLeftSubNav($linkArr = null) {
        // create the wrapping array for the UL(s)
        $ul = array(
            array(
                'ulId' => 'Nav',
                'liArr' => array()
            )
        );

        // these will be prepended to the passed links
        $liPrepend = array(
            array(
                'liClass' => 'skip',
                'href' => '#',
                'text' => 'Skip Section Navigation'
            )
        );

        // run through each of the arrays (prepend, passed links, and append)
        // and add each item to the liArr in $ul
        foreach($liPrepend as $l) array_push($ul[0]['liArr'], $l);
        foreach($linkArr as $l) array_push($ul[0]['liArr'], $l);

        // build the ul based on the array of data received
        // and consolidated above
        return self::buildUlLinkList($ul);
    }

    /**
     * --- BUILD UL LINK LIST  ---
     * build an unordered list based on an array of elements
     * @param Array $ulArr
     */
    protected function buildUlLinkList($ulArr = null) {
        // initialize empty return string
        $retStr = '';
        // run through each of the passed arrays that represents a UL
        foreach($ulArr as $u ) {
            // create the ul element
            // add id and class if those items are set
            $retStr .= "<ul";
            $retStr .= (isset($u['ulId']) ? ' id="' . $u['ulId'] . '"' : '');
            $retStr .= (isset($u['ulClass']) ? ' class="' . $u['ulClass'] . '"' : '');
            $retStr .= ">";

            // pass the liArr for the internal list items to be built
            $retStr .= $this->buildListItems($u['liArr']);

            // close the ul
            $retStr .= "</ul>";
        }

        // return string of created ul
        return $retStr;
    }

    /**
     * --- BUILD LIST ITEMS ---
     * build list items based on an array of elements
     * @param Array $itemArr
     */
    protected function buildListItems($itemArr = null) {
        // initialize empty return string
        $retStr = '';

        // iterate through the array of list items
        // build each list item string and
        // add it to overall output
        foreach($itemArr as $l) {
            $retStr .= $this->buildListItem($l);
        }

        // return string of list elements
        return $retStr;
    }

    /**
     * --- BUILD LIST ITEM ---
     * build a list item based on an object
     * @param Array $itemObj
     */
    protected function buildListItem($itemObj = null) {
        // initialize empty return string

        $retStr = '';
        //Special case for James
        //Adds a span class if the item is list or item view
        $listItemView = array('toggleListView','toggleImgView');
        // open li add id, class, link (with link class), and text, if set
        $retStr .= '<li';
        $retStr .= (isset($itemObj['liId']) ? ' id="' . $itemObj['liId'] . '"' : '');
        $retStr .= (isset($itemObj['liClass']) ? ' class="' . $itemObj['liClass'] . '"' : '');
        $retStr .= ">";
        $retStr .= (isset($itemObj['href']) ? '<a href="' . $itemObj['href'] . '"' : '');
        $retStr .= (isset($itemObj['href']) && isset($itemObj['hrefId']) ? ' id="' . $itemObj['hrefId'] . '"' : '');
        $retStr .= (isset($itemObj['href']) && isset($itemObj['hrefClass']) ? ' class="' . $itemObj['hrefClass'] . '"' : '');
        $retStr .= (isset($itemObj['href']) ? '>' : '');
        if(isset($itemObj['hrefId'])){
        	if(in_array($itemObj['hrefId'],$listItemView)){
        		$retStr .= "<span class='".str_replace("View","Icon",$itemObj['hrefId'])."'></span>";
        	}
        }
        $retStr .= (isset($itemObj['text']) ? $itemObj['text'] : '');
        $retStr .= (isset($itemObj['href']) ? '</a>' : '');
        $retStr .= "</li>";

        // return li string
        return $retStr;
    }

    /**
     * --- MARK AS SELECTED ---
     * Adds the 'selected' class to navigation items.
     * @param unknown_type $text
     * @param array $navArr
     */
    public function markAsSelected($text, array &$navArr) {
    	foreach($navArr as $k=>$a) {
			if(in_array($text, $a)) {
    			$navArr[$k]['hrefClass'] = 'selected';
    		}
    	}
    }

    /**
     * --- ARRAY TO OBJECT ---
     * Convert an array to a stdClass object
     * @param array $array
     * @returns { stdClass (optional) }
     */
    protected function arrayToObject(&$array) {
		$obj = new stdClass();
    	foreach($array as $key => $value){
    		$obj->$key = $value;
    	}
    	$array = null;
    	$array = $obj;
    	//return $obj;
    }

    /**
     * --- Set Edge Auth Cookie ---
     * Take an array of course path URLs, and set a cookie for them
     * @param array $coursePaths
     * @return boolean
     */
//     protected function setEdgeAuth($coursePaths, $url = 'lrn.com'){
//     	// Get the value for the cookie
//     	$edgeAuth = $this->_helper->AkamaiEdgeAuth;
//     	$cookieVal = $edgeAuth->direct($coursePaths);

//     	$ch = curl_init($url);
//     	curl_setopt($ch,  CURLOPT_RETURNTRANSFER, TRUE); // get the curl response back as a variable
//     	curl_setopt($ch,  CURLOPT_HEADER, TRUE); // include the headers
//     	curl_setopt($ch,  CURLOPT_NOBODY, TRUE); // make HEAD request only
//     	curl_setopt($ch, CURLOPT_TIMEOUT, 2); // set the max time to wait for the connection to complete
//     	curl_setopt($ch, CURLOPT_COOKIE, 'edge-auth='.$cookieVal); // set cookie data

//     	$response = curl_exec($ch);

//     	//list of status codes you want to treat as valid:
//     	$validStatus = array(200, 301, 302, 303, 307);

//     	if ( $response === false || !in_array(curl_getinfo($ch, CURLINFO_HTTP_CODE), $validStatus) ) {
//     		return false;
//     	}

//     	curl_close($ch);

//     	$this->sess->edgeCookie = $cookieVal;
//     }
    /**
     * --- URL EXISTS ---
     * determine whether a file exists at a URL
     * @param String $url
     * @returns { Boolean }
     */
    public function urlExists($url) {
		$url = str_replace('https', 'http', $url);

		$matches = array();
    	// Using $url, find the
    	// positions of the following: the beginning of the revision
    	// number and the location of 'media/'.
    	// After those two positions are found, use them to get the
    	// substring of the passed URL that is needed for the Akamai
    	// Auth Edge cookie.
    	$revisionPos = preg_match('/^.*\.com(:\d*)??\//', $url, $matches) ? strlen($matches[0])-1 : 0;
    	$endOfCatIdPos = preg_match('/media\//', $url, $matches, PREG_OFFSET_CAPTURE) ? $matches[0][1] : 0;
    	$coursePaths[] = substr($url, $revisionPos, $endOfCatIdPos - $revisionPos) . '*';

    	// Get the value for the cookie
    	$edgeAuth = $this->_helper->AkamaiEdgeAuth;
    	$cookieVal = $edgeAuth->getCookieValue($coursePaths);

    	$ch = curl_init($url);
    	curl_setopt($ch,  CURLOPT_RETURNTRANSFER, TRUE); // get the curl response back as a variable
    	curl_setopt($ch,  CURLOPT_HEADER, TRUE); // include the headers
    	curl_setopt($ch,  CURLOPT_NOBODY, TRUE); // make HEAD request only
    	curl_setopt($ch, CURLOPT_TIMEOUT, 2); // set the max time to wait for the connection to complete
    	curl_setopt($ch, CURLOPT_COOKIE, 'edge-auth='.$cookieVal); // set cookie data

    	$response = curl_exec($ch);

    	//list of status codes you want to treat as valid:
    	$validStatus = array(200, 301, 302, 303, 307);

    	if ( $response === false || !in_array(curl_getinfo($ch, CURLINFO_HTTP_CODE), $validStatus) ) {
    		return false;
    	}

    	curl_close($ch);

    	$this->sess->edgeCookie = $cookieVal;
    	return true;
    }

    public function startTiming() {
    	$mtime = microtime();
    	$mtime = explode(" ",$mtime);
    	$mtime = $mtime[1] + $mtime[0];
    	$startTime = $mtime;

    	return $startTime;
    }

    public function stopTiming($startTime) {
    	$mtime = microtime();
    	$mtime = explode(" ",$mtime);
    	$mtime = $mtime[1] + $mtime[0];
    	$endTime = $mtime;
    	$totalTime = ($endTime - $startTime);
    	return $totalTime;
    }

    /**
    * --- Clear Session ---
    * Call this if we need to break the session and force it to rebuild for some reason
    *
    * @param none
    * @return void
    *
    * TODO: write it so that it supresses errors
    */
    protected function clearSession(){
    	$this->sess->siteLabels = null;
    	$this->sess->siteTranslations = null;
    	$this->sess = null;
//    	unset($this->sess);
    }
    protected function flashWrapperSet($section,$code,$msg = null){
    	$this->flashMessenger->setNamespace($section)->addMessage(empty($msg) ? $this->sess->{$section}[$code] : $msg);
    }

    protected function flashWrapperGet($section,&$view,$keepmessage = false){
    	$msgs = $this->flashMessenger->setNamespace($section)->getMessages();
    	if(!empty($msgs)){
    		$view = $msgs[0];
    		if(!$keepmessage)
	    		$this->flashMessenger->setNamespace($section)->clearMessages();
    	}
    }

    protected function baseImgUrl() {
       $host = 'https://' . $_SERVER['HTTP_HOST'];
       //images come from qa7, when on dev3
       if(strpos($host, '.dev3')) {
          $host = str_replace('dev3', 'qa7', $host);
       }

       return $host;
    }
    
    protected function serviceLog($service, $page, $userId, $siteName, $startTime, $endTime = null, $enableStartLog = false){
       $message = "";
       
       if ($startTime && false == $enableStartLog && null == $endTime){
          return false;
       }
       
       if (null == $endTime){
          $message = "Started " .date("m-d-Y H-i-s" ,$startTime)." ". $page. "(" .$service. ") by " .$userId. " on " .$siteName;
       }else{
          $diff = $endTime-$startTime;
          $timeArray = explode(".", $diff + " ");
          $milliSecond = substr($timeArray[1], 0, 3) * 1;
          $message = "Ended " .date("m-d-Y H-i-s" ,$endTime). " took " .$timeArray[0]. " sec " .$milliSecond. " ms " .$page. "(" .$service. ") by " .$userId. " on " .$siteName;
       }

       error_log($message);
    }
    
    protected function globaleWelcomePageElement(){
       $this->_helper->welcomeScreen($this->sess);
       //$welcomeScreenArr = $this->_helper->welcomeScreen->buildAllElements();
       
            $welcomeScreenArr =  array(
                     'partnerBrandingImgUrl' => $this->_helper->welcomeScreen->buildPartnerBrandingImageUrl(),
                     'companyLogoImgUrl'=> $this->_helper->welcomeScreen->buildCompanyLogoImageUrl(),
                     'headerTagline' => $this->_helper->welcomeScreen->buildHeaderTagline(),
                     'carousel' => $this->_helper->welcomeScreen->buildCarousel(),
                     'vip' => $this->_helper->welcomeScreen->buildAllVipElements()
                     );
       
       //when the VIP message is empty, it's not empty -- set it empty when we have "Please enter text" as the msg
       if($welcomeScreenArr['vip'] === '<div id="vipMsg"><h3 class="secondaryTextIcons borderBottomThin"><p><span style="color: #999;">Please enter text.</span></p></h3><p class="primaryTextIcons"><p><span style="color: #999;">Please enter text.</span></p></p>
				</div>')
          $welcomeScreenArr['vip'] = '';
       
       // only get the siteTranslations if we don't have them already
       if( count( $this->sess->siteTranslations ) < 1 ) {
          $this->getTranslations();
       }
       
       // CSS for the partner branding image
       $partnerBrandingInfo = $welcomeScreenArr['partnerBrandingImgUrl'];
       $brandingAlign = 'bgTile';
       $url = '';
       if(isset($partnerBrandingInfo['image']) && $partnerBrandingInfo['image'] != '')
          $url = $partnerBrandingInfo['image'];
       $this->view->siteConfigs['partnerBrandingImgUrl'] = array();
       $this->sess->siteConfigs['partnerBrandingImgUrl'] = array();
       $this->view->siteConfigs['partnerBrandingImgUrl']['image'] = trim($url. '') != '' ? $url : CDN_IMG_URL . '/images/backgrounds/hdrgrad_flat.png';
       $this->sess->siteConfigs['partnerBrandingImgUrl'] = $this->view->siteConfigs['partnerBrandingImgUrl']['image'];
       if(isset($partnerBrandingInfo['tile']) && $partnerBrandingInfo['tile'] == 'on')
          $brandingAlign = 'bgTile';
       if(isset($partnerBrandingInfo['center']) && $partnerBrandingInfo['center'] == 'on')
          $brandingAlign = 'bgCenter';
       $this->view->siteConfigs['partnerBrandingImgUrl']['align'] = $brandingAlign;
       
       // CSS for the company logo image
       $companyLogoInfo = $welcomeScreenArr['companyLogoImgUrl'];
       $this->view->siteConfigs['companyLogoImgUrl'] = array();
       $url = '';
       $logoAlign ='logoLeftAlign';
       if(isset($companyLogoInfo['image']) && $companyLogoInfo['image'] != ''){
          $url = $companyLogoInfo['image'];
          if(isset($companyLogoInfo['left']) && $companyLogoInfo['left'] == 'on')
             $logoAlign = 'logoLeftAlign';
          if(isset($companyLogoInfo['center']) && $companyLogoInfo['center'] == 'on')
             $logoAlign = 'logoCenter';
          if(isset($companyLogoInfo['right']) && $companyLogoInfo['right'] == 'on')
             $logoAlign = 'logoRightAlign';
          $this->view->siteConfigs['companyLogoImgUrl']['align'] = $logoAlign;
       }
       $this->view->siteConfigs['companyLogoImgUrl']['image'] = $url;
       
       // CSS for the Header Tagline
       $headerTagline = $welcomeScreenArr['headerTagline'];
       $this->view->siteConfigs['headerTagline'] = array();
       $title = '';
       $titleAlign ='taglineRight';
       if(isset($headerTagline['title']) && $headerTagline['title'] != '' && $headerTagline['title'] !='Please enter text.'){
          $title = $headerTagline['title'];
          if(isset($headerTagline['left']) && $headerTagline['left'] == 'on')
             $titleAlign = 'taglineLeft';
          if(isset($headerTagline['center']) && $headerTagline['center'] == 'on')
             $titleAlign = 'taglineCenter';
          if(isset($headerTagline['right']) && $headerTagline['right'] == 'on')
             $titleAlign = 'taglineRight';
          $this->view->siteConfigs['headerTagline']['align'] = $titleAlign;
       }
       $this->view->siteConfigs['headerTagline']['title'] = $title;
       
       // carousel area based on the items stored in the database
       $this->view->carouselHTML = $welcomeScreenArr['carousel'];
       
       // the VIP Message area
       $this->view->vipHTML = $welcomeScreenArr['vip'];
       
       $this->sess->welcomeScreen = $welcomeScreenArr;
    }
    
    /*
     * to setup the AkamaiEdgeAuth cookie
     */
    protected function setupAkamaiEdgeAuthCookie(){
    	$siteService = new SiteSoapModel();
    
    	$revisionNumber = $siteService->getRevisionNumber();
    	$customContentRevision = substr($this->sess->siteConfigs['maxCreatedDate'], 0, 10);
    	
        $siteId = $this->getPartnerSiteId();
    	$coursePath = "/rev" .$revisionNumber. "/course/*!/rev" .$customContentRevision. "/course/customcontent/" .$siteId. "/*!/rev1231231231/course/customcontent/" .$siteId. "/*!/token/".$this->createUserIdToken();
    	 
    	$this->_helper->AkamaiEdgeAuth();
    	$this->_helper->AkamaiEdgeAuth->setCourseEdgeAuthCookie(AKAMAI_COOKIE_DOMAIN, $coursePath);
    }
    
    protected function deleteAkamaiEdgeAuthCookie(){
    	$this->_helper->AkamaiEdgeAuth();
    	$this->_helper->AkamaiEdgeAuth->deleteCourseEdgeAuthCookie(AKAMAI_COOKIE_DOMAIN);
    }
    
    /*
     * to check type of client browser connected
     */
    protected function whatMobileBrowserType(){
       $detect = new Mobile_Detect;
       
       if ( $detect->isMobile() ) {
          return "mobile";
       }
       
       if( $detect->isTablet() ){
          return "tablet";
       }
       
       return false;
    }
    
    
    /**
     * Getting asession data to sync with LCEC session
     *
     * @deprecated as of as of 02/18/2015
     *
     */
    protected function getASessionData(){
       // Fill the data
       $session_id =  Zend_Session::getId();
       $user_id = $this->sess->user->userId;
       $email = $this->sess->user->email;
       $milliseconds = round(microtime(true) * 1000); //var_dump($milliseconds);
       $randomNumber = rand(0,32);	//var_dump($randomNumber);
       $sessionid = $milliseconds . $randomNumber;
    
       // $ipaddress = client machine IP address
       if (! empty ( $_SERVER ['HTTP_CLIENT_IP'] )) {
        		$ipaddress = $_SERVER ['HTTP_CLIENT_IP'];
       } elseif (! empty ( $_SERVER ['HTTP_X_FORWARDED_FOR'] )) {
        		$ipaddress = $_SERVER ['HTTP_X_FORWARDED_FOR'];
       } else {
        		$ipaddress = $_SERVER ['REMOTE_ADDR'];
       }
    
       $str = md5($milliseconds.$randomNumber.$user_id.$ipaddress);
       $ticket = $this->strToHex($str);
    
       // Get the pw entry
       $pw_entry = base64_encode(utf8_encode($this->appendUserObject()));
    
       // Constrct for POST method
       $construct_post = array(
                'sessid' => $session_id,
                'userid' => $user_id,
                'email' => $email,
                'sessionid' => $sessionid,
                'ticket' => $ticket,
                'ipaddress' => $ipaddress,
                'pwentry' => $pw_entry
       );
    
       // URL compatible query string
       return http_build_query($construct_post);
    
    }
    
    /**
     * Getting pw_entry from User object
     * @deprecated as of 02/18/2015
     * @return string
     */
    public function appendUserObject(){
    
       // User Custom Column begins
       $userForLCECSessionSOAP = new UserServiceSoapModel();
       $userForLCECSessionResponse = $userForLCECSessionSOAP->userForLCECSession($this->sess->user->userId);
    
       $userObjectStrBuf = '';
       $userObjectStrBuf .= $this->sess->user->userId . " ";
       $userObjectStrBuf .= $userForLCECSessionResponse->password . " ";
       $userObjectStrBuf .= $userForLCECSessionResponse->active . " ";
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->accessId);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->firstName);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->lastName);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->empId);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->email);
       $userObjectStrBuf .= (!empty($userForLCECSessionResponse->creationDate)?date("d-M-Y",strtotime($userForLCECSessionResponse->creationDate)):"") . " ";
       $userObjectStrBuf .= (!empty($userForLCECSessionResponse->modDate)?date("d-M-Y",strtotime($userForLCECSessionResponse->modDate)):"") . " ";
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hAddress1);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hAddress2);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hCity);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hState);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hZip);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hCountry);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->hPhone);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->title);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->company);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->address1);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->address2);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->city);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->state);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->zip);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->country);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->phone);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->fax);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->browser);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->division);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->costCenter);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->superFirstName);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->superMiddleName);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->superLastName);
       $userObjectStrBuf .= (!empty($userForLCECSessionResponse->passwordModDate)?date("d-M-Y",strtotime($userForLCECSessionResponse->passwordModDate)):"") . " ";
       $userObjectStrBuf .= trim($this->appendDoubleQuotes($this->sess->user->username));
       $userObjectStrBuf .= (!empty($userForLCECSessionResponse->delDate)?date("d-M-Y",strtotime($userForLCECSessionResponse->delDate)):"") . " ";
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->lcPassword);
       $userObjectStrBuf .= $this->appendDoubleQuotes($userForLCECSessionResponse->language);
    
       return $userObjectStrBuf;
    }
    
    /**
     * Append double quotes for space enabled strings.
     * @deprecated as of 02/18/2015
     * @param unknown $str
     * @return string
     */
    public function appendDoubleQuotes($str) {
       if (empty ( $str ))
        		return "\"\"" . " ";
    
       if (! empty ( $str )) {
    
        		if (stripos ( $str, " " )) {
        		   return "\"" . $str . "\"" . " ";
        		}
    
        		return $str . " ";
    
       }
    }
    
    /**
     * Convert String into Hex and vice versa
     *
     * @deprecated as of 02/18/2015
     * @author Niraj Byanjankar
     * @param string $string
     * @param string $hex
     * @param string $toggle
     * @example strToHex('lrn') // For String to Hex, strToHex('','F0A',tru) // For Hex to String
     *
     * @return string|Hex
     */
    public function strToHex($string = '', $hex = '', $toggle = false) {
       if ($toggle) {
        		for($i = 0; $i < strlen ( $hex ) - 1; $i += 2) {
        		   $string .= chr ( hexdec ( $hex [$i] . $hex [$i + 1] ) );
        		}
        		return $string;
       } else {
    
        		for($i = 0; $i < strlen ( $string ); $i ++) {
        		   $hex .= dechex ( ord ( $string [$i] ) );
        		}
    
        		return $hex;
       }
    
    }
    
    protected function resetDefaultLanguage($lang){
       $exp = time()+3600*24*30;

       setrawcookie('siteSetLanguage'.$this->sess->siteName, "$exp|$lang", $exp, '/', COOKIE_DOMAIN, true, COOKIE_HTTPONLY);
       $this->sess->siteConfigs['DefaultLanguage'] = $lang;
       //reset the sitelanguage
       $this->getTranslations();
    }
    public function createUserIdToken(){
    
        $str = base64_encode($this->sess->user->userId);
        $str = preg_replace('/\+/', '-', $str);
        $str = preg_replace('/\//', '_', $str);
        $str = preg_replace('/\=+$/', '', $str);
        
        return $str;
    }
   
    
}

?>
