var LiveResource = function(url){
  this.url = url;

  this.initalize = function(){
    this.xhr = null;
    this.method = 'GET';

    this.cache = null;
    this.headers = {
      'Etag': null,
      'Last-Modified': null,
      'Content-Length': null
    };

    this.trimURL();
  };

  this.trimURL = function(){
    if ($livePage.options.ignore_anchors == true) {
      url = this.url.split('#');
      this.url = url[0];
    }
  };

  this.isTrackable = function(){
    if ($livePage.options.skip_external == false) {
        return true;
    }

    match = this.url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) return false;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":(" + {
        "http:": 80,
        "https:": 443
    }[location.protocol] + ")?$"), "") !== location.host) return false;
    return true;
  };

  this.cacheBreakingURL = function(){
    if (this.url.indexOf('?') > 0) {
      return this.url + '&livePage=' + (new Date() * 1);
    }
    return this.url + '?livePage=' + (new Date() * 1);
  };

  this.check = function(callback){
    this.xhr = new XMLHttpRequest();
    try {
      this.xhr.open(this.method, this.cacheBreakingURL(), false);
    } catch (e) {
      $livePage.removeResource(this.url);
      return;
    }

    this.xhr.send();

    if (this.xhr.readyState == 4 && this.xhr.status != 304) {
      this.xhr.getAllResponseHeaders();

      if (this.testHeaders() && this.testResponseBody()) {
        this.refresh();
      }
      callback();
    }

    this.xhr = null;
  };

  this.testHeaders = function(){
    if (this.url.indexOf('file://') == 0 || $livePage.url.indexOf('file://') == 0){
      return true;
    }

    var headersChanged = false;
    for (var h in this.headers) {
      if (this.headers[h] != null && (this.xhr.getResponseHeader(h) == null || this.headers[h] != this.xhr.getResponseHeader(h))) {
        headersChanged = true;
      }
      // Update the headers.
      this.headers[h] = this.xhr.getResponseHeader(h);
    }
    return headersChanged;
  };

  this.testResponseBody = function(){
    response = this.trimedResponseBody();
    returnVal = false;
    if(this.method == 'HEAD' || (this.cache != null && this.cache != response)){
      returnVal = true;
    }
    this.cache = response;

    return returnVal;
  };

  this.refresh = function(){
    try {
      chrome.extension.sendMessage({
        action: 'reload'
      }, function () {});
    } catch (e) {
      document.location.reload($livePage.url);
    }
  };

  this.trimedResponseBody = function(){
    response = this.xhr.responseText;
    if ($livePage.options.tidy_html == true) {
      // Remove comments and whitespace.
      response = response.replace(/<!--([\s\S]*?)-->/gim, '');
      response = response.replace(/  /gim, ' ');
      response = response.replace(/(\r\n|\n|\r|\t\s)/gim, '');
    }

    if ($livePage.options.tidy_inline_html == true) {
      response = response.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');
      //response = response.replace(/<style(.*?)>(.*?)<\/style>/gim, '');
      response = response.replace(/<input(.*?)hidden(.*?)>/gim, '');
    }

    return response;
  };
};
