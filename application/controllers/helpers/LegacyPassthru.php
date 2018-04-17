<?php
/**
 * Action Helper for Language Selection
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_LegacyPassthru extends Zend_Controller_Action_Helper_Abstract {

    public $_config;
    
    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct(){
        
    }
    
    /**
     * --- SET CONFIGS ---
     * Set config values from passed array
     *
     * @return void
     */
    public function setConfigs($config) {
        // if any config values are passed in, override defaults
    	if(!empty($config)) {
    		foreach($config as $k => $c) {
    			$this->_config[$k] = $c;
    		}
    	}
    	
    	// round the passed value to the 1st decimal place by $this->_roundBy
    	if(!empty($this->_config['value']))
    		$this->_config['value'] = round($this->_config['value']/$this->_roundBy) * $this->_roundBy;
    }
    
    /*
     * this will be retired after all the Saml redirect using post variables submit
     */
    public function getLegacyFrameSrc(){
        // the targetURI is being passed in the URL
        $targetURI = '/';
        if(isset($this->_config['targetURI'])) $targetURI = $this->_config['targetURI'];
	    if(isset($_GET['targetURI'])) $targetURI = $_GET['targetURI'];
	    
	    // get the appname from URL (use LCEC by default so as not to fail)
	    $legacyApp = 'lcec';
	    if(isset($this->_config['app'])) $legacyApp = $this->_config['app'];
	    if(isset($_GET['app'])) $legacyApp = $_GET['app'];
	    
	    // get the host name based on the app we want
	    switch($legacyApp){
	        case 'lcec':
                    $legacyHostConst = LEGACY_HOST_LCEC;
                    $SAMLConsumePath = '/app/samlsso/consume';
                    break;
	        case 'aim':
	            $legacyHostConst = LEGACY_HOST_AIM;
	            $SAMLConsumePath = '/app/samlsso/consume';
	            break;
	        case 'ram':
	            $legacyHostConst = LEGACY_HOST_RAM;
	            $SAMLConsumePath = '/Samlsso/consume?isConsole=1';
	            break;
	    }
	    
	    // store the legacy app URL in an easy variable
	    $siteName = $this->_config['sess']->siteName;
            if (!empty($this->_config['sess']->parentSiteName)) {
                $siteName = $this->_config['sess']->parentSiteName;
            }
	    $legacyHost = str_replace('<site>', $siteName, $legacyHostConst);
            $host = $this->_config['noDomain'] === true ? $SAMLConsumePath : $legacyHost . $SAMLConsumePath;
	    
	    // check if the user is authenticated for this pass through
	    $isSAMLAuth = $this->isSAMLAuth($legacyApp);

	    //after it is authenticated, add the returnUrlToConsole to AIM surveys page
	    $isConsole = '';
	    if(isset($_GET['isConsole'])) {
	    	$targetURI = $targetURI . '&isConsole=1';
	    }
	    
	    // if the user has not already been authenticated
	    // load a page that submits a form to get authenticated
	    // **Make sure to use the base64 SAML response!
	    if(!$isSAMLAuth) {
	        // the iframe should load an HTML page that will submit a SAML
	        // authentication request. This will verify the user and then
	        // automatically redirect them when successful.
	        $frameSrc = $this->_config['rmvSensitiveParam'] === true ? '/samlredirect/index' : '/html/lrnconsole_samlredirect.html';
	        $frameSrc .= '?postURI=' . urlencode($host);
	        $frameSrc .= '&launchType=' . base64_encode('course');
	        $frameSrc .= '&targetURI=' . urlencode($targetURI);
	        $frameSrc .= $this->_config['rmvSensitiveParam'] === true ? '' : '&SAMLResponse=' . $this->getSAMLResponse();
	    }
	     
	    // if the user is already authenticated, then just load the app.
	    // the iframe should just load the target URI directly.
	    else {
	        $frameSrc = (stripos($targetURI,'http://') === false && stripos($targetURI,'https://') === false ? $legacyHost : '') . $targetURI;
	    }

	    return $frameSrc;
    }
    
    
    public function getLegacyPostSrc(){
        $targetURI = '/';
        if(isset($this->_config['targetURI'])) $targetURI = $this->_config['targetURI'];
	    
	    // get the appname from URL (use LCEC by default so as not to fail)
	    $legacyApp = 'lcec';
	    if(isset($this->_config['app'])) $legacyApp = $this->_config['app'];
	    
	    // get the host name based on the app we want
	    switch($legacyApp){
	        case 'lcec':
                $legacyHostConst = LEGACY_HOST_LCEC;
                $SAMLConsumePath = '/app/samlsso/consume';
                break;
	        case 'aim':
	            $legacyHostConst = LEGACY_HOST_AIM;
	            $SAMLConsumePath = '/app/samlsso/consume';
	            break;
	        case 'ram':
	            $legacyHostConst = LEGACY_HOST_RAM;
	            $SAMLConsumePath = '/Samlsso/consume?isConsole=1';
	            break;
	    }
	    
	    // store the legacy app URL in an easy variable
	    $siteName = $this->_config['sess']->siteName;
            if (!empty($this->_config['sess']->parentSiteName)) {
                $siteName = $this->_config['sess']->parentSiteName;
            }
	    $legacyHost = str_replace('<site>', $siteName, $legacyHostConst);
	    $host = $legacyHost . $SAMLConsumePath;
       
       return array('postURI'=>$host, 'targetURI' => $targetURI, 'SAMLResponse' => $this->getSAMLResponse());
    }
    
    /**
     * --- IS SAML AUTH ---
     * This method was ported from JS. It is built to
     * examine the cookies of a user to determine that the
     * user has already been authenticated via SAML.
     * @return number
     */
    public function isSAMLAuth($legacyApp){
        $cookieName = $legacyApp . '-saml-auth';
        if(!empty($_COOKIE[$cookieName])){
            $cookieVars = explode('&', $_COOKIE[$cookieName]);
            if(!isset($this->_actionController->view->siteConfigs['siteId'])){
            	 $this->_actionController->view->siteConfigs['siteId'] = $this->_actionController->view->user->site->id;
            }
            for($j=0; $j<count($cookieVars); $j=$j+2){
                if($cookieVars[$j] == "siteId" && $cookieVars[$j+1] == $this->_actionController->view->siteConfigs['siteId']) return 1;
            }
            //XXX use this when we are using key=value&key2=value2 in our cookie
            //$cookieVars = explode('&', $_COOKIE[$cookieName]);
            //foreach($cookieVars as $var){
            //    $keyValue = explode('=', $var);
            //    if($keyValue[0] == 'siteId' && $keyValue[1] == $this->view->siteConfigs['siteId']) return 1;
            //}
        }
        return 0;
    }
    
    /**
     * --- GET SAML RESPONSE ---
     * Used by legacy applications when creating
     * a passthru. Requests response from SAML service
     * and stores it for use by a child controller.
     * @return array $samlData
     */
    public function getSAMLResponse(){
        // get user info
        $auth = CONSOLE_Auth::getInstance();
        $userName = $auth->getStorage()->read()->username;
        $siteId = $auth->getStorage()->read()->site->id;
        
        // this is where we pass info to saml to check user auth
        $samlService = new SamlServiceSoapModel();
        if(!empty($samlService)){
            $samlResponse = $samlService->genResponse(strtoupper($userName), $siteId);
            $samlBase64Response = $samlResponse->base64Response;
        }
        
        return $samlBase64Response;
    }
    
    /**
     * Strategy pattern: call helper as broker method
     *
     * @param  array $config
     * @return ResourceCenter
     */
    public function direct(){
        
    }
}
?>
