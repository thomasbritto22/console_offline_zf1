if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.MobileNavigation = function() {

};

Lrn.Widget.MobileNavigation.prototype = new Lrn.Widget();
Lrn.Widget.MobileNavigation.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.MobileNavigation.prototype.init = function() {
	
	var moreNavElement = '<li id="moreNavItems"><a href="#" class="primaryTextIcons font-size16"><i class="fa fa-ellipsis-h secondaryTextIcons"></i><span class="font-size16">more</span></a></li>'
	var elementCheck = $('#moreNavItems');
	var nav = $('#navigationMenu').children();
	var navElements = [];
	var navLength = nav.length;
	var viewport = $(window).width();
	// console.log(nav);
	if($(window).width() <= '767') {
		for (var i = 0; i < nav.length - 1; i++) {
			if(nav[i].id != "moreNavItems") {
				navElements.push(nav[i]);
				// console.log(navElements[i]);
				navElements[i].style.width = '80px';
				navElements[i].style.display = 'none';
			} else {
				break;
			}
		};

		$('#navigationMenu').css({'width': '100%'});
		var x = navElements[0].clientWidth = 75; 
		var numItems = Math.floor(viewport/x);
		for (var i = 0; i < numItems; i++) {
			
			if(i == numItems-1) {
				if(elementCheck.length == 0) {
					$(navElements[i]).before(moreNavElement);	
				} else {
					$(navElements[i]).before(moreNavElement);
				}
			} else {
				navElements[i].style.display = 'block';	
			}
		}
	} else {
		$('#moreNavItems').remove();
		$('#navigationMenu > li').css({'display': 'block'});
	}
	// console.log(nav, navLength, viewport, navElements, x, numItems);

};