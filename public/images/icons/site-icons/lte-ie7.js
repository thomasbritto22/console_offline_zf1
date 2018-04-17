/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'site-icons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-home' : '&#x30;',
			'icon-cogs' : '&#x31;',
			'icon-info' : '&#x32;',
			'icon-question' : '&#x33;',
			'icon-user' : '&#x34;',
			'icon-screen' : '&#x35;',
			'icon-phone' : '&#x36;',
			'icon-file' : '&#x37;',
			'icon-busy' : '&#x38;',
			'icon-exit' : '&#x39;',
			'icon-envelop' : '&#x61;',
			'icon-layers' : '&#x62;',
			'icon-signup' : '&#x63;',
			'icon-arrow-left' : '&#x64;',
			'icon-arrow-right' : '&#x65;',
			'icon-arrow-down' : '&#x66;',
			'icon-arrow-up' : '&#x67;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
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