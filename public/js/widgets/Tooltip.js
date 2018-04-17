if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.Tooltip = function(control, config) {
    // set up the default values. Do not add to
    // prototype because it will affect ALL instances.
    this.config = {};
    
    // create a variable we can use to append and place in the UI.
    this.control = $(control).get(0);
    
    // if any config values are passed in, override defaults
    if(config) for(var c in config) this.config[c] = config[c];
    
    this.buildControl();
};

Lrn.Widget.Tooltip.prototype = new Lrn.Widget();
Lrn.Widget.Tooltip.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.Tooltip.prototype.offsetCrtl = null;

/**
 * --- BUILD CONTROL ---
 * create a tooltip element with content
 * @param content
 * @returns { this.control }
 */
Lrn.Widget.Tooltip.prototype.buildControl = function() {
    
    // build the control, only if it does not already exist
    if(this.control == null) {
        // create encapsulating element with tooltip class
        this.control = document.createElement('div');
        this.control.className = 'tooltip';
        
        // hide the tooltip and add it inside the body
        this.hide();
        document.body.appendChild(this.control);
        $(this.control).mouseleave(this.hide.bind(this));
    }
};

/**
 * --- SHOW CONTROL ---
 * makes the tooltip visible with offset
 * based on passed control
 * @param offsetCtrl
 */
Lrn.Widget.Tooltip.prototype.show = function(offsetCtrl) {
    // set the CSS of the tooltip control
    // then adjust the offset to sit below the passed control
	// and not floating off to the left or right of the screen
    // then fades it in

	var self = $(this.control);
	var ocl = $(offsetCtrl);
	var op = ocl.position();
	var ctltop = (op.top + ocl.outerHeight() + 5);
	
	if(ocl.offset().top > $(window).height()/2){
		ctltop = -$(this.control).height() - op.top - ocl.outerHeight() - 15;
		switch(Lrn.Browser.type){
		case 'MSIE':	
			ocl.css({'filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)', '-ms-filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)', 'transform': 'rotate(180deg)'});
			break;
		case 'Firefox':
			ocl.css('-moz-transform','rotate(180deg)');
			break;
		default:
			ocl.css('-webkit-transform','rotate(180deg)');
			break;
		
		}
		
		this.offsetCrtl = ocl;
	}
	
    self.css({
        display: 'none',
        position: 'absolute',
        // shift the tooltip below the actual height of the element
        top: ctltop,
        
        // shift the tooltip to be centered under the offset element
        left: op.left + ((ocl.outerWidth()/2) - (self.width()/2))
    });

	var osData = this.offScreenData();
	var adjustLeft = osData.left < 0 ? osData.left * -1 : (osData.right < 0 ? osData.right : 0);
	
	$(this.control).css('left', parseInt(self.css('left')) + adjustLeft).fadeIn(300);
};
    
/**
 * --- HIDE CONTROL ---
 * hide the tooltip
 */
Lrn.Widget.Tooltip.prototype.hide = function() {
	if(this.offsetCrtl && this.offsetCrtl.length){
		var ocl = this.offsetCrtl;
		switch(Lrn.Browser.type){
		case 'MSIE':
			ocl.css({'filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=0)', '-ms-filter': 'progid:DXImageTransform.Microsoft.BasicImage(rotation=0)', 'transform': 'rotate(0deg)'});
			break;
		case 'Firefox':
			ocl.css('-moz-transform','rotate(0deg)');
			break;
		default:
			ocl.css('-webkit-transform','rotate(0deg)');
			break;
		}
		
	}
    // fades the control out	
	$(this.control).fadeOut(800);
};

/**
 * --- UPDATE TOOLTIP CONTENT ---
 * empties the content of the tooltip and
 * adds the passed content
 * @param content
 */
Lrn.Widget.Tooltip.prototype.updateContent = function(content) {
    // add the new content
    $(this.control).html(content);
};

/**
 * --- APPEND TOOLTIP CONTENT ---
 * empties the content of the tooltip and
 * adds the passed content
 * @param content
 */
Lrn.Widget.Tooltip.prototype.appendContent = function(content) {
    // add the new content
    $(this.control).append(content);
};

Lrn.Widget.Tooltip.prototype.initOffScreenValues = function() {
	var ctrlDispState = $(this.control).css('display');
	$(this.control).css('display', 'block');
	
	var el = this.control;
	this._top = el.offsetTop;
	this._left = el.offsetLeft;
	this._width = el.offsetWidth;
	this._height = el.offsetHeight;
	this._sbSize = getScrollBarWidth();


	while(el.offsetParent) {
		el = el.offsetParent;
		this._top += el.offsetTop;
		this._left += el.offsetLeft;
	}
	
	$(this.control).css('display', ctrlDispState);
};

Lrn.Widget.Tooltip.prototype.offScreen = function() {
	this.initOffScreenValues();
	
	return (
		((this._top + this._height) > window.pageYOffset && this._top < window.pageYOffset) ||
		((this._top + this._height) > (window.pageYOffset + window.innerHeight - this._sbSize) && this._top < (window.pageYOffset + window.innerHeight - this._sbSize)) ||
		((this._left + this._width) > window.pageXOffset && this._left < window.pageXOffset) ||
		((this._left + this._width) > (window.pageXOffset + window.innerWidth - this._sbSize) && this._left < (window.pageXOffset + window.innerWidth - this._sbSize))
	);
};

Lrn.Widget.Tooltip.prototype.offScreenData = function() {
	this.initOffScreenValues();
	
	return {
		bottom: (window.pageYOffset + window.innerHeight - this._sbSize) - (this._top + this._height),
		left: this._left - (window.pageXOffset),
		right: (window.pageXOffset + window.innerWidth - this._sbSize) - (this._left + this._width),
		top: this._top - window.pageYOffset
	};
};

function getScrollBarWidth() { 
	var inner = document.createElement('p'); 
	inner.style.width = "100%"; 
	inner.style.height = "200px"; 

	var outer = document.createElement('div'); 
	outer.style.position = "absolute"; 
	outer.style.top = "0px"; 
	outer.style.left = "0px"; 
	outer.style.visibility = "hidden"; 
	outer.style.width = "200px"; 
	outer.style.height = "150px"; 
	outer.style.overflow = "hidden"; 
	outer.appendChild (inner); 

	document.body.appendChild (outer); 
	var w1 = inner.offsetWidth; 
	outer.style.overflow = 'scroll'; 
	var w2 = inner.offsetWidth; 
	if (w1 == w2) w2 = outer.clientWidth; 

	document.body.removeChild (outer); 

	return (w1 - w2); 
};