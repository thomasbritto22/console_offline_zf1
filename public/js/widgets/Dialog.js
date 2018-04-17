if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.Dialog = function(config){
    this.config = {
        id: 'Dialog',
        bodyContent: ''
    };
    
    // if any config values are passed in, override defaults
    if(config) for(var c in config) this.config[c] = config[c];
    
    this.init();
};

Lrn.Widget.Dialog.prototype = new Lrn.Widget();
Lrn.Widget.Dialog.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.Dialog.prototype.init = function(){
    // call the superclass init method to extend
    this.superclass.init.apply(this);
    
    this.buildModalBg();
    this.buildWrapper();
    this.buildHeader();
    this.buildBody();
    this.buildFooter();
    
    // then add the dialog to the body
    document.body.appendChild(this.wrapper);
};

Lrn.Widget.Dialog.prototype.buildWrapper = function(){
    this.wrapper = document.createElement('div');
    this.wrapper.id = this.config.id;
    this.wrapper.className = 'dialogWrapper';
};

Lrn.Widget.Dialog.prototype.buildHeader = function(){
	var dialogMgr = this;
	
    this.header = document.createElement('div');
    this.header.className = 'header';
    
    this.headerTitle = document.createElement('h3');
    this.headerTitle.appendChild(document.createTextNode(this.config.title));
    this.header.appendChild(this.headerTitle);
    
    this.headerClose = document.createElement('button');
    this.headerClose.className = 'close';
    this.headerClose.appendChild(document.createTextNode('close'));
    this.header.appendChild(this.headerClose);
    
    //on close default behavior
    $(this.headerClose).on('click', function(e, ui){
        dialogMgr.close();
    });
    
    this.wrapper.appendChild(this.header);
};

Lrn.Widget.Dialog.prototype.buildBody = function(){
    var dialogMgr = this;
    this.body = document.createElement('div');
    this.body.className = 'body';
    
    // give the body a height and width that
    // is independant of, but can be overridden by CSS.
    $(this.body).css({
        width: dialogMgr.config.width,
        height: dialogMgr.config.height
    });
    
    // insert the body content based on what type
    // we've been given. string vs. HTML nodes
    if(typeof this.config.bodyContent == 'string'){
        this.body.innerHTML = this.config.bodyContent;
    }
    else if(typeof this.config.bodyContent == 'object'){
        this.body.appendChild(this.config.bodyContent);
    }
    
    this.wrapper.appendChild(this.body);
};

Lrn.Widget.Dialog.prototype.buildFooter = function(){
    this.footer = document.createElement('div');
    this.footer.className = 'footer';
    this.wrapper.appendChild(this.footer);
};

Lrn.Widget.Dialog.prototype.show = function(){
    this.wrapper.style.display = "block";
    this.wrapper.style.visibility = "visible";
    this.showModalBg();
};

Lrn.Widget.Dialog.prototype.close = function(){
    this.wrapper.style.display = "none";
    this.wrapper.style.visibility = "hidden";
    this.hideModalBg();
};