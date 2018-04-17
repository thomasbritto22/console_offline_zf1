<?php
/**
 * Action Helper for ratings control
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_RatingsControl extends Zend_Controller_Action_Helper_Abstract {
	// set up the default values.
	private $_config = array(
		'id' => 'ratingControl',
		'rating' => 0,
		'displayOnly' => false,
		'size' => 'std', // 'std', 'med', or 'mini'
		'showLabel' => false,
		'caption' => null,
		'name' => null,
		'displayTitle' => true,
		'position' => null,
		'ratingTypeId' => null,
		'siteRatingTypeId' => null,
		'status' => 'active'
	);
	
	//create a set of labels that we can add language context
	//to the different rating levels
	private $_ratingLabels = array(
		"(No Rating)",
		"Did not meet expectations",
		"Barely met expectations",
		"Met expectations",
		"Exceeded expectations",
		"Greatly exceeded expectations"
	);
	
	// create a variable we can use to append and place in the UI.
	private $_control = null;
	private $_roundBy = 0.5;
	private $_summaryControl = false;
	
	/**
	 * Constructor: initialize plugin loader
	 *
	 * @return void
	 */
	public function __construct($config="") {
		$this->setConfigs($config);
	}
	
	/**
     * --- DIRECT - HELPER BROKER METHOD ---
     * Useful when we need to call this method directly,
     * or use a helper broker from within another action helper.
     *
     * @param  array $config
     * @param  object $extController
     * @return RatingControl
     */
	public function direct($config, $extController = null, $summaryControl = false)	{
		$this->__construct($config);
		
		$this->_controller = $this->_actionController;
		$this->_summaryControl = $summaryControl;
		
		if(isset($extController)) $this->_controller = $extController;
		
		return $this->buildControl();
	}
	
	/**
	 * --- BUILD CONTROL ---
	 * This builds the control that we can use and append to the DOM.
	 * Also, handles implementing the configuration values to affect
	 * the outcome of the UI (size, displayOnly, showLabel, etc.).
	 *
	 * @return string
	 */
	public function buildControl() {
	    
	    // prepare information by passing it to the view
	    $this->_controller->view->config = $this->_config;
		$this->_controller->view->ratingLabels = $this->_ratingLabels;
		$this->_controller->view->summaryControl = $this->_summaryControl;
		
		// render the HTML for this control and assign it to a variable we can use later.
		$this->_control = $this->_controller->view->render('helpers/ratingsControl.phtml');
		
		return $this->_control;
	}
	
    /**
     * --- SET CONFIGS ---
     * Set config values from passed array
     *
     * @return void
     */
    public function setConfigs($config) {
    	// if any config values are passed in, override defaults
    	if(!empty($config)) {
    		foreach($config as $k => $c) {
    			$this->_config[$k] = $c;
    		}
    	}
    	
    	// round the passed value to the 1st decimal place by $this->_roundBy
    	if(!empty($this->_config['value'])){
    		$this->_config['value'] = round($this->_config['value']/$this->_roundBy) * $this->_roundBy;
    	}
    }
    
	/**
	 * --- UPDATE VALUE ---
	 * This updates the control value to display the correct rating.
	 * @param value
	 * @returns
	 *
	public function updateValue($val) {
		// round the passed value to the 1st decimal place by $roundBy
		$val = round($val/$this->_roundBy) * $this->_roundBy;
		
		$this->_config['value'] = $val;
		
		$this->buildControl();
	}*/

	
}