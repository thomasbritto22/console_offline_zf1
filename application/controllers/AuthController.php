<?php

require_once ("../application/soapModels/LRNService/User.php");
require_once ("../application/soapModels/LRNService/Site.php");
require_once ("../application/soapModels/LRNService/UserProfile.php");
require_once ("../application/soapModels/LRNService/AccessControl.php");
require_once ("../application/soapModels/AIMService/PermissionAIM.php");
require_once ("../application/soapModels/RAMService/SiteRAM.php");
require_once ("../application/soapModels/RAMService/PermissionRAM.php");
require_once ("../application/restModels/LRNService/User.php");

class AuthController extends ApplicationController {

    public function init() {
        parent::init();

        // $this->view->headLink()->appendStylesheet('/css/auth.css?'.FILES_VERSION);;
        /* video tour required */
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/Dialog.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/MediaElementPlayer.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/mejs-skins.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/VideoTour.css?' . FILES_VERSION);
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/Dialog.js?' . FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/VideoTour.js?' . FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/MediaElementPlayer.js?' . FILES_VERSION, 'text/javascript');
        // add tooltipster css
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/tooltipster.css');
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/tooltipsterThemes/tooltipster-light.css');
        //include tooltipster.js
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/jquery/jquery.tooltipster.min.js', 'text/javascript');

        // add required js components/plugins/etc.
        // include ddslick for our language selection dropdown
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/jquery.ddSlick.js', 'text/javascript');

        // add auth specific javascript
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/apps/Auth.js?' . FILES_VERSION, 'text/javascript');


        // set the layout to welcomepage_layout for all Auth Actions
        $this->_helper->layout()->setLayout('welcomepage_layout');

        // set up the language selection
        $this->view->languageSelection = $this->_helper->LanguageSelection($this->sess);

        // CSS for the background image
        $this->view->cssStr .= "\n" . $this->_helper->welcomeScreen->buildBackgroundImage();

        // headline based on value stored in the database
        $this->view->headlineHTML = $this->_helper->welcomeScreen->buildHeadline();


        // the Self Registation Button
        $this->view->selfRegStat = false;
        if (isset($this->sess->siteConfigs['AllowSelfReg']) && 't' == $this->sess->siteConfigs['AllowSelfReg']) {
            $this->view->selfRegStat = $this->_helper->welcomeScreen->getSelfRegStatus();
        }

        // render the resource center for the right column
        $this->view->viewResourceBox = true;
        $this->view->viewResourceMaxRecord = true;
        $resourceHelper = $this->_helper->resourceCenter($this->sess);
        $this->view->resourcesBoxRecords = $this->_helper->resourceCenter->getResources(null, 'loginPage', 'loginPage');
    }

    /**
     * --- LOGIN PAGE ---
     * Initialize method for login page.
     */
    public function loginAction() {

        // append to page title
        $this->view->headTitle("Login");
        $this->view->lcecHost = $this->view->siteConfigs['legacyHostLCEC'];

        $auth = CONSOLE_Auth::getInstance();

        // get any error messages the user might need to see
        $this->getAuthMessages();

        // check if user is logged in
        // if not, send to login page
        // else store a variable to use in view
        $loggedInUser = $auth->getStorage()->read();

        // send the user to myqueue if they are already logged in
        if (isset($loggedInUser->username)) {
            $this->_helper->redirector('', 'index');
        }

        // make sure to get the last labels
        $this->getTranslations();

        $this->view->loggedInUser = $loggedInUser;

        $this->sess->sanitizeSessData($this->sess->siteLabels, $this->sess->siteTranslations);
        $this->sess->sanitizeSessData($this->sess->siteErrors, $this->sess->siteTranslations);

        // the Video Tour area
        //enable the video tour
        $this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
        $this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('login');

//         	$sess = new Zend_Session_Namespace('SLO_'.$_COOKIE['PHPSESSID']);

        if (isset($this->sess->errorMsg))
            $this->view->errMsg = $this->sess->errorMsg;

        $this->view->docReadyJS .= "
			Lrn.Applications.Auth = new Lrn.Application.Auth('login');
			Lrn.Applications.Auth.init({
	    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
	    	    siteErrors: " . json_encode($this->sess->siteErrors) . "
	    	});

	    	Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();

	    	document.cookie = \"auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.lrn.com; path=/\";
		";
    }

    /**
     * Update site information in session according to users selection
     */
    public function updatedataAction() {
        $this->_helper->layout->disableLayout();
        $this->_helper->viewRenderer->setNoRender();
        $lang = $_REQUEST['lang'];
        $languageChanged = 'No';
        if ($lang == '') {
            $langs = $this->sess->siteConfigs['availableLang'];
            if (count($langs) > 0) {
                $langKeyDef = 0;
                $langKeyDefFound = false;
                $langKeyEnInt = 0;
                $langKeyEnIntFound = false;
                $langKeyEnUK = 0;
                $langKeyEnUKFound = false;
                $firstLang = 0;
                foreach ($langs as $key => $langVal) {
                    if ($langVal->language == $this->sess->siteConfigs['DefaultLanguage']) {
                        $langKeyDefFound = true;
                        $langKeyDef = $key;
                    }
                    if ($langVal->language == DEFAULT_LANGUAGE_INTENG) {
                        $langKeyEnIntFound = true;
                        $langKeyEnInt = $key;
                    }
                    if ($langVal->language == DEFAULT_LANGUAGE_UKENG) {
                        $langKeyEnUKFound = true;
                        $langKeyEnUK = $key;
                    }
                    if ($langVal->language == $tempLang[0]->language) {
                        $firstLang = $key;
                    }
                }

                if ($langKeyDefFound) {
                    $langKey = $langKeyDef;
                } else if ($langKeyEnIntFound) {
                    $langKey = $langKeyEnInt;
                } else if ($langKeyEnUKFound) {
                    $langKey = $langKeyEnUK;
                } else {
                    $langKey = $firstLang;
                }
                $lang = $langs[$langKey]->language;
            } else {
                $lang = $this->sess->siteConfigs['DefaultLanguage'];
            }
            $this->sess->userRejectLangSel = 'Yes';
        }
        if ($lang != $this->sess->siteConfigs['DefaultLanguage']) {
            if (isset($_COOKIE['siteSetLanguage' . $this->sess->siteName])) {
                list($exp, $val) = explode('|', $_COOKIE['siteSetLanguage' . $this->sess->siteName], 2);
            } else {
                $exp = time() + 3600 * 24 * 30;
            }
            $val = $lang;
            setrawcookie('siteSetLanguage' . $this->sess->siteName, "$exp|$val", $exp, '/', COOKIE_DOMAIN, true, COOKIE_HTTPONLY);
            $this->sess->siteConfigs['DefaultLanguage'] = $lang;
            $languageChanged = 'Yes';
            // get the site translations from service, parse into simple array
            // then add to view->siteTranslations for use in UI
            $this->getTranslations();
        }

        $response = array("change" => $languageChanged);
        echo json_encode($response);
        exit;
    }

    /**
     * --- BACKDOOR LOGIN PAGE ---
     * Initialize method for backdoor login page. Used by
     * admins on sites that use SLO (or other crazy use cases).
     * This page does not have any login limitations that might
     * exist on the login page.
     */
    public function backdoorAction() {
        // append to page title
        $this->view->headTitle("Login");

        $auth = CONSOLE_Auth::getInstance();

        // get any error messages the user might need to see
        $this->getAuthMessages();

        // check if user is logged in
        // if not, send to login page
        // else store a variable to use in view
        $loggedInUser = $auth->getStorage()->read();

        // send the user to myqueue if they are already logged in
        if (isset($loggedInUser->username)) {
            $this->_helper->redirector('', 'index');
        }

        $this->view->loggedInUser = $loggedInUser;
        $this->sess->sanitizeSessData($this->sess->siteLabels, $this->sess->siteTranslations);
        $this->sess->sanitizeSessData($this->sess->siteErrors, $this->sess->siteTranslations);

        $this->view->docReadyJS .= "
			Lrn.Applications.Auth = new Lrn.Application.Auth('login');
			Lrn.Applications.Auth.init({
	    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
	    	    siteErrors: " . json_encode($this->sess->siteErrors) . "
	    	});
		";
        $this->sess->fromBackdoor = true;
    }

    /**
     * --- DO LOGIN ---
     * Processes login information to authenticate
     * the user, or return an error message.
     */
    public function dologinAction() {
        parent::initAjaxResponse();
        error_log('In Do Login for site =' + $this->getSiteId());
        
        $isValidSubmission = (isset($_POST["submitx"]) && isset($_POST['username']) && isset($_POST['password']));
        $request = $this->getRequest();
        $url = $request->getHeader('referer');
        $pos = strrpos($url, "/");
        $action = strlen($url) == ++$pos ? 'login' : substr($url, $pos);
        $action = ($action === "action" ? 'login' : $action);
        if ($isValidSubmission) {
            error_log('In Valid Submission for site =' + $this->getSiteId());
            // Authenticate using soap service
            $userService = new UserServiceSoapModel();
            error_log('Before Authenticate for site =' + $this->getSiteId());
            $authInfo = $userService->authenticate($_POST['username'], $_POST['password']);
            error_log('After Authenticate Info for site =' + $this->getSiteId());
            error_log(Zend_Debug::dump($authInfo));
            // log this login attempt
            $log = $this->getLog();
            $log->log("AuthController::processloginAction(): "
                    . "username=" . $_POST['username']
                    . ";password=" . $_POST['password']
                    . ";submitx=" . $_POST['submitx']
                    . ";userId=" . ($authInfo != null ? $authInfo->userId : 'invalid')
                    . ";siteId=" . $this->getSiteId(), Zend_Log::DEBUG
            );

            if (!isset($authInfo)) {
                error_log('In AuthInfo response not set for site =' + $this->getSiteId());
                //$this->flashMessenger->addMessage($this->sess->siteErrors['CEA007']);
                $this->flashWrapperSet('siteErrors', 'CEA007');
                $this->_helper->redirector('login', 'auth');
            } else {
                // if the user has been authenticated, do some logic and set up
                // the response to send to JS land.
                if ($authInfo->authenticated == "true") {
                    error_log('In authenticated == true for site =' + $this->getSiteId());
                    // for setting up initial user info
                    $this->postAuthentication($authInfo->userId, $authInfo->forcePasswordChange, $action, $_POST['username']);
                    error_log('After postauthentication response not set for site =' + $this->getSiteId());
                    // if the user needs to reset their password
                    // also include that in our response so they
                    // will be redirected immediately.
                    if ($authInfo->forcePasswordChange == "true") {
                        $this->flashWrapperSet('forcePasswordChange', null, 'true');
                        $this->_helper->redirector('resetpassword', 'auth');
                    }
                    error_log('Before redirect to index page for site =' + $this->getSiteId());

                    //setup Akamai cookies to access course content
                    $this->setupAkamaiEdgeAuthCookie();

                    //check to see whether or not to redirect to requested URL
                    $this->redirectToRequestURL($this->sess->userRequestedURL);
                } elseif ($authInfo->authenticated == "false") {
                    error_log('In authenticated == false for site =' + $this->getSiteId());
                    error_log('Errorcode for failed authentication for site =' + $authInfo->errorCode);
                    // if we get account lockout error codes (20201, 20221) then we
                    // tell the user something more specific.
                    // Error 20201 is just an invalid login message for now
                    if ($authInfo->errorCode == '-20201') {
                        //$this->flashMessenger->addMessage($this->sess->siteErrors['CEA007']);
                        $this->flashWrapperSet('siteErrors', 'CEA007');
                        $this->_helper->redirector($action, 'auth');
                    }
                    // Error 20221 is when the user is actually locked out
                    // the [lockoutTime] is what we can use to tell the user
                    // how much longer they might be locked out for, or in the case of 0
                    // that they will be locked out until someone unlocks their acct.
                    if ($authInfo->errorCode == '-20221') {
                        // if zero, give locked out indefinite message
                        if ($authInfo->lockoutTime == "0") {
                            //$this->flashMessenger->addMessage($this->sess->siteErrors['CEA019']);
                            $this->flashWrapperSet('siteErrors', 'CEA019');
                            $this->_helper->redirector($action, 'auth');
                        }
                        // else tell them to try again in x number of minutes.
                        else {
                            //$response['response'] = "The User ID and/or Password you entered is invalid. Your account has been locked out.<br /><br />Please wait " . $authInfo->lockoutTime . " minutes and try again or contact you support representative for further assistance.";
                            $minutes = $authInfo->lockoutTime . ' ' . ($authInfo->lockoutTime > 1 ? $this->sess->siteLabels['MinutePlural'] : $this->sess->siteLabels['MinuteSingle']);
                            $this->flashMessenger->setNamespace('siteErrors')->addMessage(str_replace('%minutes%', $minutes, $this->sess->siteErrors['CEA008']));
                            $this->_helper->redirector($action, 'auth');
                        }
                    }

                    // if no specific reason, just tell the user it didn't work out
                    //$this->flashMessenger->addMessage($this->sess->siteErrors['CEA007']);
                    $this->flashWrapperSet('siteErrors', 'CEA007');
                    $this->_helper->redirector($action, 'auth');
                }
            }
        }
    }

    /**
     * --- ACTION AFTER AUTHENTICATION ---
     *
     */
    public function postAuthentication($userId, $forgotPass, $action, $username) {

        $auth = Console_Auth::getInstance();

        $userService = new UserServiceSoapModel();

        $userServiceRest = new UserServiceRestModel();

        // get more user data to suppliment our auth info
        $userInfo = $userService->getAuthenticatedUserDetails($userId);

        //check for superuser
        $test = '/lrn';
        $this->regenerateSessionId();

        $siteName = $this->sess->siteName;
        //set siteName to lrn for super user
        if (strpos($username, $test) !== false)
            $siteName = 'lrn';
        
        
        $userInfo->hasSiteCustomizerAccess = $userService->hasSiteCustomizerAccess($userId, $siteName);
             
        // set user language if not already set, to avoid LCEC language selection on opening course video
        if (!isset($userInfo->language) || $userInfo->language == '') {
            $userInfo->language = $this->sess->siteConfigs['DefaultLanguage'];
        }
        // get this users access control / permissions
        $userInfo->accessControl = $this->setUserAccessControl($userId);
        //XXX not sure what this is for
        // I would think if we have user info, we already know
        // that they have an identity.
        $userInfo->hasIdentity = 1;
        // everyone is an admin for now. header nav
        // is based on the access control anyway, setting
        // up as admin just allows them to use the site.
        //dasboard configurations
        $userInfo->vcConfigure = 0;
         
        if (VIRTUAL_CATALYST_FEATURE == 1 && ( isset($this->sess->siteConfigs['EnableVirtualCatalyst']) && $this->sess->siteConfigs['EnableVirtualCatalyst'] == 't' )) {
//                $vcPermissions = $userServiceRest->getVirtualCatalystPermissions($userId,$siteName);   
            $userInfo->vcConfigure = $userService->getVirtualCatalystPermissions($siteName, $userId);
        }

        if (EXPORT_MANAGER_FEATURE == 1 && (isset($this->sess->siteConfigs['AllowScormExport']) && $this->sess->siteConfigs['AllowScormExport'] == 't')) {
          
            $userInfo->exportManager = $userService->getExportManagerPermissions($siteName, $userId);
        }
        error_log("userInfo->vcConfigure:".$userInfo->vcConfigure."<=>userInfo->exportManager".$userInfo->exportManager);
        if ($userInfo->vcConfigure == 1 &&  $userInfo->exportManager == 1) {
                $userInfo->role = 'admin';
        } else if ($userInfo->vcConfigure == 1) {
            $userInfo->role = 'vcadmin'; // added -- - new role added if the user has virtual catalyst configure permission
        } else if ($userInfo->exportManager == 1) {
            $userInfo->role = 'emadmin'; // added -- - new role added if the user has virtual catalyst configure permission
        } 
        $userInfo->dashSiteId = $this->sess->siteId;
        $this->sess->user = $userInfo;
        // write info to session
        $auth->getStorage()->write($userInfo);
    }
    
    /*
     * Function to regenrate session Id after sucessfull authentication.
     */

    private function regenerateSessionId() {

        Zend_Session::regenerateId();
        if (isset($this->memcache)) {
            $key = Zend_Session::getId();
            $value = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
            $this->memcache->set($key, $value);
        }
    }

    /**
     * --- LOGOUT PAGE ---
     * While there is not a logout page, we can use
     * auth/logout to log out the user
     * XXX this should also delete cookies for lcec,
     * aim and ram to make sure we are LOGGED OUT for sure.
     */
    public function logoutAction() {

        $this->sess->errorMsg = null;
        $sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);

        //************************************************************************//
        //clear the session from the memcache server for production / staging / qa environments where load balancers are used.
        if (MEMCACHE_USE_MEMCACHE && ((getEnv('APPLICATION_ENV')) == 'production' || (getEnv('APPLICATION_ENV')) == 'staging' || (getEnv('APPLICATION_ENV')) == 'qa')) {

            if (!isset($this->memcache)) {
                $this->memcache = new Memcache;
                $this->memcache->connect(MEMCACHE_SERVER_IP, MEMCACHE_SERVER_PORT);
            }

            $key = Zend_Session::getId();
            $this->memcache->delete($key);
        }

        //************************************************************************//
        // clear session varible to perform logout action
        $sess->siteConfigs = NULL;
        $sess->siteLabels = NULL;
        $sess->user = NULL;
        $sess->csrfkey = NULL;

        /* Commented as of 02/18/2015
          // Unset asession
          if ( isset($this->sess->asession) ){
          unset($this->sess->asession);
          }
         */

        unset($this->sess->componentThemingList);
        unset($this->sess->siteTranslations);
        unset($this->sess->siteConfigs);
        Zend_Auth::getInstance()->clearIdentity();
        Zend_Session::forgetMe();
        //Zend_Session::destroy(true);
        // expire auth cookies
        $domain = $_SERVER["SERVER_NAME"];
        $domain = preg_replace("/^.*-console/", "", $domain);
        //$cookiesToExpire = array('edge-auth'=>'0'/*, 'lcec-saml-auth'=>'0', 'aim-saml-auth'=>'0','session-id'=>'0'*/,'auth'=>'0');
        $cookiesToExpire = array();
        $cookies = array_merge($cookiesToExpire, $_COOKIE);

//         $cookies = $_COOKIE;

        $t = time() - 4492800;

// 		if(stripos($_SERVER['HTTP_HOST'],'.qa7.') !== false){				
// 			unset($_COOKIE['edge-auth']);
// 			unset($cookies['edge-auth']);
// 			setcookie('edge-auth', -1, $t, '/','.qa7.lrn.com');
// 		}

        /*
          // Delete the cookie that retains the previous Language before logging out.
          $localCookie = 'siteSetLanguage'. $this->sess->siteName;

          // If we have this cookie
          if ( isset($_COOKIE[$localCookie])) {

          // Remove it
          unset($_COOKIE[$localCookie]);
          setcookie($localCookie, null, -1, '/');
          }
         */

        /*
          foreach ($cookies as $name => $value) {

          if ($name != 'siteSetLanguage'.$this->sess->siteName && $name !== 'IEFont' && $name !== 'edge-auth' && $name !== 'PHPSESSID') {
          unset($_COOKIE[$name]);
          setcookie($name, -1, $t);
          setcookie($name, -1, $t, '/','.lrn.com');
          }
          }
         */
        //make sure the edge-auth cookie is deleted when the user logout
        //$this->deleteAkamaiEdgeAuthCookie();

        $ctx = stream_context_create(array(
            'http' => array(
                'timeout' => 2
            )
                )
        );

        // execute logout scripts within legacy products
//  		$lcecLogout = file_get_contents($this->view->siteConfigs['legacyHostLCEC'].'/app/logout', 0,  $ctx);
// 		$aimLogout = file_get_contents($this->view->siteConfigs['legacyHostAIM'].'/app/logout');
// 		$ramLogout = file_get_contents($this->view->siteConfigs['legacyHostRAM'].'/app/logout');
        //Since Zend isn't deleting the session upon logout, we're doing it here
        exec('rm -f /console/sessions/sess_' . $phpsessid);
        exec('rm -f /console/sessions/sess_deleted');

//  		print_r($cookies);
//  		die();
        //if user logins from backdoor, then redirect user to backdoor
        if ($sess->fromBackdoor) {
            $this->sess->logoutURL = "/auth/backdoor";
        }
        return;
        // redirct to intranet if specified.  otherwise, redirect to login page
/*        if ($sess->fromSLO !== false || true === $this->sess->fromSaml)
            $this->_redirector->gotoUrl($this->sess->logoutURL);
        else
            header('Location: auth/login');
*/        //$this->_helper->redirector('login', 'auth');
    }

    /**
     * --- FORGOT PASSWORD PAGE ---
     * Initialize method for the forgot password page.
     */
    public function forgotpasswordAction() {
        // append to page title
        $this->view->headTitle($this->sess->siteLabels['ForgotPassTitle']);

        // the Video Tour area
        //enable the video tour
        $this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
        $this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('login');

        // get any error messages the user might need to see
        $this->getAuthMessages();
        $this->sess->sanitizeSessData($this->sess->siteInfo, $this->sess->siteTranslations);
        $this->sess->sanitizeSessData($this->sess->siteLabels, $this->sess->siteTranslations);
        $this->sess->sanitizeSessData($this->sess->siteErrors, $this->sess->siteTranslations);
        $this->view->docReadyJS .= "
			Lrn.Applications.Auth = new Lrn.Application.Auth('forgotpassword');
			Lrn.Applications.Auth.init({
	    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
	    	    siteErrors: " . json_encode($this->sess->siteErrors) . "
	    	});

	    	Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();
		";
    }

    /**
     * --- PROCESS FORGOT PASSWORD ---
     * Processing method for the forgot password form.
     * This method validates the users information and
     * monitors the processing of the forgot password
     * process (sending email, etc.)
     */
    public function doforgotpasswordAction() {
        parent::initAjaxResponse();

        $isValid = isset($_POST["submitx"]);
        $url = str_replace('forgotpassword', 'changepassword', $_SERVER['HTTP_REFERER']);
        $email = $_POST['email'];
        $username = $_POST['username'];

        if ($isValid) {
            // check for valid email. if not valid, set to ''
            if (!empty($email) && $email != 'E-mail Address') {
                // get the email we need to check and normalize it
                $email = strtolower($email);

                // use Zend Validator to validate email address
                $emailValidator = new Zend_Validate_EmailAddress();

                // if the email is a valid format
                if (!$emailValidator->isValid($email)) {
                    $email = '';
                    //$this->flashMessenger->addMessage($this->sess->siteLabels['ResetEmailSent']);
                    $this->flashWrapperSet('siteLabels', 'ResetEmailSent');
                    $this->_helper->redirector('login', 'auth');
                }
            }

            if (empty($username) || $username == "User Name") {
                $username = '';
            }

            if ($email == '' && $username == '') {
                //$this->flashMessenger->addMessage($this->sess->siteErrors['CEA009']);
                $this->flashWrapperSet('siteErrors', 'CEA009');
                $this->_helper->redirector('forgotpassword', 'auth');
            } else {
                // we neede to pass some labels to the FYP service method
                // because it generates an email that uses these labels.
                $usernameLabel = $this->sess->siteLabels['UserName'];
                $passwordLabel = $this->sess->siteLabels['Password'];

                $userService = new UserServiceSoapModel();
                $userServiceResponse = $userService->forgotPasswordEmail($email, $username, $url, $usernameLabel, $passwordLabel);
                if ($userServiceResponse->success == 'true') {
                    //$this->flashMessenger->addMessage($this->sess->siteLabels['ResetEmailSent']);
                    $this->flashWrapperSet('siteInfo', 'ResetEmailSent');
                    //$this->_helper->redirector('login', 'auth');
                    $this->_helper->redirector('forgotpassword', 'auth');
                } else {
                    $errorCode = $userServiceResponse->error->catalystErrCd;
                    //$this->flashMessenger->addMessage($this->sess->siteErrors[$errorCode]);
                    $this->flashWrapperSet('siteErrors', $errorCode);
                    $this->_helper->redirector('forgotpassword', 'auth');
                }
            }
        }
    }

    /**
     * --- CHANGE PASSWORD PAGE ---
     * Initialize method for the change password page.
     */
    public function changepasswordAction() {
        // append to page title
        $this->view->headTitle($this->sess->siteLabels['ChangePassword']);

        // get any error messages the user might need to see
        $this->getAuthMessages();

        // get the passwd instr note from db
        $translationSM = new TranslationSoapModel();

        $passwdinstruction = '';

        $siteTransPassInstr = $translationSM->getTranslationsPassInstrBySiteIdLang($this->sess->siteId, $this->sess->siteConfigs['DefaultLanguage']);

        $passwdinstruction = '';
        if (false !== $siteTransPassInstr) {
            $passwdinstruction = $siteTransPassInstr->data['passInstr'];
        }

        $this->view->passwdinstructions = $passwdinstruction;

        $userService = new UserServiceSoapModel();

        //get the regex expression for passwd
        $pwdregex = $userService->getPasswordRegex();
        $this->view->pwdfieldmatch = $pwdregex->fieldMatch;
        $this->view->pwdfieldlength = $pwdregex->fieldLength; #password max length
        $this->view->pwdminlength = $this->sess->siteConfigs['PasswdLength']; #password min length
        // get the key that the user received in their email
        // check that key, to make sure it's still valid
        // if it's not valid, let the user know
        $key = $_GET['key'];
        $this->view->key = $key;
        $userService = new UserServiceSoapModel();
        $isValidKey = $userService->checkPasswordRecoverKey($key);
        if ($isValidKey->success == false) {
            $errorCode = $isValidKey->error->catalystErrCd;
            //$this->flashMessenger->addMessage($this->sess->siteErrors[$errorCode]);
            $this->flashWrapperSet('siteErrors', $errorCode);
            $this->_helper->redirector('login', 'auth');
        }

        // the Video Tour area
        //enable the video tour
        $this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
        $this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('login');

        $this->view->docReadyJS .= "
			Lrn.Applications.Auth = new Lrn.Application.Auth('changepassword');
			Lrn.Applications.Auth.init({
	    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
	    	    siteErrors: " . json_encode($this->sess->siteErrors) . ",
	    	   	siteInfo: " . json_encode($this->sess->siteInfo) . "
	    	});

	    	Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();
		";
    }

    /**
     * --- DO CHANGE PASSWORD ---
     * This method is called as a result of the change password
     * form being submitted. It updates the users password
     * then redirects them accordingly.
     */
    public function dochangepasswordAction() {
        parent::initAjaxResponse();

        $key = $_POST['key'];
        $username = $_POST['username'];
        $newPassword = $_POST['newPassword'];

        $userService = new UserServiceSoapModel();
        $userServiceResponse = $userService->forgotPasswordWrite($username, $key, $newPassword);

        if ($userServiceResponse->success == false) {
            $errorCode = $userServiceResponse->error->catalystErrCd;
            $this->flashWrapperSet('siteErrors', $errorCode);
            $this->_redirector->gotoUrl('/auth/changepassword?key=' . $_POST['key']);
        } else {
            $this->flashWrapperSet('siteLabels', 'PasswordWasUpdated');
            $this->_helper->redirector('login', 'auth');
        }
    }

    /**
     * --- RESET PASSWORD PAGE ---
     * Used to load in the reset password page.
     * Set the formType so the JS Object knows
     * which form to init and what methods to use.
     */
    public function resetpasswordAction() {

        // get any error messages the user might need to see
        $this->getAuthMessages();

        // get the passwd instr note from db
        $translationSM = new TranslationSoapModel();

        $passwdinstruction = '';

        $siteTransPassInstr = $translationSM->getTranslationsPassInstrBySiteIdLang($this->sess->siteId, $this->sess->siteConfigs['DefaultLanguage']);

        $passwdinstruction = '';
        if (false !== $siteTransPassInstr) {
            $passwdinstruction = $siteTransPassInstr->data['passInstr'];
        }

        $this->view->passwdinstructions = $passwdinstruction;

        $userService = new UserServiceSoapModel();

        //get the regex expression for passwd
        $pwdregex = $userService->getPasswordRegex();
        $this->view->pwdfieldmatch = $pwdregex->fieldMatch;
        $this->view->pwdfieldlength = $pwdregex->fieldLength; #password max length
        $this->view->pwdminlength = $this->sess->siteConfigs['PasswdLength']; #password min length
        // the Video Tour area
        //enable the video tour
        $this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
        $this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('login');

        $this->view->docReadyJS .= "
	        Lrn.Applications.Auth = new Lrn.Application.Auth('resetpassword');
	    	Lrn.Applications.Auth.init({
	    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
	    	    siteErrors: " . json_encode($this->sess->siteErrors) . "
	    	});

	    	Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();
	    ";
    }

    /**
     * --- DO RESET PASSWORD ---
     * This method is called via AJAX request and
     * is responsible for actually passing the password
     * to be reset.
     */
    public function doresetpasswordAction() {
        parent::initAjaxResponse();

        // password from query string, userId from session
        $userId = $this->sess->user->userId;
        $oldPass = $_REQUEST['oldPass'];
        $newPass = ($_REQUEST['newPass'] === $_REQUEST['confirmPass']) ? $_REQUEST['newPass'] : false;

        if (!$newPass) {
            $this->flashWrapperSet('siteErrors', 'CEA012');
            $this->_helper->redirector('resetpassword', 'auth');
        } else {
            $userService = new UserServiceSoapModel();
            $response = $userService->updatePassword($userId, $oldPass, $newPass);

            Zend_Debug::Dump($response);

            if ($response->success == true) {
                // we could add a message here, but unless learn/queue displays it
                // the user will never see it. thus, it is commented out for now
                //$this->flashMessenger->addMessage($this->sess->siteLabels['PasswordWasUpdated'])
                $this->flashWrapperSet('siteLabels', 'PasswordWasUpdated');
                $this->flashWrapperSet('forcePasswordChange', null, 'false');
                $tmp = null;
                $this->flashWrapperGet('forcePasswordChange', $tmp);
                unset($tmp);

                $this->redirectToRequestURL($this->sess->userRequestedURL);
            } else if ($response->success == false) {
                $errorCode = $response->error->catalystErrCd;
                //$this->flashMessenger->addMessage($this->sess->siteErrors[$errorCode]);
                $this->flashWrapperSet('siteErrors', $errorCode);
                $this->_helper->redirector('resetpassword', 'auth');
            }
        }
    }

    /**
     * This will land on the SLO welcome page, after logging in to the catlayst
     */
    public function sloAction() {
        $this->view->path = empty($this->sess->welcomeScreen['vip']) && empty($this->sess->welcomeScreen['carousel']) ? '/learn/queue' : '/index';
        $this->view->docReadyJS .= "
			Lrn.Applications.Auth = new Lrn.Application.Auth('login');
			Lrn.Applications.Auth.init({
	    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
	    	    siteErrors: " . json_encode($this->sess->siteErrors) . "
	    	});
		";
    }

    /**
     * --- SET USER ACCESS CONTROL ---
     * Sets what kind of access this user has to the legacy
     * applications. Depending on this data, users may or may
     * not have access to legacy admin areas.
     *
     * @param unknown_type $userId
     * @return boolean
     */
    public function setUserAccessControl($userId) {
        error_log('In commented RAM service call for sit id =' + $authInfo->errorCode);
        // set AIM and RAM access to false by default
        $accessControlService = new AccessControlServiceSoapModel();
        $accessControl = $accessControlService->getLegacyApplicationAccess($userId, $this->sess->siteId);
        error_log('In RAM service access control =');
        // set AIM and RAM access to false by default
        $accessControl->aimAdmin = false;
        $accessControl->ramAdmin = false;

        error_log('In RAM service PermissionAIMSoapModel =');
// 		// till we get service-to-service calls working
        // we are directly calling aim an ram services to check is user has aim or ram admin access
        $aimPermissionService = new PermissionAIMSoapModel();
        $accessControl->aimAdmin = $aimPermissionService->isUserSiteAdmin($userId, $this->sess->siteId) ? true : false;
        $ramSiteService = new SiteRAMSoapModel();
        $ramSiteRootResponse = $ramSiteService->getSiteConfig($this->sess->siteId, 'ROOT_ENTITY_ID');
        $ramSiteRootEntityId = $ramSiteRootResponse->response;
        $accessControl->ramAdmin = false;
        if ($ramSiteRootEntityId != null) {
            $ramPermisionService = new PermissionRAMSoapModel();
            $ramResponse = $ramPermisionService->isUserSiteAdmin($userId, $this->sess->siteId, $ramSiteRootEntityId);
            if (isset($ramResponse->error))
                $this->addLog($ramResponse->errorMsg);
            else
                $accessControl->ramAdmin = $ramResponse->response ? true : false;
        } else if (isset($ramSiteRootResponse->error)) {
            $this->addLog($ramSiteRootResponse->errorMsg);
        }
        error_log('Before return RAM service PermissionAIMSoapModel =');
// 		error_log($accessControl);
        return $accessControl;
    }

    /**
     * --- GET AUTH MESSAGES ---
     * This is a helper method that will get stuff from the
     * flash messenger, and put it in a view variable.
     */
    public function getAuthMessages() {
        $this->view->errMsg = null;
        $this->view->sysMsg = null;
        $this->flashWrapperGet('siteErrors', $this->view->errMsg);
        $this->flashWrapperGet('siteLabels', $this->view->sysMsg);

        if (!empty($this->view->errMsg)) {
            $this->view->iconClass = 'fa-exclamation-triangle red';
        } else if (!empty($this->view->sysMsg)) {
            $this->view->iconClass = 'fa-check-circle green';
        } else {
            $this->view->iconClass = 'fa-check-circle green';
            $this->flashWrapperGet('siteInfo', $this->view->sysMsg);
        }
    }

    //Validate Self Registration Site Password provided by user
    public function doselfregloginAction() {
        $this->_helper->layout->disableLayout();
        $this->_helper->viewRenderer->setNoRender();

        $passwd = $_REQUEST['regPassword'];
        $siteService = new SiteSoapModel();

        //get the regex expression for passwd
        $sitePasswd = $siteService->getSitePassword($this->sess->siteName);
        $this->sess->selfRegValid = false;
        $result = new stdClass();
        $result->success = null;
        $result->error = true;
        if (isset($sitePasswd) && $sitePasswd != '') {
            if ($sitePasswd == $passwd) {
                $this->sess->selfRegValid = true;
                $result->success = true;
                $result->error = null;
            }
        }
        echo json_encode($result);
    }

    /**
     * --- SITE PASSWORD PAGE FOR SELF REGISTRATION ---
     * This is a login page to advance you to the self
     * registration portion of the site.
     */
    public function sitepasswordAction() {
        if (isset($this->sess->siteConfigs['AllowSelfReg']) && 't' == $this->sess->siteConfigs['AllowSelfReg'] && $this->view->selfRegStat) {
            $this->sess->selfRegValid = false;
            //$this->_helper->layout()->setLayout('welcomepage_layout');
            // the Video Tour area
            //enable the video tour
            $this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
            $this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('login');

            // get any error messages the user might need to see
            $this->getAuthMessages();
            if (isset($this->sess->errorMsg))
                $this->view->errMsg = $this->sess->errorMsg;
            $this->sess->sanitizeSessData($this->sess->siteInfo, $this->sess->siteTranslations);
            $this->sess->sanitizeSessData($this->sess->siteLabels, $this->sess->siteTranslations);
            $this->sess->sanitizeSessData($this->sess->siteErrors, $this->sess->siteTranslations);
            $this->view->docReadyJS .= "
				Lrn.Applications.Auth = new Lrn.Application.Auth('selfregistration');
				Lrn.Applications.Auth.init({
		    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
		    	    siteErrors: " . json_encode($this->sess->siteErrors) . "
		    	});
	
		    	Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();
			";
        } else
            $this->_helper->redirector('login', 'auth');
    }

    /**
     * --- SELF REGISTRATION ---
     * This the self registration page.
     */
    public function selfregistrationAction() {
        if (isset($this->sess->siteConfigs['AllowSelfReg']) && 't' == $this->sess->siteConfigs['AllowSelfReg'] && $this->view->selfRegStat && isset($this->sess->selfRegValid) && $this->sess->selfRegValid) {
            $this->_helper->layout()->setLayout('self_reg');
            $this->getAuthMessages();
            $this->_helper->SelfRegistration($this->sess);
            $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/date.js?' . FILES_VERSION, 'text/javascript');
            // $this->view->headScript()->appendFile('/js/bootstrap/js/bootstrap.js', 'text/javascript');
            $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/bootstrap-datepicker.js', 'text/javascript');
            //$this->view->headScript()->appendFile('/js/widgets/bootstrap-datepicker-select.js?'.FILES_VERSION, 'text/javascript');
            //$this->view->headScript()->appendFile('/js/widgets/jquery.bgiframe.js?'.FILES_VERSION, 'text/javascript');				
            //$this->view->headScript()->appendFile('/js/widgets/jquery.datepicker.js?'.FILES_VERSION, 'text/javascript');
            // $this->view->headLink()->appendStylesheet('/css/bootstrap/css/bootstrap.css');
            $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/datepicker.css');
            //$this->view->headLink()->appendStylesheet('/css/widgets/bootstrap-datepicker-select.css?'.FILES_VERSION);
            //$this->view->headScript()->appendFile('/js/widgets/bootstrap-datepicker-select.js?'.FILES_VERSION, 'text/javascript');
            $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/apps/SelfRegistration.js?' . FILES_VERSION, 'text/javascript');

            $selfRegistData = $this->_helper->SelfRegistration->getSelfRegistrationForm($this->sess->siteConfigs['DefaultLanguage'], true);
            foreach ($selfRegistData['components'] as $key => $val) {
                $this->view->$key = $val;
            }
            $this->view->docReadyJS .= "
				Lrn.Applications.SelfRegistration = new Lrn.Application.SelfRegistration();
				Lrn.Applications.SelfRegistration.init({
		    	    siteLabels: " . json_encode($this->sess->siteLabels) . ",
		    	    siteErrors: " . json_encode($this->sess->siteErrors) . ",
		    	    siteInstructions: " . json_encode($this->sess->siteInstructions) . ",		
		    	    regexArr: " . json_encode($selfRegistData['regexArr']) . "
		    	});
			";
            $this->view->userLabel = $selfRegistData['formFields'];
            $this->view->userLang = $this->sess->siteConfigs['DefaultLanguage'];
        } else
            $this->_helper->redirector('login', 'auth');
    }

    /**
     * --- NEW USER AFTER SELF REGISTRATION  ---
     * This the welcome page for newly registered user.
     */
    public function newuserAction() {
        if (isset($this->sess->siteConfigs['AllowSelfReg']) && 't' == $this->sess->siteConfigs['AllowSelfReg'] && $this->view->selfRegStat) {
            $this->_helper->layout()->setLayout('self_reg');
            $this->getAuthMessages();
            $this->_helper->SelfRegistration($this->sess);
            $selfRegistData = $this->_helper->SelfRegistration->getSelfRegistrationForm($this->sess->siteConfigs['DefaultLanguage'], true);
            $regWelMsg = $selfRegistData['components']['regWelMsg'];
            if ($regWelMsg == '')
                $regWelMsg = $this->sess->siteInstructions['CongratulationsFormCompleted'];
            $this->view->regWelMsg = $regWelMsg;
        } else
            $this->_helper->redirector('login', 'auth');
    }

    /**
     * --- SAVE USER ---
     * This the save user action.
     */
    public function saveuserAction() {
        $this->_helper->SelfRegistration($this->sess);
        // turn off any rendering of layout/view
        $this->_helper->layout->disableLayout();
        $this->_helper->viewRenderer->setNoRender();
        if (!empty($_REQUEST)) {
            $saveObj = $this->_helper->SelfRegistration->saveUser($this->sess->siteConfigs['DefaultLanguage'], $_REQUEST);
            echo json_encode($saveObj);
        }
    }

    public function testcaptchaAction() {
        // turn off any rendering of layout/view
        $this->_helper->layout->disableLayout();
        $this->_helper->viewRenderer->setNoRender();
        $challenge = $_POST["cha"];
        $response = $_POST["res"];
        $verifyCaptcha = $this->_helper->SelfRegistration->verifyCaptcha($challenge, $response);
        $result = new stdClass();
        if ($verifyCaptcha) {
            $result->success = true;
            $result->error = null;
        } else {
            $result->success = null;
            $result->error = true;
        }
        echo json_encode($result);
    }

    private function redirectToRequestURL($requestURL) {
        if (!isset($requestURL) || '' == $requestURL) {
            $this->_helper->redirector('', 'index');
        } else {
            $this->_helper->redirector->gotoUrl($requestURL);
            $this->sess->userRequestedURL = '';
        }
    }

    /**
     * Course Launch action for .course url
     */
    public function courselaunchAction() {

        $goToCounter = 0;
        start:

        $request = $this->getRequest();
        $destination = $request->getParam('destiURL');
        $media = $request->getParam('media');
        $sessionCacheKey = $request->getParam('sKey');

        $sessionId = Zend_Registry::get('memcache')->getItemFromCache($sessionCacheKey);

        if (false !== $sessionId && !empty($sessionId)) {

            // Create a cookie on destination domain
            setcookie('PHPSESSID', $sessionId, 0, '/', COOKIE_DOMAIN, COOKIE_SECURE, COOKIE_HTTPONLY);

            // Redirect 
            echo "<script type='text/javascript'>window.location.href = '" . base64_decode($destination) . "&media=" . $media . "';</script>";
            //$this->_helper->redirector->gotoUrlAndExit(base64_decode($destination) . '&media=' . $media);
        } else {

            $goToCounter++;
            if ($goToCounter <= 2) {
                // if there is miss from memcache while trying to retrieve session id
                goto start;
            } else {

                $referer = filter_input(INPUT_SERVER, REDIRECT_SCRIPT_URI);
                $baseUrlArray = explode('-', filter_input(INPUT_SERVER, HTTP_HOST));
                $host = $baseUrlArray[0];
                $baseURL = str_replace('<site>', $host, HOST_CATALYST);

                $url = $baseURL . '/auth/courselaunchsession?destiURL=' . $destination . '&media=' . $media . '&referer=' . base64_encode($referer) . '&sKey=' . $sessionCacheKey;

                $this->_helper->redirector->gotoUrlAndExit($url);
            }
        }
    }

    /**
     * Action to put session id into memcache for courselaunch if mising
     */
    public function courselaunchsessionAction() {

        $request = $this->getRequest();
        $destination = $request->getParam('destiURL');
        $media = $request->getParam('media');
        $referer = $request->getParam('referer');
        $sessionCacheKey = $request->getParam('sKey');

        $memcache = Zend_Registry::get('memcache');

        if (false === $memcache->getItemFromCache($sessionCacheKey)) {
            $sessionId = Zend_Session::getId();
            $memcache->putItemToCache($sessionId, $sessionCacheKey);
        }

        $this->_helper->redirector->gotoUrlAndExit(base64_decode($referer) . '?destiURL=' . $destination . '&media=' . $media . '&sKey=' . $sessionCacheKey);
    }

}
