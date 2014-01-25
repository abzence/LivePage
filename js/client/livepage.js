LivePage = function(config){
  this.options = config;
  this.options.enabled = true;
  this.resources = [];
  this.lastChecked = 0;
  this.url = document.URL;

  if (this.options.use_css_transitions == true) {
    style = document.createElement("style");

    style.setAttribute("type", "text/css");
    style.appendChild(document.createTextNode('.livepage-loading * {transition: all .1s ease-in;}'));
    document.querySelector('head').appendChild(style)
    document.querySelector('html').classname += ' livepage-loading';
  }

};
LivePage.prototype = {
  findResources: function(){
    var currentPage = new LiveResource(this.url);
    if (this.options.monitor_html == true) {
      this.addResource(currentPage);
    }

    if (this.options.monitor_css == true) {
      this.addCSSResources(currentPage);
    }

    if (this.options.monitor_less == true) {
      this.addLESSResources();
    }

    if (this.options.monitor_js == true) {
      this.addResources('script[src*=".js"]');
    }

    if(this.options.monitor_custom == true){
      this.addResources('link[rel="livePage"]');
    }
  },

  addResources: function(query){
    elements = document.querySelectorAll(query);
    for (var key = 0; key < elements.length; key++) {
      this.addResource(new LiveResource((elements[key].href || elements[key].src)));
    }
  },

  addCSSResources: function(currentPage){
    elements = document.styleSheets;
    for (var key = 0; key < elements.length; key++) {
      if(elements[key].href != null){ // It's a linked CSS file
        this.addResource(new LiveResourceCSS(elements[key].href, false, this));
      }

      if(elements[key].rules != null){ // It's a linked CSS file
        for(var rule = 0; rule < elements[key].rules.length; rule++){
          if(elements[key].rules[rule].constructor.name == 'CSSImportRule'){
            var a = document.createElement('a');
            a.href = elements[key].rules[rule].href;
            this.addResource(new LiveResourceCSS(a.href, currentPage, this));
          }
        }
      }
    }
  },

  addLESSResources: function(){
  },

  addResource: function(resource){
    resource.initalize();
    if(resource.isTrackable){
      this.resources[this.lastChecked++] = resource;
    }
  },

  removeResource: function(resource){
    for (r in this.resources) {
      if (this.resources[r] == resource) {
        delete this.resources[r];
      }
    }

    this.resources.sort(function () {
      return 0.5 - Math.random();
    });
    this.lastChecked = 0;
  },

  check: function(){
    if (this.options.enabled == false) {
      return false;
    }

    this.lastChecked++;
    if (this.resources[this.lastChecked] == undefined) {
      this.lastChecked = 0;
    }

    if (this.resources[this.lastChecked] == undefined) { // Nothing left to check
      $livePage.options.enabled = false;
      return;
    }

    this.resources[this.lastChecked].check(function(){
      setTimeout(function () {
        $livePage.check();
      }, $livePage.options.refresh_rate);
    });
  }
};

if (typeof $livePageConfig == "object") {
  $livePage = new LivePage($livePageConfig);
  $livePage.findResources();
  $livePage.check();
}
