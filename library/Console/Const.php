<?php 
/**
 *  
 * This class will be responsible for to define Constole constants
 *  
 */

class Console_Const {
	//  This class will be used to define constants
	
	const ACTIVE = '1';
	const INACTIVE = '0';
	
	public function init(){
		
		@define('_ONE', '1');
		@define('_ZERO', '0');
		
	
		// Variable required for configure entity .
		// Acvtived Entity
		@define('ACTIVE', _ONE);
		// Deacvtived Entity
		@define('INACTIVE', _ZERO);
		
	}
}

?>
