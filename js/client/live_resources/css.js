
var LiveResourceCSS = function(element, parentElem, LivePage){
  this.parentElem = parentElem;
  this.element = element;
  this.LivePage = LivePage;

  this.initalize = function(){
    this.xhr = null;
    this.method = 'GET';

    this.cache = null;
    this.headers = {
      'Etag': null,
      'Last-Modified': null,
      'Content-Length': null
    };

    if(this.element && this.element.href){
      this.url = this.element.href
      this.trimURL();
    }else{
      this.url = this.element;
    }

    this.findImportedStyles();
  };

  this.findImportedStyles = function(){
    var xhr = new XMLHttpRequest();
    try {
      xhr.open('GET', this.cacheBreakingURL(), false);
    } catch (e) {
      $livePage.removeResource(this.url);
      return;
    }

    xhr.send();

    if (xhr.readyState == 4 && xhr.status != 304) {
      var styleElem = document.createElement('style');
      styleElem.type = 'text/css';
      styleElem.appendChild(document.createTextNode(""));
      styleElem.innerText = xhr.response
      document.head.appendChild(styleElem);

      var sheet = styleElem.sheet;
      for(var rule = 0; rule < sheet.rules.length; rule++){
        if(sheet.rules[rule].constructor.name == 'CSSImportRule'){
          var a = document.createElement('a');
          a.href = sheet.rules[rule].href;
          this.LivePage.addResource(new LiveResourceCSS(a.href, this, this.LivePage));
        }
      }

      delete styleElem;
    }
  };
  this.refresh = function(){
    // if we have a parent element, get that to reload insead.
  };
};

LiveResourceCSS.prototype = new LiveResource();
