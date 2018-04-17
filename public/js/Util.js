//Add console object & console.log method if IE doesn't have developer tools open
if(!(window.console && console.log)) {
  console = {
    log: function(){},
    debug: function(){},
  };
}
window.alert = function(){
	console.log(arguments);
};
//global function to attach click handler for keyboard events for accessibility
function attachClickHandler(){   
    e = window.event;   
    var code =  e.which;
    if(code == 13 || code == 32) {       
        e.target.click();       
    }
}
/**
 * --- THIS MANY WORDS ---
 * Receives a string, s, and returns the number
 * of words, num, specified.
 * @param s, num
 * @returns {String}
 */
function thisManyWords(s, num){
	var out = "";
	
	s = countingWordPrep(s);
	
	for(i = 0; i < s.split(' ').length && i < num; i++)
	{
		out += (i > 0 ? ' ' : '');
		out += s.split(' ')[i];
	}
	
	return out;
}

/**
 * --- COUNTING WORD PREP ---
 * Receives a string, s, and returns the cleaned
 * string by replacing extraneous spaces.
 * @param s
 * @returns {String}
 */
function countingWordPrep(s) {
	s = s.replace(/(^\s*)|(\s*$)/gi,"");
	s = s.replace(/[ ]{2,}/gi," ");
	s = s.replace(/\n /,"\n");
	
	return s;
}

/**
 * --- IS EMPTY ---
 * Useful to determine if an object is empty.
 * Arrays have length = 0, objects have isEmpty().
 * @param obj
 * @returns {Boolean}
 */
isEmpty = function(obj){
    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            return false;
        }
    }
    return true;
};

/**
 * --- ROUND TO HALF ---
 * This function rounds a number to the first
 * decimal place in increments of .5
 * @param value
 * @returns {Int}
 */
function roundToHalf(value) {
    // make sure we have a number
    var converted = parseFloat(value);
    
    // get the decimal value of the number passed into the function
    var decimal = (converted - parseInt(converted));
    
    // multiply by 10 to create a whole number and round
    // to remove any remaining decimal places that may exist
    decimal = Math.round(decimal * 10);
    
    // if decimal is 3 or below, round.
    // if decimal is 7 or above, round.
    // otherwise, add .5 to the int portion of the passed value
    if ( (decimal < 3) || (decimal > 7) ) return Math.round(converted);
    else return (parseInt(converted, 10) + 0.5);
 }

/**
 * --- isMobile ---
 * This object quickly detects whether or not
 * the browser is on a modern mobile device
 * @param 
 * @returns {Boolean}
 */
var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i) ? true : false;
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i) ? true : false;
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i) ? true : false;
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
  }
};

/**
 * --- ALTER JQUERY CALENDAR (reverse years) ---
 * alter the jquery UI calendar year dropdown to be reverse
 */
// store original so we can call it inside our overriding method
/*$.datepicker._generateMonthYearHeader_original = $.datepicker._generateMonthYearHeader;
$.datepicker._generateMonthYearHeader = function(inst, dm, dy, mnd, mxd, s, mn, mns) {
  var header = $($.datepicker._generateMonthYearHeader_original(inst, dm, dy, mnd, mxd, s, mn, mns)),
      years = header.find('.ui-datepicker-year');

  // reverse the years
  years.html(Array.prototype.reverse.apply(years.children()));

  // return our new html
  return $('<div />').append(header).html();
};*/

if(typeof String.prototype.trim !== 'function') { 
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, ''); 
	}
}

String.prototype.ucfirst = function() {
	return this.substring(0, 1).toUpperCase() + this.substring(1).toLowerCase();
}

String.prototype.stripHtml = function () {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = this;
   return tmp.textContent || tmp.innerText || "";
}

//escape HTML special character in string
function escapeHtml(string){
	var entityMap = {
		    "&": "&amp;",
		    "<": "&lt;",
		    ">": "&gt;",
		    '"': '&quot;',
		    "'": '&apos;',
		    "/": '&#x2F;'
		  };
	
	return String(string).replace(/[&<>"'\/]/g, function (s){
	  return entityMap[s];
	});
}
//unescape HTML special character in string
function unescapeHtml(string){
	return string.replace(/&amp;/g, '&')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
				.replace(/&#x2F;/g, "/");
}

//function to remove the script tag from html content
function stripScripts(s){
    var div = document.createElement('div');
    div.innerHTML = s;
    
    var scripts = div.getElementsByTagName('script');
    var i = scripts.length;
    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
    return div.innerHTML;
}

function initPlaceholderText(){
  var input = document.createElement('input');
  var textarea = document.createElement('textarea');
  if(('placeholder' in input || 'placeholder' in textarea)==false) {
    $('[placeholder]').focus(function(){
      var i = $(this);
      if(i.val() == i.attr('placeholder')) {
        i.val('').removeClass('placeholder');
        if(i.hasClass('password')) {
          i.removeClass('password');
          
          if ('function' === typeof this.setAttribute){
        	  this.setAttribute('type', 'password');
          }
        }
      }
    }).blur(function(){
      var i = $(this);
      if(i.val() == '' || i.val() == i.attr('placeholder')){
        if(this.type=='password') {
          i.addClass('password');
          
          if ('function' === typeof this.setAttribute){
        	  this.setAttribute('type', 'text');
          }
        }
        i.addClass('placeholder').val(i.attr('placeholder'));
      }
    }).blur().parents('form').submit(function(){
      $(this).find('[placeholder]').each(function(){
        var i = $(this);
        if(i.val() == i.attr('placeholder'))
          i.val('');
      })
    });
  }   
}

function moreNavMenuItems(){
  var viewport = $(window).width();
  var navigationMenu = $('#navigationMenu > li');
  var navigationMenuLength = $('#navigationMenu > li').length;
  $('#navigationMenu').css({'width': '100%'});
  $('#navigationMenu > li').css({'width': '75px'});
}

function androidPrintTip(){
  var bg = document.createElement('div');
  bg.className = "androidPrintBg";

  var message = document.createElement('p');
  var text = document.createTextNode('We\'re sorry, this link doesn\'t work on Android tablets.  To print this page, use the Print option in the tablet\'s menu.');
  
  var image = document.createElement('img');
  image.src = CDN_IMG_URL + '/images/icons/lightbulb.png';

  message.appendChild(image);
  message.appendChild(text);
  bg.appendChild(message);
  document.body.appendChild(bg);

  setTimeout(function(){
    bg.remove();
  }, 6000);
}
function alertDialogBox(imageName,msg,popJson) { 
   
    $("#innerMessageModal").dialog("close");
    var imagePath = "/images/backgrounds/" + imageName + ".png";
    var htmlContent = '<div role="alertdialog"  aria-labelledby="dialog1Title" aria-describedby="dialog1Desc"><div tabindex="0"><div style="text-align:center;"><img aria-hidden="true" width="25%" src="' + imagePath + '"></div><p class="systemMessage"  id="dialog1Title" style="text-align:center">' + msg + '</p></div></div>';
    $("#messageModal").html(htmlContent);
    $("#messageModal").dialog({
        modal: true,
        resizable: false,
        minHeight: 300,
        width: 350,
        closeOnEscape: false,
        draggable: false,
        cache: false,
        buttons: [
            {
                text: popJson.closeText,
                icons: {
                    primary: "ui-icon-heart"
                },
                click: function () {
                    $(this).dialog("close");
                    $("#innerMessageModal").dialog("close");
                }

            }
        ],
        open: function (event, ui) {
            //$(".ui-dialog-titlebar-close", $(this).parent()).hide();
            $(".ui-dialog-titlebar", $(this).parent()).hide();
            $("#messageModal").addClass("borderBottomRadius");
            $("#ui-id-1").addClass("span-margin");
        },
        close:function( event, ui ) {
           //bring focus to save button incase of success
           var errorcontains= $('.error').length;           
           if(errorcontains > 0){
                $('.errorField:first').focus();
            }else{
                $(".updateButtons>button:first").focus();
            }
            if(imageName == 'done'){
                location.reload();
            }
            // remove title-error class for valid fields
            if($("#currentPass" ).hasClass( "valid" ) && !$("#currentPass" ).hasClass( "errorField" )){               
                $("#curPasField").find('.title-error').removeClass('title-error');
            }
            if($("#newPass" ).hasClass( "valid" ) && !$("#newPass" ).hasClass( "errorField" )){               
                $("#newPasField").find('.title-error').removeClass('title-error');
            }
            if($("#confirmPass" ).hasClass( "valid" ) && !$("#confirmPass" ).hasClass( "errorField" )){                
                $("#confirmPasField").find('.title-error').removeClass('title-error');
            }
        }
    });    
    if (popJson.autoclose) {
        setTimeout(function () {
            $("#messageModal").dialog("close");
        }, popJson.timeclose);
    }  
    
}  
function alertSaveBox(label) { 
    $("#innerMessageModal").html('<p class="messageModalText"><span class="messageModalImg"><img aria-hidden="true" src="' + CDN_IMG_URL + '/images/backgrounds/ajax-loader.gif"  alt="'+label+'" width=50 height=50/></span></br>'+label+'</p>');
    $("#innerMessageModal").dialog({
        resizable: false,
        minHeight: 150,
        width: 150,
        closeOnEscape: false,
        open: function (event, ui) {
            $(".ui-dialog-titlebar-close", $(this).parent()).hide();
            $(".ui-dialog-titlebar", $(this).parent()).hide(); 
            $("#innerMessageModal").addClass("accInnerMessageModal");
        }
    });
    
}