// store old method for later use
var oldcr = $.ui.dialog.prototype._create;

// override the original _create method
$.ui.dialog.prototype._create = function(){
    oldcr.apply(this,arguments);
    // assign theming classes to the jquery ui dialog class          
    $('.ui-dialog-titlebar').addClass('contentBgColor');
    $('.ui-dialog-title').addClass('contentTitles');
    $('#themeui_dialog').addClass('contentBgColor');

    // we're individuals so we want to use our own icons not jquery
    // so we are replacing what they had, and adding our icomoon icons
    $('.ui-dialog-titlebar-close').html('<i class="fa fa-times secondaryTextIcons" aria-hidden="true"></i><i class="material-icons secondaryTextIcons" aria-hidden="true" title="Close">&#xE5CD;</i>');

    $('.ui-dialog-titlebar-close').addClass('secondaryBgColor');
    
    $('.ui-dialog-titlebar-close').attr('aria-label', 'close');

    $('.ui-dialog-content').addClass('contentBgColor');

    $('#messageModal').addClass('contentBgColor contentTextIcons ui-corner-all');

    $('.ui-dialog').addClass('globalBgColor');
    
    $('.ui-dialog-buttonpane').addClass('contentBgColor');
};