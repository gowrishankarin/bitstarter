var fs = require('fs');
var express = require('express');
var async = require('async');
var http = require('http');
var https = require('https');
var db = require('./models');

var app = express.createServer(express.logger());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  var data = fs.readFileSync('index.html');
  response.send(data.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

app.get('/orders', function(request, response) {
	global.db.Order.findAll().success(function(orders) {
		var orders_json = [];
		orders.forEach(function(order) {
			orders_json.push({id:order.coinbase_id, amount: order.amount, time: order.time});
		});
		response.render("orders", {orders: orders_json});
	}).error(function(err) {
		console.log(err);
		response.send("error retrieving orders");
	});
});

app.get('/refresh_orders', function(request, response) {
	https.get("https://coinbase.com/api/v1/orders?api_key=" + process.env.COINBASE_API_KEY, function(res) {
		var body = '';
		res.on('data', function(chunk) {body += chunk;});
		res.on('end', function() {
			try {
				var orders_json = JSON.parse(body);
				if(orders_json.error) {
					response.send(orders_json.error);
					return;
				}
				async.forEach(orders_json.orders, addOrder, function(err) {
					if(err) {
						console.log(err);
						response.send("error adding orders");
					} else {
						response.redirect("/orders");
					}
				});
			} catch(error) {
				console.log(error);
				response.send("error parsing json");
			}
		});
		res.on('error', function(e) {
			console.log(e);
			response.send("error syncing orders");
		});
	});
});


db.sequelize.sync().complete(function(err) {
	if(err) {
		throw err;
	} else {
		http.createServer(app).listen(app.get('port'), function() {
			console.log("Listening on " + app.get('port'));
		});
	}
});

var addOrder = function(order_obj, callback) {
	var order = order_obj.order;
	if(order.status != "completed") {
		callback();
	} else {
		var Order = global.db.Order;
		Order.find({where: {coinbase_id: order.id}}).success(function(order_instance) {
			if (order_instance) {
				callback();
			} else {
				var new_order_instance = Order.build({
					coinbase_id: order.id,
					amount: order.total_btc.cents / 100000000,
					time: order.created_at
				});
				new_order_instance.save().success(function() {
					callback();
				}).error(function(err){
					callback(err);
				});
			}
		});
	}
}









































