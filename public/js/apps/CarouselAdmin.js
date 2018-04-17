if(typeof(Lrn) == 'undefined') Lrn = {};
if(typeof(Lrn.Application) == 'undefined') Lrn.Application = {};

Lrn.Application.Carousel = function(config){
 
};

/**
 * --- Carousel PROTOTYPE ---
 */
Lrn.Application.Carousel.prototype = new Lrn.Application();
Lrn.Application.Carousel.prototype.superclass = Lrn.Application.prototype;

/**
 * --- Carousel properties ---
 */


/**
 * --- Carousel methods ---
 */
Lrn.Application.Carousel.prototype.init = function(config){
  // before we extend the superclass init method, 
  // we call the init method of the superclass (Application.js)
  this.superclass.init.apply(this);
  this.initCarousel();
  this.initClearButton();
  this.initImageChange();
};

Lrn.Application.Carousel.prototype.initCarousel = function(){
  var slides = $('.carouselItems').children();

  for (var i = 0; i <= slides.length - 1; i++) {
    if(i != '0') {
      var parent = $('#slide_' + i + ' .slidePreview .slideshowImgWrap');
      var slideImage = $('#slide_' + i + ' .slidePreview .slideshowImgWrap img');
      var tempImage = new Image();
      tempImage.src = slideImage.attr('src');

      var naturalImageWidth = tempImage.width;
      var naturalImageHeight = tempImage.height;      
      var parentHeight = parent.height();
      var parentWidth = parent.width();
      
      if($('#slide_' + i + ' .slidePreview .slideshowImgWrap img').attr('src').match( '/images/placeholders/ss-placeholder.png' ) == null) {
        if(naturalImageHeight > parentHeight && naturalImageWidth > parentWidth) {
          // Image is taller than it's width
          if(naturalImageHeight > naturalImageWidth) {
            ratio = naturalImageHeight/naturalImageWidth;
            newWidth = parentHeight/ratio;
            var n = parentWidth - newWidth;
            var m = n/2;
            slideImage.css({'width': newWidth + 'px', 'height': parentHeight + 'px', 'margin-left': m + 'px'});

          // Image is shorter than it's width 
          } else if(naturalImageHeight < naturalImageWidth) {
            ratio = naturalImageWidth/naturalImageHeight;
            newHeight = parentWidth/ratio;
            var s = parentHeight - newHeight;
            var t = Math.abs(s)/2;
            if(newHeight > parentHeight) {
              slideImage.css({'width': parentWidth + 'px', 'height': newHeight + 'px'});
            } else {
              slideImage.css({'width': parentWidth + 'px', 'height': newHeight + 'px', 'margin-top': t + 'px'});  
            }
            
          // Image is a square  
          } else if(naturalImageHeight = naturalImageWidth) {
            var s = parentWidth - parentHeight;
            var t = s/2;
            slideImage.css({'width': parentHeight +'px', 'height': parentHeight + 'px', 'margin-left': t + 'px'});

          // all others
          } else {
            var l = parentWidth - naturalImageWidth;
            var m = parentHeight - naturalImageHeight;
            var o = l/2;
            var p = m/2;
            slideImage.css({'width': naturalImageWidth + 'px', 'height': naturalImageHeight + 'px', 'margin-top': p + 'px', 'margin-left': o + 'px'});

          }
        } else if(naturalImageHeight > parentHeight && naturalImageHeight > naturalImageWidth) {
          ratio = naturalImageHeight/naturalImageWidth;
          newWidth = naturalImageWidth/ratio;
          var s = parentWidth - naturalImageWidth;
          var t = s/2;
          slideImage.css({'height': parentHeight + 'px', 'width': newWidth + 'px', 'margin-left': t + 'px'});
        } else if(naturalImageWidth > parentWidth && naturalImageWidth > naturalImageHeight) {
          ratio = naturalImageWidth/naturalImageHeight;
          newHeight = naturalImageHeight/ratio;
          var s = parentHeight - naturalImageHeight;
          var t = s/2;
          slideImage.css({'width': parentWidth + 'px', 'height': newHeight + 'px', 'margin-top': t + 'px'});
        } else {
          var l = parentWidth - naturalImageWidth;
          var m = parentHeight - naturalImageHeight;
          var o = l/2;
          var p = m/2;
          slideImage.css({'width': naturalImageWidth + 'px', 'height': naturalImageHeight + 'px', 'margin-top': p + 'px', 'margin-left': o + 'px'}); 
        }  
      }
    }
  };
};

Lrn.Application.Carousel.prototype.initClearButton = function(){
  $('[name="clearSlideShowImage"]').click(function(e){
    $this = $(e.target || e.srcElement);
    var carouselFieldset = $this.closest('fieldset');
    var clearCarouselImage = carouselFieldset.find("input[name|='clearCarouselImage']");
    var clearCarouselImageName = clearCarouselImage.attr('name');
    var clearCarouselImageNameSplit = clearCarouselImageName.split('-');
    var clearCarouselImageNameNumber = clearCarouselImageNameSplit[1];
    clearCarouselImageNameNumber++;
    
    $('#slide_' + clearCarouselImageNameNumber).find('img').removeAttr('style');
  });
};

Lrn.Application.Carousel.prototype.initImageChange = function(){

  $('.slideshowImgWrap').find('img').on('change', function(e){
    
    $this = $(e.target || e.srcElement);
    var tempImage = new Image();
    tempImage.src = e.target.src;
    var slideImage = $this;
    var naturalImageWidth = tempImage.width;
    var naturalImageHeight = tempImage.height;      
    var parentHeight = 198;
    var parentWidth = 298;
    slideImage.removeAttr('style');

    if(naturalImageHeight > parentHeight && naturalImageWidth > parentWidth) {
      // Image is taller than it's width
      if(naturalImageHeight > naturalImageWidth) {
        ratio = naturalImageHeight/naturalImageWidth;
        newWidth = parentHeight/ratio;
        var n = parentWidth - newWidth;
        var m = n/2;
        slideImage.css({'width': newWidth + 'px', 'height': parentHeight + 'px', 'margin-left': m + 'px'});

      // Image is shorter than it's width 
      } else if(naturalImageHeight < naturalImageWidth) {
        ratio = naturalImageWidth/naturalImageHeight;
        newHeight = parentWidth/ratio;
        var s = parentHeight - newHeight;
        var t = Math.abs(s)/2;
        if(newHeight > parentHeight) {
          slideImage.css({'width': parentWidth + 'px', 'height': newHeight + 'px'});
        } else {
          slideImage.css({'width': parentWidth + 'px', 'height': newHeight + 'px', 'margin-top': t + 'px'});  
        }
        
      // Image is a square  
      } else if(naturalImageHeight = naturalImageWidth) {
        var s = parentWidth - parentHeight;
        var t = s/2;
        slideImage.css({'width': parentHeight +'px', 'height': parentHeight + 'px', 'margin-left': t + 'px'});

      // all others
      } else {
        var l = parentWidth - naturalImageWidth;
        var m = parentHeight - naturalImageHeight;
        var o = l/2;
        var p = m/2;
        slideImage.css({'width': naturalImageWidth + 'px', 'height': naturalImageHeight + 'px', 'margin-top': p + 'px', 'margin-left': o + 'px'});

      }
    } else if(naturalImageHeight > parentHeight && naturalImageHeight > naturalImageWidth) {
      ratio = naturalImageHeight/naturalImageWidth;
      newWidth = naturalImageWidth/ratio;
      var s = parentWidth - naturalImageWidth;
      var t = s/2;
      slideImage.css({'height': parentHeight + 'px', 'width': newWidth + 'px', 'margin-left': t + 'px'});
    } else if(naturalImageWidth > parentWidth && naturalImageWidth > naturalImageHeight) {
      ratio = naturalImageWidth/naturalImageHeight;
      newHeight = naturalImageHeight/ratio;
      var s = parentHeight - naturalImageHeight;
      var t = s/2;
      slideImage.css({'width': parentWidth + 'px', 'height': newHeight + 'px', 'margin-top': t + 'px'});
    } 
//    else {
//      var l = parentWidth - naturalImageWidth;
//      var m = parentHeight - naturalImageHeight;
//      var o = l/2;
//      var p = m/2;
//      slideImage.css({'width': naturalImageWidth + 'px', 'height': naturalImageHeight + 'px', 'margin-top': p + 'px', 'margin-left': o + 'px'}); 
//    } 
  });
};