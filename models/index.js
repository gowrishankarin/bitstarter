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
		var pgtokens = "localhost:5432:bitdb0:gary:bb";
		var host = pgtokens[0];
		var port = pgtokens[1];
		var dbname = pgtokens[2];
		var user = pgtokens[3];
		var password = pgtokens[4];
		var config = {
			dialect: 'postgres',
			protocol: 'postgres',
			port: port,
			host: host
		}
		sq = new Sequelize(dbname, user, password, config);
	}
	global.db = {
		Sequelize: Sequelize,
		sequelize: sq,
		Order: sq.import(__dirname + '/order')
	};
}
module.exports = global.db;