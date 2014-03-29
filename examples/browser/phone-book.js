sandal.factory('phoneBook', function () {

	var numbers = {};

	return {

		getAll: function () {
			var all = []
			for (var name in numbers) {
				all.push({
					name: name,
					number: numbers[name]
				});
			}
			return all;
		},

		put: function (name, number) {
			numbers[name] = number;
		}

	}

});