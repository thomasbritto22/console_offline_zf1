<?php 
/**
 * Zend_Cache wrapper class
 * This class will be responsible for custom Constole functionality
 * if needed for memcache.
 * 
 */

class Console_Memcache extends Zend_Cache {
	
    
    protected $_memcache;
    const AUTOMATIC_SERIALIZATION = 'automatic_serialization';


    /**
     * Constructor to intiantiate caching object
     * 
     * @param type $frontend
     * @param type $backend
     * @param type $frontendOptions
     * @param type $backendOptions
     * @param type $customFrontendNaming
     * @param type $customBackendNaming
     * @param type $autoload
     * @return Zend_Cache_Core|Zend_Cache_Frontend
     */
    public function init($frontend, $backend, $frontendOptions = array(), $backendOptions = array(), $customFrontendNaming = false, $customBackendNaming = false, $autoload = false)
    {
        $this->_memcache = parent::factory($frontend, $backend, $frontendOptions, $backendOptions, $customFrontendNaming, $customBackendNaming, $autoload);
        return $this->_memcache;
    }
    
    /**
     * Function to save an item to cache
     * 
     * @param type $data
     * @param type $id
     * @param type $tags
     * @param type $specificLifetime
     * @param type $priority
     */
    public function putItemToCache($data, $id = null, $tags = array(), $specificLifetime = false, $priority = 8){
        
//        if(is_array($data))
//            $this->_memcache->setOption(self::AUTOMATIC_SERIALIZATION, true);
        
        $cacheKey = $this->getKey($id);
        $this->_memcache->save($data, $cacheKey, $tags, $specificLifetime, $priority);
    }
    
    /**
     * Function to retrieve item from cache if found, for a given key, else returns false
     * 
     * @param string $key
     * @return boolean|$data
     */
    public function getItemFromCache($key){
        
        if ($key != null && ($data = $this->_memcache->load($this->getKey($key))) !== false) {
            
            //return unserialize($data) != false ? unserialize($data) : $data;
            return $data;
        }
        
        return false;
    }
    
    /**
     * Check if an item exist in cache
     * 
     * @param string $key
     * @return boolean
     */
    public function itemExist($key){
        
        $cacheKey = $this->getKey($key);
        return false !== $this->_memcache->load($cacheKey);
    }
    
    /**
     * Clean some cache records
     *
     * Available modes are :
     * Zend_Cache::CLEANING_MODE_ALL (default)    => remove all cache entries ($tags is not used)
     * Zend_Cache::CLEANING_MODE_OLD              => remove too old cache entries ($tags is not used)
     * Zend_Cache::CLEANING_MODE_MATCHING_TAG     => remove cache entries matching all given tags
     *                                               ($tags can be an array of strings or a single string)
     * Zend_Cache::CLEANING_MODE_NOT_MATCHING_TAG => remove cache entries not {matching one of the given tags}
     *                                               ($tags can be an array of strings or a single string)
     * Zend_Cache::CLEANING_MODE_MATCHING_ANY_TAG => remove cache entries matching any given tags
     *                                               ($tags can be an array of strings or a single string)
     *
     * @param  string $mode Clean mode
     * @param  array  $tags Array of tags
     * @return boolean true if no problem
     */
    public function clean($mode = 'all', $tags = array()){
        $this->_memcache->clean($mode, $tags);
    }
    
    /**
     * Function to md5 cache key
     * 
     * @param type $key
     * @return string md5
     */
    public function getKey($key) {

        return md5($key);
    }
    
    public function cacheEnabled(){
        return MEMCACHE_ENABLED;
    }
    
    /**
     * Remove a cache
     *
     * @param  string $id Cache id to remove
     * @return boolean True if ok
     */
    public function remove($id){
        $cacheKey = $this->getKey($id);
        return $this->_memcache->remove($cacheKey);
    }
}