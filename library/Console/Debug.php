<?php 
/**
 *  
 * This class will be responsible for to define RAM constants
 *  
 */

class Debug {
	
	public static $logMessages = array();
	
	public static function log ($message) {
		
		array_push (self::$logMessages, ("Php log: " . Zend_Json_Encoder::encode($message)));	
	}
}