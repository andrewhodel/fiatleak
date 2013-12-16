var cMap = {
    'USD': [196, 112],
    'EUR': [493, 89],
    'JPY': [832, 126],
    'CAD': [257, 82],
    'GBP': [464, 86],
    'CHF': [488, 102],
    'RUB': [575, 84],
    'AUD': [783, 291],
    'SEK': [511, 66],
    'DKK': [491, 78],
    'HKD': [773, 166],
    'PLN': [513, 83],
    'CNY': [758, 131],
    'SGD': [741, 230],
    'THB': [736, 183],
    'NOK': [490, 61],
    'ILS': [562, 142],
    'BRL': [320, 248],
}

// ISO 639
// in order
// Waiting, Title, SimpleAbout, HideAni, PlaySndOne, PlaySndTwo, DataFrom, Donate
var trans = {
'en':['waiting for first trade...','watch the world currencies flow into BTC in realtime','Each trade results in a bitcoin being sent from the currency counter in red to the country on the map. The value in BTC is listed in green and plotted across the map. The last exchange rate for each currency is listed in @purple and updated for each trade.','Hide animations?','Play sound when rate is','BTC per second or higher?','Data from','donate bitcoins to support fiatleak.net'],
'nl':['wachten op eerste transactie...','zie de valuta van de wereld realtime in BTC veranderen','Elke transactie resulteert in het verzenden van een BTC van de rode valutateller naar het land op de kaart. De waarde in BTC wordt weergegeven in het groen op de kaart. De laatste wisselkoers van elke valuta wordt weergegeven in paars en ververst voor elke transactie.','Animaties verbergen?','Speel geluid als snelheid','BTC per seconde of hoger is?','Data van','Doneer BTC om opensource ontwikkeling te ondersteunen.'],
'de':['waiting for first trade...','beobachte in Echtzeit, wie die Währungen der Welt in Bitcoins eingetauscht werden','Jeder Handelsabschluß führt zum einem Bitcoin, der sich vom roten Währungszähler zum Land auf der Karte bewegt. Der Wert in BTC wird in Grün angezeigt und auf der Karte dargestellt. Der aktuelle Umrechnungskurs für jede Währung wird in Violett angegeben und bei jedem Handel aktualisiert.','Animationen verstecken?','Einen Ton abspielen, wenn','oder mehr BTC pro Sekunde verkauft werden?','Berücksichtigt werden','Spende bitcoins um die Open Source Entwicklung zu unterstützen'],
'es':['esperando por la primera transacción...','vea las monedas del mundo corriendo al BTC en tiempo real','Cada transacción resulta en un Bitcoin siendo enviado desde el contador de la moneda FIAT en rojo hacia su país en el mapa. El valor en BTC se muestra en verde y se traza a través del mapa. El último precio por cada moneda se muestra en color morado y es actualizado por cada transacción.','¿Ocultar animaciones?','¿Reproducir sonido cuando la tasa es','BTC por segundo o superior?','Datos de','donar bitcoins para apoyar el desarrollo de código abierto'],
'fr':['waiting for first trade...','La vue en temps réel comment les monnaies du monde sont échangées contre des bitcoins.','Chaque vente conduit à un symbole de bitcoin que vient du compteur rouge de la monnaie au pays sur la carte du monde. Le valeur en BTC serra affiché en vert et est montré sur la carte. Le cours du change actuel pour chaque monnaie est affiché en violet et est mise à jour avec chaque vente.','Cacher les animations?','Passer un ton, si','ou plus de BTC sont vendus chaque seconde?','Pris en compte sont','Faire un don pour soutenir le développement Open source'],
'zh':['请等待第一笔交易','实时观看世界货币流入比特币的动态',' 圆形图样德尔起始位置（红色）表示该笔交易购入比特币所使用的的币种，结束位置为买入方所在的国家。 发生此交易的比特币的值标记为(绿色), 最近一次的比特币汇率为（紫色）,每笔交易实施更新','隐藏动画？','当每秒比特币交易数目等于或者大于','个时，开启提示声','数据来源','捐赠比特币来支持开源项目'],
'ru':['ожидание первой сделки ...','наблюдение за мировыми потоками BTC в режиме реального времени','результат каждой сделки в BTC отправляется из валютного счётчика красного цвета в страну на карте. Объём в BTC отображается зелёным цветом и отрисовывается на карте. Цена последней сделки для каждой валюты отображается фиолетовым цветом и обновляется при каждой сделке.','Скрыть анимацию?','Воспроизводить звуки при скорости сделок','BTC в секунду или выше?','Данные из','Пожертвования в BTC для развития проектов с открытым кодом.'],
'fi':['odotetaan ensimmäistä kauppaa...','näe miten maailman valuutat virtaavat BTC:ksi reaaliaikaisesti','Jokaisesta kaupasta lähtee bitcoin punaisella merkitystä valuuttalaskurista kartalla näkyvään maahan. Kaupan arvo BTC:ssä näkyy vihreällä ja se piirtyy kartalle. Viimeisin vaihtokurssi kullekin valuutalle näkyy purppuran värisenä ja se päivittyy kunkin kaupan myötä.','Piilota animaatiot?','Soita ääni kun kurssi on','BTC:tä per sekunti tai enemmän?','Tiedot lähteistä','lahjoita bitcoineja tukeaksesi avoimen lähdekoodin kehitystyötä'],
'pt':['Esperando pela primeira negociação...','Veja o fluxo das moedas do mundo para BTC em tempo real','Cada transacção resulta de uma bitcoin sendo enviada do contadador de moeda em vermelho para o país no mapa. O valor em BTC é listado em verde e desenhado no mapa. A ultima taxa de câmbio para cada moeda é listada em roxo, em tempo real para cada transacção.','Esconder animações?','Tocar som quando a frequencia é de','BTC por segundo ou maior?','Dados de','Doar bitcoins para suportar desenvolvimento de software livre']
}

var stage = new Kinetic.Stage({
    container: 'mapcontainer',
    width: 1015,
    height: 550,
});

var mapLayer = new Kinetic.Layer({});
var paisLayer = new Kinetic.Layer({});
var tdLayer = new Kinetic.Layer({});
var graphLayer = new Kinetic.Layer({});
var sunLayer = new Kinetic.Layer({});

var bLine = new Kinetic.Line({
    points: [0, 400, 1014, 400],
    stroke: '#FFFFBC',
    strokeWidth: 2,
});

tdLayer.add(bLine);

var totalTime = new Kinetic.Text({
    x: 20,
    y: 15,
    text: '00:00:00.0',
    fontSize: 18,
    fill: 'black'
});
tdLayer.add(totalTime);

var ch = new Kinetic.Text({
    x: 950,
    y: 70,
    text: 'it\'s back!!',
    fontSize: 14,
    fill: 'green'
});
tdLayer.add(ch);

var marca = new Kinetic.Text({
    x: 630,
    y: 30,
    text: 'http://fiatleak.net',
    fontSize: 40,
    fontStyle: 'bold',
    fill: '#f7931a'
});
tdLayer.add(marca);

var totalB = new Kinetic.Text({
    x: 20,
    y: 30,
    text: '+0 BTC',
    fontSize: 60,
    fontStyle: 'bold',
    fill: 'green'
});
tdLayer.add(totalB);

var lhourl = new Kinetic.Text({
    x: 20,
    y: 90,
    text: '1hr',
    fontSize: 18,
    fill: 'black'
});
paisLayer.add(lhourl);

var lhour = new Kinetic.Text({
    x: 60,
    y: 90,
    text: '+0',
    fontSize: 18,
    fill: 'green'
});
tdLayer.add(lhour);

var lthirtyl = new Kinetic.Text({
    x: 20,
    y: 110,
    text: '30m',
    fontSize: 18,
    fill: 'black'
});
paisLayer.add(lthirtyl);

var lthirty = new Kinetic.Text({
    x: 60,
    y: 110,
    text: '+0',
    fontSize: 18,
    fill: 'green'
});
tdLayer.add(lthirty);

var ltenl = new Kinetic.Text({
    x: 20,
    y: 130,
    text: '10m',
    fontSize: 18,
    fill: 'black'
});
paisLayer.add(ltenl);

var lten = new Kinetic.Text({
    x: 60,
    y: 130,
    text: '+0',
    fontSize: 18,
    fill: 'green'
});
tdLayer.add(lten);

var lfivel = new Kinetic.Text({
    x: 20,
    y: 150,
    text: '5m',
    fontSize: 18,
    fill: 'black'
});
paisLayer.add(lfivel);

var lfive = new Kinetic.Text({
    x: 60,
    y: 150,
    text: '+0',
    fontSize: 18,
    fill: 'green'
});
tdLayer.add(lfive);

var lonel = new Kinetic.Text({
    x: 20,
    y: 170,
    text: '1m',
    fontSize: 18,
    fill: 'black'
});
paisLayer.add(lonel);

var lone = new Kinetic.Text({
    x: 60,
    y: 170,
    text: '+0',
    fontSize: 18,
    fill: 'green'
});
tdLayer.add(lone);

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
var rateValueBoxes = {};
var xPositions = {};
var yPositions = {};
var tbValue = 0;

var i = 0;
for (var key in cMap) {

    var stageWidth = stage.attrs.width;
    yPositions[key] = 410;
    xPositions[key] = i * (stageWidth / 14);

    if (i > 14) {
        yPositions[key] = 480;
        xPositions[key] = (i - 15) * (stageWidth / 14);
    }

    xPositions[key] += 6;

    cLabels[key] = new Kinetic.Text({
        x: xPositions[key],
        y: yPositions[key],
        text: key,
        fontStyle: 'bold',
        fontSize: 24,
        fill: 'red'
    });

    cValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: yPositions[key] + 40,
        text: '',
        fontSize: 12,
        fill: 'red'
    });

    cValues[key] = 0;

    bValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: yPositions[key] + 25,
        text: '+0',
        fontSize: 12,
        fill: 'green'
    });

    bValues[key] = 0;

    rateValueBoxes[key] = new Kinetic.Text({
        x: xPositions[key],
        y: yPositions[key] + 55,
        text: '',
        fontSize: 12,
        fill: 'purple'
    });

    paisLayer.add(cLabels[key]);
    tdLayer.add(cValueBoxes[key]);
    tdLayer.add(bValueBoxes[key]);
    tdLayer.add(rateValueBoxes[key]);

    i++;

}

stage.add(mapLayer);
stage.add(paisLayer);
stage.add(tdLayer);
stage.add(graphLayer);
stage.add(sunLayer);

var img = new Image();
img.src = "img/btc_logo_60.png";

var lastHighCoinPriceStepDown = 0;

function aBuy(bitcoins, price, currencyName, proxySpread) {
    if (typeof proxySpread == 'undefined') {
	proxySpread = 0;
    }

    //console.log('aBuy of '+bitcoins+' for $'+price+' of '+currencyName);

    if (typeof cMap[currencyName] === 'undefined') {
        console.log('currency not yet added to fiatleak - ' + currencyName);
        return;
    }

    if ($('#collecting').is(':visible')) {
        $('#collecting').hide();
    }

    if ($('#hideAnimations').is(":checked")) {

        var cVal = Number(bitcoins * price) + cValues[currencyName];
        cValueBoxes[currencyName].setText(Math.round(cVal));
        cValues[currencyName] = cVal;

        var bVal = Number(bitcoins) + bValues[currencyName];
        bValueBoxes[currencyName].setText('+' + Math.round(bVal));
        bValues[currencyName] = bVal;

        rateValueBoxes[currencyName].setText('@' + Math.round(Number(price) * 100) / 100);

        var tbVal = Number(bitcoins) + tbValue;
        totalB.setText('+' + Math.round(tbVal * 10) / 10 + ' BTC');
        tbValue = tbVal;

        nowBtcTotal += Number(bitcoins);

        tdLayer.draw();

    } else {

        var layer = new Kinetic.Layer();

        var s = 60;

        if (Number(bitcoins) <= 4) {
            s = 15 + (Number(bitcoins)/4)*40;
        }

        if (s < 15) {
            s = 15;
        }

        var image = new Kinetic.Image({
            image: img,
            //x: xPositions[currencyName] + 10,
            //y: 380,
            width: s,
            height: s,
        });

        var group = new Kinetic.Group({
            x: xPositions[currencyName] + 10,
            y: yPositions[currencyName] - s,
        });
        group.add(image);

        if (Number(bitcoins) >= .25) {
            var ct = new Kinetic.Text({
                text: '+' + Math.round(Number(bitcoins)*100)/100 + ' BTC',
                fontSize: 10,
                x: 10+s,
                y: 20 - (lastHighCoinPriceStepDown * 10),
                fill: 'green'
            });
            group.add(ct);
            if (lastHighCoinPriceStepDown > 3) {
                lastHighCoinPriceStepDown = 0;
            } else {
                lastHighCoinPriceStepDown++;
            }
        }

        layer.add(group);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: group,
            duration: 6,
            x: cMap[currencyName][0],
            y: cMap[currencyName][1],
            easing: Kinetic.Easings.EaseOut,
            onFinish: function () {
                layer.destroy();

                tdLayer.draw();

            }
        });

        var cVal = Number(bitcoins * price) + cValues[currencyName];
        cValueBoxes[currencyName].setText(Math.round(cVal));
        cValues[currencyName] = cVal;

        var bVal = Number(bitcoins) + bValues[currencyName];
        bValueBoxes[currencyName].setText('+' + Math.round(bVal));
        bValues[currencyName] = bVal;

        rateValueBoxes[currencyName].setText('@' + Math.round(Number(price) * 100) / 100);

        var tbVal = Number(bitcoins) + tbValue;
        totalB.setText('+' + Math.round(tbVal * 10) / 10 + ' BTC');
        tbValue = tbVal;

        nowBtcTotal += Number(bitcoins);

	setTimeout(function() {
		tween.play();
	}, (Math.floor(Math.random() * 1000) + 1)*proxySpread);

    }

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
var openD = new Date();
var secondsInF = [];
var eachFive = [];
var lastFive = new Date();
var spliceEvery = false;

function tickGraph() {

    if (nowBtcTotal > largest) {
        largest = nowBtcTotal;
    }

    //console.log(graphLayer.getChildren().length + ' graph points');

    if (graphLayer.getChildren().length > 0) {
        // move graphLayer children left one px

        for (var i = 0; i < graphLayer.getChildren().length; i++) {

            var x = graphLayer.getChildren()[i].getX() - 8;
            var y = graphLayer.getChildren()[i].getY();

            if (x < 0) {
                // remove it
                graphLayer.getChildren()[i].destroy();
            } else {
                // add it
                graphLayer.getChildren()[i].setPosition(x, y);
            }

        }

    }

    var calc = nowBtcTotal;
    if (nowBtcTotal > largest) {
        // set safe calc total
        calc = largest;
    }
    var cx = 1000;
    var cy = 400 - ((100 / largest) * calc);

    if (nowBtcTotal > Number($("#sndUserLimit").val()) && $('#playSound').is(":checked")) {
	snd.play();
    }

    if (cy < 390) {
        console.log('add a high point number >10%');

        var pn = Math.round(nowBtcTotal * 100) / 100;

        var hp = new Kinetic.Text({
            x: cx - 4,
            y: cy - 10,
            text: '+' + pn + ' BTC',
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

    // update time
    totalTime.setText(timeDifference(new Date(), openD));

    //lfive
    var totalLastFive = 0;
    var lastMinuteTotal = 0;

    for (var i = 0; i < secondsInF.length; i++) {
        totalLastFive += secondsInF[i];

        if (i > secondsInF.length - 60) {
            lastMinuteTotal += secondsInF[i];
        }

    }

    var now = new Date();
    //console.log('ms since lastFive '+(now.getTime()-lastFive.getTime()));
    //console.log('secondsInF.length='+secondsInF.length);

    if (spliceEvery == true) {
        secondsInF.splice(0, 1);
    }

    if (now.getTime() - lastFive.getTime() > 300000) {
        console.log('pushing seconds to five');
        totalLastFive = 0;
        for (var i = 0; i < secondsInF.length; i++) {
            totalLastFive += secondsInF[i];
        }
        eachFive.push(totalLastFive);
        lastFive = new Date();
        spliceEvery = true;
    }

    secondsInF.push(nowBtcTotal);

    //eachFive
    if (eachFive.length > 12) {
        // we have reached an hour
        eachFive.splice(0, 1);
    }

    // 1m
    if (secondsInF.length < 60) {
        lone.setText('+' + Math.round(tbValue * 10) / 10);
    } else {
        lone.setText('+' + Math.round(lastMinuteTotal * 10) / 10);
    }

    // 5m
    if (eachFive.length > 0) {
        lfive.setText('+' + Math.round(totalLastFive * 10) / 10);
    } else {
        lfive.setText('+' + Math.round(tbValue * 10) / 10);
    }

    // 10m
    if (eachFive.length > 1) {
        lten.setText('+' + Math.round((eachFive[0] + totalLastFive) * 10) / 10);
    } else {
        lten.setText('+' + Math.round(tbValue * 10) / 10);
    }

    // 30m
    if (eachFive.length > 5) {
        var t = 0;
        for (var c = 0; c < 5; c++) {
            t += eachFive[c];
        }
        lthirty.setText('+' + Math.round((t + totalLastFive) * 10) / 10);
    } else {
        lthirty.setText('+' + Math.round(tbValue * 10) / 10);
    }

    // 1hr
    if (eachFive.length > 11) {
        var t = 0;
        for (var c = 0; c < 11; c++) {
            t += eachFive[c];
        }
        lhour.setText('+' + Math.round((t + totalLastFive) * 10) / 10);
    } else {
        lhour.setText('+' + Math.round(tbValue * 10) / 10);
    }


    //draw
    tdLayer.draw();

    // resets
    nowBtcTotal = 0;

}

function timeDifference(current, previous) {
    var duration = current.getTime() - previous.getTime();
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function sunU() {
    sunLayer.draw();
    drawDayNightMap(sunLayer.getCanvas()._canvas);
}

var snd = new Audio("sounds/c6.mp3");

function setLang(l) {

	$('#langWaiting').html(trans[l][0]);
	$('#langTitle').html(trans[l][1]);
	$('#langSimpleAbout').html(trans[l][2]);
	$('#langHideAni').html(trans[l][3]);
	$('#langPlaySndOne').html(trans[l][4]);
	$('#langPlaySndTwo').html(trans[l][5]);
	$('#langDataFrom').html(trans[l][6]);
	$('#langDonate').html(trans[l][7]);

	// change select
	$('#selectLang option:contains("'+l+'")').prop('selected', true);

}

$('#selectLang').change(function () {
	setLang($('#selectLang').val());
});

$(document).ready(function () {

    var language = window.navigator.userLanguage || window.navigator.language;
    var l = language.substr(0,2);

    // init lang
    for (var key in trans) {
	$('#selectLang').append('<option>'+key+'</option>');
    }

    if (trans[l]) {
	//alert(l);
	setLang(l);
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	$('#hideAnimations').attr('checked','checked');
    }

    initSunlight();

    //var socket = io.connect('http://fiatproxy1.jit.su:80');
    var socket = io.connect('http://69.94.230.87:8003');
    socket.on('proxyBuy', function (data) {
        aBuy(data[0], data[1], data[2], 1);
    });

    TradeSocket.init();

    sunU();

    // redraw daylight every 5 minutes
    window.setInterval("sunU()", 60000*5);
    // tick graph every second
    window.setInterval("tickGraph()", 1000);

});
