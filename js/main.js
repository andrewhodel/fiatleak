TradeSocket.init();

var cMap = {
    'USD': [244,127],
    'EUR': [493,89],
    'JPY': [841,132],
    'CAD': [265,98],
    'GBP': [464,86],
    'CHF': [488,102],
    'RUB': [575,84],
    'AUD': [829,297],
    'SEK': [511,66],
    'DKK': [491,78],
    'HKD': [773,166],
    'PLN': [513,83],
    'CNY': [774,122],
    'SGD': [741,230],
    'THB': [736,183],
    'NOK': [490,61],
}

var stage = new Kinetic.Stage({
    container: 'mapcontainer',
    width: 1015,
    height: 475,
});

var mapLayer = new Kinetic.Layer({});

var paisLayer = new Kinetic.Layer({});

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
    xPositions[key] = i * (stageWidth / Object.keys(cMap).length);

    cLabels[key] = new Kinetic.Text({
        x: xPositions[key],
        y: 400,
        text: key,
	fontStyle: 'bold',
        fontSize: 24,
        fill: 'red'
    });

    cValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: 425,
        text: '-0.00',
        fontSize: 12,
        fill: 'red'
    });

    cValues[key] = 0;

    bValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: 440,
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

var img = new Image();
img.src = "img/btc_logo_30.png";

function aBuy(bitcoins, currency, currencyName) {

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
            layer.remove();

		var cVal = Math.round((Number(currency)+cValues[currencyName])*100)/100;
		cValueBoxes[currencyName].setText('-'+cVal);
		cValues[currencyName] = cVal;

		var bVal = Math.round((Number(bitcoins)+bValues[currencyName])*100)/100;
		bValueBoxes[currencyName].setText('+'+bVal);
		bValues[currencyName] = bVal;

		var tbVal = Math.round((Number(bitcoins)+tbValue)*100)/100;
		totalB.setText('+'+tbVal+' BTC');
		tbValue = tbVal;


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
