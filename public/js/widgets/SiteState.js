if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.SiteState = function(){

  this.loadingPath = CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif';
  this.imageBgPath = CDN_IMG_URL + '/images/backgrounds/';
  
};

Lrn.Widget.SiteState.prototype = new Lrn.Widget();
Lrn.Widget.SiteState.prototype.superclass = Lrn.Widget.prototype;



/**
 * --- GLOBAL LOAD/SAVING/ERROR FUNCTION ---
 * This will be called by any source that needs
 * to show the loading, saving, or error state
 * of our site.
 */
Lrn.Widget.SiteState.prototype.open = function(imageName, alertText){
  if($('.bgOverlay') && $('.siteStateContent')){
    $('.bgOverlay').remove();
    $('.siteStateContent').remove();
  }
  //Store the body tag in a variable
  var panel = document.getElementsByTagName('body') [0];

  //Build background overlay
  var overlay = document.createElement('div');
  overlay.setAttribute('class', 'bgOverlay');

  //Build wrapper for content
  var wrapper = document.createElement('div');
  wrapper.setAttribute('class', 'siteStateContent');

  //Build image
  var imageWrapper = document.createElement('div');
  imageWrapper.setAttribute('class', 'iWrap');

  var image = document.createElement('img');
  if(imageName == 'loading' || imageName == 'saving') {
    image.src = this.loadingPath;
  } else {
    image.src = this.imageBgPath + imageName + '.png';
  }

  //Build text
  var textEl = document.createElement('p');
  var text = document.createTextNode(alertText);
  textEl.setAttribute('class', 'siteStateText');

  //Append all elements to each other
  textEl.appendChild(text);
  imageWrapper.appendChild(image);
  wrapper.appendChild(imageWrapper);
  wrapper.appendChild(textEl);
  panel.appendChild(overlay);
  panel.appendChild(wrapper);
}

Lrn.Widget.SiteState.prototype.close = function(closeTime){
  setTimeout(function(){
    $('.bgOverlay').fadeOut(1000, function(){
      $('.bgOverlay').remove();  
    });
    $('.siteStateContent').fadeOut(1000, function(){
      $('.siteStateContent').remove();
    });
    
    
  }, closeTime);
}