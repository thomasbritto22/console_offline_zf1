<?

require_once ("../application/soapModels/CatalystService/ReviewAndRating.php");

/**
 * Action Helper for Breadcrumb
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_AverageRating extends Zend_Controller_Action_Helper_Abstract {

    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct($config=null){

        $this->_config = array(
            'systemId' => null,
            'showTotals' => true,
            'size' => 'std',
        	'numRevComment' => '',
        	'siteLabels'=> array()
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
    public function direct($config = null, $extController = null){
        $this->__construct($config);

        $this->_controller = $this->_actionController;
		if(isset($extController)) $this->_controller = $extController;

        return $this->buildAverageRating($config);
    }

    /**
     * --- BUILD AVERAGE RATING ---
     * This is the main function that builds the average rating control,
     * and builds the other controls for the average rating tooltip. It passes
     * both to a view and returns the resulting rendered HTML.
     */
    public function buildAverageRating($config){
        $reviewAndRatingService = new ReviewAndRatingSoapModel();
    	$averageRating = $reviewAndRatingService->getModuleAverageRatings($this->_config['systemId']);

    	// by default we will set the reviews to show 0.
    	// we can do this by initing our $mainRating var
    	// here, and setting its rating value to 0.
    	$mainRating = (object) array(
    	    'rating' => 0
    	);

        // the config array already has our rating data in it, so we don't
        // need to query for it again. The first thing we need to do is pull
        // out the 'overall' category. This will be the replacement for our
        // main rating, which is immediately visibl to users. We can find
        // this value, because it is the only one where 'isLibrary' = 2.
        if(!empty($averageRating->averageRatingDTOList)){
            foreach($averageRating->averageRatingDTOList as $r){
                if($r->isLibrary == '2'){
                    $mainRating = $r;
                }
            }
        }

        // now use the main rating data to create the main rating control
        // this is the one that shows up on the page, with the total # and tooltip arrow.
        $mainRatingConfig = array(
            'displayOnly' => true,
            'displayTitle' => false,
            'size' => $this->_config['size'],
            'showTotals' => true,
            'rating' => $mainRating->rating
        );
        $mainRatingControl = Zend_Controller_Action_HelperBroker::getStaticHelper('ratingsControl');
        $this->_controller->view->mainRatingControl = $mainRatingControl->direct($mainRatingConfig, $this->_controller);

        // now that we have a control for the users to see, we need to
        // add the tooltip so the user can see the other ratings that were
        // left by the user. This tooltip also includes the main rating again.
        $tooltipControls = "";
        if(!empty($averageRating->averageRatingDTOList)){

            // order the tooltip rating types by isLibrary,
            // with types that = 2 are at the top. This is mostly
            // to make sure that "overall" is at the top of the list.
            $sortArr = array();
            foreach($averageRating->averageRatingDTOList as $k=>$r){ $sortArr[$k] = $r->isLibrary; }
            array_multisort($sortArr, SORT_DESC, $averageRating->averageRatingDTOList);

            foreach($averageRating->averageRatingDTOList as $d){
                $ttConfig = array(
                    'name' => $config['siteLabels'][str_replace(' ','',$d->name)],
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
        $delimiter = '%';
        $totalRatings = '';
        if(preg_match('/'.$delimiter.'numreviews'.$delimiter.'/',$this->_config['numRevComment'],$array)){
        	$totalRatings = (str_replace(($delimiter.'numreviews'.$delimiter),$averageRating->totalRatings,$this->_config['numRevComment']));
        }
        // finally, pass the totals to the view as well.
        $this->_controller->view->totalRatings = $totalRatings;
        $this->_controller->view->featuredRatings  = $config['siteLabels']['FeaturedRatings'];

        // return back a rendered HTML script with the average rating and the tooltip rating controls
        return $this->_controller->view->render('reviews/averageRating.phtml');
    }
}
?>