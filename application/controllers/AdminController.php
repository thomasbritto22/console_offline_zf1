<?php
require_once ("../application/soapModels/CatalystService/Component.php");
require_once ("../application/soapModels/LRNService/SLO.php");
require_once ("../application/soapModels/CatalystService/CourseCustomization.php");
require_once ("../application/soapModels/LRNService/Site.php");

class AdminController extends ApplicationController {
	public $rcTypes;
	public $visibilityTypes;

    public function init() {
        parent::init();
        $this->config = json_decode(file_get_contents('../application/configs/json/fileUpload.json'));
        // append to page title
        $this->view->pageTitle = '';
        $this->view->headTitle($this->view->pageTitle);

        // add admin specific css
        $this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/admin.css?'.FILES_VERSION);
       
        $this->view->headLink()->appendStylesheet( CDN_IMG_URL . '/css/customvcemheader.css');
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/apps/customvcemheader.js?'.FILES_VERSION, 'text/javascript');
        // add required js components/plugins/etc.
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/widgets/Dialog.js?'.FILES_VERSION, 'text/javascript');
        // add admin specific javascript
        $this->view->headScript()->appendFile( CDN_CSS_JS_URL . '/js/apps/Admin.js?'.FILES_VERSION, 'text/javascript');
        //include admin.js selft Registration extention
        //include tooltipster.js
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/jquery/jquery.fileDownload.js?', 'text/javascript');
        $adminHelper = $this->_helper->Admin($this->sess);

        // make sure to add the fileTool HTML to our view
        //$this->view->fileTool = $this->view->render('files/tool.phtml');
        
        //it is require for admin page to display the lanuague confirmation
        $this->view->pageSiteDefLang = $this->view->siteDefLang;

	    $this->view->docReadyJS .= "
            // create and initialize our admin JS
            Lrn.Application.Admin = new Lrn.Application.Admin({
	    	defLang: " . json_encode(DEFAULT_LANGUAGE) . ",
			lang: " . json_encode($this->sess->siteConfigs['ConfigsDefaultLanguage']) . ",
		    langName:" . json_encode($this->sess->siteConfigs['ConfigsDefaultLanguageName']) . "
		});
            Lrn.Application.Admin.init();
            ";

        // set the layout to leftsidebar_layout for all Admin Actions
        $this->_helper->layout()->setLayout('two_column_layout');

        $this->rcTypes = array('url'=>'URL', 'email'=>'Email', 'doc'=>'Document', 'phone'=>'Phone', 'text'=>'Plain text', 'video'=>'Video');
        $this->visibilityTypes = array('loginPage'=>'Login page', 'rightSidebar'=>'Right sidebar', 'global'=>'Global', 'resourcePage'=>'Resource Center');
    }

    /**
     * --- ADMIN INDEX ---
     * The default landing page for the admin area
     */
    public function indexAction() {

    }

    public function catalystofflineAction() {
        $auth = CONSOLE_Auth::getInstance();
        $loggedInUser = $auth->getStorage()->read();
        $siteSettingObject = new SiteSoapModel();
        $siteSettings = $siteSettingObject->getSiteSettings("vc_auto_user_create");
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/dataTable/jquery.dataTables.min.js', 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/apps/moment.js?' . FILES_VERSION, 'text/javascript');
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/dataTable/dataTable.css?' . FILES_VERSION);
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/dataTable/jquery.dataTables.min.js', 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/dataTable/dataTables.fixedColumns.js', 'text/javascript');
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/virtualCatalyst.css?' . FILES_VERSION);
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/jquery/jquery-ajax-localstorage-cache.js', 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/apps/virtualCatalyst.js', 'text/javascript');

        $this->view->company = $this->sess->siteName;
        $this->view->siteId = $this->sess->siteId;
        $this->view->flag = "vc";
        if($siteSettings->dataObject->settingValue)
        $this->view->vc_auto_user_create = "checked='checked'";

         if (VIRTUAL_CATALYST_FEATURE == 0 || ( !isset($this->sess->siteConfigs['EnableVirtualCatalyst']) || $this->sess->siteConfigs['EnableVirtualCatalyst'] != 't' ) || $loggedInUser->vcConfigure != 1) {
          //$this->_redirect('/admin/offlineerror');  
       }
    }

    public function exportmanagerAction() { 
        
        $auth = CONSOLE_Auth::getInstance();
        $loggedInUser = $auth->getStorage()->read();
        
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/dataTable/jquery.dataTables.min.css?' . FILES_VERSION);
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/exportManager.css?' . FILES_VERSION);
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/dataTable/jquery.dataTables.min.js', 'text/javascript');
        $this->view->headLink()->appendStylesheet(CDN_IMG_URL . '/css/dataTable/dataTable.css?' . FILES_VERSION);
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/dataTable/dataTables.fixedColumns.js', 'text/javascript');
        
        
         
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/jquery/jquery-ajax-localstorage-cache.js', 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/dataTable/jquery.dataTables.areaselect.js', 'text/javascript');
        $this->view->headScript()->appendFile(CDN_CSS_JS_URL . '/js/apps/exportManager.js?' . FILES_VERSION, 'text/javascript');
       
        $this->view->availableLang = json_encode($this->sess->languages);
        $this->view->flag = "em";
        $this->view->exportFormat = (isset($_POST['exportFormat']))?$_POST['exportFormat']:"scorm";
       
    if (EXPORT_MANAGER_FEATURE == 0 || (!isset($this->sess->siteConfigs['AllowScormExport']) || $this->sess->siteConfigs['AllowScormExport'] != 't') || $loggedInUser->exportManager != 1) {

          //$this->_redirect('/admin/offlineerror');

      }

    }
    public function offlineerrorAction() {
        
        $this->view->sorryMsg = "We're sorry, but the page you're looking for seems to be missing.";
        $this->view->botMsg = "Try returning to the home page to find the page you were looking for, or E-mail support for more help.";
        if (!empty($this->sess->siteLabels['MissingPage']))
            $this->view->sorryMsg = $this->sess->siteLabels['MissingPage'];
        if (!empty($this->sess->siteLabels['ReturnToHome']))
            $this->view->botMsg = $this->sess->siteLabels['ReturnToHome'];
    }
    
    public function setsitesettingslistAction(){
        // turn off any rendering of layout/view
        $this->_helper->layout->disableLayout();
        $this->_helper->viewRenderer->setNoRender();
        $siteSettingObject = new SiteSoapModel();
        $siteSettingsDTO['settingValue'] = isset($_POST['vc_auto_user_create']) ? "1" : "0";
        $siteSettingsDTO['settingName'] = "vc_auto_user_create";
        $siteSettingsDTO['company'] = $this->sess->siteName;
        $response = $siteSettingObject->setSiteSettingsList($siteSettingsDTO);
        echo json_encode($response);
        exit;
    }
     public function exportpdfAction(){
        ini_set('memory_limit', '4096M'); // 4 GB Memory
        ini_set('max_execution_time', 0); //no limit  
        
        $this->_helper->layout->disableLayout();
        $this->_helper->viewRenderer->setNoRender();
        $sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
        $flag = $_GET['flag'];
        
        if($flag){
           $sess->lcec_session = $flag;
        }
        $sessionId = $sess->lcec_session;
       
        $courseId = $_GET['systemId'];
        
        //$courseId = '16586';
        if(empty($courseId)){ return ;exit;}
        
        $url = $this->getRequestlUrl($courseId); 
       // echo $url;
       // echo $sessionId;
        //echo $courseId."=".$sessionId."</br>";
        try {
            $client = $this->makeRestCall($url);  
            $client->setHeaders(
                    array('Accept: application/json', 
                        'Access-Control-Allow-Origin:*', 
                        'Access-Control-Allow-Credentials:true', 
                        'Cookie:session-id='.$sessionId
                    ));
            $response = $client->request(Zend_Http_Client::GET);
            $response = Zend_Json::decode($response->getBody());
            if(!empty($response)){
               $pdfUrl = $this-> getPdfUrl($response['pdfUrl'],$courseId);
            }
            echo json_encode($pdfUrl);
            exit; 
                
        } catch (Zend_Exception $e) {
            echo $e;
        }
    }
    private function makeRestCall($url) {
        // CURLOPT_SSL_VERIFYHOST
        $config = array(
            'adapter' => 'Zend_Http_Client_Adapter_Curl',
            'curloptions' => array(CURLOPT_SSL_VERIFYPEER => true),
        );
        return $client = new Zend_Http_Client($url,$config);
    }
    private function getRequestlUrl($courseId){ 
        
      $legacyHost = $this->getLegacyHost();
      $url = $legacyHost.'/app/redirector/pdfExport_fluidx?&template=FluidX&course_id='.$courseId.'&type=Tutorial';
      return $url;
      
    }
    private function getPdfUrl($pdfPath,$courseId) {
        
        $sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
        $pdfName = basename($pdfPath);
        $legacyHost = $this->getLegacyHost();
        $pdfUrl = $legacyHost.'/rev1231231231/export/customcontent/'. $sess->siteName .'-lcec/'.$pdfName;
        $arr['content']['zipFile']= $pdfUrl;
        $arr['content']['systemId']= $courseId;
        return $arr;
        
    }
    private function getLegacyHost(){
        
         $sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
         $legacyHost = str_replace('<site>', $sess->siteName, LEGACY_HOST_LCEC);
         return $legacyHost;
    }
    


}
