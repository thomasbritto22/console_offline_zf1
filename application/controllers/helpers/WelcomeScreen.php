<?php

require_once ("../application/soapModels/CatalystService/Component.php");

/**
 * Action Helper for Welcome Screen
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_WelcomeScreen extends Zend_Controller_Action_Helper_Abstract
{
	private $cache = null;
	private $_baseImgUrl = null;
	private $_siteId = null;
	private $_siteName = null;
	private $_wsItems = null;
	private $_componentService = null;
	
	//to tempory store the component data for each used section
	private $_globalElementsData = null;
	private $_loginElementsData = null;
	private $_welcomePageElementsData = null;

	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {

	}

	/**
	 * --- BASE IMAGE URL ---
	 * This builds the base image url in regards to qa7
	 *
	 * @return string
	 */
	public function baseImgUrl() {
		$host = 'https://' . $_SERVER['HTTP_HOST'];
		//images come from qa7, when on dev3
		if(strpos($host, '.dev3')) {
			$host = str_replace('dev3', 'qa7', $host);
		}

		return $host;
	}

	/**
	 * --- BUILD ALL ELEMENTS ---
	 * This builds all the welcome screen elements
	 *
	 * @return string
	 */
	public function buildAllElements() {
		//$this->_wsItems = $this->getAllWelcomeScreenItems();

		return array(
			'partnerBrandingImgUrl' => $this->buildPartnerBrandingImageUrl(),
			'companyLogoImgUrl'=> $this->buildCompanyLogoImageUrl(),
			'headerTagline' => $this->buildHeaderTagline(),
			'bgImgUrl'=>$this->buildBackgroundImageUrl(),
			'bgImg' => $this->buildBackgroundImage(),
			'carousel' => $this->buildCarousel(),
			'headline' => $this->buildHeadline(),
			'vip' => $this->buildAllVipElements(),
			'selfreg'=>$this->getSelfRegStatus()
		);
	}
	
	/**
	 * --- CHECK SELF REGISTRATION STATUS ---
	 * This checks if self registration is turned on for the site
	 *
	 * @return string
	 */
	public function getSelfRegStatus() {
		$status = false;
			
		$wsItems = array();
	
		// loop through all components received and
		// add to _wsItems based on subsection then groupId
        $wsItems = $this->getSectionElementData($this->_loginElementsData, 'login');
		if(isset($wsItems['self_registration']))
				$this->_wsItems['self_registration'] = $wsItems['self_registration'];
	
		if(!empty($this->_wsItems)){
		   if(isset($this->_wsItems['self_registration'])){
		      if(isset($this->_wsItems['self_registration']['toggle']) && $this->_wsItems['self_registration']['toggle'] == 'on'){
		         	$status = true;
		         }
		      }
		 }
		return $status;
		
	}

	/**
	 * --- BUILD BACKGROUND IMAGE ---
	 * This builds the background image CSS
	 *
	 * @return string
	 */
	public function buildBackgroundImage() {
		$bgImage = '';
		$bgTile = 'repeat-y';
		$wsItems = array();

		// loop through all components received and
		// add to _wsItems based on subsection then groupId
        $wsItems = $this->getSectionElementData($this->_loginElementsData, 'login');
		if(isset($wsItems['bg_image']))
			$this->_wsItems['bg_image'] = $wsItems['bg_image'];

		if(!empty($this->_wsItems)){
		   if(isset($this->_wsItems['bg_image'])){
		      if(isset($this->_wsItems['bg_image']['toggle']) && $this->_wsItems['bg_image']['toggle'] == 'on'){
		         foreach($this->_wsItems['bg_image'] as $key => $item){
		            if('toggle' != $key && isset($item['image']))
		               $bgImage = $item['image'];
		            if('toggle' != $key && isset($item['tile']) && 'off' === $item['tile'])
		               $bgTile = 'no-repeat';
		         }
		      }
		   }
		}

		if(!empty($bgImage)) {
			return "#bgLeftAlign { background: url('$bgImage') scroll $bgTile left top transparent;}";
		}
		else {
			return "#bgLeftAlign { background: none;} ";
		}
	}

	/**
	 * --- BUILD BACKGROUND IMAGE ---
	 * This builds the background image url
	 *
	 * @return string
	 */
	public function buildBackgroundImageUrl() {
		$bgImage = '';
		$wsItems = array();

		// loop through all components received and
		// add to _wsItems based on subsection then groupId
		$wsItems = $this->getSectionElementData($this->_loginElementsData, 'login');
		if(isset($wsItems['bg_image']))
			$this->_wsItems['bg_image'] = $wsItems['bg_image'];

		if(!empty($this->_wsItems)) {
			if(isset($this->_wsItems['bg_image'])) {
				if(isset($this->_wsItems['bg_image']['toggle']) && $this->_wsItems['bg_image']['toggle'] == 'on'){
					foreach($this->_wsItems['bg_image'] as $key => $item) {
						if('toggle' != $key && isset($item['image']))
							$bgImage = $item['image'];
					}
				}
			}
		}

		if(!empty($bgImage))
		{
			return $bgImage;
		}
		else
		{
		   return '';
		}
	}

	/**
	 * --- BUILD PARTNER BRANDING IMAGE ---
	 * This builds the partner Branding image URL
	 *
	 * @return string
	 */
	public function buildPartnerBrandingImageUrl() {
		$partnerBrImage = array();
		$wsItems = array();

		// loop through all components received and
		// add to _wsItems based on subsection then groupId
		$wsItems = $this->getSectionElementData($this->_globalElementsData, 'global_component');
		if(isset($wsItems['Header']))
			$this->_wsItems['Header'] = $wsItems['Header'];
        $items = $this->_wsItems['Header'];

		if(!empty($this->_wsItems)) {
			if(isset($this->_wsItems['Header'])) {
				foreach($items as $key => $item) {
					if('toggle' != $key){
						$partnerBrImage = $item;
					}
				}
			}
		}

		if(!empty($partnerBrImage))
		{
			return $partnerBrImage;
		}
		else
		{
			return '';
		}
	}

	/**
	 * --- BUILD Comapny Logo ---
	 * This builds the partner logo image URL
	 *
	 * @return string
	 */
	public function buildCompanyLogoImageUrl() {
		$partnerLogoImage = array();
		$wsItems = array();
		
		$wsItems = $this->getSectionElementData($this->_globalElementsData, 'global_component');

		// loop through all components received and
		// add to _wsItems based on subsection then groupId
		if(isset($wsItems['company_logo']))
			$this->_wsItems['company_logo'] = $wsItems['company_logo'];

		if(!empty($this->_wsItems)) {
			if(isset($this->_wsItems['company_logo'])) {
				foreach($this->_wsItems['company_logo'] as $item) {
					if(isset($item['image']))
						$partnerLogoImage = $item;
				}
			}
		}

		if(!empty($partnerLogoImage))
		{
			return $partnerLogoImage;
		}
		else
		{
			return '';
		}
	}

	/**
	 * --- BUILD Header Tagline ---
	 * This builds the partner Header Tagline
	 *
	 * @return string
	 */
	public function buildHeaderTagline() {
		$headerTagline = array();
		$wsItems = array();

		// loop through all components received and
		// add to _wsItems based on subsection then groupId
		$wsItems = $this->getSectionElementData($this->_globalElementsData, 'global_component');
		if(isset($wsItems['header_tagline']))
			$this->_wsItems['header_tagline'] = $wsItems['header_tagline'];

		if(!empty($this->_wsItems)) {
			if(isset($this->_wsItems['header_tagline'])) {
				foreach($this->_wsItems['header_tagline'] as $item) {
					if(isset($item['title']))
						$headerTagline = $item;
				}
			}
		}

		if(!empty($headerTagline))
		{
			return $headerTagline;
		}
		else
		{
			return '';
		}
	}

	/**
	 * --- BUILD CAROUSEL ---
	 * This builds the carousel images and wrapping divs
	 *
	 * @return string
	 */
	public function buildCarousel() {
		$carouselItems = array();

		$wsItems = $this->getSectionElementData($this->_welcomePageElementsData, 'welcome_page');
		
		if(isset($wsItems['carousel'])) {
			$carouselItems = $wsItems['carousel'];
		}

		if(count($carouselItems) > 0 ) {
		   //run short the slaceshow by position
 		   usort($carouselItems, array($this, 'cmpCarouseItem'));

		   foreach($carouselItems as $key => $item) {
		      if(isset($item['toggle']) && $item['toggle'] == 'off')
		         unset($carouselItems[$key]);
		   }

		   $numslides = 6;
		   if(count($carouselItems) > $numslides){
		      $extraSlides = count($carouselItems) - $numslides;
		      $i = 1;
		      foreach($carouselItems as $key => $item) {
		         if($i <=  $extraSlides)
		            unset($carouselItems[$key]);
		         $i++;
		      }
		   }

		   if(!empty($carouselItems))
		   {
		      $this->_actionController->view->carouselItems = $carouselItems;
		      return $this->_actionController->view->render('helpers/carousel.phtml');
		   }

		}

		return '';
	}

	/**
	 * --- BUILD HEADLINE ---
	 * This builds the headline on the Welcome Screen
	 *
	 * @return string
	 */
	public function buildHeadline() {
		//Zend_Debug::Dump($componentList);
		$headerItems = array();

		$wsItems = array();

		// loop through all components received and
		// add to _wsItems based on subsection then groupId
        $wsItems = $this->getSectionElementData($this->_loginElementsData, 'login');
		if(isset($wsItems['headline'])) {
			$headerItems = $wsItems['headline'];
		}

		if(count($headerItems) > 0) {
			$headerTemp = array();
			if(isset($headerItems['toggle'])){
				$headerTemp[0]['toggle'] = $headerItems['toggle'];
				unset($headerItems['toggle']);
			}
			ksort($headerItems);
			foreach($headerItems as $headerItem){
				if(isset($headerItem['text']))
					$headerTemp[0]['text'] = $headerItem['text'];
			}
			// turn list into array always
			if(!is_array($componentList)) $componentList = array($componentList);

			//go through component list to get toggle
			//we only want the last one entered
			foreach($componentList as $c) {
			    switch($c->componentType) {
 					case 'toggle': //toggle
 						$headerTemp[0]['toggle'] = $c->value;
 						break;
 				}
			}
			$headLine = array();

			if((isset($headerTemp[0]['toggle']) && $headerTemp[0]['toggle'] == 'on') || !(isset($headerTemp[0]['toggle']))){
				if(isset($headerTemp[0]['toggle'])){
					unset($headerTemp[0]['toggle']);
				}
				if(count($headerTemp[0]) > 0){
					if(isset($headerTemp[0]['text']) && $headerTemp[0]['text'] != '')
						$headLine['text'] = str_replace('&nbsp;',' ',$headerTemp[0]['text']);
					else {
						if(isset($headerTemp[0]) && is_null($headerTemp[0]['text']) && $headerTemp[0]['text'] == '')
							$headLine['text'] = '';
						else
							$headLine['text'] = '...doing business the right way';
					}
				}
			}
			$headLine['text'] = isset($headLine['text']) ? $headLine['text']: '';
			$this->_actionController->view->headerItems = $headLine;

			return $this->_actionController->view->render('helpers/headline.phtml');
		}
		else {
			return '';
		}
	}


	/**
	 * --- BUILD ALL VIP ELEMENTS ---
	 * This builds the carousel images and wrapping divs
	 *
	 * @return string
	 */
	public function buildAllVipElements() {
                                $vipItems = $this->getVipItems();//print_r($vipItems);exit;
 
                                if(isset($vipItems) && count($vipItems) > 0) {
                                                $vipTitle = isset($vipItems['title']) && strpos($vipItems['title'],'Please enter text.') === false ? true : false;
                                                $vipImg = isset($vipItems['image']) ? true : false;
                                                $vipText = isset($vipItems['text']) && strpos($vipItems['text'],'Please enter text.') === false ? true : false;
                                                $vipSig = isset($vipItems['signature']) && $vipItems['signature'] != '' ? true : false;
                                                return ($vipTitle || $vipImg ||  $vipText || $vipSig ?'<div id="vipMsg" class="contentTextIcons">' : '') .
                                                ($vipTitle ? '<h3 class="secondaryTextIcons borderBottomThin">' . $vipItems['title'] . '</h3>':'').
                                                                ($vipImg ? '<div id="vipImage">
                                                                                <img alt="VIP Image" class="customfile" src="' . $vipItems['image'] . '" >
                                                                                </div>' : '').
 
                                                                ($vipText ? '<div class="contentTextIcons vipwrapperMargin">' . $vipItems['text']  . '</div>' :'').
                                                                                ($vipSig ?'<span class="vipSig">' .
                                                                                                '<img alt="VIP Signature" class="signature" src="'.$vipItems['signature'].'">' .
                                                                                '</span>' :'').
                                                               
                                                                ($vipTitle || $vipImg ||  $vipText || $vipSig ?'<div class="clear"></div></div>' : '');
                                }
                }

	/**
	 * --- GET VIP ITEMS ---
	 *
	 * Gets the VIP Items from the db
	 * and adds them to the _vipItems array
	 *
	 * @param
	 */
	public function getVipItems() {
         if(!empty($this->_siteId)) {
            static $vipItems = array();

            if(count($vipItems) <= 0) {
               $wsItems = array();
               
               // loop through all components received and
               // add to _wsItems based on subsection then groupId
               $wsItems = $this->getSectionElementData($this->_welcomePageElementsData, 'welcome_page');

               if(isset($wsItems['VIP_message'])) {
                  if (isset($wsItems['VIP_message']['toggle']) && $wsItems['VIP_message']['toggle'] == 'on')
                  {
                  	$wsItems['VIP_message'] = array_reverse($wsItems['VIP_message'],1);
                     foreach($wsItems['VIP_message'] as $key => $item)
                     {
                        if('toggle' != $key)
                        {
                           $vipItems = $item;
                        }
                     }
                  }
               }
            }

			return $vipItems;
		}
		else
		{
			return null;
		}
	}

// 	/**
// 	 * --- GET ALL WELCOME SCREEN ITEMS ---
// 	 *
// 	 * Gets the VIP Items from the db
// 	 * and adds them to the _vipItems array
// 	 *
// 	 * @param
// 	 */
// 	public function getAllWelcomeScreenItems() {
// 		static $wsItems = null;

// 		if(count($wsItems) <= 0 && !empty($this->_siteId)) {
// 			$componentSM = new ComponentSoapModel();
// 			$componentList = $componentSM->getComponentSettingsBySiteBySectionByLanguage('global_component','',$this->_sess->siteConfigs['DefaultLanguage']);
// 			$wsItems = array();

// 			// loop through all components received and
// 			// add to _wsItems based on subsection then groupId
// 			$wsItems = $this->groupData($componentList);
// 		}

// 		//Zend_Debug::Dump($wsItems);exit;

// 		return $wsItems;
// 	}

	/**
	 * loop through all components received and
	 * add to _wsItems based on subsection then groupId
	 */
	public function groupData($componentList){
		$wsItems = array();
		if(!empty($componentList) && $componentList !== (array)$componentList) {
			$componentList = array($componentList);
		}
		// loop through all components received and
		// add to _wsItems based on subsection then groupId
		foreach((array)$componentList as $c) {

			switch($c->componentType) {
				case 'customfile': //customfile
					if(!empty($c->customFileDTO->path)){
						$wsItems[$c->subSection][$c->groupId]['image'] = $this->_baseImgUrl . $c->customFileDTO->path;
						if($c->customFileDTO->fileTypeName == 'image'){
							$wsItems[$c->subSection][$c->groupId]['width'] = $c->customFileDTO->width;
							$wsItems[$c->subSection][$c->groupId]['height'] = $c->customFileDTO->height;
						}
					}
					break;
				case 'signature': //customfile
					if(!empty($c->customFileDTO->path)){
						$wsItems[$c->subSection][$c->groupId]['signature'] = $this->_baseImgUrl . $c->customFileDTO->path;
					}
					break;
				case 'title': //title
					$wsItems[$c->subSection][$c->groupId]['title'] = $c->value;
					break;
				case 'text': //text
					$wsItems[$c->subSection][$c->groupId]['text'] = $c->value;
					break;
				case 'tile': //text
					$wsItems[$c->subSection][$c->groupId]['tile'] = $c->value;
					break;
				case 'left': //text
					$wsItems[$c->subSection][$c->groupId]['left'] = $c->value;
					break;
				case 'right': //text
					$wsItems[$c->subSection][$c->groupId]['right'] = $c->value;
					break;
				case 'center': //text
					$wsItems[$c->subSection][$c->groupId]['center'] = $c->value;
					break;
				case 'toggle': //toggle
					if($c->subSection == 'carousel'){
						$wsItems[$c->subSection][$c->groupId]['toggle'] = $c->value;
					    $wsItems[$c->subSection][$c->groupId]['position'] = $c->position;
					}else
						$wsItems[$c->subSection]['toggle'] = $c->value;
					break;
			}
		}
		//Zend_Debug::Dump($wsItems);exit;

		return $wsItems;
	}

	/**
	 * --- SET SITE ID ---
	 *
	 * Sets the classes site ID
	 *
	 * @param string $siteId
	 */
	public function setSiteId($siteId) {
		$this->_siteId = $siteId;
		return $this;
	}

	/**
	 * --- SET SITE NAME ---
	 *
	 * Sets the classes site name
	 *
	 * @param string $siteName
	 */
	public function setSiteName($siteName) {
	    $this->_siteName = $siteName;
	    return $this;
	}

	/**
	 * Strategy pattern: call helper as broker method
	 *
	 * @param  string $siteId
	 * @return HTML_Output
	 */
	public function direct($sess)
	{
		$this->_sess = $sess;
		$this->_siteId = $sess->siteId;
		$this->_siteName = $sess->siteName;
                $this->cache = Zend_Registry::get('memcache');

		$this->_baseImgUrl = $this->baseImgUrl();
		$this->_componentService = new ComponentSoapModel();

	}

   //callable resort function
   private function cmpCarouseItem($a, $b)
   {
      if ($a['position'] == $b['position'])
      {
         return 0;
      }

      return ($a['position'] < $b['position']) ? -1 : 1;
   }
   
   private function getSectionElementData(&$dataElement, $section, $subSection = null){
      $data = null;
      
      if(null === $dataElement){
         $cacheKeyArray = $params = array($section, $subSection, $this->_sess->siteConfigs['DefaultLanguage']);//
         $componentList = $this->cache->getItemsFromCache($this->_componentService, 'getComponentSettingsBySiteBySectionByLanguage', $params, $cacheKeyArray);
         $data = $this->groupData($componentList);
      }else{
         $data = $dataElement;
      }
      
      //assign the data back to temporary store so don't need to call service again
      $dataElement = $data;
      
      return $data;
   }
}
