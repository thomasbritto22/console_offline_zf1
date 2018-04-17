<?php
class IndexController extends ApplicationController {

	public function init(){
		parent::init();

		$this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/jquery.ddSlick.js?'.FILES_VERSION, 'text/javascript');
		$this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/Camera.js?'.FILES_VERSION, 'text/javascript');
		$this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/widgets/Camera.css?'.FILES_VERSION);

		/*video tour required*/
		$this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/widgets/Dialog.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/widgets/MediaElementPlayer.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/widgets/mejs-skins.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/widgets/VideoTour.css?'.FILES_VERSION);
		$this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/Dialog.js?'.FILES_VERSION, 'text/javascript');
		$this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/VideoTour.js?'.FILES_VERSION, 'text/javascript');
		$this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/MediaElementPlayer.js?'.FILES_VERSION,'text/javascript');
		$this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/jquery/jquery.mobile-1.4.5.js', 'text/javascript');

		// set the layout to three_column_layout for all Auth Actions
		$this->_helper->layout()->setLayout('index_layout');

		//redirect to my queue if home page is no content
// 		if (empty($this->view->carouselHTML) && empty($this->view->vipHTML))
// 		{
// 		   $this->_helper->redirector('queue', 'learn');
// 		}

		// the Video Tour area
		//enable the video tour
		$this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
		$this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('home');

		// render the resource center for the right column
		$this->view->viewResourceBox = true;
		$resourceHelper = $this->_helper->resourceCenter($this->sess);
		$this->view->resourcesBoxRecords =  $this->_helper->resourceCenter->getResources(RESOURCE_RIGHT_COLUMN_SHOW_NUMBER, 'rightSidebar', 'rightSidebar');

		$this->view->docReadyJS .= "
	    	Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();

			Lrn.Applications = new Lrn.Application();
			Lrn.Applications.init();
			// call the camera function to begin slider
            Lrn.camerawrap = $('#camera_wrap_1');
            // setup up some custom options for our slider
            Lrn.camerawrap.camera({});
		";
	}

	/**
	 * --- INDEX ACTION ---
	 * The main action for the index page, aka 'My Queue'.
	 * Basically checks if user is logged in, and acts
	 * accordingly (redirect or value setup).
	 */
	public function indexAction(){
	    // instanciate the user SOAP service and Auth class
	    $auth = CONSOLE_Auth::getInstance();

	    // check if user is logged in
	    // if not, send to login page
	    // else store a variable to use in view
	    $loggedInUser = $auth->getStorage()->read();

	    $sloSess = new Console_SessionHelper('SLO');
            $this->_redirect('/admin/offlineerror');

	    // to keep things organized, we are going to
	    // redirect users to the myqueue page instead
	    // of making the index page into the myqueue page.
	    // this way we leave index open to be more of a router.
	    //$this->_redirect('/learn/queue');
	}
         public function getcurrenttranslationAction() {
             
         parent::initAjaxResponse();
         $this->getTranslations();
            echo json_encode($this->sess->siteLabels);
    }
}