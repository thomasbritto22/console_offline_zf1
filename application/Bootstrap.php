<?php

class Bootstrap extends Zend_Application_Bootstrap_Bootstrap {

    protected function _initDoctype() {
        $this->bootstrap('view');
        $view = $this->getResource('view');
        $view->doctype('HTML5');
    }

    protected function setconstants($constants) {
        foreach ($constants as $key => $value) {
            if (!defined($key)) {
                define($key, $value);
            }
        }
    }

    protected function _initAutoload() {
        Zend_Loader_Autoloader::getInstance()->registerNamespace('Console_');
    }

    protected function _initPlugins() {
        $acl = new Console_Acl();
        $fc = Zend_Controller_Front::getInstance();
        $fc->addModuleDirectory('../application/plugin')
                ->registerPlugin(new SSL_Plugin())
                ->registerPlugin(new Site_Plugin())
                ->registerPlugin(new Saml_Initiate_Plugin())
                ->registerPlugin(new Auth_Plugin($acl))
				 ->registerPlugin(new XSS())
                ->registerPlugin(new CSRF());
    }

    protected function _initActionHelperBrokers() {
        Zend_Controller_Action_HelperBroker::addPath(APPLICATION_PATH . '/controllers/helpers', 'Helpers');
    }

    protected function _initSetLangMap() {
        Zend_Registry::set('LangMap', array(
            "arSA" => "Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©",
            "bgBG" => "Ð±ÑŠÐ»Ð³Ð°Ñ€Ñ�ÐºÐ¸ ÐµÐ·Ð¸Ðº",
            "csCZ" => "Ä�esky",
            "daDK" => "Dansk",
            "deDE" => "Deutsch",
            "elGR" => "ÎµÎ»Î»Î·Î½Î¹ÎºÎ¬",
            "en" => "English",
            "enIE" => "English (International)",
            "enUK" => "English (United Kingdom)",
            "esES" => "EspaÃ±ol (Europa)",
            "esLA" => "EspaÃ±ol (Latinoamerica)",
            "etEE" => "Eesti",
            "fiFI" => "Suomi",
            "frCA" => "FranÃ§ais (Canada)",
            "frFR" => "FranÃ§ais",
            "heIL" => "×¢×‘×¨×™×ª ×™×©×¨×�×œ×™×ª",
            "hiIN" => "à¤¹à¤¿à¤¨à¥�à¤¦à¥€, à¤¹à¤¿à¤‚à¤¦à¥€",
            "hrHR" => "Hrvatski",
            "huHU" => "Magyar",
            "idID" => "Bahasa Indonesia",
            "itIT" => "Italiano",
            "jaJP" => "æ—¥æœ¬èªž (ã�«ã�»ã‚“ã�”)",
            "koKR" => "í•œêµ­ì–´ (éŸ“åœ‹èªž)",
            "mrIN" => "à¤®à¤°à¤¾à¤ à¥€",
            "msMY" => "Bahasa Melayu",
            "nlBE" => "Nederlands (Belgien)",
            "nlNL" => "Nederlands (Nederlands)",
            "noNO" => "Norsk",
            "plPL" => "Polski",
            "ptBR" => "PortuguÃªs (Brazil)",
            "ptPT" => "PortuguÃªs (Portugal)",
            "roRO" => "RomÃ¢nÄƒ",
            "ruRU" => "Ñ€ÑƒÑ�Ñ�ÐºÐ¸Ð¹ Ñ�Ð·Ñ‹Ðº",
            "srYU" => "Srpski",
            "svSE" => "Svenska",
            "thTH" => "à¹„à¸—à¸¢",
            "tlPH" => "Tagalog",
            "trTR" => "TÃ¼rkÃ§e",
            "viVN" => "Tiáº¿ng Viá»‡t",
            "zhCN" => "ä¸­æ–‡(ç®€ä½“)",
            "zhHK" => "ä¸­æ–‡(é¦™æ¸¯)",
            "zhTW" => "ä¸­æ–‡(å�°ç�£)",
            "afZA" => "Afrikaans",
            "skSK" => "SlovenÄ�ina",
            "slSI" => "SlovenÄ�ina",
            "ltLT" => "LietuviÅ³ kalba",
            "ukUA" => "Ð£ÐºÑ€Ð°Ñ—Ð½Ñ�ÑŒÐºÐ°",
            "kkKZ" => "ÒšÐ°Ð·Ð°Ò›ÑˆÐ°",
            "mkMK" => "ÐœÐ°ÐºÐµÐ´Ð¾Ð½Ñ�ÐºÐ¸",
            "meME" => "Crnogorski jezik",
            "isIS" => "Ã�slenska",
            "mnMN" => "ÐœÐ¾Ð½Ð³Ð¾Ð»",
            "sqAL" => "Shqiptar"
        ));
    }

    /**
     * Function to initialize memcache
     */
    protected function _initMemcache() {
        $options = $this->getOptions();
        
        if (extension_loaded('memcache')) {
            // Configure caching backend
            $cacheBackend = new Zend_Cache_Backend_Memcached(
                array(
                    'servers' => $options['cache']['backend']['options']['servers'],
                    'compression' => MEMCACHE_COMPRESSION,
                    'compatibility' => MEMCACHE_COMPATIBILITY
                )
            );

            // Configure caching frontend
            $cacheFrontend = new Zend_Cache_Core(
                array(
                    'caching' => MEMCACHE_CACHING,
                    'lifetime' => MEMCACHE_TTL, //10 min,
                    //'cache_id_prefix' => 'Catalyst_',
                    'write_control' => MEMCACHE_WRITE_CONTROL,
                    'automatic_serialization' => true,
                    'ignore_user_abort' => MEMCACHE_IGNORE_USER_ABORT
                )
            );

            // Build a caching object
            $memcache = new Console_MemcacheHelper($cacheFrontend, $cacheBackend);
            Zend_Registry::set('memcache', $memcache);
            
        } else {
            Zend_Cache::throwException("Memcache extension is missing");
        }
    }

}
