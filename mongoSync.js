const Promise = require('bluebird');
const MongoClient = require('mongodb').MongoClient;

function MongoSync(_connectStr) {
	"use strict";
	this.connectStr = _connectStr;
	this.db = null;
}

MongoSync.prototype.connect = Promise.coroutine(function* () {
	// console.log(this.connectStr);
	if (!this.connectStr) {
		throw new Error('connect str is null');
	}
	this.db = yield MongoClient.connect(this.connectStr);
});

MongoSync.prototype.close = Promise.coroutine(function* () {
	if (!this.db) {
		throw new Error("db not init");
	}
	this.db.close();
	this.db = null;
});

MongoSync.prototype.getCollection = Promise.coroutine(function* (name) {
	if (!this.db) {
		throw new Error("db not init");
	}
	if (!name) {
		throw new Error("input is null");
	}
	return this.db.collection(name);
});

MongoSync.prototype.insert = Promise.coroutine(function* (collection, doc, options) {
	if (!this.db) {
		throw new Error("db not init");
	}
	if (!collection) {
		throw new Error("input collection is null");
	}
	if(options === undefined) options = {};
	return yield collection.insert(doc, options);
});

MongoSync.prototype.find = Promise.coroutine(function* (collection, selector, fields, skip, limit, timeout) {
	if (!this.db) {
		throw new Error("db not init");
	}
	if (!collection) {
		throw new Error("input collection is null");
	}
	if(selector === undefined) {
		return yield collection.find().toArray();
	} else if (fields === undefined) {
		return yield collection.find(selector).toArray();
	} else if(skip === undefined) {
		return yield collection.find(selector, fields).toArray();
	} else if(limit === undefined) {
		return yield collection.find(selector, fields, skip).toArray();
	} else if(timeout === undefined) {
		return yield collection.find(selector, fields, skip, limit).toArray();
	} else {
		return yield collection.find(selector, fields, skip, limit, timeout).toArray();
	}
});

MongoSync.prototype.update = Promise.coroutine(function* (collection, selector, doc, options) {
	if (!this.db) {
		throw new Error("db not init");
	}
	if (!collection) {
		throw new Error("input collection is null");
	}
	if(options === undefined) options = {};
	return yield collection.update(selector, doc, options);
});

MongoSync.prototype.remove = Promise.coroutine(function* (collection, selector, options) {
	if (!this.db) {
		throw new Error("db not init");
	}
	if (!collection) {
		throw new Error("input collection is null");
	}
	if(undefined === selector) selector = {};
	if(options === undefined) options = {};
	return yield collection.remove(selector, options);
});

// modules.export = 
(function() {
	'use strict';
	Promise.coroutine(function* () {
		let mongoSync = new MongoSync('mongodb://localhost:27017/test');
		yield mongoSync.connect();
		let collection = yield mongoSync.getCollection("test");
		let ret = yield mongoSync.insert(collection, {"name": "david"});
		console.log(ret.result);
		let data = yield mongoSync.find(collection);
		console.log(data);
		ret = yield mongoSync.update(collection, {"name": "david"}, {"$set": {"name": "david_shi"}}, {"multi": true});
		console.log(ret.result);
		data = yield mongoSync.find(collection);
		console.log(data);
		ret = yield mongoSync.remove(collection);
		console.log(ret.result);
		yield mongoSync.close();
	})();
})();