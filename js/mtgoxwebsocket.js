/*

socket code from MaxLaumeister, donate to him - 14zoTKB29NdsJRvk4qP3vB9mQZ3dcV3eWk

https://github.com/MaxLaumeister/Listen-To-Bitcoin/blob/master/socket.js

LICENSE

If you distribute this project in part or in full, please attribute with a link to the GitHub page. This software is available under The MIT License, reproduced below.

Copyright (c) 2013 Maximillian Laumeister

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var satoshi = 100000000;

function TradeSocket() {

}

TradeSocket.init = function() {
	// Terminate previous connection, if any
	if (this.connection)
		this.connection.close();

	if ('WebSocket' in window) {
		var connection = new ReconnectingWebSocket('ws://websocket.mtgox.com:80/mtgox');
		connection.reconnectInterval = 5000;
		connection.timeoutInterval = 50000;
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
			
			if (message.trade) {

				var bitcoins = message.trade.amount_int / satoshi;
				var price = message.trade.price;
				var currencyName = message.trade.price_currency;
				
				//console.log("Trade: " + bitcoins + " BTC | " + currency  + " " + currencyName);

				aBuy(bitcoins, price, currencyName);

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
