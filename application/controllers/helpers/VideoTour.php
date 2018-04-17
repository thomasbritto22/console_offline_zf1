<?
require_once ("../application/soapModels/CatalystService/Component.php");

/**
 * Action Helper for Video Tour
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_VideoTour extends Zend_Controller_Action_Helper_Abstract {

   protected $cache = null;
   private $_sess = null;
   private $_siteId = null;
   private $_items = array();
   private $_baseImgUrl = null;

	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {

	}

	private function groupData($componentList){
	   $wsItems = array();
	   if(!empty($componentList) && $componentList !== (array)$componentList) {
	      $componentList = array($componentList);
	   }

	   // loop through all components received and
	   // add to _wsItems based on subsection then groupId
	   foreach((array)$componentList as $c) {
	   	if($c->componentType == 'customfile' || $c->componentType == 'thumbnail')
	   		$wsItems[$c->subSection][$c->groupId][$c->componentType] = $this->_baseImgUrl . $c->customFileDTO->path;
	   	else if($c->componentType == 'toggle')
	   		$wsItems[$c->subSection][$c->componentType] = $c->value;
	   	else
	   		$wsItems[$c->subSection][$c->groupId][$c->componentType] = $c->value;
	   }
	   return $wsItems;
	}

	private function baseImgUrl() {
	   $host = 'https://' . $_SERVER['HTTP_HOST'];
	   //images come from qa7, when on dev3
	   if(strpos($host, '.dev3')) {
	      $host = str_replace('dev3', 'qa7', $host);
	   }

	   return $host;
	}

   /**
    * Strategy pattern: call helper as broker method
    */
   public function direct($sess)
   {
      //$this->_baseImgUrl = $baseUrl;
      $this->_baseImgUrl = $this->baseImgUrl();
      $this->_sess = $sess;
      $this->cache = Zend_Registry::get('memcache');
      
      $componentSM = new ComponentSoapModel();
      $cacheKeyArray = $params = array('global_component', 'video_tour', $this->_sess->siteConfigs['DefaultLanguage']);//
      $componentList = $this->cache->getItemsFromCache($componentSM, 'getComponentSettingsBySiteBySectionByLanguage', $params, $cacheKeyArray);

      $wsItems = $this->groupData($componentList);
      if(isset($wsItems['video_tour']['toggle']) && $wsItems['video_tour']['toggle'] == 'on'){
         foreach($wsItems['video_tour'] as $key => $item) {
            if('toggle' != $key && is_array($item) && isset($item['customfile']))
               $this->_items= $item;
         }
      }

      return $this->_items;
   }
   
   public function checkEnable($page)
   {
      if(isset($this->_items['visibility'])){
         $visibilityArr = json_decode($this->_items['visibility']);
         return in_array($page, $visibilityArr);
      }
      
      return false;
   }

}
?>