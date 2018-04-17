<?php
class Reset_Pass_Form extends Zend_Form {
	public function init() {
		$this->setMethod('post');
		
		$this->addElement(
		    'text', 'newPass', array(
		        'label' => 'New Password',
		        'required' => true,
		        'filters' => array('StringTrim'),
		));
		
		$this->addElement(
		    'text', 'confirmPass', array(
		        'label' => 'Confirm Password',
		        'required' => true,
		        'filters' => array('StringTrim'),
		));
		
		$this->addElement(
		    'submit', 'submit', array(
		        'label' => 'Login',
		        'ignore' => true
		));
	}
}