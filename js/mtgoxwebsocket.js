var satoshi = 100000000;

var DELAY_CAP = 1000;

function TradeSocket() {

}

TradeSocket.init = function() {
	// Terminate previous connection, if any
	if (this.connection)
		this.connection.close();

	if ('WebSocket' in window) {
		var connection = new ReconnectingWebSocket('ws://websocket.mtgox.com:80/mtgox');
		this.connection = connection;

		connection.onopen = function() {
			console.log('Mt.Gox: Connection open!');
			
			var unsubDepth = {
				"op" : "unsubscribe",
				"channel" : "24e67e0d-1cad-4cc0-9e7a-f8523ef460fe"
			}
			
			connection.send(JSON.stringify(unsubDepth));
		}

		connection.onclose = function() {
			console.log('Mt.Gox: Connection closed');
		}

		connection.onerror = function(error) {
			console.log('Mt.Gox: Connection Error: ');
			console.log(error);
		}

		connection.onmessage = function(e) {
			var message = JSON.parse(e.data);
			//console.log(message);
			
			if (message.trade) {

				var bitcoins = message.trade.amount_int / satoshi;
				var currency = (message.trade.price * message.trade.amount_int / satoshi);
				var currencyName = message.trade.price_currency;
				
				console.log("Trade: " + bitcoins + " BTC | " + currency  + " " + currencyName);

				aBuy(bitcoins, currency, currencyName);

				setTimeout(function() {
					//new Transaction(bitcoins, false, currency, currencyName);
				}, Math.random() * DELAY_CAP);
			}
		}
	} else {
		//WebSockets are not supported.
		console.log("No websocket support.");
	}
}

TradeSocket.close = function() {
	if (this.connection)
		this.connection.close();
}
