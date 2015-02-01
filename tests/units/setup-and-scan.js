QUnit.module("Setup", {
  beforeEach: function(){
    $livePage = new LivePage($livePageConfig);
  }
});

QUnit.test( "LivePage can initalize", function( assert ) {
  assert.equal(typeof($livePage), "object")
});

QUnit.module("Scan", {
  beforeEach: function(){
    $livePage = new LivePage($livePageConfig);
    $livePage.findResources();
  }
});

QUnit.test("Finds all the CSS sheets", function( assert ) {
  var resources = _.filter($livePage.resources, function(resource){
    return (resource instanceof LiveResourceCSS)
  });

  assert.equal(resources.length, 1)
});
