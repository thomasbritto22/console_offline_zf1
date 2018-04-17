if(typeof Lrn == 'undefined') Lrn = {};
if(typeof Lrn.Widget == 'undefined') Lrn.Widget = {};

Lrn.Widget.ShareControls = function(config){
    // if any config values are passed in, override defaults
    if(config) for(var c in config) this.config[c] = config[c];
};

Lrn.Widget.ShareControls.prototype = new Lrn.Widget();
Lrn.Widget.ShareControls.prototype.superclass = Lrn.Widget.prototype;

Lrn.Widget.ShareControls.prototype.init = function(){
    
};

Lrn.Widget.ShareControls.prototype.buildControl_linkedIn = function(){
    var shareCtrl_linkedIn = document.createElement('button');
    shareCtrl_linkedIn.className = 'linkedIn';
    shareCtrl_linkedIn.title = 'Share on LinkedIn';
    shareCtrl_linkedIn.appendChild(document.createTextNode('Share on LinkedIn'));
    return shareCtrl_linkedIn;
};

Lrn.Widget.ShareControls.prototype.buildControl_facebook = function(){
    var shareCtrl_facebook = document.createElement('button');
    shareCtrl_facebook.className = 'facebook';
    shareCtrl_facebook.title = 'Share on Facebook';
    shareCtrl_facebook.appendChild(document.createTextNode('Share on Facebook'));
    return shareCtrl_facebook;
};

Lrn.Widget.ShareControls.prototype.buildControl_twitter = function(){
    var shareCtrl_twitter = document.createElement('button');
    shareCtrl_twitter.className = 'twitter';
    shareCtrl_twitter.title = 'Share on Twitter';
    shareCtrl_twitter.appendChild(document.createTextNode('Share on Twitter'));
    return shareCtrl_twitter;
};