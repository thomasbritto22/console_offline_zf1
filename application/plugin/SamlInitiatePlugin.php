<?php
require_once ("../application/soapModels/LRNService/Site.php");

/**
* Handle Saml Initiated processes
*
*
*/
class Saml_Initiate_Plugin extends Zend_Controller_Plugin_Abstract {

	/* 
	 * List of pages which needs to excluded from Saml Initiated request
	 */
	protected $_excludePages = array(
                '/auth/login',
	        '/samlsso/samlinitiate',
	        '/samlsso/consume',
                '/sso/consume',
                '/auth/backdoor',
	        '/auth/dologin',            
        '/error/error',
	);
	protected $sess;

	public function preDispatch(Zend_Controller_Request_Abstract $request) {
	   
		$controller = $request->getControllerName();
		$action = $request->getActionName();
        $path = '/'.$controller.'/'.$action;
        
		// start authentication
		$auth = Console_Auth::getInstance();
		$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		
		if(!$auth->hasIdentity() && !in_array($path, $this->_excludePages)) {
		   $redirector = Zend_Controller_Action_HelperBroker::getStaticHelper('redirector');
		   
		   try {
      		   $siteService = new SiteSoapModel();
      		   $samlConfig = $siteService->getSiteSettingsForSAML($this->sess->siteName);
      		   
      		   //check to see whether the SAML Initiated is enable for this site or not
      		   if (isset($samlConfig['SAMLEnabled']) && "1" == $samlConfig['SAMLEnabled'] &&
      		       isset($samlConfig['isSPInitSAML']) && "1" == $samlConfig['isSPInitSAML']){
      		         
                        /* Retain the request URL, so that after SP Initiated SAML Authorization we can redirect to the requested URL */
                        $this->sess->SPInitTargetURI = $request->getRequestUri();
                        
               		 //Redirect User to logout
               		 $redirector->gotoUrl('/samlsso/samlinitiate');
      	       } 
		   } catch (Exception $e){
		      
		      //make sure if there is an error user will redirected to login page
		      $redirector->gotoUrl('/auth/login');
      	   }
	   }
	}
}

?>
