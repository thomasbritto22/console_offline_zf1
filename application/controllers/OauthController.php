<?php
require_once ("../application/soapModels/CatalystService/SocialMedia.php");
require_once ("../application/model/TwitterAPIExchange.php");
/**
 * Auth Controller using Zend's MVC implementation.
 *
 *
 */

class OauthController extends ApplicationController {
	private $json;
	private $filename = '../data/json/twitter.json';
    public function init() {
		parent::init();
		$this->json = json_decode(file_get_contents($this->filename));
		//$this->getResponse()->setHeader('Content-Type', 'application/json');
		// add auth specific css
		$this->view->headLink()->appendStylesheet('/css/auth.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet('/css/widgets/ResourceCenter.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet('/css/widgets/Camera.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet('/css/widgets/Dialog.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet('/css/widgets/MediaElementPlayer.css?'.FILES_VERSION);
		$this->view->headLink()->appendStylesheet('/css/widgets/mejs-skins.css?'.FILES_VERSION);

		// add required js components/plugins/etc.
		// include ddslick for our language selection dropdown
        $this->view->headScript()->appendFile('/js/widgets/jquery.ddSlick.js', 'text/javascript');
        $this->view->headScript()->appendFile('/js/widgets/Camera.js?'.FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile('/js/widgets/Dialog.js?'.FILES_VERSION, 'text/javascript');
        $this->view->headScript()->appendFile('/js/widgets/MediaElementPlayer.js?'.FILES_VERSION,'text/javascript');
        $this->view->headScript()->appendFile('/js/apps/twitter.js?'.FILES_VERSION, 'text/javascript');
        // add tooltipster css
        $this->view->headLink()->appendStylesheet('/css/tooltipster.css');
        $this->view->headLink()->appendStylesheet('/css/tooltipsterThemes/tooltipster-light.css');
        //include tooltipster.js
        $this->view->headScript()->appendFile('/js/jquery/jquery.tooltipster.min.js', 'text/javascript');
        
        // add auth specific javascript
		$this->view->headScript()->appendFile('/js/apps/Auth.js?'.FILES_VERSION, 'text/javascript');

		// set the layout to welcomepage_layout for all Auth Actions
		$this->_helper->layout()->setLayout('welcomepage_layout');

		// set up the language selection
        $this->view->languageSelection = $this->_helper->LanguageSelection($this->sess);
        $this->flashMessenger = $this->_helper->getHelper('FlashMessenger');
        $this->view->docReadyJS .= "
			Lrn.Applications.Auth = new Lrn.Application.Auth('login');
			Lrn.Applications.Auth.init({
	    	    siteConfigs: " . json_encode($this->view->siteConfigs) . ",
        		siteLabels: " . json_encode($this->sess->siteLabels) . ",
        		siteErrors: " . json_encode($this->sess->siteErrors) . ",
        		siteInstructions: " . json_encode($this->sess->siteInstructions) . "
	    	});
		";
	}

	protected $sess;
	private $tweetText;
	/**
	 * Login Action
	 *
	 * Performs user login through Twitter using OAuth.  If user's have not
	 * granted our application access to their account, they will be sent to
	 * Twitter to do so.  Once done, they will return to this page again so
	 * that we can handle them (e.g. run our application for them).
	 *
	 * @param void
	 * @return void
	 */
	public function indexAction(){
		$tweetText = '';
		if(isset($_GET['tweet'])){
			$tweetText = $_GET['tweet'];
		}
		if($tweetText == 'null')
			$tweetText = '';
		$tweetSavedData =  $this->getidAction($tweetText);
		$this->json = json_decode(file_get_contents($this->filename));
		$this->sess->tweetData = array('url' => $tweetSavedData->bitlyUrl,
										'id' => $tweetSavedData->bitlyUrlId
										);
		$this->view->tweetText = $tweetText .' '.$tweetSavedData->bitlyUrl;

	}
	public function authenticateAction(){
		$tweetText = $this->getRequest()->getPost('tweet', null);
		$user_msg = $this->getRequest()->getPost('user_msg', null);
		if($user_msg == 'Your comments here...')
			$user_msg = null;
		$len_url = iconv_strlen(htmlspecialchars($this->sess->tweetData['url'], ENT_QUOTES, 'UTF-8'), 'UTF-8');
		$len_text =  iconv_strlen(htmlspecialchars($tweetText, ENT_QUOTES, 'UTF-8'), 'UTF-8') - $len_url;
		$this->sess->tweetData['tweet'] = substr($tweetText,0,--$len_text);
		$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		$this->sess->tweetData['message'] = $tweetText;
		$this->sess->tweetData['user_msg'] = $user_msg;
		$this->sess->tweet = "Pending";

		unset($this->sess->twitter_access_token);

		//check to see if the user is already authorized to twitter with a twitter_auth_token
		$auth = CONSOLE_Auth::getInstance();
		$loggedInUser = $auth->getStorage()->read();

		$socialMediaService = new SocialMediaSoapModel();
		$token = $socialMediaService->getSocialMediaUserAccessToken($loggedInUser->userId, 'twitter_auth_token');
		$this->sess->twitter_access_token = $token->dataObject->value;

		if(isset($this->sess->twitter_access_token)){
			$this->_helper->redirector('tweet' , 'oauth');
		}else{
			$config = array(
					'callbackUrl' => 'https://'.$_SERVER['HTTP_HOST'].'/oauth/callback/',
					'siteUrl' => 'https://api.twitter.com/oauth',
					'consumerKey' => 'KyUd5gcCBTLDLSjH5ON9qQ',
					'consumerSecret' => 'GWQvyUUro6shA6Mgu6hWXPdtr9ltmwJVOMYbTGxn0'
			);
			$consumer = new Zend_Oauth_Consumer($config);
			//if (!$this->sess->twitter_request_token) {
				$token = $consumer->getRequestToken();
				$this->sess->twitter_request_token  = serialize($token);

				$consumer->redirect();
			//}
		}
	}
	public function callbackAction(){

		$deniedText = $this->_request->getQuery('denied', null);
		//echo "$deniedText";

		if($deniedText == null) {
			$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
			$config = array(
	              'callbackUrl' => 'https://'.$_SERVER['HTTP_HOST'].'/oauth/callback/',
	               'siteUrl' => 'https://api.twitter.com/oauth',
	               'consumerKey' => 'KyUd5gcCBTLDLSjH5ON9qQ',
	               'consumerSecret' => 'GWQvyUUro6shA6Mgu6hWXPdtr9ltmwJVOMYbTGxn0'
	        );//unset($this->sess->twitter_request_token);
			$consumer = new Zend_Oauth_Consumer($config);
			if (!empty($_GET) && isset($this->sess->twitter_request_token))
			{
				$token = $consumer->getAccessToken($_GET, unserialize($this->sess->twitter_request_token));
				unset($this->sess->twitter_request_token);
				// Now that we have an Access Token, we can discard the Request Token
				//$this->sess->twitter_request_token = null;exit;
			} else {
				// Mistaken request? Some malfeasant trying something?
				exit('Invalid callback request. Oops. Sorry.');
			}

			//write the twitter_access_token to the DB
			$auth = CONSOLE_Auth::getInstance();
			$loggedInUser = $auth->getStorage()->read();
			
			$socialMediaService = new SocialMediaSoapModel();
			$socialMediaService->setSocialMediaUserAccessToken($loggedInUser->userId, 'twitter_auth_token', $token);

			//file_put_contents(‘token.txt’, serialize($token));
			$this->sess->twitter_access_token = $token;

			if($this->sess->tweet == "Pending") {
				$this->_helper->redirector('tweet' , 'oauth');
			}
		} else {
			$this->_helper->redirector('denied' , 'oauth');
		}


	}

	public function deniedAction() {

	}

	public function tweetAction() {
		$this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
		$token = $this->sess->twitter_access_token;
		//$token = (array) $token;
		$oauth_token = '';
		$oauth_token_secret = '';

		$tokenArray = explode("&", $token);

		//get the oauth_token and oauth_token_secret from the tokenArray
		foreach($tokenArray as $tk){
			$tkArr = explode("=", $tk);
			if($tkArr[0] == 'oauth_token')
				$oauth_token = $tkArr[1];
			if($tkArr[0] == 'oauth_token_secret')
				$oauth_token_secret = $tkArr[1];
		}

	    $id = $this->sess->tweetData['id'];
		$this->sess->tweet = $this->sess->siteInstructions['Done'];
		// update user's status with Twitter
		$len_usr_msg = iconv_strlen(htmlspecialchars($this->sess->tweetData['user_msg'], ENT_QUOTES, 'UTF-8'), 'UTF-8');
		if($this->sess->tweetData['tweet'] != '')
			$len_msg = iconv_strlen('"' . htmlspecialchars($this->sess->tweetData['tweet'] . '"', ENT_QUOTES, 'UTF-8'), 'UTF-8');
		else
			$len_msg = iconv_strlen(htmlspecialchars($this->sess->tweetData['tweet'], ENT_QUOTES, 'UTF-8'), 'UTF-8');

		$urlText = ' ' . $this->sess->tweetData['url'];
		$len_url = iconv_strlen(htmlspecialchars($urlText, ENT_QUOTES, 'UTF-8'), 'UTF-8');
		$len_tweet = 137 - $len_url;
		$tweet = '';
		if($len_usr_msg > $len_tweet){
			$all_len = $len_tweet - 3;
			$tweet = substr ($this->sess->tweetData['user_msg'] , 0 , $all_len) . '...';
		}
		else if($len_usr_msg <= $len_tweet && $len_usr_msg > 95){
			$tweet = substr ($this->sess->tweetData['user_msg'] , 0 , $len_tweet);
		} else if($len_usr_msg <= 95 ){
			$msg_combined_len  = $len_msg+$len_usr_msg;
			if($msg_combined_len <= $len_tweet) {
				$tweet = $this->sess->tweetData['user_msg'] ;
				if($len_usr_msg > 0 && $len_msg >0)
					$tweet .= ' "' ;
				$tweet .= $this->sess->tweetData['tweet'];
				if($len_usr_msg > 0 && $len_msg >0)
					$tweet .= '"' ;
			} else {
				$usr_msg_strlen = $len_tweet - $len_usr_msg - 4;
				$tweet = $this->sess->tweetData['user_msg'] . ' "' . substr ($this->sess->tweetData['tweet'], 0 , $usr_msg_strlen) . '..."';
			}
		}

		$settings = array(
				'oauth_access_token' => $oauth_token,
				'oauth_access_token_secret' => $oauth_token_secret,
				'consumer_key' => "KyUd5gcCBTLDLSjH5ON9qQ",
				'consumer_secret' => "GWQvyUUro6shA6Mgu6hWXPdtr9ltmwJVOMYbTGxn0"
		);
		$url = 'https://api.twitter.com/1.1/statuses/update.json';
		$requestMethod = 'POST';
		$postfields = array(
				'status' => $tweet.$urlText
		);
		$twitter = new TwitterAPIExchange($settings);
		$twitterRes =  $twitter->buildOauth($url, $requestMethod)
		->setPostfields($postfields)
		->performRequest();

		$twitterRes = json_decode($twitterRes);
		
		//get new token if token from DB is expired
		if(isset($twitterRes->errors) && $twitterRes->errors[0]->code == 89 ){
			$this->sess->tweet = "Pending";
			$config = array(
					'callbackUrl' => 'https://'.$_SERVER['HTTP_HOST'].'/oauth/callback/',
					'siteUrl' => 'https://api.twitter.com/oauth',
					'consumerKey' => 'KyUd5gcCBTLDLSjH5ON9qQ',
					'consumerSecret' => 'GWQvyUUro6shA6Mgu6hWXPdtr9ltmwJVOMYbTGxn0'
			);
			$consumer = new Zend_Oauth_Consumer($config);
			//if (!$this->sess->twitter_request_token) {
			$token = $consumer->getRequestToken();
			$this->sess->twitter_request_token  = serialize($token);
			
				$consumer->redirect();
		}
			
		if(isset($twitterRes->id)){
			$tweetId = $twitterRes->id;

			//write the tweet data to the DB
			$auth = CONSOLE_Auth::getInstance();
			$loggedInUser = $auth->getStorage()->read();

			$socialMediaLogDto = array(
					'bitlyUrl' => $this->sess->bitlyUrl ,
					'bitlyUrlId' => $this->sess->bitlyUrlId ,
					'componentSectionId' =>  $this->sess->componentSectionId,
					'createDate' => 	$this->sess->createDateTime,
					'curriculumId' =>  $this->sess->curriculumId,  // modify shareSnippet.js to get this value
					'id' => null,
					'shareText' => $this->sess->tweetData['message']  ,
					'socialMediaId' => $tweetId,    // tweetID,
					'systemId' =>  $this->sess->systemId,  // possibly modify shareSnippet.js to get this value
					'userComment' => $this->sess->tweetData['user_msg'] ,
					'userId' => $loggedInUser->userId
			);

			$socialMediaService = new SocialMediaSoapModel();
			$response = $socialMediaService->setSocialMediaLog($socialMediaLogDto);

			unset($this->sess->tweetText);
			if(isset($response->dataObject->id) && $response->dataObject->id != '') {
				$usr_msg = $this->sess->tweetData['user_msg'] ;
				$tweet =  $this->sess->tweetData['tweet'];
				$statusTweet = $this->setTweet($response->dataObject->id, $id, $usr_msg, $tweet);
				if($statusTweet->status == 'OK'){
					$this->view->msgtweet =  $this->sess->siteInstructions['ThanksForTweeting'];
					//$this->_helper->redirector('tweet' , 'oauth');
					//exit;
				}
				else{
					$this->view->msgtweet =  $this->sess->siteErrors['CED001'];
					//$this->_helper->redirector('tweet' , 'oauth');
				}

			} else {
				if(isset($response->error)) {
					$this->view->msgtweet =   $this->sess->siteErrors['CED001'];
					//$this->_helper->redirector('tweet' , 'oauth');
				}

			}
		} else {//'Not able to post tweet. Please try again later';
			$this->view->msgtweet = $this->sess->siteErrors['CED001'];
			//$this->_helper->redirector('tweet' , 'oauth');
		}
	}
	public function successAction() {

	}
	function buildBaseString($baseURI, $method, $params) {
		$r = array();
		ksort($params);
		foreach($params as $key=>$value){
			$r[] = "$key=" . rawurlencode($value);
		}
		return $method."&" . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $r));
	}

	function buildAuthorizationHeader($oauth) {
		$r = 'Authorization: OAuth ';
		$values = array();
		foreach($oauth as $key=>$value)
			$values[] = "$key=\"" . rawurlencode($value) . "\"";
		$r .= implode(', ', $values);
		return $r;
	}

	public function getidAction ($tweetText) {

		$id = md5(time());
		$moduleId = '';  // TODO
		$bitly = $this->bitly_shorten('https://'.$_SERVER['HTTP_HOST'].'/html/twitter-landing-page.html?id='.$id);
		$bitly = empty($bitly) ? array('error'=>'no bit.ly') : $bitly;
		$data = new stdClass();

		$data->bitly = $bitly;
		$array = (array)$this->json;
		$array[$id] = $data;
		$this->json = $array;


		$currentDateTime = time();

		//TODO -- place this common code into a separate private function
		$auth = CONSOLE_Auth::getInstance();
		$loggedInUser = $auth->getStorage()->read();

		$twitterComponentSectionId = $this->fetchTwitterComponentSectionId();

		$courseName = '';
		if(isset($_GET['courseName'])){
			$this->sess->courseName = $_GET['courseName'];
		}

		$curriculumId = '';
		if(isset($_GET['curriculumId'])){
			$this->sess->curriculumId = $_GET['curriculumId'];
		}

		$systemId = '';
		if(isset($_GET['systemId'])){
			$this->sess->systemId = $_GET['systemId'];
		}

		$this->sess->bitlyUrl = $data->bitly;
		$this->sess->bitlyUrlId = $id;
		$this->sess->componentSectionId = $twitterComponentSectionId;
		$this->sess->createDateTime = $currentDateTime;

  /*
        $library = array();

        if(!empty($response)){
            $library = $response;

            // use array_multisort to pre-sort the files
            // by most recent updated first.
            $sortCol = array();
            foreach((array)$library as $i=>$l){
                $sortCol[$i] = $l->updateDate;
            }
            array_multisort($sortCol, SORT_DESC, $library);
        }


//		file_put_contents($this->filename,json_encode($this->json));
		*/

		$content = new stdClass();
		$content->bitlyUrlId = $id;
		$content->bitlyUrl = $bitly;
		return $content;

	}

	protected function bitly_shorten ($url) {

		$query = array(
				"version" => "2.0.1",
				"longUrl" => $url,
				"login" => 'o_2pm5lnujev', // replace with your login
				"apiKey" => 'R_849c3688548d3b33330c1b69db5d1f22' // replace with your api key
		);

		$query = http_build_query($query);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://api.bit.ly/shorten?".$query);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

		$response = curl_exec($ch);
		curl_close($ch);

		$response = json_decode($response);
		if($response->errorCode == 0 && $response->statusCode == "OK") {
			return $response->results->{$url}->shortUrl;
		}
		return null;
	}
	public function setTweet($id,$tweetid, $usr_msg, $tweet) {
		$status = new stdClass();
		$array = (array)$this->json;

		if(isset($id) && !empty($id)){
			if(!isset($tweetid)){
				$status->status = 'Missing Twitter ID';
				$status->error = true;
			}else{
				$auth = CONSOLE_Auth::getInstance();
				$loggedInUser = $auth->getStorage()->read();
				$name = '';
				if(isset($loggedInUser->firstName))
					$name .= $loggedInUser->firstName;
				if(isset($loggedInUser->lastName) && $loggedInUser->lastName != '')
					$name .= ' ' . $loggedInUser->lastName;

				$array[$id]->twitterId = $tweetid;
				$array[$id]->usrmsg = $usr_msg;
				$array[$id]->tweet = $tweet;
				$array[$id]->name = $name;
				$this->json = $array;


				$socialMediaService = new SocialMediaSoapModel();
        		$response = $socialMediaService->getSocialMediaLog($id);


				if($response) {   // ??? FIND OUT WHAT VALUE IN RESPONSE INDICATES SUCCESS
					$status->status = 'OK';
				}else{
					$status->status = 'Unable to save data';
					$status->error = true;
				}
			}
		}else{
			$status->status = 'The ID specified does not exist.';
			$status->error = true;

		}
		$status->debug = $array[$id];

		return $status;

	}

	public function fetchTwitterComponentSectionId( ) {
		$twitterComponentName = 'twitter';

		$componentService = new ComponentSoapModel();
		$response = $this->cache->getItemsFromCache($componentService, 'getAllComponentSections', array(), array(self::CACHE_KEY_ALL_COMPONENT_SECTIONS), false);
		  foreach((array)$response as $componentSectionObject) {
	           if (strtolower( $componentSectionObject->name) == $twitterComponentName ) {
		           	 return  $componentSectionObject->id;
	           }
	      }
	      return null;
	}

	private function printArrayContents($arrayToPrint) {
		foreach ($arrayToPrint as $index => $value) {
		 		if (is_array($value)) {
		 			$this->printArrayContents($value);
		 			echo('Array '.$index .' : '."\n");
		 			foreach ($value as $index2 => $value2) {
		 				echo($index2 .' = '. $value2."\n");
		 			}
		 		} else {
		 	 		echo($index .' = '. $value."\n");
		 		}
		}
	}

}
