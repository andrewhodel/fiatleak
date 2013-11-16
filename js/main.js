TradeSocket.init();

var cMap = {
    'USD': [196,112],
    'EUR': [493,89],
    'JPY': [841,132],
    'CAD': [257,82],
    'GBP': [464,86],
    'CHF': [488,102],
    'RUB': [575,84],
    'AUD': [783,291],
    'SEK': [511,66],
    'DKK': [491,78],
    'HKD': [773,166],
    'PLN': [513,83],
    'CNY': [758,131],
    'SGD': [741,230],
    'THB': [736,183],
    'NOK': [490,61],
    'ILS': [562,142],
}

var stage = new Kinetic.Stage({
    container: 'mapcontainer',
    width: 1015,
    height: 510,
});

var mapLayer = new Kinetic.Layer({});
var paisLayer = new Kinetic.Layer({});
var graphLayer = new Kinetic.Layer({});

var totalB = new Kinetic.Text({
  x: 350,
  y: 330,
  text: '+0.00 BTC',
  fontSize: 60,
  fill: 'green'
});

for (var key in worldMap.shapes) {

    var path = new Kinetic.Path({
        data: worldMap.shapes[key],
        fill: '#eee',
        stroke: '#555',
        strokeWidth: 1
    });

    mapLayer.add(path);
}

var cLabels = {};
var cValueBoxes = {};
var cValues = {};
var bValueBoxes = {};
var bValues = {};
var xPositions = {};
var tbValue = 0;

var i = 0;
for (var key in cMap) {

    var stageWidth = stage.attrs.width;
    var ybase = 400;

    if (i>15) {
	ybase = 460;
        xPositions[key] = (i-16) * (stageWidth / Object.keys(cMap).length);
    } else {
        xPositions[key] = i * (stageWidth / Object.keys(cMap).length);
    }

    cLabels[key] = new Kinetic.Text({
        x: xPositions[key],
        y: ybase,
        text: key,
	fontStyle: 'bold',
        fontSize: 24,
        fill: 'red'
    });

    cValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: ybase+25,
        text: '-0.00',
        fontSize: 12,
        fill: 'red'
    });

    cValues[key] = 0;

    bValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: ybase+40,
        text: '+0.00',
        fontSize: 12,
        fill: 'green'
    });

    bValues[key] = 0;

    paisLayer.add(cLabels[key]);
    paisLayer.add(totalB);
    paisLayer.add(cValueBoxes[key]);
    paisLayer.add(bValueBoxes[key]);

    i++;

}

stage.add(mapLayer);
stage.add(paisLayer);
stage.add(graphLayer);

var img = new Image();
img.src = "img/btc_logo_30.png";

function aBuy(bitcoins, currency, currencyName) {

	if (typeof cMap[currencyName] === 'undefined') {
		return;
	}

    if ($('#collecting').is(':visible')) {
	$('#collecting').hide();
    }

    var layer = new Kinetic.Layer();

    var circle = new Kinetic.Circle({
        radius: 10,
        fill: '#f7931a',
        stroke: '#ffffff',
        strokeWidth: 2
    });

    var image = new Kinetic.Image({
        image: img,
        width: 30,
        x: xPositions[currencyName]+10,
        y: 380,
        height: 30,
    });


    layer.add(image);
    stage.add(layer);

    var tween = new Kinetic.Tween({
        node: image,
        duration: 6,
        rotation: Math.PI * 2,
        x: cMap[currencyName][0],
        y: cMap[currencyName][1],
        easing: Kinetic.Easings.EaseOut,
        onFinish: function () {
            layer.destroy();

		var cVal = Math.round((Number(currency)+cValues[currencyName])*100)/100;
		cValueBoxes[currencyName].setText('-'+cVal);
		cValues[currencyName] = cVal;

		var bVal = Math.round((Number(bitcoins)+bValues[currencyName])*100)/100;
		bValueBoxes[currencyName].setText('+'+bVal);
		bValues[currencyName] = bVal;

		var tbVal = Math.round((Number(bitcoins)+tbValue)*100)/100;
		totalB.setText('+'+tbVal+' BTC');
		tbValue = tbVal;

		nowBtcTotal += Number(bitcoins);

		paisLayer.draw();

        }
    });

    tween.play();

}

function getPosition(e) {

    var targ;
    if (!e)
        e = window.event;
    if (e.target)
        targ = e.target;
    else if (e.srcElement)
        targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    // jQuery normalizes the pageX and pageY
    // pageX,Y are the mouse positions relative to the document
    // offset() returns the position of the element relative to the document
    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;

    return {
        "x": x,
        "y": y
    };
};

$('canvas').click(function (event) {
    // jQuery would normalize the event
    position = getPosition(event);
    //now you can use the x and y positions
    console.log("X: " + position.x + " Y: " + position.y);
});

var nowBtcTotal = 0;
var largest = 2;

function tickGraph() {

	if (nowBtcTotal>largest) {
		largest = nowBtcTotal;
	}

	//console.log(graphLayer.getChildren().length + ' graph points');

	if (graphLayer.getChildren().length>0) {
		// move graphLayer children left one px

		for (var i=0; i<graphLayer.getChildren().length; i++) {

			var x = graphLayer.getChildren()[i].getX()-4;
			var y = graphLayer.getChildren()[i].getY();

			if (x<0) {
				// remove it
				graphLayer.getChildren()[i].destroy();
			} else {
				// add it
				graphLayer.getChildren()[i].setPosition(x,y);
			}

		}

	}

	var calc = nowBtcTotal;
	if (nowBtcTotal>largest) {
		// set safe calc total
		calc = largest;
	}
	var cx = 1000;
	var cy = 389-((100/largest)*calc);

	if (cy<379) {
		console.log('add a high point number >10%');

		var pn = Math.round(nowBtcTotal*100)/100;

var hp = new Kinetic.Text({
  x: cx-4,
  y: cy-10,
  text: '+'+pn+' BTC',
  fontSize: 10,
  fontStyle: 'bold',
  fill: 'green'
});

		hp.rotateDeg(-90);

		graphLayer.add(hp);

	}

    var circle = new Kinetic.Circle({
        radius: 2,
        fill: '#f7931a',
	x: cx,
	y: cy
    });

	graphLayer.add(circle);
	graphLayer.draw();

	//console.log('adding tickGraph '+nowBtcTotal+', '+cx+','+cy);
	nowBtcTotal = 0;

}

window.setInterval("tickGraph()",1000);

var socket = io.connect('http://fiatproxy1.jit.su:80');
socket.on('proxyBuy', function (data) {
	aBuy(data[0],data[1],data[2]);
});
