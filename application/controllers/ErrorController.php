<?php

class ErrorController extends ApplicationController
{

    public function errorAction()
    {
    	//for Twitter REST calls
    	if(stripos($_SERVER['REQUEST_URI'],'/rest/') !== false){
			print_r($this);
    		return;
    	}
    	//disable
    	$mimeMatches = array();
    	preg_match('/\.(?:jpe?g|gif|png|css|js)$/i', $_SERVER['REQUEST_URI'], $mimeMatches);
    	$errors = $this->_getParam('error_handler');

    	if(count($mimeMatches) > 0 ){
    		//Disable output for images, CSS, and Javascript file requests...
    		$this->_helper->layout()->disableLayout();
    		$this->_helper->viewRenderer->setNoRender(true);

    		switch ($errors->type) {
    			case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ROUTE:
    			case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
    			case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:

    				// 404 error -- controller or action not found
    				$this->getResponse()->setHttpResponseCode(404);
    				break;
    			default:
    				// application error
    				$this->getResponse()->setHttpResponseCode(500);
    				break;
    		}

    		switch(substr(strtolower($mimeMatches[0]),1)){
    			case 'jpeg':
    			case 'jpg':
    				$this->getResponse()->setHeader('Content-Type', 'image/jpeg', true);
    				break;
    			case 'png':
    			case 'gif':
    				$this->getResponse()->setHeader('Content-Type', 'image/'.$mimeMatches[0],true);
    				break;
    			case 'css':
    				$this->getResponse()->setHeader('Content-Type', 'text/css',true);
    				break;
    			case 'js':
    				$this->getResponse()->setHeader('Content-Type', 'application/javascript',true);
    				break;
    		}
    		return;
    	}else
    		// Otherwise, set the default layout to leftsidebar_layout for all Channel Actions
    		$this->_helper->layout()->setLayout('clean_layout');

    	// Set head title to error
    	$this->view->headTitle("Error");

        $this->view->headLink()->appendStylesheet('/css/error.css?'.FILES_VERSION);

        // add required js components/plugins/etc.
        $this->view->headScript()->appendFile(
        		'/js/apps/Error.js?'.FILES_VERSION,
        		'text/javascript'
        );

        // make sure Lrn.Applications exists
        $this->view->docReadyJS .= "
        	if(typeof Lrn.Applications == 'undefined') Lrn.Applications = {};
        	Lrn.Applications.Error = new Lrn.Application.Error({
        		siteConfigs: " . json_encode($this->view->siteConfigs) . "
        	});
        	Lrn.Applications.Error.init();
       	";

        // initialize our javascript
        $this->view->docReadyJS .= "
	    	Lrn.Applications.Error.initErrorView();
	   	";

        if (!$errors) {
            $this->view->message = 'You have reached the error page';
            return;
        }

         switch ($errors->type) {
             case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ROUTE:
             case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_CONTROLLER:
             case Zend_Controller_Plugin_ErrorHandler::EXCEPTION_NO_ACTION:

                 // 404 error -- controller or action not found
                 $this->getResponse()->setHttpResponseCode(404);
                 $this->view->message = 'Page not found';
                 break;
             default:
                 // application error
                 $this->getResponse()->setHttpResponseCode(500);
                 $this->view->message = 'Application error';
                 break;
         }

        // Log exception, if logger available
         if ($log = $this->getLog()) {
             $log->crit($this->view->message, $errors->exception);
             $log->log($this->view->message . "exception: " . $errors->exception, Zend_Log::CRIT);
         }

         // conditionally display exceptions
         if ($this->getInvokeArg('displayExceptions') == true) {
             $this->view->exception = $errors->exception;
         }
        $this->view->errorTrace = $this->view->message . "exception: " . $errors->exception;

        $this->view->request   = $errors->request;

        $this->view->sorryMsg = 'We\'re sorry,';
        $this->view->topMsg = ' there was a sign-in error.';
        $this->view->botMsg = 'Please contact your help desk.';
        if(isset($this->sess->user)) {
        	// set the default layout to leftsidebar_layout for all Channel Actions
        	$this->_helper->layout()->setLayout('index_layout');
        	$this->view->sorryMsg = $this->sess->siteLabels['MissingPage'];
        	$this->view->topMsg = '';
        	$this->view->botMsg = $this->sess->siteLabels['ReturnToHome'];
        }

    }

}

?>