<?php

class ResourcecenterController extends ApplicationController {

    public function init() {
        parent::init();

        /* video tour required */
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/Dialog.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/MediaElementPlayer.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/mejs-skins.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/widgets/VideoTour.css?' . FILES_VERSION);
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/Dialog.js?' . FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/VideoTour.js?' . FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/widgets/MediaElementPlayer.js?' . FILES_VERSION, 'text/javascript');


        //enable the video tour
        $this->view->videoTourItems = $this->_helper->VideoTour($this->sess);
        $this->view->videoTourBox = $this->_helper->VideoTour->checkEnable('resource');

        $this->view->pageTitle = $this->sess->siteLabels['ResourceCenter'];
        $this->view->headTitle($this->view->pageTitle);

        //set the default height for middle content
        $this->view->docReadyJS .= "
            Lrn.Applications = new Lrn.Application();
			Lrn.Applications.init();
		    Lrn.Widget.VideoTour = new Lrn.Widget.VideoTour();
            ";

        //set There column layout for this controller
        $this->_helper->layout()->setLayout('three_column_layout');
    }

    public function indexAction() {
        $this->_helper->resourceCenter($this->sess);

        if ($this->_helper->resourceCenter->countResources() <= 0) {
            $this->_helper->redirector('', 'index');
        }

        $this->view->resources = $this->_helper->resourceCenter->getResources(null, array('loginPage', 'rightSidebar', 'resourcePage'), 'resourcePage');
    }

    public function downloadAction() {
        //If any link is open from resource centre on login page, this variable is set to download link 
        //so when user login he is again prompted for download
        $this->sess->userRequestedURL = '';
        ignore_user_abort(true);
        $file_path = $_REQUEST['filepath'];
        $new_filename = $_REQUEST['filename'];
        $type = 'application/' . $_REQUEST['type'];
        $file_path = strtok($file_path, '?');
        $path_parts = pathinfo($file_path); //print_r($path_parts);exit;
        $file_ext = $path_parts['extension'];
        $file_name = $path_parts['basename'];

        $file_path = ($_REQUEST['action']=='exportCourse')?$file_name:FILES_PATH . $file_name;
        error_log($file_path);
        $fp = fopen($file_path, 'rb');
        header_remove();
        //echo filesize('/console/files/'.$path_parts['basename']);exit;
        header("Cache-Control: public, must-revalidate, post-check=0, pre-check=0");
        header("Content-Disposition: attachment; filename=\"$new_filename\"");
        $ctype_default = "application/octet-stream";
        $content_types = array(
            "pdf" => "application/pdf",
            "doc" => "application/msword",
            "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "zip" => "application/zip"
        );
        $ctype = isset($content_types[$file_ext]) ? $content_types[$file_ext] : $ctype_default;
        header("Content-Type: " . $ctype);
        header("Content-Length: " . filesize($file_path));
        ob_clean();
        flush();
        session_write_close();
////echo $pdfiledata = file_get_contents($file_path);
//		readfile($file_path);
        fpassthru($fp);
//        unlink($file_path);
        exit;
    }

}

?>