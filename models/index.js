if(!global.hasOwnProperty('db')) {
	var Sequelize = require('sequelize');
	var sq = null;
	var fs = require('fs');
	var PGPASS_FILE = '../.pgpass';

	if(process.env.DATABASE_URL) {
		var pgregex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
		var match = process.env.DATABASE_URL.match(pgregex);
		var user = match[1];
		var password = match[2];
		var host = match[3];
		var port = match[4];
		var dbname = match[5];
		var config = {
			dialect: 'postgres',
			protocol: 'postgres',
			port: port,
			host: host,
			logging: true
		};
		sq = new Sequelize(dbname, user, password, config);
	} else {
		/*var pgtokens = "fs.readFileSync(PGPASS_FILE).toString().split(':')";
		var host = pgtokens[0];
		var port = pgtokens[1];
		var dbname = pgtokens[2];
		var user = pgtokens[3];
		var password = pgtokens[4];*/
		var config = {
			dialect: 'postgres',
			protocol: 'postgres',
			port: port,
			host: host
		}
		sq = new Sequelize("test_dev", "gary", "", config);
	}
	global.db = {
		Sequelize: Sequelize,
		sequelize: sq,
		Order: sq.import(__dirname + '/order')
	};
	//global.db.Order.findAll();
}
module.exports = global.db;

/*
http://blog.willj.net/2011/05/31/setting-up-postgresql-for-ruby-on-rails-development-on-os-x/

https://devcenter.heroku.com/articles/postgres-the-bits-you-havent-found-yet
http://dailyjs.com/2011/09/26/heroku/
https://devcenter.heroku.com/articles/heroku-postgresql

*/