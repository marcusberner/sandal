sandal.factory('phoneBookController', ['phoneBook', 'phoneBookView'], function (phoneBook, view) {

	view.onNewNumber(function (name, number) {
		phoneBook.put(name, number);
		view.update(phoneBook.getAll());
	});

});