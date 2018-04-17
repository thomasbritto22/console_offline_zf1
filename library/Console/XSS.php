<?php
require_once 'Php/HTMLPurifier/HTMLPurifier.auto.php';

class Console_Filter_XSS implements Zend_Filter_Interface
{
 	/**
     * The HTML Purifer object
     *
     * @var HTMLPurifier
     */
    private $purifier;

    /**
     * Initialise the HTML Purifier object.
     */
    function __construct()
    {
    	$config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.AllowedAttributes', array('a.id', 'a.target', 'a.href'));
        $config->set('Attr.AllowedFrameTargets', array('_blank', '_self'));
    	$this->purifier = new HTMLPurifier($config);
    }

    /**
     * Filter the value using HTML Purifier.
     *
     * @param string $value The value to filter
     * @see Zend_Filter_Interface::filter()
     */

    public function filter($value)
    {
    	return $this->purifier->purify($value);
    }   
}