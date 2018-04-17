<?php
require_once ("../application/soapModels/LRNService/CourseLaunch.php");
require_once ("../application/soapModels/LRNService/CourseUpdate.php");
require_once ("../application/soapModels/LRNService/Modules.php");
require_once ("../application/soapModels/LRNService/Site.php");
require_once ("../application/soapModels/LRNService/JasperCert.php");
/**
 * Action Helper for Course Launch
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_CourseLaunch extends Zend_Controller_Action_Helper_Abstract {
	private $_siteId = null;
	private $_sess = null;
	private $_courseLaunchSM = null;
	private $_courseUpdateSM = null;
	private $_courseJasperCertSM = null;
	private $_courseConfig = array(
	         'fusionPlus' => null,
	         'FluidX' => null,
	         'default' => null
		);
	
	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {
	   $this->_courseConfig['FusionPlus'] = array('logo' => array('maxWidth'=>165 ,'maxHeight' => 60));
	   $this->_courseConfig['FluidX'] = array('logo' => array('maxWidth'=>230 ,'maxHeight' => 90));
	   $this->_courseConfig['default'] = array('logo' => array('maxWidth'=>230 ,'maxHeight' => 90));
	}
	
	/**
	 * Strategy pattern: call helper as broker method
	 */
	public function direct($sess, $activeController = null)
	{
		$this->_sess = $sess;
		$this->_siteId = $sess->siteId;
		$this->_siteName = $sess->siteName;
	
		$this->_courseLaunchSM = new CourseLaunchServiceSoapModel();
		$this->_courseUpdateSM = new CourseUpdateServiceSoapModel();
		$this->_modulesServiceSM = new ModulesServiceSoapModel();
		$this->_courseJasperCertSM = new JasperCertServiceSoapModel();
		$this->_siteSM = new SiteSoapModel();
		
		//this code make it is possible for doing unit test on this helper
		if (null === $activeController){
			$this->_activeController = $this->getActionController();
		}else{
			//this will passed by unit test class
			$this->_activeController = $activeController;
		}
	}
		
	public function setCLSessId(){
	    //if site is not set to do courseLaunch from catalyst we do noth
	    if (!isset($this->_sess->siteConfigs['catalystSiteConfigs']['courselaunch']) || true !== $this->_sess->siteConfigs['catalystSiteConfigs']['courselaunch']){
	       return false;
	    }
	    
		$clSessId = $this->_courseLaunchSM->getAiccSessionByUserCompany();
		
		/* Commented as of 02/18/2015
		$aSess = '';
		$numargs = func_num_args();
	
		// Check if there are arguments in function
		if ( $numargs>0) {
			// if Yes, get the systemId
			$arg_list = func_get_args();
			$aSess = $arg_list[0];
		}
		*/
		if($clSessId == '')
			$clSessId = $this->createCLSessId();
		$this->_sess->clSessId = $clSessId;
	
	}
	
	private function createCLSessId(){
		
		/* Commented as of 02/18/2015
		// Get aSession
		$aSession = !empty($aSess)?$aSess:$clSessId;
	
		// Store it in session
		$this->sess->asession = $aSession;
		*/
		
		$clSessId = md5(time());
	
		$cLSessData = array(
				"company" => $this->_sess->siteName,
				"aSession" => $clSessId,
				"userId" => $this->_sess->user->userId,
				"id" => $clSessId
		);
		$cLSessData = (object) $cLSessData;
		$result = $this->_courseUpdateSM->createAiccSession($cLSessData);
	
		return $clSessId;
	}	
	
	public function getParam($curriculumId, $systemId, $companyLogo =''){
		$moduleDetails = $this->_modulesServiceSM->getModulePreview($curriculumId, $systemId);
		$courses = $moduleDetails->courseLookupDTO;
		if(!is_array($courses)){
		   $courses = array($courses);
		}
		$courseData = $courses[0];
		
		//make sure to create or increament the sessions action event
		$this->setupSessionActionEvent($systemId);
		
		//get base catalog configs
		$baseCatalogId = $courseData->baseCatalogId;
		$siteBaseCatalogConfigs = $this->_courseLaunchSM->getSiteBaseCatalogConfigs($baseCatalogId, $systemId);
		$siteBaseCatalogConfigsTemp = $siteBaseCatalogConfigs;
		$siteBaseCatalogConfigs = array();
		
		if(false !== $siteBaseCatalogConfigsTemp && count($siteBaseCatalogConfigsTemp) > 0){
		   foreach ($siteBaseCatalogConfigsTemp as $value){
			   $siteBaseCatalogConfigs[$value->configKey] = $value;
		   }
		}
		
		$this->_sess->siteBaseCatalogConfigs = $siteBaseCatalogConfigs;

		//get console parameters for course 
		$paramConsole = $this->_courseLaunchSM->getParamConsole($systemId);
		
		$courseEventsDTOTemp = array();
		$courseEventsDTO = array();
		if(!empty($paramConsole->courseEventsDTO)){
			if(!is_array($paramConsole->courseEventsDTO->CourseEventsDTO))
				$courseEventsDTOTemp[] = $paramConsole->courseEventsDTO->CourseEventsDTO;
			else 
				$courseEventsDTOTemp = $paramConsole->courseEventsDTO->CourseEventsDTO;
		}
		foreach ($courseEventsDTOTemp as $value){
			$courseEventsDTO[$value->action] = $value;
		}
		
		//get course lookup and edition data for course
		$courseLookup = $this->_courseLaunchSM->getCourseLookupAndEditionFromSystemId($systemId);
		
		//get bookmark and lesson from lessonLocation
		$bookmark = '';
		$lesson = '';
		if(isset($paramConsole->aiccCourseStateDTO) && isset($paramConsole->aiccCourseStateDTO->lessonLocation)){
			$lessonLocationStrClean = trim($paramConsole->aiccCourseStateDTO->lessonLocation);
		
			if(!empty($lessonLocationStrClean)){
				$bookmarkArr = $this->getBookMark($paramConsole->aiccCourseStateDTO->lessonLocation);
				$bookmark = $bookmarkArr['bookmarkPage'];
				$lesson = $bookmarkArr['bookmarkLesson'];
			}
		}
		
		//$setLessonCompletedStatus = false !== $this->_courseJasperCertSM->getCompletionCertificateForUserCompanySystemId($systemId) ? true : false;
		if(isset($paramConsole->lessonCompletedStatus) && $paramConsole->lessonCompletedStatus == '1')
			$setLessonCompletedStatus = true;
		$cummulativeTimeSpent = isset($courseEventsDTO['time']) && $courseEventsDTO['time']->value !='' ? $courseEventsDTO['time']->value : '0';
		$timeEventMessageSequence = isset($courseEventsDTO['time']) && $courseEventsDTO['time']->position != '' ? $courseEventsDTO['time']->position : '0';
		$campaign_attempt_time = isset($courseEventsDTO['campaign_attempt_time']) && $courseEventsDTO['campaign_attempt_time']->value != '' ? $courseEventsDTO['campaign_attempt_time']->value : '0';
		$loginName = $this->_sess->user->username;
		$pqrEnabled = isset($siteBaseCatalogConfigs['quiz_partial_retake']) && $siteBaseCatalogConfigs['quiz_partial_retake']->configValue > 0 ? 'true' : 'false';
		$certificateAvailable = isset($siteBaseCatalogConfigs['certificateAvailable']) && $siteBaseCatalogConfigs['certificateAvailable']->configValue > 0  ? 'true' : 'false';
		$media = isset($this->_sess->siteConfigs['Media']) ? $this->_sess->siteConfigs['Media'] : '';
		$userName = $this->_sess->user->firstName . ' ' . $this->_sess->user->lastName;
		$quizFailtrack = isset($siteBaseCatalogConfigs['quiz_fail_track']) && $siteBaseCatalogConfigs['quiz_fail_track']->configValue > 0 ? 'true' : 'false';
		$randomQuizes = isset($siteBaseCatalogConfigs['quiz_randomize']) && $siteBaseCatalogConfigs['quiz_randomize']->configValue > 0? 'true' : 'false';
		$userId = $this->_sess->user->userId;
		$masteryScore = isset($siteBaseCatalogConfigs['quiz_mastery']) && '' != $siteBaseCatalogConfigs['quiz_mastery']->configValue ? $siteBaseCatalogConfigs['quiz_mastery']->configValue : 0;
		$companyName = $this->_sess->siteName;
		$hasPolicies = isset($siteBaseCatalogConfigs['hasPolicies']) && $siteBaseCatalogConfigs['hasPolicies']->configValue > 0 ? 'true' : 'false';
		$bookmarkPageNum = $bookmark !== '' ? $bookmark : 0;
		$coreLesson = !empty($paramConsole->aiccCourseStateDTO) ? $paramConsole->aiccCourseStateDTO->coreLesson : '';
		$testOut = isset($siteBaseCatalogConfigs['allow_test_out']) && $siteBaseCatalogConfigs['allow_test_out']->configValue > 0 ? 'true' : 'false';
		$quizScoretrack = isset($siteBaseCatalogConfigs['quiz_score_track']) && $siteBaseCatalogConfigs['quiz_score_track']->configValue > 0 ? 'true' : 'false';
		$quizFeedback = isset($siteBaseCatalogConfigs['quiz_feedback_detail']) && $siteBaseCatalogConfigs['quiz_feedback_detail']->configValue > 0 ? 'true' : 'false';
		$bookmarkLessonNum = $lesson !== '' ? $lesson : '-1';
		$hasContacts = isset($siteBaseCatalogConfigs['hasContacts']) && $siteBaseCatalogConfigs['hasContacts']->configValue > 0 ? 'true' : 'false';
		$getParamErrorNumber = '0';
		$getParamErrorText   = "OK";
		$CompletionCertificate = isset($siteBaseCatalogConfigs['CompletionCertificate']) && $siteBaseCatalogConfigs['CompletionCertificate']->configValue > 0 ? 't' : 'f';
		$mediaLastModifiedDate = isset($this->_sess->siteConfigs['maxCreatedDate']) ? substr($this->_sess->siteConfigs['maxCreatedDate'], 0, 10) : '';
		$lrnCourseOnline = 'true';
		
		/*
		 * check to see if the logo file is fit the right dimention, if not set it back to empty
		 * for now only fusionPlus course type is passing, it is supposed change to every type of the course
		 */
		$companyLogoPath = '';
		$template = $this->courseTemplate($this->_sess->siteConfigs["CourseTemplatePreference"], $courseData->templates);
		if ('' != $companyLogo && file_exists($companyLogo) && false !== $this->logoSizeFit($companyLogo, $template)){
		   $companyLogoPath = $this->_sess->siteConfigs['catalystHost'].'/app/companylogo';
		}
		
		$paramStr = (true === $setLessonCompletedStatus ? 'tutorial.setLessonCompleted(999,true);' : '').'
		var cumulativeTimeSpent = ' . $cummulativeTimeSpent  . ' * 1000;
		var timeEventMessageSequence = ' . $timeEventMessageSequence . ';
		var campaign_attempt_time = ' . $campaign_attempt_time . ' * 1000;
		tutorial.loginName = "' . $loginName . '";
		tutorial.pqrEnabled = ' . $pqrEnabled . ';
		'.('true' == $certificateAvailable ? 'tutorial.certificateAvailable = ' . $certificateAvailable . ';' : '').'
		tutorial.media = "' . $media . '";
		tutorial.userName = "' . $userName . '";
		tutorial.quizFailtrack = ' . $quizFailtrack . ';
		tutorial.randomQuizes = ' . $randomQuizes . ';
		'.('' != $companyLogoPath ? 'tutorial.companyLogo = "' .$companyLogoPath. '";' : '').'
		tutorial.userId = ' . $userId . ';
		tutorial.masteryScore = ' . $masteryScore . ';
		tutorial.companyName = "' . $companyName . '";
		tutorial.hasPolicies = ' . $hasPolicies . ';
		tutorial.bookmarkPageNum = ' . $bookmarkPageNum . ';
		tutorial.coreLesson = "' . $coreLesson . '";
		tutorial.testOut = ' . $testOut . ';
		tutorial.quizScoretrack = ' . $quizScoretrack . ';
		tutorial.quizFeedback = ' . $quizFeedback . ';
		tutorial.bookmarkLessonNum = "' . $bookmarkLessonNum . '";
		tutorial.hasContacts = ' . $hasContacts . ';
		tutorial.getParamErrorNumber = ' . $getParamErrorNumber . ';
		tutorial.getParamErrorText   = "' . $getParamErrorText . '";
		tutorial.CompletionCertificate = "' . $CompletionCertificate . '";
		var mediaLastModifiedDate = "' . $mediaLastModifiedDate . '";
                var CSRFToken = "'. $this->_sess->csrfkey .'";
		var lrnCourseOnline = ' . $lrnCourseOnline . ';';
		
		return $paramStr;
	}
	
	public function getParamCert($systemId){
	   
	   $config = $this->_courseJasperCertSM->getJasperGetParam($systemId);
	   $configArr = array();
	   
	   //default values of variable
	   $defaultConfigValue = array(
	            'returned_for_correction' => null,
	            'allow_retake' => 0,
	            'certCompletedInOtherLanguage' => 0,
	            'canSubmitCertification' => 1,
	            'timeEventMessageSequence' => 0,
	            'cumulativeTimeSpent' => 0,
	            'allow_attachments' => 0
	   );
	   
	   if (!empty($config)){
	       if(is_array($config->jasperGetParamDTOList->JasperGetParamDTO)){
      	       foreach ($config->jasperGetParamDTOList->JasperGetParamDTO as $confObj){
      	          $configArr[$confObj->name] = intval($confObj->value)*1;
      	       }
	       }
	       
	       if(!empty($config->returnedForCorrectionDTO)){
	          $configArr['returned_for_correction'] = $this->returnCertBuildQuestion($config->returnedForCorrectionDTO);
	       }else{
	             //make sure the returned for correction is alway null if nothing return
	             $configArr['returned_for_correction'] = null;
	       }
	       
	       //setup the default value if service not return that values
	       $configArr = array_merge($defaultConfigValue, $configArr);
	       return $configArr;
	   }else{
	      return false;
	   }
	}
	
	public function getCourseXML($systemId,$xmlType){
		$courseXML = $this->_courseLaunchSM->getCourseXml($systemId,$xmlType);
		return preg_replace('/\shref=".*?\/custom\//', ' href="/app/custom/', $courseXML);
	}
	
// 	public function getCourseTemPref($curriculumId, $systemId, $siteTemplatePreference){
// 		$moduleDetails = $this->_modulesServiceSM->getModulePreview($curriculumId, $systemId);
// 		// normalize courses to array, then store as simple var
// 		$courses = $moduleDetails->courseLookupDTO;
// 		if(!is_array($courses)) $courses = array($courses);
// 		$courseData = $courses[0];
		
// 		$courseAvailableTempaltes = explode(',', $courseData->templates);		
// 		if(isset($siteTemplatePreference)) {
// 			$template = $siteTemplatePreference;
// 		}
// 		else{
// 			$template = $courseData->templates;
// 		}
		
// 		return $template;
// 	}
	
	public function getCourseProperties($systemId){
		$courseProperties = $this->_courseLaunchSM->getCourseLookupAndEditionFromSiteIdSystemId($systemId);
		return $courseProperties;
	}
	
	public function getSiteSettings(){
		$siteSettings = $this->_siteSM->getSiteSettings('FusionPlusColors');
		$settings = '';
		if(!empty($siteSettings->dataObject) && $siteSettings->dataObject->settingValue != '')
			$settings = $siteSettings->dataObject->settingValue;		
		return $settings;
	}
	
	public function getBulletin($systemId){
		$bulletinInfo = $this->_courseLaunchSM->getCourseBUlletinByCompanyCourse($systemId);
        
		$bulletinJsStr = "function initBulletin(){\n";
		
		if(is_array($bulletinInfo)){
		   foreach($bulletinInfo as $bulletinObj){   
		      $bulletinJsStr .= $this->buildBulletinJSObj($bulletinObj)."\n\n";
		   }
		}
		
		$bulletinJsStr .= "\n}";
		
		return $bulletinJsStr;
	}
	
	/**
	 * Getting image
	 *
	 * @param integer $imageId        	
	 * @return array $courseBulletinImage
	 */
	public function getCourseBulletinImage($imageId) {
		$courseBulletinImage = $this->_courseLaunchSM->getCourseBulletinImage ( $imageId );
		
		return $courseBulletinImage;
	}
	
	public function putParam($reqVars){
		$systemId = $reqVars['systemId']; 
		
		$result = new stdClass();
		$result->success = true;
		
		//check if aicc_data is not truncated else return error
		$start_aicc = false;
		$end_aicc = false;
		if (strpos($reqVars['aicc_data'], '{') !== FALSE)
			$start_aicc = true;
		if (strpos($reqVars['aicc_data'], '}') !== FALSE)
			$end_aicc = true;
		if(!$start_aicc || !$end_aicc){
			$result->success = false;
			$result->comment = "Truncated data";
			return $result;
		}
		
		//get events info from aicc_data and check if it has one or more events else return error
		$lines = array();
		if($reqVars['aicc_data'] != '')
			$lines = preg_split('/\n|\r\n?/', $reqVars['aicc_data']);
		$params = array();
		if(count($lines) > 0){
			foreach($lines as $line){
				if (strpos($line, '=') !== FALSE){
					$line  =  explode('=', $line);
					$params[trim($line[0])] = trim($line[1]);
				}			
			}
		} else {
			//return error
			$result->success = false;
			$result->comment = "No data";
			return $result;
		}

		$otherAttrArr = array(
			'lessonStatus' =>'lesson_status'
		);
		
		$lessonStatusArr = array(
	         'incomplete' => 'I',
	         'I' => 'I',
	         'C' => 'CL',
		     'F' => 'F',
		     'passed' => 'P',
		     'failed' => 'F',
		     'P' => 'P',
		     'CP' => 'CP',
		     'CC' => 'CC'
		);
		
		if(isset($params['lesson_status']) && $params['lesson_status'] != '')
			$params['lesson_status'] = $lessonStatusArr[$params['lesson_status']];
		
		if(isset($params['cumulative_time_spent']) && $params['cumulative_time_spent'] != '')
			$params['cumulative_time_spent'] = round($params['cumulative_time_spent'] / 1000);
		
		if(isset($params['campaign_attempt_time']) && $params['campaign_attempt_time'] != '')
			$params['campaign_attempt_time'] = round($params['campaign_attempt_time'] / 1000);

		//make sure time_delta_since_last_transmission is second
		if(isset($params['time_delta_since_last_transmission']) && '' != $params['time_delta_since_last_transmission']){
		   $params['time_delta_since_last_transmission'] = round($params['time_delta_since_last_transmission'] / 1000, 0);
		}
		
		//get already saved events data from service
		$paramConsole = $this->_courseLaunchSM->getParamConsole($systemId);
		
	    $courseEventsObj = $this->buildCourseEventsUpdateObj($paramConsole, $params, $result);
	    
		//check if the return result for buildCourseEvent Update object return sucess false
	    if(false == $result->success){
	       return $result;
	    }
	    
		$courseUpdateObj = new stdClass();		
		$courseUpdateObj->aiccCourseStateDTO = $this->buildAiccCourseStateObj($paramConsole, $params);
		$courseUpdateObj->company = $this->_sess->siteName;
		$courseUpdateObj->course = $systemId;		

		$courseUpdateObj->courseEventsDTO = $courseEventsObj;
		
		foreach($otherAttrArr as $key => $val){
			$courseUpdateObj->$key = $params[$val];
		}
		
		$courseUpdateObj->userId = $this->_sess->user->userId;

		//for tracking purpose will remove when everything is done
		//print_r($courseUpdateObj);
		
		//save events data for course course
		$updateConsole = $this->_courseUpdateSM->putParamConsole($courseUpdateObj, $this->_sess->user->creationDate);
		
		$result->success = $updateConsole;
		return $result;
	}
	
	public function getFileContent($path){
	   $fileContent = '';
	   if (!file_exists($path)){
	       return $fileContent;
	   }
	   
	   $fileContent = file_get_contents($path);
	   
   	   if (false === $fileContent){
   	      $fileContent = '';
   	   }
	   
	   return $fileContent;
	}
	
	public function curlGetData($url) {
	   $ch = curl_init();
	   
	   // set URL and other appropriate options
	   curl_setopt($ch, CURLOPT_URL, $url);
	   curl_setopt($ch,CURLOPT_SSL_VERIFYHOST, false);
	   curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, false);
	   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	   curl_setopt($ch, CURLOPT_TIMEOUT, 50);
	
	   // grab URL and pass it to the browser
	   $data = curl_exec($ch);
	   if (false === $data){
	      $data = '';
	   }
	   
	   // close cURL resource, and free up system resources
	   curl_close($ch);
	
	   return $data;
	}
	
	public function buildCourseURL($curriculumId, $systemId, $siteTemplatePreference, $courseData, $noDomain = false){
	   $template = $this->courseTemplate($siteTemplatePreference, $courseData->templates);

	   // store the course content URL in an easy variable
	   if(isset($this->_sess->siteConfigs['catalystSiteConfigs']['courselaunch']) && true === $this->_sess->siteConfigs['catalystSiteConfigs']['courselaunch'] 
	       && (false !== strpos($template, 'FusionPlus') || false !== strpos($template, 'FluidX'))){
	      //customize URL for jasper
	      $appTypeUrl = '';
	      $cxmlUrl = '';
	      $courseXmlUrl = '';
	      $pageConfigUrl = '';
	      $certDataUrl = '';
	      $sessionId = '';
	      
	      if ('jasper' == $courseData->appType){
	         $appTypeUrl = '&app=jasper';
	         $courseXmlUrl = '&cxml=' .$courseData->catalogId. '.xml';
	      }else if($this->isEoccCourse($systemId)){
	         $certDataUrl = '&cert_data=/app/customcertdata';
	         $courseXmlUrl = '&course_xml=/app/coursexml';
	         $pageConfigUrl = '&page_config=/app/pageconfig';
	      }else{
	         //other course other then Jasper course
	         $courseXmlUrl = '&course_xml=/app/coursexml';
	         $pageConfigUrl = '&page_config=/app/pageconfig';
	      }
	      
	      $clSessId = $this->_sess->clSessId;
	      $revId = $courseData->revisionNumber;
	      
          /*
           * To check whether the site should go to Akamai site or not
           * Removed
           */
   	      if('t' === $this->_sess->siteConfigs["CourseAkamai"]){
   	         //for now only qaacess11 is on akamai for testing
   	         $contentHost = $this->_sess->siteConfigs['contentHostCatalyst'];
   	         $sessionId = '&sID='.session_id();
   	      }else{
   	         //when course not Akamai we don't need the .course in domain name
   	         $contentHost = $this->_sess->siteConfigs['catalystHost'];
   	      }
   	      
   	      $courseUrl = '/rev'.$courseData->revisionNumber.'/course/templates/ajax/'.$template.'/start.html';
   	      $courseUrl .= '?aicc_sid='.$clSessId;
   	      $courseUrl .= '&aicc_url=/app/putparam';
   	      $courseUrl .= $appTypeUrl;
   	      $courseUrl .= '&systemId=' . $systemId;
   	      $courseUrl .= '&curriculumId=' . $curriculumId;
   	      $courseUrl .= '&lang=' . $courseData->language;
   	      $courseUrl .= '&cpath=' . $courseData->coursePath;
   	      $courseUrl .= $courseXmlUrl;
   	      $courseUrl .= $certDataUrl;
   	      $courseUrl .= $pageConfigUrl;
   	      $courseUrl .= '&moduleId='.$moduleId;
   	      //$courseUrl .= $sessionId;
   	      //$courseUrl .= '&media=on';
   	      //$courseUrl .= '&CSRFToken='.$this->_sess->csrfkey; //pass csrf token to courseware
   	      
   	      $destination = $contentHost.$courseUrl;
              $destination = base64_encode($destination) . '&media=on';
              $sessionId = Zend_Session::getId();
              $sessionCacheKey = md5('sessionId_' . $this->_siteId . '_' . $this->_sess->user->userId);
              Zend_Registry::get('memcache')->putItemToCache($sessionId, $sessionCacheKey);
              
   	     $destination = $contentHost . '/auth/courselaunch?destiURL=' . $destination . '&sKey=' . $sessionCacheKey;
	   }else{
         // put together a course URL that we can use to either
         // redirect the user to, or send them to directly (if SAML auth).
         $courseUrl = '/app/redirector/course';
         $courseUrl .= '?trackingOn=1';
         $courseUrl .= '&course_id=' . $systemId;
         $courseUrl .= '&template=' . $template;
         $courseUrl .= '&media=on';
         $courseUrl .= '&siteName=' . $this->_sess->siteName;
         //$courseUrl .= '&CSRFToken='.$this->_sess->csrfkey; //pass csrf token to courseware
         
         //temporary fixed for UCB-CIA site not to add fromConsole
         if ('ucb-cia' != $this->_sess->siteName){
            $courseUrl .= '&fromConsole=true';
         }
         
         if(!isset($_COOKIE['auth']) || empty($_COOKIE['auth'])){
            // use our LegacyPassthru helper to get the iframe URL
            $ptSettings = array(
               'app' => 'lcec',
               'sess' => $this->_sess,
               'targetURI' => $courseUrl,
               'rmvSensitiveParam' => true,
                'noDomain' => $noDomain
            );
            
            $pt = $this->_activeController->getHelper('LegacyPassthru');
            $pt->setConfigs($ptSettings);
            
            $destination = $pt->getLegacyFrameSrc();
         }else{            
            $destination = $this->_sess->siteConfigs['legacyHostLCEC'].$courseUrl;
         }
	   }
	   
	   if(empty($this->_sess->siteConfigs['Media']) || $this->_sess->siteConfigs['Media'] === 'none'){
	      $destination = str_replace('media=on','media=off', $destination);
	      //make sure to change it when URI is encoded
	      $destination = str_replace('%26media%3Don','%26media%3Doff', $destination);
	   }
	   
	   return $destination;
	}
	
	/*
	 * helper function
	 */
   private function getBookMark($lessonLocation){
	   //return false if no lession location passed
	   if(!$lessonLocation){
	      return false;
	   }
	   
	   $locationNumber = trim(str_replace('intro,iid', '', $lessonLocation));
	   
	   if($locationNumber){
	     $returnVariable = array();

	     $returnVariable['bookmarkLesson'] = round($locationNumber / 100, 0);
	     $returnVariable['bookmarkPage'] = round($locationNumber % 100, 0);
	     
	     return $returnVariable;
	   }
	   
	   return false;
	}
	
	private function buildCourseEventsUpdateObj($paramConsole, $params, &$result){
	   $courseEventsDTOTemp = array();
	   $courseEventsDTO = array();
	   $courseEventsDTOArr = array(
            'quizscore' => 'score',
            'time' => 'time_delta_since_last_transmission'
	   );
	   
	   //create course event array from object if only one event record is returned
	   if(!empty($paramConsole->courseEventsDTO)){
	      if(!is_array($paramConsole->courseEventsDTO->CourseEventsDTO))
	         $courseEventsDTOTemp[] = $paramConsole->courseEventsDTO->CourseEventsDTO;
	      else
	         $courseEventsDTOTemp = $paramConsole->courseEventsDTO->CourseEventsDTO;
	   }
	   
	   //assign action names as keys for event array
	   foreach ($courseEventsDTOTemp as $value)
	      $courseEventsDTO[$value->action] = $value;
	   
	   //check if the request coming in is not duplicate and already saved else retun error
	   //NOTE: we use the position of time event action to store the time_event_message_sequence
	   if(isset($courseEventsDTO['time']) && $courseEventsDTO['time']->courseEventId != ''){
	      $timeEventSeq = $courseEventsDTO['time']->position;
	      if($timeEventSeq !== ''){
	         if($params['time_event_message_sequence'] <= $timeEventSeq ){
	            $result->success = false;
	            $result->comment = "Duplicate Req";
	            return false;
	         }
	      }
	   }
	   
	   //set courseEventId for events already saved in db else set it to -1 for new events
	   $cEDto = array();
	   foreach($courseEventsDTOArr as $key => $val){
	      $obj = new stdClass();
	      if(isset($params[$val]) && $params[$val] !== ''){
	         $obj->action = $key;
	         if(isset($courseEventsDTO[$key]) && $courseEventsDTO[$key]->courseEventId != ''){
	            $obj->courseEventId = $courseEventsDTO[$key]->courseEventId;
	         }else{
	            $obj->courseEventId = -1;
	         }
	         
	         $obj->value = $params[$val];
	         
	         //add position value to the time event action for storing time_event_message_sequence
	         if('time' === $key && isset($params['time_event_message_sequence'])){
	            $obj->position = $params['time_event_message_sequence'];
	         }
	         
	         $cEDto[] = $obj;
	      }
	   }

      //create lessonsdone action event if progress contain lessonsdone 
      if(isset($params['progress']) && 0 === strpos($params['progress'], 'lessonsdone')){
         $obj = new stdClass();
         $obj->action = 'lessonsdone';
         $obj->value = 1;
         $obj->courseEventId = (isset($courseEventsDTO['lessonsdone']) && $courseEventsDTO['lessonsdone']->courseEventId != '' ? $courseEventsDTO['lessonsdone']->courseEventId : -1);
         $cEDto[] = $obj;
      }
	   
	  return $cEDto;
   }
	
	private function buildAiccCourseStateObj($paramConsole, $params){
	   $aiccSavedDto = '';
	   if(isset($paramConsole->aiccCourseStateDTO) && $paramConsole->aiccCourseStateDTO != '')
	      $aiccSavedDto = $paramConsole->aiccCourseStateDTO;
	   
	   $aiccCourseStateDTOArr = array(
            'lessonLocation' => 'lesson_location',
            'coreLesson' => 'progress'
	   );
	   
	   $aiccDto = new stdClass();
	   foreach($aiccCourseStateDTOArr as $key => $val){
	      if(isset($aiccSavedDto->aiccEventsId) && $aiccSavedDto->aiccEventsId != '')
	         $aiccDto->aiccEventsId = $aiccSavedDto->aiccEventsId;
	      else
	         $aiccDto->aiccEventsId = -1;
	      
	      //explicite condition for coreLesson due to course player not continue to send completedWithNoScore
	      //after the they send once
	      if('coreLesson' == $key && isset($aiccSavedDto->$key) 
	         && 0 === strpos($aiccSavedDto->$key, 'completedWithNoScore') 
	         && false === strpos($params[$val], 'completedWithNoScore')){
	            $params[$val] = "completedWithNoScore," .$params[$val];
	      }
	      
	      $aiccDto->$key = $params[$val];
	   }
	   
	   return $aiccDto;
	}
	
	private function logoSizeFit($path, $courseType){
	   $config = isset($this->_courseConfig[$courseType]) ? $this->_courseConfig[$courseType] : $this->_courseConfig['default'];
	   $width = 0;
	   $height = 0;
	   
	   $size = getimagesize($path);
	   if(is_array($size)){
	      $width = $size[0];
	      $height = $size[1];
	   }
	   
 	   if ($width> 0 && $height> 0 && $width <= $config['logo']['maxWidth'] && $height <= $config['logo']['maxHeight']){
 	      return true;
 	   }
 	   
 	   return false;
	}
	
	private function buildBulletinJSObj($bulletinObj){
	   
	   $strObj = "\t\t".'tutorial.setBulletin(
	                     "' .$bulletinObj->lesson. '.' .$bulletinObj->page. '",
	                     new Bulletin(
	                        '.(0 == $bulletinObj->mandatory ? 'false' : 'true').',
	                        "' .$bulletinObj->type. '",
	                        "' .addslashes($bulletinObj->text). '",
	                        "' .$bulletinObj->url. '",
	                        "' .$bulletinObj->urlName. '",
	                        "' .$bulletinObj->sectionImageId. '"
	                        )
	               );';
	   
	   return $strObj;
	}
	
	private function courseTemplate($siteTemplatePreference, $courseTemplateData){
	   $courseAvailableTemplates = explode(',', $courseTemplateData);
	   
	   if(isset($siteTemplatePreference)) {
	      $template = (strpos($courseTemplateData, $siteTemplatePreference) != false) ? $siteTemplatePreference : $courseAvailableTemplates[0];
	   }else{
	      $template = $courseAvailableTemplates[0];
	   }
	   
	   return $template;
	}
	
	private function isEoccCourse($systemId){
	   $courseInfo = $this->_courseLaunchSM->getCourseVersion($systemId);
	   
	   if (false != $courseInfo && !empty($courseInfo)){
	      if (isset($courseInfo->jasperCertificationId) && !empty($courseInfo->jasperCertificationId)){
	         return true;
	      }
	   }
	   
	   return false;
	}
	
	private function setupSessionActionEvent($systemId){
	      $obj = new stdClass();
	      $obj->action = 'sessions';
	      $obj->value = 1;
	      $obj->courseEventId = -1;
	      $obj->userId = $this->_sess->user->userId;
	      $obj->company = $this->_sess->siteName;
	      $obj->course = $systemId;
	      
	      return $this->_courseUpdateSM->addCourseSessionsEvent($obj);
	}
	
	private function returnCertBuildQuestion($returnCertObj){
	   $questionArray = array();
	   
	   $questionArray["attempt_id"] = $returnCertObj->jasperAttemptId;
	   $questionArray["comment"] = !empty($returnCertObj->comment) ? $returnCertObj->comment : '';
	   
	   //build return question structure
	   $questionArray["question"] = array();
	   foreach ($returnCertObj->jasperReturnedQuestionDTOList->JasperReturnedQuestionDTO as $question){
	      $questionArray["question"][] = array(
	               "printable_qseq" => $question->printableQSeq,
	               "choices" => !empty($question->choices) ? explode(",", $question->choices) : array(),
	               "ans" => !empty($question->ans) ? explode(",", $question->ans) : array(),
	               "text" => $question->text,
	               "question_id" => $question->questionId,
	               "question_text" => $question->questionText,
	               "choice_ids" => !empty($question->choiceIds) ? explode(",", $question->choiceIds) : array(),
	               "seq" => $question->choiceSeq
	               );
	   }
	   
	   //build files response structure
	   $questionArray["files"] = array();
	   if(isset($returnCertObj->filesDTOList) && !empty($returnCertObj->filesDTOList)){
      	   foreach ($returnCertObj->filesDTOList as $file){
      	      $questionArray["files"][] = array(
      	               "date" => $file->created,
      	               "name" => $file->name,
      	               "url" => 'app/certificatefile?fileId='.$file->id,
      	               "id" => $file->id,
      	               "size" => $file->dataSize
      	      );
      	   }
	   }
	   
	   return $questionArray;
	}
	
	/**
	 * Gettting custom sections information
	 *
	 * @param integer $systemId
	 * @return xml $customSectionsInfo
	 */
	public function getCustomSectionsInfoHTML($systemId){
	
		$customSectionsInfo = $this->_courseLaunchSM->getCustomSectionsInfo($systemId);
		
		return $customSectionsInfo;
	}
	
	/**
	 * Get Custom Certification Data Infomration
	 *
	 * @param string $systemId
	 * @return object
	 */
	public function getCustomCertDataInfo( $systemId ) {
	
		$customCertDataInfo = $this->_courseJasperCertSM->getCustomCertificationDataInfo( $systemId ); // This is a common method
	
		return $customCertDataInfo;
	}
	
	/**
	 * Getting the boolean value for Custom Certification.
	 *
	 * @param string $systemId
	 * @return boolean
	 */
	public function getCustomCertVisibility($systemId){
	
		$courseInfo = $this->_courseLaunchSM->getCourseVersion($systemId);
	
		if (false != $courseInfo && !empty($courseInfo)){
				
			if ( isset($courseInfo->certificationHidden) ){
				return $courseInfo->certificationHidden;
			}
				
		}
	
		return false;
	}
	
	/**
	 * Get Jasper Completion Information
	 * 
	 * @param array $params
	 * @return object
	 */
	public function getJasperCompletionInfoArray($params) {
	
		$jasperInfo = $this->_courseJasperCertSM->getJasperCompletion($params);
	
		return $jasperInfo;
	}
	
	/**
	 * Getting data after uploading Attached files for Jasper Completion
	 *  
	 * @param array $params
	 * @return object
	 */
	public function getUploadJasperCompletionFileInfo($params) {
		$uploadJasperCompletionFileInfo = $this->_courseJasperCertSM->getUploadJasperCompletionFileInfo($params);
		
		return $uploadJasperCompletionFileInfo;
	}
	
	/**
	 * Return custom files metadata information
	 * @param unknown $params
	 * @return unknown
	 */
	public function getCourseCustomFiles($params) {
		$courseCustomFileInfo = $this->_courseLaunchSM->getCourseCustomFilesInfo ( $params );
	
		return $courseCustomFileInfo;
	}
	
	/*
	 * end helper function
	 */
}