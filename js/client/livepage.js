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
    if (this.options.monitor_css == true) {
      this.addCSSResources();
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

    if (this.options.monitor_html == true) {
      this.addResource(new LiveResource(this.url));
    }
  },

  addResources: function(query){
    elements = document.querySelectorAll(query);
    for (var key = 0; key < elements.length; key++) {
      this.addResource(new LiveResource((elements[key].href || elements[key].src)));
    }
  },

  addCSSResources: function(){
    elements = document.styleSheets;
    for (var key = 0; key < elements.length; key++) {
      if(elements[key].href != null){
        debugger;
        this.addResource(new LiveResourceCSS(elements[key].href));
      }
    }
  },

  addLESSResources: function(){
  },

  addResource: function(resource){
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
  debugger;
  $livePage.check();
}
