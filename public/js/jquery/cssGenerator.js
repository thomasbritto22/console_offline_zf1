/* GENERATE CROSS BROWSER CSS FUNCTIONS */

var cssRGBA = function(color, offset, alpha){
	if(typeof(alpha) == "undefined") { alpha = 1 }
	
	var _r = parseInt(color.substr(0,2),16);
	var _g = parseInt(color.substr(2,2),16);
	var _b = parseInt(color.substr(4,2),16);
	
	return "rgba(" + Math.round(_r + offset) + "," + Math.round(_g + offset) + "," + Math.round(_b + offset) + ", "+alpha+")";
}

// -moz type direction needed.
var cssGradient = function(colorStops, direction){
	if(typeof(direction) == "undefined") { direction = 'center top' }
	var cR = '';
	var _moz = '-moz-linear-gradient(' + direction;
	var _webkit = '-webkit-gradient(';
	
	switch (direction) {
		case 'center top':		_webkit += 'linear, left top, left bottom'; break;	
		case 'center bottom':	_webkit += 'linear, left bottom, left top'; break;	
		case 'left center':		_webkit += 'linear, left top, left bottom'; break;
		case 'right center':	_webkit += 'linear, right top, right bottom'; break;
		case '45deg':			_webkit += 'linear, left bottom, right top'; break;
		case '-45deg':			_webkit += 'linear, left top, right bottom'; break;
		case '135deg':			_webkit += 'linear, right bottom, left top'; break;
		case '-135deg':			_webkit += 'linear, right top, left bottom'; break;
	}
	
	for (var i=0;i<colorStops.length;i++) {
		_moz += ", " + colorStops[i].c + " " + colorStops[i].p + "%";
		_webkit += ", color-stop(" + colorStops[i].p/100 + ", " + colorStops[i].c + ")";
	}
	
	// for browsers not supporting gradients, background will be the first colorStop.
	cR += 'background: ' + colorStops[0].c + '; ';
	cR += 'background-image: ' + _moz + '); ';
	cR += 'background-image: ' + _webkit + '); ';

	return cR;
}

var cssBorderRadius = function(value) {
	
	if($.isArray(value) && value.length == 4) {
		cR = "";
		if(value[0] != null) {
			cR += '-moz-border-radius-topleft: ' + value[0] + 'px; ';
			cR += '-webkit-border-top-left-radius: ' + value[0] + 'px; ';
			cR += 'border-top-left-radius: ' + value[0] + 'px; ';
		} 
		if(value[1] != null) {
			cR += '-moz-border-radius-topright: ' + value[1] + 'px; ';
			cR += '-webkit-border-top-right-radius: ' + value[1] + 'px; ';
			cR += 'border-top-right-radius: ' + value[1] + 'px; ';
		} 
		if(value[2] != null) {
			cR += '-moz-border-radius-bottomright: ' + value[2] + 'px; ';
			cR += '-webkit-border-bottom-right-radius: ' + value[2] + 'px; ';
			cR += 'border-bottom-right-radius: ' + value[2] + 'px; ';
		} 
		if(value[3] != null) {
			cR += '-moz-border-radius-bottomleft: ' + value[3] + 'px; ';
			cR += '-webkit-border-bottom-left-radius: ' + value[3] + 'px; ';
			cR += 'border-bottom-left-radius: ' + value[3] + 'px; ';
		} 
		return cR;
	}
	return '-moz-border-radius: ' + value + '; -webkit-border-radius: ' + value + '; border-radius: ' + value + ';';
}

var cssBoxShadow = function(shadows) {
	if(!$.isArray(shadows)) { shadows = [shadows]; }

	var _moz = '-moz-box-shadow: ';
	var _webkit = '-webkit-box-shadow: ';
	var _normal = 'box-shadow: ';
		
	cR = '';
	for (var i=0;i<shadows.length;i++) {
		if(i>0) {
			_moz += ", ";
			_webkit += ", ";
			_normal += ", ";
		}
		_moz += shadows[i];
		_webkit += shadows[i];
		_normal += shadows[i];
		
		cR += _moz + "; " + _webkit + "; " + _normal + "; ";
	}
	return cR;
}
