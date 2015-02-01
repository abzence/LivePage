/*
 * The livePages object, manages making pages live & storing the live setting.
 */
function livePages(){
  // The object of pages we have marked as live.
  this.livePages = {};
  this.refresh();
};

// Refreshes livePages from database.
livePages.prototype.refresh = function(){
  this.livePages = settings.get('livePages');
  if(settings.get('livePages') == null){
    this.livePages = {};
  }
};

// Wipes the database of all live pages.
livePages.prototype.removeAll = function(){
  settings.set('livePages', null);
};

/*
 * Transforms the URLS into the type the users have configured.
 */
livePages.prototype.cleanURL = function(url){
  settings.refresh();
  var a = document.createElement('a');
  a.href = url;

  // If they only want entire hosts, just return the host name
  if(settings.options.entire_hosts == true){
    if(a.hostname != ''){
      return a.hostname;
    }
    // Fallback for file:// protocol if there isn't one.
    return 'Local Files (file://)';
  }

  /*
   * Strips the hash from the URL. 
   * See https://developer.mozilla.org/en-US/docs/DOM/window.location#Properties for more info about the properties
   */
  if(settings.options.ignore_anchors == true){
    return a.protocol+a.port+'//'+a.hostname+a.pathname+a.search;
  }

  return url;
}

// Deletes a url from livePages list.
livePages.prototype.remove = function(tab){
  this.refresh();
  tab.url = this.cleanURL(tab.url);

  delete this.livePages[tab.url];
  settings.set('livePages', this.livePages);
  this.stop(tab);
};

// Add page to LivePages.
livePages.prototype.add = function(tab){
  this.refresh();
  tab.url = this.cleanURL(tab.gg=Gurl);

  this.livePages[tab.url] = true;
  settings.set('livePages', this.livePages);
  this.start(tab);
};

// Check if the url is on the livePages list.
livePages.prototype.isLive = function(url){
  this.refresh();
  url = this.cleanURL(url);

  if(typeof this.livePages[url] != "undefined"){
    return true;
  }
  return false;
};

// Turns on the LivePage on the tab.
livePages.prototype.start = function(tab){
  settings.refresh();

  // Update the Icon
  chrome.browserAction.setBadgeText({text: chrome.i18n.getMessage('@live'), tabId: tab.id});
  chrome.browserAction.setTitle({title: chrome.i18n.getMessage('@disable_on_this_tab'), tabId: tab.id});

  // Make the page Live
  chrome.tabs.executeScript(tab.id, {code: 'var $livePageConfig = '+JSON.stringify(settings.options)+'; var $livePage = false;'});
  if(settings.options.monitor_less == true){ // Only load the less stuff if we need it.
    chrome.tabs.executeScript(tab.id, {file: 'js/client/less-1.4.1.min.js'});
  }
  chrome.tabs.executeScript(tab.id, {file: 'js/client/live_resources/base.js'}, function(){
    chrome.tabs.executeScript(tab.id, {file: 'js/client/live_resources/css.js'}, function(){
      chrome.tabs.executeScript(tab.id, {file: 'js/client/livepage.js'}, function(){
        chrome.tabs.executeScript(tab.id, {code: 'if (typeof $livePageConfig == "object") { $livePage = new LivePage($livePageConfig); $livePage.findResources(); $livePage.check();}'})
      });
    });
  });
}

// Turns off live page on the tab.
livePages.prototype.stop = function(tab){
  // Stop live page running if it's there.
  chrome.tabs.executeScript(tab.id, {code: 'if(typeof $livePage != "undefined"){$livePage.options.enabled = false;}'});
  chrome.browserAction.setBadgeText({text: '', tabId: tab.id});
  chrome.browserAction.setTitle({title: chrome.i18n.getMessage('@enable_on_this_tab'), tabId: tab.id});
}

var livepages = new livePages();