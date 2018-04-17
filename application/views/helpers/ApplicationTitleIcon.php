<?php
class Zend_View_Helper_ApplicationTitleIcon extends Zend_View_Helper_Abstract 
{
	private $iconStyleList = array(
      		'learn' 	=> array('_default_' => 'fa-check', 'queue' => 'fa-check', 'preview' => 'fa-eye', 'reviews' => 'fa-star'),
      		'catalog'	=> array('_default_' => 'fa-book', 'index' => 'fa-book'),
                'viewdashboard'	=> array('_default_' => 'fa-bar-chart', 'index' => 'fa-bar-chart'),
      		'resourcecenter' => array('_default_' => 'fa-info-circle', 'index' => 'fa-info-circle'),
      		'notifications' => array('_default_' => 'fa-history', 'history' => 'fa-history'),
      		'profile' 	=> array('_default_' => 'fa-user', 'index' => 'fa-user'),
      		'admin'  	=> array('_default_' => 'fa-gear'),
		);
	
	private $globalDefaultIcon = 'fa-check';
	
	public function applicationTitleIcon($controller = null, $action = null)
	{
		if (!isset($this->iconStyleList[$controller][$action]))
		{
			return isset($this->iconStyleList[$controller]['_default_']) ? $this->iconStyleList[$controller]['_default_'] : $this->globalDefaultIcon;
		}
		
        return $this->iconStyleList[$controller][$action];    
	}
}
?>