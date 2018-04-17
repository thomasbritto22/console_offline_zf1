<?php
include_once('_CatalystService.php');

/**
 * --- COMPONENT SOAP MODEL ---
 * Random things like welcome screen carousel, vip message, headline, etc.
 */
class ComponentSoapModel extends CatalystServiceSoapModel {

 	/**
     * --- INITALIZE ---
     * Initializes the Catalyst Service model... fairly self explanitory.
     */
    const CACHE_KEY_ALL_COMPONENT_SECTIONS = 'allComponentSections';
    const CACHE_KEY_ALL_COMPONENT_TYPE = 'allComponentType';
    public function ComponentSoapModel(){
        $this->init();
    }

	/**
     * --- GET ALL COMPONENT SECTIONS  ---
     * Gets a list of component sections.
     */
	public function getAllComponentSections() {
	    if($this->client){
    		$response = $this->client->getAllComponentSections()->out;
    		$cleanResponse = $response->dataObject->componentSections->ComponentSectionDTO;
    		return $cleanResponse;
	    }
	    return false;
	}
        
        /**
         * Gets component sections and types from services/cache and creates component object
         * @return \stdClass
         */
        public function getAllComponents(){
            
             $components = new stdClass();
             $components->sections = $this->_memcache->getItemsFromCache($this, 'getAllComponentSections', array(), array(self::CACHE_KEY_ALL_COMPONENT_SECTIONS), false);
             $components->types = $this->_memcache->getItemsFromCache($this, 'getAllComponentTypes', array(), array(self::CACHE_KEY_ALL_COMPONENT_TYPE), false);
             
             return $components;
        }

	/**
	 * --- GET COMPONENTS BY SECTION  ---
	 * Gets a list of components by section ID.
	 */
	public function getComponentsBySection($section, $subsection='') {
		if($this->client){
			$response = $this->client->getComponentSettingsBySiteBySection(array(
				'in0' => $this->sess->siteId,
				'in1' => $section,
				'in2' => $subsection
			))->out;

			if($response->success && !empty($response->dataObject->componentSettings))
			{
				$cleanResponse = $response->dataObject->componentSettings->ComponentSettingDTO;
				return $cleanResponse;
			}

			return null;
		}
		return false;
	}
        
        /**
	 * --- GET COMPONENTS BY SITE  ---
	 * Gets a list of all components by site id.
	 */
	public function getComponentSettingsBySite() {
		if($this->client){
			$response = $this->client->getComponentSettingsBySite(array(
				'in0' => $this->sess->siteId
			))->out;
                        
                        if($response->success && !empty($response->dataObject->componentSettings))
			{
			    if (!is_array($response->dataObject->componentSettings->ComponentSettingDTO) && isset($response->dataObject->componentSettings->ComponentSettingDTO->componentType))
			    {
			       $response->dataObject->componentSettings->ComponentSettingDTO = array($response->dataObject->componentSettings->ComponentSettingDTO);
			    }
			    
                            $cleanResponse = $response->dataObject->componentSettings->ComponentSettingDTO;
                            return $cleanResponse;
			}
                        
			return null;
		}
		return false;
	}

	/**
	 * --- GET COMPONENTS BY SECTION and LANGUAGE ---
	 * Gets a list of components by section ID and language.
	 */
	public function getComponentSettingsBySiteBySectionByLanguage($section, $subsection='',$language='') {
		if($language == '')
			$language = $this->sess->siteConfigs['ConfigsDefaultLanguage'];
		if($this->client){
			$response = $this->client->getComponentSettingsBySiteBySectionByLanguage(array(
				'in0' => $this->sess->siteId,
				'in1' => $section,
				'in2' => $subsection,
				'in3' => $language
			))->out;

			if($response->success && !empty($response->dataObject->componentSettings))
			{
			    if (!is_array($response->dataObject->componentSettings->ComponentSettingDTO) && isset($response->dataObject->componentSettings->ComponentSettingDTO->componentType))
			    {
			       $response->dataObject->componentSettings->ComponentSettingDTO = array($response->dataObject->componentSettings->ComponentSettingDTO);
			    }
			    
				$cleanResponse = $response->dataObject->componentSettings->ComponentSettingDTO;
				return $cleanResponse;
			}

			return null;
		}
		return false;
	}
        
        /**
	 * --- GET all COMPONENTS BY LANGUAGE ---
	 * Gets a list of all components .
	 */
        public function getComponentSettingsBySiteByLanguage($language = '') {
        
            if($language == '')
                $language = $this->sess->siteConfigs['ConfigsDefaultLanguage'];
                
            if ($this->client) {
                $response = $this->client->getComponentSettingsBySiteByLanguage(array(
                            'in0' => $this->sess->siteId,
                            'in1' => $language
                        ))->out;
                        
                
                if ($response->success && !empty($response->dataObject->componentSettings)) {
                    if (!is_array($response->dataObject->componentSettings->ComponentSettingDTO) && isset($response->dataObject->componentSettings->ComponentSettingDTO->componentType)) {
                        $response->dataObject->componentSettings->ComponentSettingDTO = array($response->dataObject->componentSettings->ComponentSettingDTO);
                    }

                    $cleanResponse = $response->dataObject->componentSettings->ComponentSettingDTO;
                    return $cleanResponse;
                }

                return null;
            }
            return false;
        }

	/**
	 * --- GET COMPONENT BY SITE and TYPE  ---
	 * Gets a settings of component by component type.
	 */
	public function getComponentSettingsByType($componentType) {
            if($this->client){
                $response = $this->client->getComponentSettingsBySiteByComponentType(array(
                                'in0' => $this->sess->siteId,
                                'in1' => $componentType
                ))->out;

                if($response->success && !empty($response->dataObject->componentSettings))
                {
                    if (!is_array($response->dataObject->componentSettings->ComponentSettingDTO && isset($response->dataObject->componentSettings->ComponentSettingDTO->componentType)))
                    {
                       $response->dataObject->componentSettings->ComponentSettingDTO = array($response->dataObject->componentSettings->ComponentSettingDTO);
                    }
                    $cleanResponse = $response;
                    return $cleanResponse;
                }

                return null;
            }
            return false;
	}

	/**
	 * --- GET COMPONENT BY SITE and TYPE  ---
	 * Gets a settings of component by component type.
	 */
	public function getComponentSettingsByTypeForTheming($componentType) {
		if($this->client){
			$response = $this->client->getComponentSettingsByTypeForTheming(array(
					'in0' => $this->sess->siteId,
					'in1' => $componentType
			))->out;

			if($response->success && !empty($response->dataObject->componentSettings))
			{
				$cleanResponse = $response;
				return $cleanResponse;
			}

			return null;
		}
		return false;
	}

	/**
     * --- GET ALL COMPONENT TYPES  ---
     * Gets a list of component types.
     */
	public function getAllComponentTypes() {
	    if($this->client){
    		$response = $this->client->getAllComponentTypes()->out;
    		$cleanResponse = $response->dataObject->componentTypes->ComponentTypeDTO;
    		return $cleanResponse;
	    }
	    return false;
	}

	/**
	 * --- SAVE COMPONENT DATA ---
	 * Sends data to the service for saving to database.
	 */
	public function saveComponentSettings($settings){
	    if($this->client){

	        $response = $this->client->saveComponentSettings(array(
	            'in0'=>$settings
	        ))->out;
	        if($response->success && !empty($response->dataObject->componentSettings))
			{
				$cleanResponse = $response;
				return $cleanResponse;
			}
	    }
	    return false;
	}

	public function deleteComponentSettingByGroupId($id){
		if($this->client){
			$response = $this->client->deleteComponentSettingByGroupId(array(
					'in0'=>$id
			))->out;
			return $response;
		}
		return false;
	}

	public function deleteComponentSettingBySiteIdByTypeId($componentType){
		if($this->client){
			$response = $this->client->deleteComponentSettingBySiteIdByTypeId(array(
					'in0'=>$this->sess->siteId,
					'in1'=>$componentType
			))->out;
			if($response->success && !empty($response->dataObject->componentSettings))
			{
				$cleanResponse = $response;
				return $cleanResponse;
			}

			return null;
		}
		return false;
	}

	public function deleteComponentSettingById($componentSettingID){
		if($this->client){
			$response = $this->client->deleteComponentSettingById(array(
					'in0'=>$componentSettingID
			))->out;
			if($response->success && !empty($response->dataObject))
			{
				$cleanResponse = $response;
				return $cleanResponse;
			}

			return null;
		}
		return false;
	}
}
