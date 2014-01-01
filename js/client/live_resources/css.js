
function LiveResourceCSS(url, parent){
  this.parent = parent;
  this.url = url;
  this.initalize();
}

LiveResourceCSS.prototype = LiveResource.prototype;

LiveResourceCSS.prototype = {
  refresh: function(){
    // Refresh the CSS in it's place after checking this one is the parent.
  }
};
