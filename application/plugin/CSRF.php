<?php
/**
 * A controller plugin for protecting forms and AJAX post requests from CSRF
 *
 * Works by looking at the response and adding a hidden element to every
 * form, which contains an automatically generated token that is checked
 * on the next request against a token stored in the session
 * 
 * For AJAX request, looks at the request header for custom header with token
 *
 */
class CSRF extends Zend_Controller_Plugin_Abstract {
	/**
	 * Session storage
	 * @var Zend_Session_Namespace
	 */
	protected $_session = null;
	
	/**
	 * The name of the form element which contains the token
	 * @var string
	 */
	protected $_tokenName = 'CSRFToken';	

	/* List of pages which needs to excluded from CSRF prevent, this should used only
	 * in cases where it is necessary
	 */
	protected $_excludePages = array(
	         '/sso/consume',
	         '/samlsso/consume',
	         '/auth/courselaunch'
	);
	
	/**
	 * Set the name of the csrf form element
	 * @param string $name
	 * @return CSRF implements fluent interface
	 */
	public function setTokenName($name)
	{
		$this->_tokenName = $name;
		return $this;
	}
	public function dispatchLoopStartup()
	{
		//$this->_session = new Zend_Session_Namespace(SESSION_GLOBAL_NAMESPACE);
	}
	/**
	 * Performs CSRF protection checks before dispatching occurs
	 * @param Zend_Controller_Request_Abstract $request
	 */
	public function preDispatch(Zend_Controller_Request_Abstract $request)
	{
	     $this->_initializeTokens();
         $controller = $request->getControllerName();
         $action = $request->getActionName();
         $path = '/'.$controller.'/'.$action;
         if( !in_array( $path, $this->_excludePages ) ) {
            if($request->isPost() === true) {
               $value = $request->getPost($this->_tokenName);
               if( empty( $value ) && $request->isXmlHttpRequest() ) {
                  $value = $request->getHeader($this->_tokenName);
               }

            	if(!$this->isValidToken($value)) {
            		
                    if( $request->isXmlHttpRequest() ) {
                        header("HTTP/1.0 400 Bad Request");
                        $response = array( 'systemError' => "true" );
                        echo json_encode($response);
                        exit;
                    } else {
                        $redirector = Zend_Controller_Action_HelperBroker::getStaticHelper('redirector');
           		
            		//Redirect User to logout
            		$redirector->gotoUrlAndExit('/error.html');                     
                    }
            	}
            }
        }
	}
	/**
	 * Check if a token is valid for the previous request
	 * @param string $value
	 * @return bool
	 */
	public function isValidToken($value)
	{
		if($value != $this->_token) {
			return false;
		}			
		return true;
	}
	
	/**
	 * Return the CSRF token for this request
	 * @return string
	 */
	public function getToken()
	{
		return $this->_token;
	}

	/**
	 * Adds protection to forms
	 */
	public function dispatchLoopShutdown()
	{
		$token = $this->getToken();
		$response = $this->getResponse();
		$headers = $response->getHeaders();
		foreach($headers as $header)
		{
			//Do not proceed if content-type is not html/xhtml or such
			if($header['name'] == 'Content-Type' && strpos($header['value'], 'html') === false)
				return;
		}
		$element = sprintf('<input type="hidden" name="%s" value="%s" />',
				$this->_tokenName,
				$token
		);
		$body = $response->getBody();
		//Find all forms and add the csrf protection element to them
		$body = preg_replace('/<form[^>]*>/i', '$0' . $element, $body);
		$response->setBody($body);
	}
	/**
	 * Initializes a new token
	 */
	protected function _initializeTokens()
	{
	    $this->_session = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		if( empty( $this->_session->csrfkey ) ) {
			$newToken = sha1(microtime() . mt_rand() . $this->_session->siteId);
			$this->_session->csrfkey = $newToken;
		} else {
			$newToken = $this->_session->csrfkey;
		}
		$this->_token = $newToken;
	}
}