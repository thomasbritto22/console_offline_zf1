<?php
require_once ("../application/soapModels/CatalystService/Component.php");
require_once ("../application/soapModels/LRNService/UserProfile.php");
require_once ("../application/soapModels/CatalystService/UserProfileCustomization.php");
require_once("../application/soapModels/CatalystService/Translation.php");
require_once('../library/Recaptcha/recaptchalib.php');
/**
 * Action Helper for Self-Registration
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_SelfRegistration extends Zend_Controller_Action_Helper_Abstract {
    const COMPONENT_TITLE = 'title';
    const COMPONENT_TEXT = 'text';
    const COMPONENT_DESC = 'description';
    const COMPONENT_TOGGLE = 'toggle';
    const COMPONENT_RESOURCE_TYPE = 'rc_type';
    const COMPONENT_CUSTOMFILE = 'customfile';
    const COMPONENT_THUMBNAIL = 'thumbnail';
    const COMPONENT_LOGIN_POSITION = 'login_position';
    const COMPONENT_RIGHTSIDEBAR_POSITION = 'internal_position';
    const COMPONENT_RESOURCECENTER_POSITION = 'resource_center_position';
    const FIELDLIST_TEXT = 'fieldLists';
    const LABEL_TEXT = 'labels';
   
	protected $cache = null;
	private $_siteId = null;
	private $_sess = null;
	private $_selfRegistrationData = null;
	private $_componentModel = null;
	private $_userProfileModel = null;
        private $_userProfileCustomizationModel = null;
	private $_activeController = null;
	private $_siteInstructions = array();
	
	//included all component sections for self-registration
    private $_componentSections = array(
                array("section" => "login", "subSection" => "self_registration"),
                array("section" => "login", "subSection" => "reg_verification")
             );
	
    //exclude list that is not user fields
    private $_notFieldList = array('userRegistrationTopMessage', 'userRegistrationBottomMessage', 'userRegistrationCaptcha', 'userRegistrationCongratsMessage');
    
    //used list for label keys
    private $_LabelKeyList = array('CongratulationsFormCompleted', 'SelfRegMessage');
    
    //globalDataGroup name list
    private $_dataGroupName = array('fieldList' => 'fieldLists', 'component' => 'components', 'label' => 'labels');
    
	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {

	}


	/**
	 * Strategy pattern: call helper as broker method
	 */
	public function direct($sess, $activeController = null)
	{
		$this->_sess = $sess;
		$this->_siteId = $sess->siteId;
		$this->_siteName = $sess->siteName;
                

                $this->cache = Zend_Registry::get('memcache');
                
		$this->_componentModel = new ComponentSoapModel();
		$this->_userProfileModel = new UserProfileServiceSoapModel();
                $this->_userProfileCustomizationModel= new UserProfileCustomizationServiceSoapModel();
		$this->_transModel = new TranslationSoapModel();
		$this->_userService = new UserServiceSoapModel();
		
		//this code make it is possible for doing unit test on this helper
		if (null === $activeController){
		   $this->_activeController = $this->getActionController();
		}else{
		   //this will passed by unit test class
		   $this->_activeController = $activeController;
		}
	}
	
	public function getSelfRegistrationData($lang)
	{
	   $this->_selfRegistrationData['components'] = array();
	   $this->_selfRegistrationData['fieldLists'] = array();
	   $this->_siteInstructions = $this->getSiteInstructions($lang);
	   //adding the user registration component to the data
	   foreach ($this->_componentSections as $section){
           
                $cacheKeyArray = $params = array($section['section'], $section['subSection'], $lang);//
                $componentList = $this->cache->getItemsFromCache($this->_componentModel, 'getComponentSettingsBySiteBySectionByLanguage', $params, $cacheKeyArray);
	      if (is_array($componentList)){
	         $this->_selfRegistrationData['components'] = array_merge($this->_selfRegistrationData['components'], $this->buildSelfRegistComponentRecords($componentList));
	      }
	   }
	   
	   //adding the user registration field to the data
	   $fieldList = $this->_userProfileModel->getUserSelfRegistrationProfileDetails($lang);
           
       $fieldListInstruction = $this->_userProfileCustomizationModel->getUserColumnInstructions($lang);
           
	   if (is_array($fieldList)){
	      //mark the records that is not custom fields
	      $excludeFields = array_filter($fieldList, array($this,filterNotCustomFields));
	      foreach ($excludeFields as $key => $value){
	         $fieldList[$key]->notRegistrationField = true;
	      }
	      
	      $this->_selfRegistrationData['fieldLists'] = $this->buildSelfRegistFieldListRecords($fieldList);
              foreach ( $fieldListInstruction as $instr ){
                if (array_key_exists($instr->columnName, $this->_selfRegistrationData['fieldLists'])) {
                    $this->_selfRegistrationData['fieldLists'][$instr->columnName]->instructionText = $instr->instruction;
                    $this->_selfRegistrationData['fieldLists'][$instr->columnName]->userColumnInstructionId = $instr->id;
                    $this->_selfRegistrationData['fieldLists'][$instr->columnName]->userColumnInstructionIsActive = $instr->isActive;
                    $this->_selfRegistrationData['fieldLists'][$instr->columnName]->userColumnInstructionLanguage = $instr->language;

                }
              }             
	   }
	   
	   //adding the default label to the data 
	   $this->_selfRegistrationData['labels']= $this->buildSelfRegistLabelRecords($this->_siteInstructions, $this->_LabelKeyList);
	   
	   return $this->_selfRegistrationData;
	}
	
	public function saveSelfRegistrationData($lang, $data)
	{
	   //initial each update list
	   $requestData = array(
	                     $this::FIELDLIST_TEXT => array(),
	                     $this::LABEL_TEXT => array(),
	                  );
	   
	   foreach ($data as $value)
	   {
	      $buildObj = false;
	      
	      if($this::FIELDLIST_TEXT == $value['dataGroup']){
	         $buildObj = $this->buildSaveFieldObj($value, $lang);
	      }else if ($this::LABEL_TEXT == $value['dataGroup']){
	         $buildObj = array(
	                  'lang' => $lang,
	                  'translationKey' => $value['fieldName'],
	                  'translationId' => $value['id'],
	                  'translationValue' => $value['value']
	                  );
	      }
	      
	      if(false !== $buildObj)
	      {
	         $requestData[$value[dataGroup]][] = $buildObj;
	      }
	   }
	   
	   $response = $this->_userProfileCustomizationModel->saveUserSelfRegistration($requestData[$this::FIELDLIST_TEXT]);
	   
	   return $response;
	}
	
	public function publishSelfRegistration($lang)
	{
	   $response = $this->_userProfileCustomizationModel->publishUserSelfRegistrationProfile($lang);

	   return $response;
	}
	
	private function buildSaveFieldObj($fieldData, $lang)
	{
	   if (isset($fieldData) && !empty($fieldData)) {
	      // create a new dto userProfile object and set the value
	      $fieldObject = new stdClass;
	      $fieldObject->siteId = $this->_siteId;
	      $fieldObject->language = $lang;
	      $fieldObject->columnName = $fieldData['fieldName'];
	      $fieldObject->instruction = $fieldData['value'];
	      $fieldObject->id = $fieldData['id'];
	      $fieldObject->isActive = 0;
	      
	      return $fieldObject;
	   }
	   
	   return false;
	}
	
	private function buildSelfRegistLabelRecords($labelRecords, $keyList){
	   $filterRecords = array();
	   if(is_array($labelRecords))
	   {
      	   foreach ($labelRecords as $key => $value)
      	   {
      	      if(false !== array_search($key, $keyList))
      	      {
      	         $filterRecords[$key] = $value;
      	      }
      	   }
	   }
	   
	   return $filterRecords;
	   
	}
	
	//build for future use
	private function buildSelfRegistComponentRecords($componentList)
	{
	   $components = array();
	
	   if(!empty($componentList)){
	      foreach($componentList as $selfRegist) {
	         $components[$selfRegist->section][$selfRegist->subSection][$selfRegist->componentType] = null;
	         $temp = &$components[$selfRegist->section][$selfRegist->subSection][$selfRegist->componentType];
	         
	         switch($selfRegist->componentType) {
	            case $this::COMPONENT_TITLE: //title
	               $temp['value'] = $selfRegist->value;
	               $temp['id'] = $selfRegist->id;
	               $temp['language'] = $selfRegist->language;
	               $temp['position'] = $selfRegist->position;
	               $temp['groupId'] = $selfRegist->groupId;
	               break;
	            default:
	               $temp['value'] = $selfRegist->value;
	               $temp['id'] = $selfRegist->id;
	               $temp['language'] = $selfRegist->language;
	               $temp['position'] = $selfRegist->position;
	               $temp['groupId'] = $selfRegist->groupId;
	               break;
	         }
	      }
	   }
	
	   return $components;
	}
	
	private function buildSelfRegistFieldListRecords($fieldListArr)
	{
	   $newStructArr = array();
	   
	   foreach ($fieldListArr as $value){
	      $newStructArr[$value->columnName] = $value;
	   }
	   
	   //add the hardcode fields to the list if not existed
	   foreach ($this->_notFieldList as $extraField)
	   {
	      if(!isset($newStructArr[$extraField]))
	      {
	         $fieldObject = new stdClass;
	         $fieldObject->columnName = $extraField;
	         $fieldObject->userColumnInstructionId = null;
	         $fieldObject->userColumnInstructionIsActive = null;
	         $fieldObject->notRegistrationField = true;
	         
	         if ($extraField == 'userRegistrationCongratsMessage'){
	            $fieldObject->instructionText = $this->_siteInstructions['CongratulationsFormCompleted'];
	         }elseif($extraField == 'userRegistrationTopMessage'){
	            $fieldObject->instructionText = $this->_siteInstructions['SelfRegMessage'];
	         }else{
	            $fieldObject->instructionText = null;
	         }
	         
	         $newStructArr[$extraField] = $fieldObject;
	      }
	   }

	   return $newStructArr;
	}
	
	private function filterNotCustomFields($var)
	{
	   $search = array_search($var->columnName, $this->_notFieldList, true);
	   
	   if (false === $search){
	      return false;
	   }
	   
	   return true;
	}
	public function getPasswordField($lang,$name){
		$pwdField = array();
		//password field settings
		$siteTransPassInstr = $this->_transModel->getTranslationsPassInstrBySiteIdLang($this->_siteId, $lang);
		$passwdinstruction = '';
		if (false !== $siteTransPassInstr)
		{
			$passwdinstruction = $siteTransPassInstr->data['passInstr'];
		}
		//get the regex expression for passwd
		$pwdregex = $this->_userService->getPasswordRegex();
		$pwdminlength =  $this->_sess->siteConfigs['PasswdLength']; #password min
		
		$pwdField = array("columnName" => $name, "company" => $this->_siteName, 
				"displayName" => $this->_sess->siteLabels[$name], "displayValue" => "", "editAllowed" => "1", 
				"entityName" => "", "fieldFormat" => $pwdregex->fieldMatch, "fieldLength" => $pwdregex->fieldLength,
				"pwdminLength" => $pwdminlength,
				 "fieldType" => "11", "instructionText" => $passwdinstruction, 
				"privilegeVisibilityLevel" => "0", "propertyName" => $name,
				 "protectedField" => "1", "reportPosition" => "1", "requiredField" => "1", 
				"searchCriteria" => "0", "sourceOfData" => "", "userColumnInstructionId" => "",
				 "userColumnInstructionIsActive" => "1", "userColumnInstructionLanguage" => $lang, 
				"userCustomColumnEnum" => "", "value" => "");
		$pwdField = (object) $pwdField;
		return $pwdField;
		
	}
	
	public function getSelfRegistrationForm($lang,$retOp=false)
	{
		$retArr = array();
		//adding the user registration field to the data
		$userLabel = $this->_userProfileModel->getUserSelfRegistrationProfileDetails($lang);
                $fieldListInstruction = $this->_userProfileCustomizationModel->getUserColumnInstructions($lang);
                
		$userLabelCopy = array();
		//password field settings
		$pwdField = $this->getPasswordField($lang,'Password');
		$conPwdField = $this->getPasswordField($lang,'Confirmpassword');
		//exclude list that is not user fields
		$formSettings = array();
		$regexArr = array();
		foreach($userLabel as $key=>&$label){		
                    
                    foreach ( $fieldListInstruction as $instr ){
                    if ( $instr->columnName == $label->columnName ) {
                        $label->instructionText = $instr->instruction;
                        $label->userColumnInstructionId = $instr->id;
                        $label->userColumnInstructionIsActive = $instr->isActive;
                        $label->userColumnInstructionLanguage = $instr->language;
                    }
                    if (in_array($instr->columnName, $this->_notFieldList)) {
                        $formSettings[$instr->columnName] = $instr;
                    }
                }    
			
				$regexArr[] = array('columnName'=>$label->columnName, 'exp'=>$label->fieldFormat,'length'=>$label->fieldLength, 'required'=>$label->requiredField,'msg'=>$this->_sess->siteLabels['IncorrectFormat'],'requiredmsg'=>$this->_sess->siteLabels['Required']);
				$userLabelCopy[] = $label;
				
			if($label->columnName == 'Login_name'){
				//add password fields to form
				$userLabelCopy[] = $pwdField;
				$userLabelCopy[] = $conPwdField;
				
				//add password formats to regexArr
				$label = $pwdField;
				$regexArr[] = array('columnName'=>$label->columnName, 'exp'=>$label->fieldFormat,'length'=>$label->fieldLength, 'minlength'=>$label->pwdminLength, 'required'=>$label->requiredField,'msg'=>$this->_sess->siteLabels['IncorrectFormat'],'requiredmsg'=>$this->_sess->siteLabels['Required']);
				$label = $conPwdField;
				$regexArr[] = array('columnName'=>$label->columnName, 'exp'=>$label->fieldFormat,'length'=>$label->fieldLength, 'minlength'=>$label->pwdminLength, 'required'=>$label->requiredField,'msg'=>$this->_sess->siteLabels['IncorrectFormat'],'requiredmsg'=>$this->_sess->siteLabels['Required']);
			}
		}
                
		$retArr['formFields']=$userLabelCopy;
		$retArr['regexArr'] = $regexArr;
		if($retOp) {
			$optional = array();
			if(isset($formSettings['userRegistrationTopMessage']) && $formSettings['userRegistrationTopMessage']->isActive == 1 && $formSettings['userRegistrationTopMessage']->instruction != '')
				$optional['regTopMsg'] = $formSettings['userRegistrationTopMessage']->instruction;
			else 
				$optional['regTopMsg'] = '';
			if(isset($formSettings['userRegistrationCongratsMessage']) && $formSettings['userRegistrationCongratsMessage']->isActive == 1 && $formSettings['userRegistrationCongratsMessage']->instruction != '')
				$optional['regWelMsg'] = $formSettings['userRegistrationCongratsMessage']->instruction;
			else 
				$optional['regWelMsg'] = '';
			if(isset($formSettings['userRegistrationBottomMessage']) && $formSettings['userRegistrationBottomMessage']->isActive == 1 && $formSettings['userRegistrationBottomMessage']->instruction != '')
				$optional['regBotMsg'] = $formSettings['userRegistrationBottomMessage']->instruction;
			else
				$optional['regBotMsg'] = '';
			if(isset($formSettings['userRegistrationCaptcha']) && $formSettings['userRegistrationCaptcha']->isActive == 1 && $formSettings['userRegistrationCaptcha']->instruction == 'off')
				$optional['regCaptcha'] = false;
			else 
				$optional['regCaptcha'] = true;
			$retArr['components'] = $optional;
	
		}
		return $retArr;
	}
	public function verifyCaptcha($challenge,$response){
		$privatekey = "6LcVUfQSAAAAAJ7EW5grxNFksYdsSNPq2hAUaeCM";
		$resp = recaptcha_check_answer ($privatekey,
				$_SERVER["REMOTE_ADDR"],
				$challenge,
				$response);
		
		if (!$resp->is_valid) {
			return false;
		}
		return true;
	}
	public function saveUser($lang,$formData){
		$userObj = $this->createSaveUserObj($lang,$formData);//print_r($userObj);//exit;
		$saveUser = $this->_userService->insertSelfRegistrationUser($userObj);
		return $saveUser;
	}
	
	public function createSaveUserObj($lang,$formData){
                $siteId = $this->_sess->siteId;
                if (!empty($this->_sess->parentSiteId)) {
                    $siteId = $this->_sess->parentSiteId;
                }
                
		$selfRegData = $this->getSelfRegistrationForm($lang);
		$dataObj = new stdClass();
		$data = array();
		$fields = $selfRegData['formFields'];
		foreach($fields as $key=>$label){
			if($label->columnName != 'Confirmpassword'){
				if(isset($formData[$label->columnName]))
					$label->value = $formData[$label->columnName];
				$dataField = array("columnName" => $label->columnName, "instruction" => trim($label->value),
						"isActive" => 1, "language" => $label->userColumnInstructionLanguage, "siteId" => $siteId);
				$dataField = (object) $dataField;
				$data[] = $dataField;	
			}		
		}
		$dataObj = array('UserColumnInstructionDTO'=>$data);
		return $dataObj;
	}
	
	private function getSiteInstructions($lang)
	{
	   $translationSM = new TranslationSoapModel();
	   $siteTransItems = $translationSM->getTranslationsBySiteIdLang($this->_siteId, $lang);
	    
	   $siteInstructions = array();
	   
	   if(count($siteTransItems)>0){
	      foreach($siteTransItems as $t) {
	         switch($t->translationKeyType) {
	            case 'Instruction':
	               $siteInstructions[$t->translationKey] = $t->translationValue;
	               break;
	         }
	      }
	      
	      $this->_sess->sanitizeSessData($siteInstructions, $siteTransItems);
	   }
	   
	   return $siteInstructions;
	}
}
?>
