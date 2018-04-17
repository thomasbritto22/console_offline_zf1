<?

require_once ("../application/soapModels/CatalystService/ReviewAndRating.php");

/**
 * Action Helper for Breadcrumb
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_UserRating extends Zend_Controller_Action_Helper_Abstract {

    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct($config=null){
        
        $this->_config = array(
            'systemId' => null,
            'ratingData' => null,
        	'siteLabels' => null,
        );
        
        // if any config values are passed in, override defaults
        if(!empty($config)) {
            foreach($config as $k => $c) {
                $this->_config[$k] = $c;
            }
        }
    }
    
    /**
     * --- DIRECT - HELPER BROKER METHOD ---
     * Useful when we need to call this method directly,
     * or use a helper broker from within another action helper.
     *
     * @param  array $config
     * @return AverageRating
     */
    public function direct($config = null, $extController = null, $siteLabel = null){
        $this->__construct($config);
        
        //set SiteLabel
        $this->_config['siteLabels'] = $siteLabel;
        
        $this->_controller = $this->_actionController;
		if(isset($extController)) $this->_controller = $extController;
        
        return $this->buildUserRating();
    }
    
    /**
     * --- BUILD USER RATING ---
     * This is the main function that builds the user rating control,
     * and builds the other controls for the average rating tooltip. It passes
     * both to a view and returns the resulting rendered HTML.
     */
    public function buildUserRating(){

        

        
        // now that we have a control for the users to see, we need to
        // add the tooltip so the user can see the other ratings that were
        // left by the user. This tooltip also includes the main rating again.
        $tooltipControls = "";
        
        if($this->_config['ratingData']){
            // order the tooltip rating types by isLibrary,
            // with types that = 2 are at the top. This is mostly
            // to make sure that "overall" is at the top of the list.
            $sortArr = array();
            foreach($this->_config['ratingData'] as $k=>$r){ $sortArr[$k] = $r->position; }
            
            // we should find out where 'ratingData' is coming from and make it always an array
            // that is a better solution for this and the correct one.
            if(is_array($this->_config['ratingData'])){
              array_multisort($sortArr, SORT_ASC, $this->_config['ratingData']);  
            } 
            
            // now loop through and create controls
            foreach($this->_config['ratingData'] as $d){
            	$labelKeyName = str_replace(' ', '', $d->ratingTypeName);
                $ttConfig = array(
                    'name' => isset($this->_config['siteLabels'][$labelKeyName]) ? $this->_config['siteLabels'][$labelKeyName] : $d->ratingTypeName,
                    'displayOnly' => true,
                    'displayTitle' => true,
                    'size' => "mini",
                    'rating' => $d->rating
                );
                
                $control = Zend_Controller_Action_HelperBroker::getStaticHelper('ratingsControl');
                $tooltipControls .= $control->direct($ttConfig, $this->_controller);
            }
        }
        $this->_controller->view->tooltipControls = $tooltipControls;
       
        
        // the config array already has our rating data in it, so we don't
        // need to query for it again. The first thing we need to do is pull
        // out the 'overall' category. This will be the rating that we apply
        // to the control that is immediately visible to others. We can find
        // this value, because it is the only one where 'isLibrary' = 2.
        if(!is_array($this->_config['ratingData'])) $this->_config['ratingData'] = array($this->_config['ratingData']);
        foreach($this->_config['ratingData'] as $r){
           if($r->isLibrary == '2'){
              $mainRating = $r;
           }
        }
        // now use the main rating data to create the main rating control
        $mainRatingConfig = array(
                 'displayOnly' => true,
                 'displayTitle' => false,
                 'size' => 'med',
                 'rating' => $mainRating->rating
        );
        $mainRatingControl = Zend_Controller_Action_HelperBroker::getStaticHelper('ratingsControl');
        $this->_controller->view->mainRatingControl = $mainRatingControl->direct($mainRatingConfig, $this->_controller, true);
        
        // return back a rendered HTML script with the average rating and the tooltip rating controls
        return $this->_controller->view->render('reviews/userRating.phtml');
    }
}
?>