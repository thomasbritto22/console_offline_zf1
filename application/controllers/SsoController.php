<?php

require_once ("../application/soapModels/LRNService/Site.php");
require_once ("../application/soapModels/LRNService/SLO.php");
require_once ('../application/controllers/AuthController.php');

class SsoController extends AuthController {

    public function init() {
        parent::init();
    }

    public function jasperssoAction() {
        $SLOService = new SLOServiceSoapModel();

        //Get the SSO trust key
        $response = $SLOService->generateJasperSSOTrustKey($this->sess->user->username, $this->sess->siteName);

        $role = 'ROLE_ADMINISTRATOR';
        $params = 'user_id=' . $this->sess->user->username . '&company=' . $this->sess->siteName . '&trust_key=' . $response . '&role=' . $role;

        //echo $params; exit;
        $this->_redirect(JASPER_REPORTS_URL . '?' . $params);
        return;
    }

    public function testSloAction() { 
        $SLOService = new SLOServiceSoapModel();

        //Get the SSO trust key
        $response = $SLOService->generateJasperSSOTrustKey($this->sess->user->username, $this->sess->siteName);

        $role = 'ROLE_ADMINISTRATOR';
        $params = 'user_id=' . $this->sess->user->username . '&company=' . $this->sess->siteName . '&trust_key=' . $response . '&role=' . $role;

        //echo $params; exit;
        $this->_redirect(JASPER_REPORTS_URL . '?' . $params);
        return;
    }

    /**
     * --- CONSUME SSO RESPONSE ---
     * this function checks the sso response from partner site
     * authenticates user and then
     * redirect them to redirect url specified by partner
     */
    public function consumeAction() {
        
        $pdata = $this->getRequest()->getPost();
        $data = array();
        foreach ($pdata as $pkey => $pval) {
            $data [str_replace("q_", "q.", $pkey)] = $pval;
        }

        $username = $data['q.login'];
        $userId = $data['q.userId'];
        $trustKey = $data['q.trust_key'];
        $redirectURL = $data['q.target_path'];
        $logoutURL = $data['q.logout_url'];
        $admin_url = $data['q.adminToolsUrl'];
        $lcec_logo = $data['q.logo_s'];
        $lcec_adminHelp = $data['q.help_url'];
        $lcec_referenceGuide = $data['q.admin_guide_path'];
        $lcec_tutorialGuide = $data['q.tutorial'];
        $lcec_profile = $data['q.profile'];
        $lcec_session = $data['q.session-id'];
        if (MEMCACHE_USE_MEMCACHE && ((getEnv('APPLICATION_ENV')) == 'production' || (getEnv('APPLICATION_ENV')) == 'staging' || (getEnv('APPLICATION_ENV')) == 'qa')) {

            $value = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);

            $this->memcache = new Memcache;
            $this->memcache->connect(MEMCACHE_SERVER_IP, MEMCACHE_SERVER_PORT);
            $key = Zend_Session::getId();
            $this->memcache->set($key, $value);

            $this->sess = $this->memcache->get($key);
        } else { // if development, just use Apache server. Because no php_memcache extension is available in development
            $this->sess = new Console_SessionHelper(SESSION_GLOBAL_NAMESPACE);
        }
//        exit;
        $module = $this->getRequest()->getParam('module');

        if ($module == "vc") {
            $redirectURL = '/admin/catalystoffline';
        } else {
            $redirectURL = '/admin/exportmanager';
        }

        if (isset($trustKey)) {

            //
            // Check if site has SSO enabled
            //
            //make trustKey to lowerCase - temporary fix 
            // check if trust key is validates
            // if response is not true then validation was unsuccessful
            //
            ksort($data);
            foreach ($data as $key => $val) {
                if ($key != "q.trust_key")
                    $keyData .= $key . $val;
            }
            $genTrustKey = hash_hmac("md5", utf8_encode($keyData), utf8_encode(VIRTUAL_CATALYST_SECRET_KEY));
         
            if ($genTrustKey == $trustKey) {
                $this->sess->username = $username;
                $this->sess->adminUrl = $admin_url;
                $this->sess->logoUrl = $lcec_logo;
                $this->sess->lcec_adminHelp = $lcec_adminHelp;
                $this->sess->lcec_referenceGuide = $lcec_referenceGuide;
                $this->sess->lcec_tutorialGuide = $lcec_tutorialGuide;
                $this->sess->lcec_profile = $lcec_profile;
                $this->sess->fromSLO = true;
                $this->sess->logoutURL = $logoutURL;
                $this->sess->lcec_session = $lcec_session;
                $this->postAuthentication($userId, "false", "", $username);
                //need to reset the language cookie and 
//                $this->resetDefaultLanguage($this->sess->user->language);
                if (!isset($redirectURL))
                    $redirectURL = "/";
                $this->_redirect($redirectURL);
                return;
            }else {
                $this->sess->errorMsg = "Invalid Trust key";
                $this->_redirect('/admin/offlineerror');
                return;
            }
        } else {
            $this->sess->errorMsg = "No Trust Key found";
            $this->_redirect('/admin/offlineerror');
        }
    }

    public function get_domain($url) {
        $pieces = parse_url($url);
        $domain = isset($pieces['host']) ? $pieces['host'] : '';
        if (preg_match('/(?P<domain>[a-z0-9][a-z0-9\-]{1,63}\.[a-z\.]{2,6})$/i', $domain, $regs)) {
            return isset($pieces['port']) ? $regs['domain'] . ':' . $pieces['port'] : $regs['domain'];
        }
        if (empty($regs['domain'])) {
            return isset($pieces['port']) ? $domain . ':' . $pieces['port'] : $domain;
        }
        return false;
    }

}
