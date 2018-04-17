<?
require_once ("../application/soapModels/CatalystService/Component.php");

/**
 * Action Helper for Resource Center
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_AdminResourceCenter extends Zend_Controller_Action_Helper_Abstract {
   const SECTION = 'global_component';
   const SUB_SECTION = 'resource_center';
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
   const VISIBILITY = 'visibility';
   const DOCUMENT = 'doc';
   const VIDEO = 'video';

   protected $cache = null;
   private $_soapComponent = null;
   private $_siteId = null;
   private $_sess = null;
   private $_resourceItems = null;
   private $_rcPositioningItems = null;
   private $_visibilityTextArr = array('loginPage'=>'Login page', 'rightSidebar'=>'Right sidebar', 'global'=>'Global', 'resourcePage'=>'Resource Center');
   private $_typeTextArr = array('url'=>'URL', 'email'=>'Email', 'doc'=>'Document', 'phone'=>'Phone', 'text'=>'Plain text', 'video'=>'Video');
   private $_visibilityComponentType = array();
   
   /**
    * Constructor: initialize plugin loader
    *
    * @return void
    */
   public function __construct() {
      $this->_soapComponent = new ComponentSoapModel();
   }

   /**
    * Strategy pattern: call helper as broker method
    *
    * @param  string $siteId
    * @return HTML_Output
    */
   public function direct($sess, $langCode)
   {
      $this->_sess = $sess;
      $this->_siteId = $sess->siteId;

        $this->cache = Zend_Registry::get('memcache');
        $cacheKeyArray = $params = array($this::SECTION, $this::SUB_SECTION, $langCode);//
        $componentList = $this->cache->getItemsFromCache($this->_soapComponent, 'getComponentSettingsBySiteBySectionByLanguage', $params, $cacheKeyArray);
      $this->_resourceItems = $this->buildResourceItemAdmin($componentList, $this->_rcPositioningItems);
      
      $this->_visibilityComponentType = array('loginPage'=>$this::COMPONENT_LOGIN_POSITION, 'rightSidebar'=>$this::COMPONENT_RIGHTSIDEBAR_POSITION, 'resourcePage'=>$this::COMPONENT_RESOURCECENTER_POSITION);
   }

   public function getResourceCenterJsonRecords()
   {
      /*
       * Trying to build the Json data string
      */
      $jsonStr = '{"aaData":[]}';

      if (!empty($this->_resourceItems)  && is_array($this->_resourceItems['resourceCenter']))
      {
         $jsonArr['aaData'] = array();

         foreach ($this->_resourceItems['resourceCenter']  as $groupId => $resource)
         {
            $jsonArr['aaData'][] = array(
                  'groupId' => $groupId,
                  'position' => $resource['rc_type']['position'],

                  'type' => $resource['rc_type']['value'],
                  'typeText' => isset($this->_typeTextArr[$resource['rc_type']['value']]) ? $this->_typeTextArr[$resource['rc_type']['value']] : '' ,
                  'typeId' => $resource['rc_type']['id'],

                  'title' => $resource['title']['value'],
                  'titleId' => $resource['title']['id'],

                  'description' => !empty($resource['description']['value'])? $resource['description']['value']: '',
                  'descriptionId' => $resource['description']['id'],

                  'text' => $resource['text']['value'],
                  'textId' => $resource['text']['id'],

                  'visibility' => $resource['visibility']['value'],
                  'visibilityText' => isset($this->_visibilityTextArr[$resource['visibility']['value']]) ? $this->_visibilityTextArr[$resource['visibility']['value']] : '' ,
                  'visibilityId' => $resource['visibility']['id'],

                  'customfile' => isset($resource['customfile'])? $resource['customfile']['value']->id:'',
                  'customfileId' => isset($resource['customfile'])? $resource['customfile']['id']:'',
                  'customfilePath' => isset($resource['customfile'])? $resource['customfile']['value']->path:'',
                  'customfileTitle' => isset($resource['customfile'])? $resource['customfile']['value']->title:'',

                  'thumbnailfile' => isset($resource['thumbnail'])? $resource['thumbnail']['value']->id:'',
                  'thumbnailfileId' => isset($resource['thumbnail'])? $resource['thumbnail']['id']:'',
                  'thumbnailfilePath' => isset($resource['thumbnail'])? $resource['thumbnail']['value']->path:'',
               );
         }
         
         //add sort positioning to the return jsonString
         $jsonArr['positioning'] = !empty($this->_rcPositioningItems) ? $this->_rcPositioningItems: array();

         $jsonStr = json_encode($jsonArr);
      }

      return $jsonStr;
   }

   public function addResource($title, $resource, $description, $visibility, $type, $language, $customfile = '', $thumbnailfile = '')
   {
      $rawRecords = array(
            array('type' => $this::COMPONENT_TITLE, 'value' => $title, 'language' => $language),
            array('type' => $this::COMPONENT_TEXT, 'value' => $resource, 'language' => $language),
            array('type' => $this::COMPONENT_DESC, 'value' => $description, 'language' => $language),
            array('type' => $this::COMPONENT_TOGGLE, 'value' => $visibility, 'language' => $language),
            array('type' => $this::COMPONENT_RESOURCE_TYPE, 'value' => $type, 'language' => $language)
         );

      if (!empty($customfile) && ($this::VIDEO == $type || $this::DOCUMENT == $type)) $rawRecords[] =  array('type' => $this::COMPONENT_CUSTOMFILE, 'value' => $customfile, 'language' => $language);
      if (!empty($thumbnailfile) && $this::VIDEO == $type) $rawRecords[] =  array('type' => $this::COMPONENT_THUMBNAIL, 'value' => $thumbnailfile, 'language' => $language);

      //build save records
      $saveRecords = array();

      foreach ($rawRecords as $record)
      {
         if(false !== ($saveRecord = $this->buildResourceSoapRecord($record)))
         {
            $saveRecords[] = $saveRecord;
         }
      }

      //start saving
      return $this->saveResource($saveRecords);
   }

   public function updateResources($rawRecords)
   {
      //build update records
      $saveRecords = array();

      foreach ($rawRecords as $record)
      {
         if(false !== ($saveRecord = $this->buildResourceSoapRecord($record)))
         {
            $saveRecords[] = $saveRecord;
         }
      }

      //start update
      return $this->saveResource($saveRecords);
   }

   public function deleteResources($groupIds)
   {
      if (isset($groupIds) && is_array($groupIds)){

         foreach ($groupIds as $groupId)
         {
            $this->_soapComponent->deleteComponentSettingByGroupId($groupId);
         }

         return '{"success":true}';
      }

      return '{"success":false}';
   }

   private function saveResource($records)
   {
      if (isset($records) && is_array($records) ){

         $response = $this->_soapComponent->saveComponentSettings($records);

         if (isset($response->success) && true === $response->success)
         {
            $dataJson = $this->serviceResponseJsonHandler($response);

            return '{"success":true,' .($dataJson ? '"data":' .$dataJson : '"data":{}'). '}';
         }
      }

      return '{"success":false}';
   }
   
   private function buildResourceSoapRecord($record)
   {
      if (!is_array($record))
      {
         return false;
      }

      return array(
            'id' => !empty($record['id'])? $record['id']: null,
            'siteId' => $this->_siteId,
            'section' => $this::SECTION,
            'subSection' => $this::SUB_SECTION,
            'language' => $record['language'],
            'componentType' => ($record['type'] != $this::VISIBILITY ? $record['type']: $this::COMPONENT_TOGGLE),
            'value' => $record['value'],
            'position' => !empty($record['position']) ? $record['position'] : $this->countResources() + 1,
            'groupId' => $record['groupId']
         );
   }

   private function buildResourceItemAdmin($componentList, &$positioning)
   {
      $components = array();

      if(!empty($componentList)){
         foreach($componentList as $resource) {
            switch($resource->componentType) {
               case $this::COMPONENT_RESOURCE_TYPE: //resource type
                  $components['resourceCenter'][$resource->groupId]['rc_type']['value'] =  $resource->value;
                  $components['resourceCenter'][$resource->groupId]['rc_type']['id'] =  $resource->id;
                  $components['resourceCenter'][$resource->groupId]['rc_type']['position'] =  $resource->position;
                  break;
               case $this::COMPONENT_TITLE: //title
                  $components['resourceCenter'][$resource->groupId]['title']['value'] = $resource->value;
                  $components['resourceCenter'][$resource->groupId]['title']['id'] = $resource->id;
                  $components['resourceCenter'][$resource->groupId]['title']['position'] = $resource->position;
                  break;
               case $this::COMPONENT_TEXT: //text
                  $components['resourceCenter'][$resource->groupId]['text']['value'] = $resource->value;
                  $components['resourceCenter'][$resource->groupId]['text']['id'] = $resource->id;
                  $components['resourceCenter'][$resource->groupId]['text']['position'] = $resource->position;
                  break;
               case $this::COMPONENT_TOGGLE: //toggle
                  $components['resourceCenter'][$resource->groupId]['visibility']['value'] = $resource->value;
                  $components['resourceCenter'][$resource->groupId]['visibility']['id'] = $resource->id;
                  $components['resourceCenter'][$resource->groupId]['visibility']['position'] = $resource->position;
                  break;
               case $this::COMPONENT_CUSTOMFILE: //customfile
                  $components['resourceCenter'][$resource->groupId]['customfile']['value'] = $resource->customFileDTO;
                  $components['resourceCenter'][$resource->groupId]['customfile']['id'] = $resource->id;
                  $components['resourceCenter'][$resource->groupId]['customfile']['position'] = $resource->position;
                  break;
               case $this::COMPONENT_THUMBNAIL: //thumbnail
                  $components['resourceCenter'][$resource->groupId]['thumbnail']['value'] = $resource->customFileDTO;
                  $components['resourceCenter'][$resource->groupId]['thumbnail']['id'] = $resource->id;
                  $components['resourceCenter'][$resource->groupId]['thumbnail']['position'] = $resource->position;
                  break;
               case $this::COMPONENT_DESC: //description
                  $components['resourceCenter'][$resource->groupId]['description']['value'] = $resource->value;
                  $components['resourceCenter'][$resource->groupId]['description']['id'] = $resource->id;
                  $components['resourceCenter'][$resource->groupId]['description']['position'] = $resource->position;
                  break;
               case $this::COMPONENT_LOGIN_POSITION:
                  $positioning['loginPage']['value'] = $resource->value;
                  $positioning['loginPage']['id'] = $resource->id;
                  $positioning['loginPage']['groupId'] = $resource->groupId;
                  break;
               case $this::COMPONENT_RIGHTSIDEBAR_POSITION:
                  $positioning['rightSidebar']['value'] = $resource->value;
                  $positioning['rightSidebar']['id'] = $resource->id;
                  $positioning['rightSidebar']['groupId'] = $resource->groupId;
                  break;
               case $this::COMPONENT_RESOURCECENTER_POSITION:
                  $positioning['resourcePage']['value'] = $resource->value;
                  $positioning['resourcePage']['id'] = $resource->id;
                  $positioning['resourcePage']['groupId'] = $resource->groupId;
                  break;
            }
         }

         return $components;
      }

      //return false when no record
      return false;
   }

   public function countResources()
   {
      return count($this->_resourceItems['resourceCenter']);
   }

   private function serviceResponseJsonHandler($response)
   {
      if (isset($response->dataObject->componentSettings->ComponentSettingDTO))
      {
         if (count($response->dataObject->componentSettings->ComponentSettingDTO) <= 1)
         {
            return '[' .json_encode($response->dataObject->componentSettings->ComponentSettingDTO). ']';
         }
         else
         {
            return json_encode($response->dataObject->componentSettings->ComponentSettingDTO);
         }
      }

      return false;
   }

   /*
    * reorder resource section
    */
   
   public function updateOrder($lang, $visibility, $groupIds)
   {
      if (!empty($this->_visibilityComponentType[$visibility])){
         $id = null;
         $groupId = null;
         
         if (!empty($this->_rcPositioningItems[$visibility]) && !empty($this->_rcPositioningItems[$visibility]['id'])){
            $id = $this->_rcPositioningItems[$visibility]['id'];
            $groupId = $this->_rcPositioningItems[$visibility]['groupId'];
         }

         return $this->saveResource(array(
                     array(
                        'id' => $id,
                        'siteId' => $this->_siteId,
                        'section' => $this::SECTION,
                        'subSection' => $this::SUB_SECTION,
                        'language' => $lang,
                        'componentType' => $this->_visibilityComponentType[$visibility],
                        'value' => json_encode($groupIds),
                        'groupId' => $groupId
                     )
                  ));
      }else{
         return '{"success":false}';
      }
   }
   
   public function countEachResourceType(){
      
      $arrCount = array();
      
      foreach ($this->_resourceItems['resourceCenter']  as $resource)
      {
         if (isset($arrCount[$resource['visibility']['value']]))
         {
            ++$arrCount[$resource['visibility']['value']];
         }
         else
         {
            $arrCount[$resource['visibility']['value']] = 1;
         }
      }
      
      return arrCount;
   }
   
   /*
    * End reorder resource section
    */

}
?>