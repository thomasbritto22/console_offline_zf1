if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

Lrn.Application.Error = function(config){
    if(config){
        this.user = config.user || null;
        this.siteConfigs = config.siteConfigs || null;
    }
};

/**
 * --- ERROR PROTOTYPE ---
 * We want to make Error a subclass of Application so
 * we will set the Error.prototype to the Lrn.Application object
 * and make sure we have the superclass available for
 * overriding methods from Lrn.Application.
 */
Lrn.Application.Error.prototype = new Lrn.Application();
Lrn.Application.Error.prototype.superclass = Lrn.Application.prototype;

Lrn.Application.Error.prototype.init = function(){
    // before we extend the superclass init method, 
    // we call the init method of the superclass (Application.js)
    this.superclass.init.apply(this);
};

/**
 * --- INIT ERROR VIEW ---
 * Does random things to get the various parts of the queue
 * page to work. Switching between views, etc.
 */
Lrn.Application.Error.prototype.initErrorView = function(){

	// call our function to set our funky column heights
	//Lrn.Applications.Error.initColumnHeight();
	
	// since the 404 page does not have any columns on the left
	// and right side we want the contentWrapper to have a width
	// of 100% so that it takes up all the space allotted
	$('#contentWrapper').css('width','100%');
};