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
  assert.equal($livePage.resources.length, 1)
});
