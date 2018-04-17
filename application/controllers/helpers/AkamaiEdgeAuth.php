<?php
/**
 * Action Helper for ratings control
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_AkamaiEdgeAuth extends Zend_Controller_Action_Helper_Abstract {
	private $SECONDS_IN_DAY = 0;
	public $DEFAULT_AUTH_TERM = 0;
	
	private $EDGE_COOKIE_DOMAIN_PREFIX = 'course';
	private $EDGE_COOKIE_NAME          = 'edge-auth';
	private $EDGE_PRIVATE_KEY          = 'Eeewj/oJZxZyeH4kRKcoZAQvT0oXJ0oHjAGuIWFezH7MwhMiY7KKq7XJoLy6iPInL';
	
	private $PROXY_COOKIE_NAME         = 'proxy-auth';
	private $PROXY_COOKIE_VALUE        = 'P5Mj+yKBQIWEQ+yvKXSa0sAU8/ooOEWzxBV5H7A9gjZzgZrijhvteEDd/PXnaYXQ1';
	
	private $EXPIRES = 0;
	private $EDGE_AUTHEN_MD5 = '';
	
	
	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct() {
		$this->SECONDS_IN_DAY = 24 * 60 * 60;
		$this->DEFAULT_AUTH_TERM = $this->SECONDS_IN_DAY * 2;
		
		$this->EXPIRES = time() + $this->DEFAULT_AUTH_TERM;
	}
	
	public function getCookieValue($coursePaths) {
	    $cookieData = array();
	    $cookieData['access'] = array();
	    
	    // does the edge-auth cookie already exist
	    if(isset($_COOKIE['edge-auth'])) {
	        // separate the existing cookie data
	        $cookieData = explode('~', $_COOKIE['edge-auth']);
	        
	        // new array to pull apart the existing cookie data
	        $newCookieData = array();
	        
	        // loop through the existing cookie data
	        foreach($cookieData as $v) {
	            // separate the items again by the equals character
	            $eqItems = explode('=', $v);
	            
	            // if the array is greater than 1
	            if(count($eqItems) > 1) {
	                // add the broken down cookie items
	                // to the new cookie data
    	            $newCookieData[$eqItems[0]] = $eqItems[1];
    	            
    	            // explode by '!' the right side of the data that was
    	            // originally separated by '='
    	            $exItems = explode('!', $eqItems[1]);

    	            // store the exploded data as individual elements
    	            // in a hash, so that a path is only used once in
    	            // the cookie
    	            $newData = array();
    	            
    	            // if there are more than 1 items in the array
    	            // (there was actually a '!' to split the data around)
	                if(count($exItems) > 1) {
	                    // loop through each item
	                    foreach($exItems as $w) {
	                        // add the item as the key and value (hash-like)
	                        $newData[md5($w)] = $w;
	                    }
	                    // overwrite the string data in the new cookie data
	                    // with the broken down array/hash
    	                $newCookieData[$eqItems[0]] = $newData;
	                }
	            }
	        }
	        
	        // overwrite the original cookie data with the new, broken-down data
	        $cookieData = $newCookieData;
	    }
	    //*/
	    // add each of the course paths from the myQueue list
	    // to the hash
	    if(!isset($cookieData['access']) || !is_array($cookieData['access'])) {
	        $cookieData['access'] = array();
	    }
	    foreach($coursePaths as $v) {
	        $cookieData['access'][md5($v)] = $v;
	    }
	    
	    $access = '';
	    // join all of the path data with a separating '!'
	    if(is_array($cookieData['access']) && count($cookieData['access']) > 0) {
		    $access = implode('!', $cookieData['access']);
	    }
		
		// calculate the md5 hash
		$md5 = md5($this->EXPIRES.$access.$this->EDGE_PRIVATE_KEY);
		
		// join the expiration date, path list, and md5 hash value with '~'
		return implode('~', array("expires=$this->EXPIRES", "access=$access", "md5=$md5"));
	}
	
	public function setEdgeAuthCookie($coursePaths) {
		$cookieValue = $this->getCookieValue($coursePaths);
	    $domain = '.lrn.com';
		
// 	    if(stripos($_SERVER['HTTP_HOST'],'.qa7.') !== false){
// 	    	$domain = '.qa7.lrn.com';
// 	    }
        
// 		if( preg_match('/^.+(\.\w+\.lrn\.com).*$/', $_SERVER['HTTP_HOST'], $matches) &&
// 		    !strpos($_SERVER['HTTP_HOST'], '.dev3') ) {
// 			$domain = $matches[1];
// 		}
	    
		setcookie( $this->EDGE_COOKIE_NAME, 
					$cookieValue, 
					$this->EXPIRES, 
					'/', 
					$domain,  
                                        COOKIE_SECURE, 
                                        COOKIE_HTTPONLY);//*/
		return $cookieValue;
	}
	
	public function setCourseEdgeAuthCookie($domain, $coursePath){
	   $this->EDGE_AUTHEN_MD5 = md5($this->EXPIRES.$coursePath.$this->EDGE_PRIVATE_KEY);
	   
	   //remove existing cookie if existed
	   //$this->deleteCourseEdgeAuthCookie($domain);
	   
	   $edgeAuthValue = '';
	   $edgeAuthValue .= 'expires=' .$this->EXPIRES. '~';
	   $edgeAuthValue .= 'access=' .$coursePath. '~';
	   $edgeAuthValue .= 'md5=' .$this->EDGE_AUTHEN_MD5;
	   
	   $value = setcookie(
	      $this->EDGE_COOKIE_NAME,
      	  $edgeAuthValue,
      	  0,
      	  '/',
      	  $domain,
          COOKIE_SECURE, 
          COOKIE_HTTPONLY
	   );
	}
	
	public function deleteCourseEdgeAuthCookie($domain){
	   
	   if(isset($_COOKIE[$this->EDGE_COOKIE_NAME])) {
	   //   unset($_COOKIE[$this->EDGE_COOKIE_NAME]);
	      setcookie($this->EDGE_COOKIE_NAME, 'deletePath', 0, '/', $domain,  COOKIE_SECURE, COOKIE_HTTPONLY);
	   }
	   
	}
	
	public function direct()
	{
	   
	}
}
?>