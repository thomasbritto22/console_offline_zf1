<?php
class Reset_Pass_Form extends Zend_Form {
	public function init() {
		$this->setMethod('post');
		
		$this->addElement(
		    'text', 'oldPass', array(
		        'label' => 'Old Password',
		        'required' => true,
		        'filters' => array('StringTrim'),
		));
		
		$this->addElement(
		    'text', 'newPass', array(
		        'label' => 'New Password',
		        'required' => true,
		        'filters' => array('StringTrim'),
		));
		
		$this->addElement(
		    'submit', 'submit', array(
		        'label' => 'Reset My Password',
		        'ignore' => true
		));
	}
}