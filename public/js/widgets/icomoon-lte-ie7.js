/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-home' : '&#x30;',
			'icon-pencil' : '&#x31;',
			'icon-stack' : '&#x32;',
			'icon-history' : '&#x33;',
			'icon-user' : '&#x34;',
			'icon-busy' : '&#x35;',
			'icon-cog' : '&#x36;',
			'icon-warning' : '&#x37;',
			'icon-notification' : '&#x38;',
			'icon-question' : '&#x39;',
			'icon-info' : '&#x61;',
			'icon-cancel-circle' : '&#x62;',
			'icon-checkmark-circle' : '&#x63;',
			'icon-close' : '&#x64;',
			'icon-checkmark' : '&#x65;',
			'icon-exit' : '&#x66;',
			'icon-play' : '&#x67;',
			'icon-play-2' : '&#x68;',
			'icon-mail' : '&#x69;',
			'icon-book' : '&#x6a;',
			'icon-star' : '&#x6b;',
			'icon-print' : '&#x6c;',
			'icon-info-2' : '&#x6d;',
			'icon-point-up' : '&#x6e;',
			'icon-file' : '&#x6f;',
			'icon-phone' : '&#x70;',
			'icon-search' : '&#x71;',
			'icon-filter' : '&#x72;',
			'icon-mail-2' : '&#x73;',
			'icon-youtube' : '&#x74;',
			'icon-binoculars' : '&#x75;',
			'icon-arrow-right' : '&#x76;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};