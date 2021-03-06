var PhoneBook = function (db) {
	this.db = db;
};

PhoneBook.prototype.getAll = function (callback) {

	var items = [],
		stream = this.db.createReadStream();

	stream.on('data', function (item) {
		items.push(item);
	});
	stream.on('error', function (err) {
		callback(err);
	});
	stream.on('end', function() {
		callback(null, items);
	});

};

PhoneBook.prototype.put = function (name, info, callback) {
	this.db.put(name, info, callback);
};

PhoneBook.prototype.clear = function (name, info, callback) {
	this.db.put(name, info, callback);
};

module.exports = PhoneBook;