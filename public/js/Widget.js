if(typeof Lrn == 'undefined') Lrn = {};

/**
 * --- Lrn.Widget ---
 * All widgets will extend this object.
 */
Lrn.Widget = function(){};

Lrn.Widget.prototype = {
    init: function(){
        
    },
    
    /**
     * --- BUILD MODAL BACKGROUND ---
     * Builds an element that we can use to black
     * out the screen behind any kind of modal widget.
     */
    buildModalBg: function(){
        if(!this.modalBg){
            this.modalBg = document.createElement('div');
            this.modalBg.className = 'modalBg';
            document.body.appendChild(this.modalBg);
        }
    },
    
    /**
     * -- SHOW MODAL BACKGROUND ---
     * Shows the modal background
     */
    showModalBg: function(){
        $(this.modalBg).show();
    },
    
    /**
     * --- HIDE MODAL BACKGROUND ---
     * Hides the modal background
     */
    hideModalBg: function(){
        $(this.modalBg).hide();
    }
};
