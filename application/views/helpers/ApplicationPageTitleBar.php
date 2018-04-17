<?php
class Zend_View_Helper_ApplicationPageTitleBar extends Zend_View_Helper_Abstract 
{	
	public function applicationPageTitleBar($items = array())
	{
		if (empty($items)) return '';
		
		$bar = '';
		foreach ($items as $item)
		{
			$text = '';
			$class = '';
			
			if(isset($item['property']) && !empty($item['property']))
			{
				if (isset($item['property']['href']))
				{
					$text .= '<a href="'.$item['property']['href'].'" class="titleBarBtnFgColor">'.(isset($item['text'])? $item['text']:''). '</a>';
				}
				
				if (isset($item['property']['class']) && !empty($item['property']['class']))
				{
					$class = $item['property']['class'];
				}
			}
			else
			{
				$text = isset($item['text'])? $item['text']:'';
			}
			
			$bar .= '<div class="subLink">'.(isset($item['icon']) && !empty($item['icon'])? '<span class="'.$item['icon'].'"></span>': '').(!empty($text) ? '<span class="titleBarBtnFgColor '.$class.'">'.$text.'</span>':'').'</div>';
		}
		
        return $bar;    
	}
}
?>