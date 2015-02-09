
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Remove one from group', function (t) {

	var container = new Sandal();
	container.object('obj1', 'first object', { groups: ['myGroup'] });
	container.object('obj2', 'second object', { groups: ['myGroup'] });
	container.remove('obj2');

	container.resolve(function(error, myGroup) {
		t.notOk(error, 'should not fail');
		t.deepEqual(myGroup, { obj1: 'first object' }, 'should get non removed components');
		t.end();
	});

});