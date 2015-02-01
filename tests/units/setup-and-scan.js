QUnit.module("Setup", {
  beforeEach: function(){
    $livePage = new livePage($livePageConfig, document.getElementById('qunit-fixture'));
  }
});

QUnit.test( "LivePage can initalize", function( assert ) {
  assert.equal(typeof($livePage), "object")
});

QUnit.module("Scan", {
  beforeEach: function(){
    $livePage = new livePage($livePageConfig, document.getElementById('qunit-fixture'));
    $livePage.scanPage();
  }
});

QUnit.test("Finds all the CSS sheets", function( assert ) {
  debugger;
  assert.equal($livePage.resources.length, 1)
});
