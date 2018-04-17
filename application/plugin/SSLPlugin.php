<?php
/* handle SSL redirect */
class SSL_Plugin extends Zend_Controller_Plugin_Abstract {

	public function preDispatch(Zend_Controller_Request_Abstract $request) {
	   /* if ( !($request->getHeader('FRONT-END-HTTPS')) ) {
	    	// this is not an https request
	    	// is it required by our environment
	    	if (SSL_REDIRECT == 1 && false === strpos($_SERVER['HTTP_HOST'], '.course.')) {
	    		header('Location: https://'. $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
	    		exit();
	    	}
	    }*/
	}
}