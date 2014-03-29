sandal.factory('phoneBookView', ['jQuery', 'done'], function ($, done) {

	var view = {};

	$(document).ready(function () {

		var list = $('#list'),
			newNumberActions = [];

		view.update = function (numbers) {
			var listHtml = '<tr><td><b>Name</b></td><td><b>Number</b></td></tr>';
			for (var i in numbers) {
				listHtml += ('<tr><td>' + numbers[i].name + '</td><td>' + numbers[i].number + '</td></tr>');
			}
			list.html(listHtml);
		};

		view.onNewNumber = function (action) {
			newNumberActions.push(action);
		};

		$('#addNumber').click(function () {
			var name = $('#name').val();
			var number = $('#number').val()
			for (var i in newNumberActions) {
				newNumberActions[i](name, number);
			}
			$('#name').val('');
			$('#number').val('');
		});

		$('#view').show();

		done(null, view);
	});

});