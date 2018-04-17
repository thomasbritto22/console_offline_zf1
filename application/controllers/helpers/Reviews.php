<?
require_once ("../application/soapModels/LRNService/User.php");
require_once ("../application/soapModels/LRNService/Modules.php");
require_once ("../application/soapModels/CatalystService/ReviewAndRating.php");

/**
 * Action Helper for Module Reviews (possibly all reviews w/ filter)
 *
 * @uses Zend_Controller_Action_Helper_Abstract
 */
class Helpers_Reviews extends Zend_Controller_Action_Helper_Abstract {

    /**
     * Constructor: initialize plugin loader
     *
     * @return void
     */
    public function __construct($config=""){
        // if any config values are passed in, override defaults
        if(!empty($config)) {
            foreach($config as $k => $c) {
                $this->_config[$k] = $c;
            }
        }
    }
    
    /**
     * Strategy pattern: call helper as broker method
     *
     * @param  array $config
     * @return Reviews UI
     */
    public function direct(){
        $this->__construct();
        return $this->buildReviewList();
    }
    
    /**
     * --- BUILD REVIEW FORM ---
     * Primarily responsible for creating a form view for posting
     * reviews and ratings. This method also checks if the current user
     * has previously left a review, and if so, prepopulates the form.
     * There is only one review per module per user.
     * @param integer $systemId
     * @param integer $userId
     */
    public function buildReviewForm($systemId, $userId, $siteLabels){
        // use service to check if user can review this course
        // meaning they have taken this course before.
        $modulesService = new ModulesServiceSoapModel();
        $completions = $modulesService->getModulesTaken();
        
        // users cannot participate until they have completed the course
        $userCanParticipate = false;
        
        foreach((array)$completions as $c){
            if($c->systemId == $systemId){
                $userCanParticipate = true;
            }
        }
        
        // also grab permissions for rating and reviewing specifically
        $utilHelper = Zend_Controller_Action_HelperBroker::getStaticHelper('Util');
        $userCanReview = $utilHelper->getComponentToggle('reviews');
        $userCanRate = $utilHelper->getComponentToggle('ratings');
        
        $this->_actionController->view->userCanReview = $userCanReview;
        $this->_actionController->view->userCanRate = $userCanRate;
        
        // grab the current user's review and ratings (if any)
        $reviewAndRatingService = new ReviewAndRatingSoapModel();
        $userReviewObj = $reviewAndRatingService->getUserReviewAndRating($systemId);
        
        // add the rating and review to the view, if we have them
        if(!empty($userReviewObj->rating)){
            $rating = $userReviewObj->rating;
            $this->_actionController->view->rating = $rating;
        }
        if(!empty($userReviewObj->review)){
            $review = $userReviewObj->review;
            $this->_actionController->view->review = $review;
        }
        
        // get the list of rating types (categories) this site has.
        // By default there is 'Overall', 'Design', 'Content Writing' and 'Relevancy'.
        // We use the current site list of rating types,
        // NOT the list of types that the user has left ratings for. !IMPORTANT
        $ratingTypes = $reviewAndRatingService->getSiteRatingTypes();
        
        if(!empty($ratingTypes)){
            // Controls for rating form
            // pass off the building of the rating controls to another function.
            // that way we can have a little more control over what kind of control
            // we want. For the form, they need to be interactive (displayOnly = false)
            // but for the prepop, they need to be display only (displayOnly = true)
            // we may also want to make them look different (size = 'std|med').
            $formControls = $this->buildRatingControls(
                $ratingTypes,
                (!empty($userReviewObj->rating) ? $userReviewObj->rating : null),
                array(
                    'displayOnly' => false,
                    'size' => 'std'
                ),$siteLabels
            );
            $this->_actionController->view->formRatingControls = $formControls['ratingControlString'];
            
            // controls for prepop
            $prepopControls = $this->buildRatingControls(
                $ratingTypes,
                (!empty($userReviewObj->rating) ? $userReviewObj->rating : null),
                array(
                    'displayOnly' => true,
                    'size' => 'std'
                ),$siteLabels
            );
            $this->_actionController->view->prepopRatingControls = $prepopControls['ratingControlString'];
        }
            
        // set up which views are going to be passed to the client.
        // this is important because although we can hide them all via css
        // we do not want users to even have an opportunity to do something
        // they shouldn't do.
        $this->_actionController->view->showIntro = false;
        $this->_actionController->view->showNoCompletion = false;
        $this->_actionController->view->showForm = true; // we are always showing the form (except when no completion)
        $this->_actionController->view->showPrepop = false;
        $this->_actionController->view->showVerify = false;
        
        // if the user has just completed a course, show the intro
        if(strpos($_SERVER['REQUEST_URI'], 'viewcertificate')){
            $this->_actionController->view->showIntro = true;
        }
        
        // if the user has already reviewed or rated this course,
        // include prepop and verification views.
        if(!empty($review) || !empty($rating)){
            $this->_actionController->view->showPrepop = true;
            $this->_actionController->view->showVerify = true;
        }
        
        // if we are not at the view certificate page
        // then it is likely we are at the module reviews page.
        // if the user does not have a previous review
        // then it is likely they have not taken this course.
        // in that case, show the noCompletion view
        $url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : $_SERVER['REQUEST_URI'];
        
         
        if(!$userCanParticipate) {
            // do not include the form if the user has not yet completed the course.
            $this->_actionController->view->showForm = false;
            
            // make sure to show the noCompletion view.
            $this->_actionController->view->showNoCompletion = true;
        }
        
        // pass any necessary variables to the view
        $this->_actionController->view->systemId = $systemId;
        
        // return the rendered form view
        return $this->_actionController->view->render('reviews/form.phtml');
    }
    
    /**
     * --- BUILD REVIEW LIST ---
     * Responsible for getting the Rating/Reviews for this module
     * and then generating a view of the list.
     * @param integer $systemId
     * @param integer $siteId
     * @return string
     */
    public function buildReviewList($systemId,$siteLabels){
        $reviewAndRatingService = new ReviewAndRatingSoapModel();
        $moduleReviews = $reviewAndRatingService->getModuleReviewsAndRatings($systemId);
        
       if(!empty($moduleReviews)){
            foreach ($moduleReviews as $reviewObj){
                $reviewList[] = $this->convertReviewAndRatingObject($reviewObj, $systemId,$siteLabels);
            }
            $this->_actionController->view->reviewList = $reviewList;
        }
        
        return $this->_actionController->view->render('reviews/list.phtml');
    }
    
    /**
     * --- CONVERT REVIEW AND RATINGS OBJECT ---
     * This method converts our reviewDTO and our ratingDTO into a single review
     * object. This object is added to others to create the review list. We also
     * take the liberty of converting rating data into the rating control and
     * rating control tooltip for each user.
     * @param stdObject $reviewAndRating
     * @return multitype:NULL multitype:NULL
     */
    public function convertReviewAndRatingObject($reviewAndRating, $systemId,$siteLabels) {
        // pull the review and rating data from our data object
        $reviewData = $reviewAndRating->reviewDTO;
        $ratingData = (isset($reviewAndRating->ratingDTOList->RatingDTO)) ? $reviewAndRating->ratingDTOList->RatingDTO : array();
        //make sure data is alway the array
        if (!is_array($ratingData)){
           $ratingData = array($ratingData);
        }
        
        $userId = $reviewData->userId;
        
        // use the user service to get user info for the reviewer
        $userService = new UserServiceSoapModel();
        $userData = $userService->getAuthenticatedUserDetails($userId);
        // var_dump($reviewData);
        // exit();
        if(!empty($reviewData)){
            // figure out which date we want to show
            $reviewDate = $reviewData->createDate;
            if(isset($reviewData->updateDate)) $reviewDate = $reviewData->updateDate;
            
            // create an object for this review and return it.
            // it will be appended to a larger object and returned to JS.
            // changing 'helpful' names here as the the names used by services do not appear to be related
            $reviewAndRatingObj = array(
                'id' => $reviewData->id,
                'reviewText' => $reviewData->review,
                'reviewTime' => $this->getDateFormat($reviewDate,$siteLabels),
                'helpfulCount' => $reviewData->reviewHelpfulResponses,
                'totalHelpfulCount' => $reviewData->totalReviewResponses,
                'commentThreadId' => $reviewData->commentThreadId,
                'cName' => $reveiwData->systemId,
            	'reviewer'=> array(
                    'id' => $userId,
                    'username' => $userData->username,
                    'firstName' => $userData->firstName,
                    'lastName' => $userData->lastName//,
                    //'isCurrentUser' => ($userId == $this->getLoggedInUser()->userId)
                )
            );
        }
        else{
            $reviewAndRatingObj = array(
            	'reviewer'=> array(
                    'id' => $userId,
                    'username' => $userData['username'],
                    'firstName' => $userData['firstName'],
                    'lastName' => $userData['lastName']//,
                    //'isCurrentUser' => ($userId == $this->getLoggedInUser()->userId)
                )
            );
        }
        
        // store the ratings data and convert it into actual rating controls.
        //XXX we may need to reorder based on ->position
        if(!empty($ratingData)){
            //sending ratings data along with review
            $reviewAndRatingObj['ratings'] = $ratingData;
                            
            // add the rating control to show the average ratings
    		// for this module. This will also include the tooltip
        	$userRatingConfig = array(
    			'systemId' => $systemId,
        	    'ratingData' => $ratingData
        	);
        	
        	$ratingsControl = Zend_Controller_Action_HelperBroker::getStaticHelper('UserRating');
        	$reviewAndRatingObj['ratingControl'] = $ratingsControl->direct($userRatingConfig, $this->_actionController, $siteLabels);
        }
        
        if($reviewData || $ratingData) return $reviewAndRatingObj;
    }
    
    /**
     * --- BUILD RATING CONTROLS ---
     * For each rating type (category), we need a separate rating control.
     * we are going to use the types that the admin has set up
     * and IF we have user data, we will represent that. Otherwise
     * just show a rating control with 0 rating. This will let the
     * user to go back and enter a value for that type, if they want to.
     *
     * @param unknown_type $ratingTypes The list of site rating types from service.
     * @param unknown_type $config Any changes to the configs we want to make (only size and displayOnly for now)
     */
    public function buildRatingControls($ratingTypes, $userRating, $config,$siteLabels=''){
    
        $ratingControlObj = array();
        $ratingControlString = '';
        
        if(!is_array($ratingTypes)) $ratingTypes = array($ratingTypes);
        
        // order the tooltip rating types by isLibrary,
        // with types that = 2 are at the top. This is mostly
        // to make sure that "overall" is at the top of the list.
        $sortArr = array();
        foreach($ratingTypes as $k=>$r){ $sortArr[$k] = $r->position; }
        array_multisort($sortArr, SORT_ASC, $ratingTypes);
        
        foreach($ratingTypes as $r){
            
            // by default, we are going to use values
            // from the ratings type table, with 0 rating.
            $ratingValueObj = $r;
            $ratingValueObj->rating = 0;
            
            // find out if this rating type has been set by the user
            // if it has, update the rating value. that is the only important piece
            if(!empty($userRating)){
                if(!is_array($userRating)) $userRating = array($userRating);
                foreach($userRating as $ur){
                    if($ur->siteRatingTypeId == $r->siteRatingTypeId){
                        $ratingValueObj->rating = $ur->rating;
                        break;
                    }
                }
            }
            
            // setup the configs for this particular control
            $rcConfig = array(
                'displayOnly' => (!empty($config['displayOnly']) ? $config['displayOnly'] : 'false'),
    			'displayTitle' => true,
    			'size' => (!empty($config['size']) ? $config['size'] : "std"),
                'caption' => '',
    			'isLibrary' => $ratingValueObj->isLibrary,
    			'name' => $siteLabels[str_replace(' ','',$ratingValueObj->name)],
    			'position' => $ratingValueObj->position,
    			'ratingTypeId' => $ratingValueObj->ratingTypeId,
    			'siteRatingTypeId' => $ratingValueObj->siteRatingTypeId,
    			'status' => $ratingValueObj->status,
    			'rating' => $ratingValueObj->rating
            );
            // grab an instance of the rating control and use for this particular rating type
            $rc = Zend_Controller_Action_HelperBroker::getStaticHelper('ratingsControl');
            $ctrl = $rc->direct($rcConfig, $this->_actionController);
            
            // if this control has an 'isLibrary' property of 2, than it
            // should automatically be at the top, we will push it in manually.
            // otherwise, just add this control to the end
            if($r->isLibrary == 2) array_unshift($ratingControlObj, $ctrl);
            else $ratingControlObj[] = $ctrl;
            
            // add this control to the form via a view variable
            $ratingControlString .= $ctrl;
        }
        
        return array(
            'ratingControlObj' => $ratingControlObj,
            'ratingControlString' => $ratingControlString
        );
    }
    
    /**
     * --- GET DATE FORMAT FOR REVIEWS ---
     * change the date reported by services to a
     * desired format. we are calling it 'postDate' because
     * it is either the create date OR the update date.
     * @param date $reviewDate
     */
   public function getDateFormat ($reviewDate,$siteLabels) {
       // do calculations based on seconds since posted
       // use "c" instad of "Y-m-d" so that we can account for seconds and for GMT offset.
       $secondsDiff = abs(strtotime(date("c")) - strtotime($reviewDate));
       $minutesDiff = floor($secondsDiff / 60);
       $hoursDiff = floor($secondsDiff / 3600);
       
       //between zero and 59 seconds -- : i.e post �Just now� (less than a minute ago)
       if($secondsDiff < 60) $postDate = $siteLabels['JustNow'];
       
       //between one minute and 00:59:59  -- : i.e post �(x) minutes ago�, like �47 minutes ago� (less than an hour ago),
       
       if($minutesDiff > 0 && $minutesDiff < 60){
          $timeTxt = $siteLabels['MinutesAgo'];
          $postDate = str_replace("%minutesDiff%", $minutesDiff, $timeTxt);;
       }       
       
       //between one hour and 23:59:59  -- : i.e post �(x) hours ago�, like �3 hours ago� (less than a day ago),
       if($minutesDiff >= 60 and $hoursDiff < 24){
          $timeTxt = $siteLabels['HoursAgo']; 
          $postDate = str_replace("%hoursDiff%", $hoursDiff, $timeTxt);;
       }
       
       if($hoursDiff >= 24){
          $month = $siteLabels[date('M', strtotime($reviewDate))];
          $dateString = date('%\m% d, Y', strtotime($reviewDate));
          $dateString = str_replace('%m%', $month, $dateString);
          $postDate = $dateString;
       }
       
       return $postDate;
   }
}
?>