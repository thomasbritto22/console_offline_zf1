<?
require_once ("../application/soapModels/CatalystService/Component.php");

/**
 * Action Helper for Resource Center
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_ResourceCenter extends Zend_Controller_Action_Helper_Abstract {
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
   
	protected $cache = null;
	private $_siteId = null;
	private $_sess = null;
	private $_resourceItems = null;
	private $_positioningRecords = null;

	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {

	}

	/**
	 * --- SET SITE ID ---
	 *
	 * Sets the classes site ID
	 *
	 * @param string $siteId
	 */
	public function setSiteId($sess) {
		$_siteId = $sess->siteId;
	}

	/**
	 * Strategy pattern: call helper as broker method
	 */
	public function direct($sess)
	{
		$this->_sess = $sess;
		$this->_siteId = $sess->siteId;

		$componentSM = new ComponentSoapModel();
                $this->cache = Zend_Registry::get('memcache');
                $cacheKeyArray = $params = array($this::SECTION, $this::SUB_SECTION, $this->_sess->siteConfigs['DefaultLanguage']);//
                $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentSettingsBySiteBySectionByLanguage', $params, $cacheKeyArray);
		$this->_resourceItems = $this->buildResourceItem($componentList, $this->_positioningRecords);
	}

   public function getResources($recordNumber = null, $type = null, $orderBy = null)
   {
      $resourceRecords = $this->_resourceItems;
      
      //reorder resource according to the location
      if (null !== $orderBy && !empty($resourceRecords)){//var_dump($resourceRecords);
         $resourceRecords = $this->sortByGroup($resourceRecords, json_decode($this->_positioningRecords[$orderBy]['value']));
      }
	   
      if(count($resourceRecords) > 0 ){
      	$items = array();
      
      	//if no type and number of record passed mean that need to return all records
      	if (( null === $type || (is_array($type) && empty($type)) ) && null === $recordNumber)
      	{  
      		return $resourceRecords;
      	}
      
      	$lookupArray = array('global');
      
      	if (is_array($type))
      	{
      	   $lookupArray = array_merge($lookupArray, $type);
      	}
      	else
      	{
      	   $lookupArray = array_merge($lookupArray, array($type));
      	}
      
      	if(!empty($resourceRecords))
      	{
      		foreach($resourceRecords as $key => $item)
      		{
      			if(false !== array_search($item['toggle'], $lookupArray))
      			{
      				$items[$key] = $item;
      			}
      
      			if (null != $recordNumber && count($items) == $recordNumber) break;
      		}
      	}
      	
      	return $items;
      }
      else
      {
      	return array();
      }
   }

   private function sortByGroup($originalRecords, $orderByRecord){
      $sortTemp = array();
      $notSortTemp = $originalRecords;
      
      //return if nothing to sort
      if (empty($orderByRecord) || empty($originalRecords))
      {
         return $originalRecords;
      }
      
      foreach($orderByRecord as $value)
      {
         if(isset($originalRecords[$value]))
         {
            $sortTemp[$value] = $originalRecords[$value];
            unset($notSortTemp[$value]);
         }
      }
   
      return array_merge($sortTemp, $notSortTemp);
   }
	
	private function buildResourceItem($components, &$positioning)
	{
		$resourceItems = array();
		$viewTypeText = array(
				'email'  => $this->_sess->siteLabels['ContactviaE-mail'],
				'doc'	 => $this->_sess->siteLabels['ViewDocument'],
				'url'	 => $this->_sess->siteLabels['VisitWebsite'],
				'phone'  => null,
				'text'	 => null,
		);

		foreach((array)$components as $c) {
			switch($c->componentType) {
				case $this::COMPONENT_RESOURCE_TYPE: //resource center type
					$resourceItems[$c->groupId]['type'] = $c->value;
					break;
				case $this::COMPONENT_TITLE: //title
					$resourceItems[$c->groupId]['title'] = $c->value;
					break;
				case $this::COMPONENT_TEXT: //text
					$resourceItems[$c->groupId]['text'] = $c->value;
					break;
				case $this::COMPONENT_TOGGLE: //toggle
					$resourceItems[$c->groupId]['toggle'] = $c->value;
					break;
				case $this::COMPONENT_CUSTOMFILE: //customfile
					$resourceItems[$c->groupId]['customfile'] = $c->customFileDTO;
					break;
				case $this::COMPONENT_THUMBNAIL: //thumbnail
					$resourceItems[$c->groupId]['thumbnail'] = $c->customFileDTO;
					break;
				case $this::COMPONENT_DESC: //description
				   $resourceItems[$c->groupId]['description'] = $c->value;
				   break;
                case $this::COMPONENT_LOGIN_POSITION:
                   $positioning['loginPage']['value'] = $c->value;
                   $positioning['loginPage']['id'] = $c->id;
                   break;
                case $this::COMPONENT_RIGHTSIDEBAR_POSITION:
                   $positioning['rightSidebar']['value'] = $c->value;
                   $positioning['rightSidebar']['id'] = $c->id;
                   $positioning['rightSidebar']['groupId'] = $c->groupId;
                   break;
                case $this::COMPONENT_RESOURCECENTER_POSITION:
                   $positioning['resourcePage']['value'] = $c->value;
                   $positioning['resourcePage']['id'] = $c->id;
                   $positioning['resourcePage']['groupId'] = $c->groupId;
                   break;
			}
		}
		
		$resourceItems1 = $resourceItems;
		foreach($resourceItems as $key=>$res){
			$resourceItems1[$key]['desc'] = !empty($viewTypeText[$res['type']])? $viewTypeText[$res['type']]: htmlspecialchars($res['text']);
		}
		$resourceItems = $resourceItems1;
		
		return $resourceItems;
	}

	public function countResources()
	{
	   return count($this->_resourceItems);
	}
}
?>