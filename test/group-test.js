
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Adding tag to service, factory and object', function (t) {

	var sandal = new Sandal();

	sandal.factory('factory1', function (done) {
		done(null, 'f1');
	}, [ 'tag1', 'tag2' ]);
	sandal.factory('factory2', function () {
		return 'f2';
	}, true, [ 'tag1' ]);
	sandal.factory('factory3', [ 'object1' ], function (o) {
		return 'f3' + o;
	}, true, [ 'tag1' ]);
	sandal.service('service1', function () {
		this.value = 's1';
	}, [ 'tag1', 'tag2' ]);
	sandal.service('service2', function () {
		this.value = 's2';
	}, true, [ 'tag1' ]);
	sandal.service('service3', [ 'object1' ], function (o) {
		this.value = 's3' + o;
	}, true, [ 'tag1' ]);
	sandal.object('object1', 'o1', [ 'tag1', 'tag2' ]);
	sandal.object('object2', 'o2', [ 'tag1' ]);

	sandal.resolve(function(err, tag1, tag2) {
		t.notOk(err, 'should not fail');
		t.deepEqual(tag1,
			[ 'f1', 'f2', 'f3o1', { value: 's1' }, { value: 's2' }, { value: 's3o1' }, 'o1', 'o2' ],
			'should resolve all tag1 dependencies');
		t.deepEqual(tag2,
			[ 'f1', { value: 's1' }, 'o1' ],
			'should resolve all tag2 dependencies');
		t.end();
	});

});