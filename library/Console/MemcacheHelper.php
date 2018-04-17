<?php

/**
 * Memcahe Helper class for custom functions and implementations
 * This class will be responsible for custom Console memcache functionality
 * if needed for memcache.
 * 
 */
class Console_MemcacheHelper extends Console_Memcache {

    
    protected $sess;

    const CACHE_KEY_COMPONENT_SECTION_SUFFIX = 'componentSections';
    const CACHE_KEY_COMPONENT_NO_DATA = 'noDataForSite';

    /**
     * 
     * @param type $frontend
     * @param type $backend
     * @param type $frontendOptions
     * @param type $backendOptions
     * @param type $customFrontendNaming
     * @param type $customBackendNaming
     * @param type $autoload
     * @return type
     */
    public function __construct($frontend, $backend, $frontendOptions = array(), $backendOptions = array(), $customFrontendNaming = false, $customBackendNaming = false, $autoload = false) {
        return $this->init($frontend, $backend, $frontendOptions, $backendOptions, $customFrontendNaming, $customBackendNaming, $autoload);
    }

    /**
     * Customized function to return data from memcache
     * 
     * A generalized function to return data from memcache if memcache is enabled and asked to use, it also checks for the \n
     * requested service and class to return data dynamically as requested and put it in cache if enabled. If \n
     * memcache is turned off, it directly returns data from requested class and method.
     * 
     * @param object $serviceClass
     * @param string $serviceMethod
     * @param array $params
     * @param array $cacheKeyArr
     * @param boolean $useCache
     * @return type
     */
    public function getItemsFromCache($serviceClass, $serviceMethod, $params = array(), $cacheKeyArr = array(), $prefixSite = true, $useCache = true) {
       
        $response = false;
        $this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
        $classObj = (method_exists($this, $serviceMethod) == true && 
                $this->cacheEnabled() == true && $useCache == true) ? $this : $serviceClass;
        
        //$cacheKey = $this->sess->siteId . '_' . implode('_', array_filter($cacheKeyArr));
        $cacheKey = $this->prependSiteIdPrefix($prefixSite) . implode('_', array_filter($cacheKeyArr));
        
        if ($this->cacheEnabled() == true && $useCache == true) {
            
            if (($response = $this->getItemFromCache($cacheKey)) === false) {
                
                $response = call_user_func_array(array($classObj, $serviceMethod), $params);
                $this->putItemToCache($response, $cacheKey);
            } 
        } else {
            $response = call_user_func_array(array($classObj, $serviceMethod), $params);
        }

        return $response;
    }

    /**
     * Gets a list of components by section ID.
     * 
     * @param type $section
     * @param type $subsection
     * @return type
     */
    protected function getComponentsBySection($section, $subsection='') {
        
       if ($this->validateSectionsForSite($section, $subsection) === true)
            return null;
        
        $componentSectionData = $this->getComponentSettingsBySite();
        
        return array_values($componentSectionData[implode('_', array_filter(array($section, $subsection)))]);
    }
    
    /**
     * Gets a list of components by section ID and language.
     * 
     * @param type $section
     * @param type $subsection
     * @param type $language
     * @return type
     */
    protected function getComponentSettingsBySiteBySectionByLanguage($section, $subsection='',$language='') {

        if ($language == '')
            $language = $this->sess->siteConfigs['ConfigsDefaultLanguage'];
        
        if ($this->validateSectionsForSite($section, $subsection,$language) === true)
            return null;
        
        $componentSectionData = $this->getComponentSettingsBySite();
        
        return array_values($componentSectionData[implode('_', array_filter(array($section, $subsection, $language)))]);
    }
    
    /**
     * Gets all component for a site
     * @return type
     */
    protected function getComponentSettingsBySite(){
        
        $componentSM = new ComponentSoapModel();
        $componentData = $componentSM->getComponentSettingsBySite();
        
        return $this->processComponentData($componentData);
    }
    
    /**
     * 
     * @param type $componentData
     * @return type
     */
    protected function processComponentData($componentData){
        
        $componentSectionData = array();
        if (!empty($componentData)) {
            
            $componentSections = array();
            $i = 0;
            foreach ($componentData as $cData) {

                $componentSectionData[$cData->section][$i] = $cData;
                $componentSectionData[implode('_', array_filter(array($cData->section, $cData->language)))][$i] = $cData;
                $componentSectionData[implode('_', array_filter(array($cData->section, $cData->subSection)))][$i] = $cData;
                $componentSectionData[implode('_', array_filter(array($cData->section, $cData->subSection, $cData->language)))][$i] = $cData;
                $i++;
                
                $componentSections[$cData->section]['subSections'][] = $cData->subSection;
                $componentSections[$cData->section]['language'][] = $cData->language;
                
                $componentSections[$cData->section]['subSections'] = array_filter(array_unique($componentSections[$cData->section]['subSections']));
                $componentSections[$cData->section]['language'] = array_unique($componentSections[$cData->section]['language']);
            }

            $this->putItemToCache($componentSections, $this->prependSiteIdPrefix() . self::CACHE_KEY_COMPONENT_SECTION_SUFFIX);
            
            foreach ($componentSectionData as $key => $data) {
                $this->putItemToCache(array_values($data), $this->prependSiteIdPrefix() . $key);
            }
            
        } else {
            $this->putItemToCache($componentSectionData, $this->prependSiteIdPrefix() . self::CACHE_KEY_COMPONENT_NO_DATA);
        }

        return $componentSectionData;
    }
    
    /**
     * validates component sections,subsections and languages for a site in a combination.
     * 
     * @param type $section
     * @param type $subsection
     * @param type $language
     * @return boolean
     */
    protected function validateSectionsForSite($section, $subsection='',$language=''){
        
        $data = $this->getItemFromCache($this->sess->siteId . self::CACHE_KEY_COMPONENT_NO_DATA);
        
        if($data !== false && empty($data))
            return true;
        
        $cacheKeySection = $this->prependSiteIdPrefix() . self::CACHE_KEY_COMPONENT_SECTION_SUFFIX;
        $componentSections = $this->getItemFromCache($cacheKeySection);
        
        if($componentSections != null && !array_key_exists($section, $componentSections))
            return true;
        if($subsection != '' && $componentSections[$section]['subSections'] != null && !in_array($section, $componentSections[$section]['subSections']))
            return true;
        if($language != '' && $componentSections[$section]['language'] != null && !in_array($language, $componentSections[$section]['language']))
            return true;
        
        return false;
    }
    
    /**
     * Performs a check if site id need to be prefixed with cache key
     * @param type $prefixSite
     * @return type
     */
    private function prependSiteIdPrefix($prefixSite = true){
        
        return $prefixSite === true ? $this->sess->siteId . '_' : '';
    }

}
