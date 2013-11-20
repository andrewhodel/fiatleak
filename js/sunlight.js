// (C) 2011 g/christensen (gchristnsn@gmail.com)

// Map dimensions
var mapWidth = 1015;
var mapHeight = 450;

function adjustParameters()
{
	// How many degrees in one pixel?
	pixelDegW = 360 / mapWidth;
	pixelDegH = 180 / mapHeight;

	// Offset from 180 deg. of the most left longitude on the map grid
	// in degrees
	edgeOffset = 9.5;

	// Map grid origin
	centerDegW = (mapWidth / 2) * pixelDegW - edgeOffset;
	centerDegH = (mapHeight / 2) * pixelDegH;
}

// Pixel coordinates
function pixelX(deg)
{
	var offset = (deg < centerDegW)
		? (centerDegW - deg)
		: (360 - deg + centerDegW);

	return offset / pixelDegW; // in 360 deg. space
}

function pixelY(deg)
{
	return (centerDegH - deg) / pixelDegH;
}

// Pixel latitude and longitude
function pixelLambda(x)
{
	var deg = x * pixelDegW;
	return (deg < centerDegW)
		? (centerDegW - deg)
		: (360 - deg + centerDegW); // in 360 deg. space
}

function pixelPhi(y, lambda)
{
	return centerDegH - y * pixelDegH;
}

// Canvas circle helper
function drawCircle(ctx, cx, cy, r, fill)
{
	ctx.beginPath();  
	ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();	
	ctx.stroke();
} 

function initSunlight()
{
	adjustParameters();

}

function drawDayNightMap(map)
{
	var ctx = map.getContext("2d");	

	performCalculations(new Date());

	var northSun = DECsun >= 0;
	var startFrom = northSun? 0: (mapHeight - 1);
	var pstop = function (y) { return northSun? (y < mapHeight): (y >= 0); };
	var inc = northSun? 1: -1;
	
	ctx.fillStyle = "rgba(0, 0, 0, 0.1)";

	for (var x = 0; x < mapWidth; ++x)
		for (var y = startFrom; pstop(y); y += inc)
		{			
			var lambda = pixelLambda(x);
			var phi = pixelPhi(y) + 0.5 * (northSun? -1: 1);

			var centralAngle = sind(phi) * sind(DECsun) 
							 + cosd(phi) * cosd(DECsun) * cosd(GHAsun - lambda);
			centralAngle = Math.acos(centralAngle);
			 
			if (centralAngle > Math.PI / 2)
			{                                              
				var rectTop = northSun? y: 0;
				var rectHeight = northSun? mapHeight - rectTop: y + 1;
                
				ctx.fillRect(x, rectTop, 1, rectHeight);                                             				
				break;
			}    
		}                          
	
	drawCircle(ctx, pixelX(GHAsun), pixelY(DECsun), 5, "#FFFF00");
	drawCircle(ctx, pixelX(GHAmoon), pixelY(DECmoon), 5, "#FFFFFF");
}

// Source: Henning Umland, http://www.celnav.de/longterm.htm

var dtr = Math.PI / 180;

//Auxiliary functions
//Sine of angles in degrees

function sind(x) {
    return Math.sin(dtr * x);
}

//Cosine of angles in degrees

function cosd(x) {
    return Math.cos(dtr * x);
}

//Tangent of angles in degrees

function tand(x) {
    return Math.tan(dtr * x);
}

//Truncate large angles

function trunc(x) {
    return 360 * (x / 360 - Math.floor(x / 360));
}

// Main function

function performCalculations(date) {
	year = date.getUTCFullYear();
	month = date.getUTCMonth() + 1;
	day = date.getUTCDate();
	hour = date.getUTCHours();
	minute = date.getUTCMinutes();
	second = date.getUTCSeconds();
	deltaT = 0;
	dayfraction = (hour + minute / 60 + second / 3600) / 24;


	TimeMeasures();
	Nutation();
	Aries();
	Sun();
	Moon();
}


// Calculating Julian date, century, and millennium

function TimeMeasures() {
    with(Math) {
        //Julian day (UT1)
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        var A = floor(year / 100);
        var B = 2 - A + floor(A / 4);
        JD0h = floor(365.25 * (year + 4716)) + floor(30.6001 * (month + 1)) + day + B - 1524.5;
        JD = JD0h + dayfraction;

        //Julian centuries (GMT) since 2000 January 0.5
        T = (JD - 2451545) / 36525;
        T2 = T * T;
        T3 = T * T2;
        T4 = T * T3;
        T5 = T * T4;

        //Julian ephemeris day (TDT)
        JDE = JD + deltaT / 86400;

        //Julian centuries (TDT) from 2000 January 0.5
        TE = (JDE - 2451545) / 36525;
        TE2 = TE * TE;
        TE3 = TE * TE2;
        TE4 = TE * TE3;
        TE5 = TE * TE4;

        //Julian millenniums (TDT) from 2000 January 0.5
        Tau = 0.1 * TE;
        Tau2 = Tau * Tau;
        Tau3 = Tau * Tau2;
        Tau4 = Tau * Tau3;
        Tau5 = Tau * Tau4;
    }
}


//Nutation, obliquity of the ecliptic

function Nutation() {
    //IAU 1980 nutation theory:
    //Mean anomaly of the moon
    var Mm = 134.962981389 + 198.867398056 * TE + trunc(477000 * TE) + 0.008697222222 * TE2 + TE3 / 56250;

    //Mean anomaly of the sun
    var M = 357.527723333 + 359.05034 * TE + trunc(35640 * TE) - 0.0001602777778 * TE2 - TE3 / 300000;

    //Mean distance of the moon from the ascending node
    var F = 93.271910277 + 82.017538055 * TE + trunc(483120 * TE) - 0.0036825 * TE2 + TE3 / 327272.7273;

    //Mean elongation of the moon
    var D = 297.850363055 + 307.11148 * TE + trunc(444960 * TE) - 0.001914166667 * TE2 + TE3 / 189473.6842;

    //Longitude of the ascending node of the moon
    var omega = 125.044522222 - 134.136260833 * TE - trunc(1800 * TE) + 0.002070833333 * TE2 + TE3 / 450000;

    //Periodic terms for nutation
    var nut = new Array(106);
    nut[0] = " 0 0 0 0 1-171996-174.2 92025 8.9 ";
    nut[1] = " 0 0 2-2 2 -13187  -1.6  5736-3.1 ";
    nut[2] = " 0 0 2 0 2  -2274  -0.2   977-0.5 ";
    nut[3] = " 0 0 0 0 2   2062   0.2  -895 0.5 ";
    nut[4] = " 0-1 0 0 0  -1426   3.4    54-0.1 ";
    nut[5] = " 1 0 0 0 0    712   0.1    -7 0.0 ";
    nut[6] = " 0 1 2-2 2   -517   1.2   224-0.6 ";
    nut[7] = " 0 0 2 0 1   -386  -0.4   200 0.0 ";
    nut[8] = " 1 0 2 0 2   -301   0.0   129-0.1 ";
    nut[9] = " 0-1 2-2 2    217  -0.5   -95 0.3 ";
    nut[10] = "-1 0 0 2 0    158   0.0    -1 0.0 ";
    nut[11] = " 0 0 2-2 1    129   0.1   -70 0.0 ";
    nut[12] = "-1 0 2 0 2    123   0.0   -53 0.0 ";
    nut[13] = " 1 0 0 0 1     63   0.1   -33 0.0 ";
    nut[14] = " 0 0 0 2 0     63   0.0    -2 0.0 ";
    nut[15] = "-1 0 2 2 2    -59   0.0    26 0.0 ";
    nut[16] = "-1 0 0 0 1    -58  -0.1    32 0.0 ";
    nut[17] = " 1 0 2 0 1    -51   0.0    27 0.0 ";
    nut[18] = "-2 0 0 2 0    -48   0.0     1 0.0 ";
    nut[19] = "-2 0 2 0 1     46   0.0   -24 0.0 ";
    nut[20] = " 0 0 2 2 2    -38   0.0    16 0.0 ";
    nut[21] = " 2 0 2 0 2    -31   0.0    13 0.0 ";
    nut[22] = " 2 0 0 0 0     29   0.0    -1 0.0 ";
    nut[23] = " 1 0 2-2 2     29   0.0   -12 0.0 ";
    nut[24] = " 0 0 2 0 0     26   0.0    -1 0.0 ";
    nut[25] = " 0 0 2-2 0    -22   0.0     0 0.0 ";
    nut[26] = "-1 0 2 0 1     21   0.0   -10 0.0 ";
    nut[27] = " 0 2 0 0 0     17  -0.1     0 0.0 ";
    nut[28] = " 0 2 2-2 2    -16   0.1     7 0.0 ";
    nut[29] = "-1 0 0 2 1     16   0.0    -8 0.0 ";
    nut[30] = " 0 1 0 0 1    -15   0.0     9 0.0 ";
    nut[31] = " 1 0 0-2 1    -13   0.0     7 0.0 ";
    nut[32] = " 0-1 0 0 1    -12   0.0     6 0.0 ";
    nut[33] = " 2 0-2 0 0     11   0.0     0 0.0 ";
    nut[34] = "-1 0 2 2 1    -10   0.0     5 0.0 ";
    nut[35] = " 1 0 2 2 2     -8   0.0     3 0.0 ";
    nut[36] = " 0-1 2 0 2     -7   0.0     3 0.0 ";
    nut[37] = " 0 0 2 2 1     -7   0.0     3 0.0 ";
    nut[38] = " 1 1 0-2 0     -7   0.0     0 0.0 ";
    nut[39] = " 0 1 2 0 2      7   0.0    -3 0.0 ";
    nut[40] = "-2 0 0 2 1     -6   0.0     3 0.0 ";
    nut[41] = " 0 0 0 2 1     -6   0.0     3 0.0 ";
    nut[42] = " 2 0 2-2 2      6   0.0    -3 0.0 ";
    nut[43] = " 1 0 0 2 0      6   0.0     0 0.0 ";
    nut[44] = " 1 0 2-2 1      6   0.0    -3 0.0 ";
    nut[45] = " 0 0 0-2 1     -5   0.0     3 0.0 ";
    nut[46] = " 0-1 2-2 1     -5   0.0     3 0.0 ";
    nut[47] = " 2 0 2 0 1     -5   0.0     3 0.0 ";
    nut[48] = " 1-1 0 0 0      5   0.0     0 0.0 ";
    nut[49] = " 1 0 0-1 0     -4   0.0     0 0.0 ";
    nut[50] = " 0 0 0 1 0     -4   0.0     0 0.0 ";
    nut[51] = " 0 1 0-2 0     -4   0.0     0 0.0 ";
    nut[52] = " 1 0-2 0 0      4   0.0     0 0.0 ";
    nut[53] = " 2 0 0-2 1      4   0.0    -2 0.0 ";
    nut[54] = " 0 1 2-2 1      4   0.0    -2 0.0 ";
    nut[55] = " 1 1 0 0 0     -3   0.0     0 0.0 ";
    nut[56] = " 1-1 0-1 0     -3   0.0     0 0.0 ";
    nut[57] = "-1-1 2 2 2     -3   0.0     1 0.0 ";
    nut[58] = " 0-1 2 2 2     -3   0.0     1 0.0 ";
    nut[59] = " 1-1 2 0 2     -3   0.0     1 0.0 ";
    nut[60] = " 3 0 2 0 2     -3   0.0     1 0.0 ";
    nut[61] = "-2 0 2 0 2     -3   0.0     1 0.0 ";
    nut[62] = " 1 0 2 0 0      3   0.0     0 0.0 ";
    nut[63] = "-1 0 2 4 2     -2   0.0     1 0.0 ";
    nut[64] = " 1 0 0 0 2     -2   0.0     1 0.0 ";
    nut[65] = "-1 0 2-2 1     -2   0.0     1 0.0 ";
    nut[66] = " 0-2 2-2 1     -2   0.0     1 0.0 ";
    nut[67] = "-2 0 0 0 1     -2   0.0     1 0.0 ";
    nut[68] = " 2 0 0 0 1      2   0.0    -1 0.0 ";
    nut[69] = " 3 0 0 0 0      2   0.0     0 0.0 ";
    nut[70] = " 1 1 2 0 2      2   0.0    -1 0.0 ";
    nut[71] = " 0 0 2 1 2      2   0.0    -1 0.0 ";
    nut[72] = " 1 0 0 2 1     -1   0.0     0 0.0 ";
    nut[73] = " 1 0 2 2 1     -1   0.0     1 0.0 ";
    nut[74] = " 1 1 0-2 1     -1   0.0     0 0.0 ";
    nut[75] = " 0 1 0 2 0     -1   0.0     0 0.0 ";
    nut[76] = " 0 1 2-2 0     -1   0.0     0 0.0 ";
    nut[77] = " 0 1-2 2 0     -1   0.0     0 0.0 ";
    nut[78] = " 1 0-2 2 0     -1   0.0     0 0.0 ";
    nut[79] = " 1 0-2-2 0     -1   0.0     0 0.0 ";
    nut[80] = " 1 0 2-2 0     -1   0.0     0 0.0 ";
    nut[81] = " 1 0 0-4 0     -1   0.0     0 0.0 ";
    nut[82] = " 2 0 0-4 0     -1   0.0     0 0.0 ";
    nut[83] = " 0 0 2 4 2     -1   0.0     0 0.0 ";
    nut[84] = " 0 0 2-1 2     -1   0.0     0 0.0 ";
    nut[85] = "-2 0 2 4 2     -1   0.0     1 0.0 ";
    nut[86] = " 2 0 2 2 2     -1   0.0     0 0.0 ";
    nut[87] = " 0-1 2 0 1     -1   0.0     0 0.0 ";
    nut[88] = " 0 0-2 0 1     -1   0.0     0 0.0 ";
    nut[89] = " 0 0 4-2 2      1   0.0     0 0.0 ";
    nut[90] = " 0 1 0 0 2      1   0.0     0 0.0 ";
    nut[91] = " 1 1 2-2 2      1   0.0    -1 0.0 ";
    nut[92] = " 3 0 2-2 2      1   0.0     0 0.0 ";
    nut[93] = "-2 0 2 2 2      1   0.0    -1 0.0 ";
    nut[94] = "-1 0 0 0 2      1   0.0    -1 0.0 ";
    nut[95] = " 0 0-2 2 1      1   0.0     0 0.0 ";
    nut[96] = " 0 1 2 0 1      1   0.0     0 0.0 ";
    nut[97] = "-1 0 4 0 2      1   0.0     0 0.0 ";
    nut[98] = " 2 1 0-2 0      1   0.0     0 0.0 ";
    nut[99] = " 2 0 0 2 0      1   0.0     0 0.0 ";
    nut[100] = " 2 0 2-2 1      1   0.0    -1 0.0 ";
    nut[101] = " 2 0-2 0 1      1   0.0     0 0.0 ";
    nut[102] = " 1-1 0-2 0      1   0.0     0 0.0 ";
    nut[103] = "-1 0 0 1 1      1   0.0     0 0.0 ";
    nut[104] = "-1-1 0 2 1      1   0.0     0 0.0 ";
    nut[105] = " 0 1 0 1 0      1   0.0     0 0.0 ";

    //Reading periodic terms
    var fMm, fM, fF, fD, f_omega, dp = 0,
        de = 0;

    for (x = 0; x < 105; x++) {
        fMm = eval(nut[x].substring(0, 2));
        fM = eval(nut[x].substring(2, 4));
        fF = eval(nut[x].substring(4, 6));
        fD = eval(nut[x].substring(6, 8));
        f_omega = eval(nut[x].substring(8, 10));
        dp += (eval(nut[x].substring(10, 17)) + TE * eval(nut[x].substring(17, 23))) * sind(fD * D + fM * M + fMm * Mm + fF * F + f_omega * omega);
        de += (eval(nut[x].substring(23, 29)) + TE * eval(nut[x].substring(29, 33))) * cosd(fD * D + fM * M + fMm * Mm + fF * F + f_omega * omega);
    }

    //Corrections (Herring, 1987)
/*
   var corr = new Array(4);
   corr[0] = " 0 0 0 0 1-725 417 213 224 ";
   corr[1] = " 0 1 0 0 0 523  61 208 -24 ";
   corr[2] = " 0 0 2-2 2 102-118 -41 -47 ";
   corr[3] = " 0 0 2 0 2 -81   0  32   0 ";
   
   for (x=0; x<4; x++)
   {
      fMm = eval(corr[x].substring(0,2));
      fM = eval(corr[x].substring(2,4));
      fF = eval(corr[x].substring(4,6));
      fD = eval(corr[x].substring(6,8));
      f_omega = eval(corr[x].substring(8,10));
      dp += 0.1*(eval(corr[x].substring(10,14))*sind(fD*D+fM*M+fMm*Mm+fF*F+f_omega*omega)+eval(corr[x].substring(14,18))*cosd(fD*D+fM*M+fMm*Mm+fF*F+f_omega*omega));
      de += 0.1*(eval(corr[x].substring(18,22))*cosd(fD*D+fM*M+fMm*Mm+fF*F+f_omega*omega)+eval(corr[x].substring(22,26))*sind(fD*D+fM*M+fMm*Mm+fF*F+f_omega*omega));
   }
   */

    //Nutation in longitude
    delta_psi = dp / 36000000;

    //Nutation in obliquity
    delta_eps = de / 36000000;

    //Mean obliquity of the ecliptic
    eps0 = (84381.448 - 46.815 * TE - 0.00059 * TE2 + 0.001813 * TE3) / 3600;

    //True obliquity of the ecliptic
    eps = eps0 + delta_eps;
}

//GHA Aries, GAST, GMST, equation of the equinoxes
function Aries()
{
    //Mean GHA Aries
    var GHAAmean = trunc(280.46061837+ 360.98564736629*(JD-2451545)+0.000387933*T2-T3/38710000);

    //True GHA Aries
    GHAAtrue = trunc(GHAAmean+delta_psi*cosd(eps));
}

//Calculations for the sun

function Sun() {
    with(Math) {
        //Periodic terms for the sun
        //Longitude
        var L0 = 175347046;
        L0 += 3341656 * cos(4.6692568 + 6283.0758500 * Tau);
        L0 += 34894 * cos(4.62610 + 12566.15170 * Tau);
        L0 += 3497 * cos(2.7441 + 5753.3849 * Tau);
        L0 += 3418 * cos(2.8289 + 3.5231 * Tau);
        L0 += 3136 * cos(3.6277 + 77713.7715 * Tau);
        L0 += 2676 * cos(4.4181 + 7860.4194 * Tau);
        L0 += 2343 * cos(6.1352 + 3930.2097 * Tau);
        L0 += 1324 * cos(0.7425 + 11506.7698 * Tau);
        L0 += 1273 * cos(2.0371 + 529.6910 * Tau);

        L0 += 1199 * cos(1.1096 + 1577.3435 * Tau);
        L0 += 990 * cos(5.233 + 5884.927 * Tau);
        L0 += 902 * cos(2.045 + 26.298 * Tau);
        L0 += 857 * cos(3.508 + 398.149 * Tau);
        L0 += 780 * cos(1.179 + 5223.694 * Tau);
        L0 += 753 * cos(2.533 + 5507.553 * Tau);
        L0 += 505 * cos(4.583 + 18849.228 * Tau);
        L0 += 492 * cos(4.205 + 775.523 * Tau);
        L0 += 357 * cos(2.920 + 0.067 * Tau);
        L0 += 317 * cos(5.849 + 11790.629 * Tau);

        L0 += 284 * cos(1.899 + 796.298 * Tau);
        L0 += 271 * cos(0.315 + 10977.079 * Tau);
        L0 += 243 * cos(0.345 + 5486.778 * Tau);
        L0 += 206 * cos(4.806 + 2544.314 * Tau);
        L0 += 205 * cos(1.869 + 5573.143 * Tau);
        L0 += 202 * cos(2.458 + 6069.777 * Tau);
        L0 += 156 * cos(0.833 + 213.299 * Tau);
        L0 += 132 * cos(3.411 + 2942.463 * Tau);
        L0 += 126 * cos(1.083 + 20.775 * Tau);
        L0 += 115 * cos(0.645 + 0.980 * Tau);

        L0 += 103 * cos(0.636 + 4694.003 * Tau);
        L0 += 102 * cos(0.976 + 15720.839 * Tau);
        L0 += 102 * cos(4.267 + 7.114 * Tau);
        L0 += 99 * cos(6.21 + 2146.17 * Tau);
        L0 += 98 * cos(0.68 + 155.42 * Tau);
        L0 += 86 * cos(5.98 + 161000.69 * Tau);
        L0 += 85 * cos(1.30 + 6275.96 * Tau);
        L0 += 85 * cos(3.67 + 71430.70 * Tau);
        L0 += 80 * cos(1.81 + 17260.15 * Tau);
        L0 += 79 * cos(3.04 + 12036.46 * Tau);

        L0 += 75 * cos(1.76 + 5088.63 * Tau);
        L0 += 74 * cos(3.50 + 3154.69 * Tau);
        L0 += 74 * cos(4.68 + 801.82 * Tau);
        L0 += 70 * cos(0.83 + 9437.76 * Tau);
        L0 += 62 * cos(3.98 + 8827.39 * Tau);
        L0 += 61 * cos(1.82 + 7084.90 * Tau);
        L0 += 57 * cos(2.78 + 6286.60 * Tau);
        L0 += 56 * cos(4.39 + 14143.50 * Tau);
        L0 += 56 * cos(3.47 + 6279.55 * Tau);
        L0 += 52 * cos(0.19 + 12139.55 * Tau);

        L0 += 52 * cos(1.33 + 1748.02 * Tau);
        L0 += 51 * cos(0.28 + 5856.48 * Tau);
        L0 += 49 * cos(0.49 + 1194.45 * Tau);
        L0 += 41 * cos(5.37 + 8429.24 * Tau);
        L0 += 41 * cos(2.40 + 19651.05 * Tau);
        L0 += 39 * cos(6.17 + 10447.39 * Tau);
        L0 += 37 * cos(6.04 + 10213.29 * Tau);
        L0 += 37 * cos(2.57 + 1059.38 * Tau);
        L0 += 36 * cos(1.71 + 2352.87 * Tau);
        L0 += 36 * cos(1.78 + 6812.77 * Tau);

        L0 += 33 * cos(0.59 + 17789.85 * Tau);
        L0 += 30 * cos(0.44 + 83996.85 * Tau);
        L0 += 30 * cos(2.74 + 1349.87 * Tau);
        L0 += 25 * cos(3.16 + 4690.48 * Tau);


        var L1 = 628331966747;
        L1 += 206059 * cos(2.678235 + 6283.075850 * Tau);
        L1 += 4303 * cos(2.6351 + 12566.1517 * Tau);
        L1 += 425 * cos(1.590 + 3.523 * Tau);
        L1 += 119 * cos(5.796 + 26.298 * Tau);
        L1 += 109 * cos(2.966 + 1577.344 * Tau);
        L1 += 93 * cos(2.59 + 18849.23 * Tau);
        L1 += 72 * cos(1.14 + 529.69 * Tau);
        L1 += 68 * cos(1.87 + 398.15 * Tau);
        L1 += 67 * cos(4.41 + 5507.55 * Tau);

        L1 += 59 * cos(2.89 + 5223.69 * Tau);
        L1 += 56 * cos(2.17 + 155.42 * Tau);
        L1 += 45 * cos(0.40 + 796.30 * Tau);
        L1 += 36 * cos(0.47 + 775.52 * Tau);
        L1 += 29 * cos(2.65 + 7.11 * Tau);
        L1 += 21 * cos(5.34 + 0.98 * Tau);
        L1 += 19 * cos(1.85 + 5486.78 * Tau);
        L1 += 19 * cos(4.97 + 213.30 * Tau);
        L1 += 17 * cos(2.99 + 6275.96 * Tau);
        L1 += 16 * cos(0.03 + 2544.31 * Tau);

        L1 += 16 * cos(1.43 + 2146.17 * Tau);
        L1 += 15 * cos(1.21 + 10977.08 * Tau);
        L1 += 12 * cos(2.83 + 1748.02 * Tau);
        L1 += 12 * cos(3.26 + 5088.63 * Tau);
        L1 += 12 * cos(5.27 + 1194.45 * Tau);
        L1 += 12 * cos(2.08 + 4694.00 * Tau);
        L1 += 11 * cos(0.77 + 553.57 * Tau);
        L1 += 10 * cos(1.30 + 6286.60 * Tau);
        L1 += 10 * cos(4.24 + 1349.87 * Tau);
        L1 += 9 * cos(2.70 + 242.73 * Tau);

        L1 += 9 * cos(5.64 + 951.72 * Tau);
        L1 += 8 * cos(5.30 + 2352.87 * Tau);
        L1 += 6 * cos(2.65 + 9437.76 * Tau);
        L1 += 6 * cos(4.67 + 4690.48 * Tau);


        var L2 = 52919;
        L2 += 8720 * cos(1.0721 + 6283.0758 * Tau);
        L2 += 309 * cos(0.867 + 12566.152 * Tau);
        L2 += 27 * cos(0.05 + 3.52 * Tau);
        L2 += 16 * cos(5.19 + 26.30 * Tau);
        L2 += 16 * cos(3.68 + 155.42 * Tau);
        L2 += 10 * cos(0.76 + 18849.23 * Tau);
        L2 += 9 * cos(2.06 + 77713.77 * Tau);
        L2 += 7 * cos(0.83 + 775.52 * Tau);
        L2 += 5 * cos(4.66 + 1577.34 * Tau);

        L2 += 4 * cos(1.03 + 7.11 * Tau);
        L2 += 4 * cos(3.44 + 5573.14 * Tau);
        L2 += 3 * cos(5.14 + 796.30 * Tau);
        L2 += 3 * cos(6.05 + 5507.55 * Tau);
        L2 += 3 * cos(1.19 + 242.73 * Tau);
        L2 += 3 * cos(6.12 + 529.69 * Tau);
        L2 += 3 * cos(0.31 + 398.15 * Tau);
        L2 += 3 * cos(2.28 + 553.57 * Tau);
        L2 += 2 * cos(4.38 + 5223.69 * Tau);
        L2 += 2 * cos(3.75 + 0.98 * Tau);


        var L3 = 289 * cos(5.844 + 6283.076 * Tau);
        L3 += 35;
        L3 += 17 * cos(5.49 + 12566.15 * Tau);
        L3 += 3 * cos(5.20 + 155.42 * Tau);
        L3 += 1 * cos(4.72 + 3.52 * Tau);
        L3 += 1 * cos(5.30 + 18849.23 * Tau);
        L3 += 1 * cos(5.97 + 242.73 * Tau);


        var L4 = 114 * cos(3.142);
        L4 += 8 * cos(4.13 + 6283.08 * Tau);
        L4 += 1 * cos(3.84 + 12566.15 * Tau);


        var L5 = 1 * cos(3.14);

        //Mean longitude of the sun
        var Lsun_mean = trunc(280.4664567 + 360007.6982779 * Tau + 0.03032028 * Tau2 + Tau3 / 49931 - Tau4 / 15299 - Tau5 / 1988000);

        //Heliocentric longitude
        var Lhelioc = trunc((L0 + L1 * Tau + L2 * Tau2 + L3 * Tau3 + L4 * Tau4 + L5 * Tau5) / 1e8 / dtr);

        //Geocentric longitude
        Lsun_true = trunc(Lhelioc + 180 - 0.000025);

        //Latitude
        var B0 = 280 * cos(3.199 + 84334.662 * Tau);
        B0 += 102 * cos(5.422 + 5507.553 * Tau);
        B0 += 80 * cos(3.88 + 5223.69 * Tau);
        B0 += 44 * cos(3.70 + 2352.87 * Tau);
        B0 += 32 * cos(4.00 + 1577.34 * Tau);

        var B1 = 9 * cos(3.90 + 5507.55 * Tau);
        B1 += 6 * cos(1.73 + 5223.69 * Tau);

        //Heliocentric latitude
        var B = (B0 + B1 * Tau) / 1e8 / dtr;

        //Geocentric latitude
        var beta = trunc(-B);

        //Corrections
        Lsun_prime = trunc(Lhelioc + 180 - 1.397 * TE - 0.00031 * TE2);

        beta = beta + 0.000011 * (cosd(Lsun_prime) - sind(Lsun_prime));


        //Distance earth-sun
        var R0 = 100013989;
        R0 += 1670700 * cos(3.0984635 + 6283.0758500 * Tau);
        R0 += 13956 * cos(3.05525 + 12566.15170 * Tau);
        R0 += 3084 * cos(5.1985 + 77713.7715 * Tau);
        R0 += 1628 * cos(1.1739 + 5753.3849 * Tau);
        R0 += 1576 * cos(2.8469 + 7860.4194 * Tau);
        R0 += 925 * cos(5.453 + 11506.770 * Tau);
        R0 += 542 * cos(4.564 + 3930.210 * Tau);
        R0 += 472 * cos(3.661 + 5884.927 * Tau);
        R0 += 346 * cos(0.964 + 5507.553 * Tau);

        R0 += 329 * cos(5.900 + 5223.694 * Tau);
        R0 += 307 * cos(0.299 + 5573.143 * Tau);
        R0 += 243 * cos(4.273 + 11790.629 * Tau);
        R0 += 212 * cos(5.847 + 1577.344 * Tau);
        R0 += 186 * cos(5.022 + 10977.079 * Tau);
        R0 += 175 * cos(3.012 + 18849.228 * Tau);
        R0 += 110 * cos(5.055 + 5486.778 * Tau);
        R0 += 98 * cos(0.89 + 6069.78 * Tau);
        R0 += 86 * cos(5.69 + 15720.84 * Tau);
        R0 += 86 * cos(1.27 + 161000.69 * Tau);

        R0 += 65 * cos(0.27 + 17260.15 * Tau);
        R0 += 63 * cos(0.92 + 529.69 * Tau);
        R0 += 57 * cos(2.01 + 83996.85 * Tau);
        R0 += 56 * cos(5.24 + 71430.70 * Tau);
        R0 += 49 * cos(3.25 + 2544.31 * Tau);
        R0 += 47 * cos(2.58 + 775.52 * Tau);
        R0 += 45 * cos(5.54 + 9437.76 * Tau);
        R0 += 43 * cos(6.01 + 6275.96 * Tau);
        R0 += 39 * cos(5.36 + 4694.00 * Tau);
        R0 += 38 * cos(2.39 + 8827.39 * Tau);

        R0 += 37 * cos(0.83 + 19651.05 * Tau);
        R0 += 37 * cos(4.90 + 12139.55 * Tau);
        R0 += 36 * cos(1.67 + 12036.46 * Tau);
        R0 += 35 * cos(1.84 + 2942.46 * Tau);
        R0 += 33 * cos(0.24 + 7084.90 * Tau);
        R0 += 32 * cos(0.18 + 5088.63 * Tau);
        R0 += 32 * cos(1.78 + 398.15 * Tau);
        R0 += 28 * cos(1.21 + 6286.60 * Tau);
        R0 += 28 * cos(1.90 + 6279.55 * Tau);
        R0 += 26 * cos(4.59 + 10447.39 * Tau);


        var R1 = 103019 * cos(1.107490 + 6283.075850 * Tau);
        R1 += 1721 * cos(1.0644 + 12566.1517 * Tau);
        R1 += 702 * cos(3.142);
        R1 += 32 * cos(1.02 + 18849.23 * Tau);
        R1 += 31 * cos(2.84 + 5507.55 * Tau);
        R1 += 25 * cos(1.32 + 5223.69 * Tau);
        R1 += 18 * cos(1.42 + 1577.34 * Tau);
        R1 += 10 * cos(5.91 + 10977.08 * Tau);
        R1 += 9 * cos(1.42 + 6275.96 * Tau);
        R1 += 9 * cos(0.27 + 5486.78 * Tau);


        var R2 = 4359 * cos(5.7846 + 6283.0758 * Tau);
        R2 += 124 * cos(5.579 + 12566.152 * Tau);
        R2 += 12 * cos(3.14);
        R2 += 9 * cos(3.63 + 77713.77 * Tau);
        R2 += 6 * cos(1.87 + 5573.14 * Tau);
        R2 += 3 * cos(5.47 + 18849.23 * Tau);


        var R3 = 145 * cos(4.273 + 6283.076 * Tau);
        R3 += 7 * cos(3.92 + 12566.15 * Tau);


        var R4 = 4 * cos(2.56 + 6283.08 * Tau);

        R = (R0 + R1 * Tau + R2 * Tau2 + R3 * Tau3 + R4 * Tau4) / 1e8;


        //Apparent longitude of the sun
        lambda = trunc(Lsun_true + delta_psi - 0.005691611 / R);

        //Right ascension of the sun, apparent
        RAsun = trunc(atan2((sind(lambda) * cosd(eps) - tand(beta) * sind(eps)), cosd(lambda)) / dtr);

        //Sidereal hour angle of the sun, apparent
        SHAsun = 360 - RAsun;

        //Declination of the sun, apparent 
        DECsun = asin(sind(beta) * cosd(eps) + cosd(beta) * sind(eps) * sind(lambda)) / dtr;
        Dsun = DECsun;

        //GHA of the sun
        GHAsun = trunc(GHAAtrue - RAsun);

        //Semidiameter of the sun
        SDsun = 959.63 / R;

        //Horizontal parallax of the sun
        HPsun = 8.794 / R;

        //Equation of time
        //EOT = 4*(Lsun_mean-0.0057183-0.0008-RAsun+delta_psi*cosd(eps));
        EOT = 4 * GHAsun + 720 - 1440 * dayfraction;
        if (EOT > 20) EOT -= 1440;
        if (EOT < -20) EOT += 1440;
    }
}


//Calculation of ephemerides for the moon

function Moon() {
    with(Math) {
        // Mean longitude of the moon
        Lmoon_mean = trunc(218.3164591 + 481267.88134236 * TE - 0.0013268 * TE2 + TE3 / 538841 - TE4 / 65194000);

        //Mean elongation of the moon
        D = trunc(297.8502042 + 445267.1115168 * TE - 0.00163 * TE2 + TE3 / 545868 - TE4 / 113065000);

        // Mean anomaly of the sun
        Msun_mean = trunc(357.5291092 + 35999.0502909 * TE - 0.0001536 * TE2 + TE3 / 24490000);

        //Mean anomaly of the moon
        Mmoon_mean = trunc(134.9634114 + 477198.8676313 * TE + 0.008997 * TE2 + TE3 / 69699 - TE4 / 14712000);

        //Mean distance of the moon from her ascending node
        F = trunc(93.2720993 + 483202.0175273 * TE - 0.0034029 * TE2 - TE3 / 3526000 + TE4 / 863310000);

        //Corrections
        A1 = 119.75 + 131.849 * TE;
        A1 = 360 * (A1 / 360 - floor(A1 / 360));
        A2 = 53.09 + 479264.29 * TE;
        A2 = 360 * (A2 / 360 - floor(A2 / 360));
        A3 = 313.45 + 481266.484 * TE;
        A3 = 360 * (A3 / 360 - floor(A3 / 360));

        fE = 1 - 0.002516 * TE - 0.0000074 * TE2;
        fE2 = fE * fE;


        //Periodic terms for the moon
        //Longitude and distance
        fD = new Array(60);
        fMms = new Array(60);
        fMmm = new Array(60);
        fF = new Array(60);
        coeffs = new Array(60);
        coeffc = new Array(60);

        fD[0]=0; fMms[0]=0; fMmm[0]=1; fF[0]=0; coeffs[0]=6288774; coeffc[0]=-20905355;
        fD[1]=2; fMms[1]=0; fMmm[1]=-1; fF[1]=0; coeffs[1]=1274027; coeffc[1]=-3699111;
        fD[2]=2; fMms[2]=0; fMmm[2]=0; fF[2]=0; coeffs[2]=658314; coeffc[2]=-2955968;
        fD[3]=0; fMms[3]=0; fMmm[3]=2; fF[3]=0; coeffs[3]=213618; coeffc[3]=-569925;
        fD[4]=0; fMms[4]=1; fMmm[4]=0; fF[4]=0; coeffs[4]=-185116; coeffc[4]=48888;
        fD[5]=0; fMms[5]=0; fMmm[5]=0; fF[5]=2; coeffs[5]=-114332; coeffc[5]=-3149;
        fD[6]=2; fMms[6]=0; fMmm[6]=-2; fF[6]=0; coeffs[6]=58793; coeffc[6]=246158;
        fD[7]=2; fMms[7]=-1; fMmm[7]=-1; fF[7]=0; coeffs[7]=57066; coeffc[7]=-152138;
        fD[8]=2; fMms[8]=0; fMmm[8]=1; fF[8]=0; coeffs[8]=53322; coeffc[8]=-170733;
        fD[9]=2; fMms[9]=-1; fMmm[9]=0; fF[9]=0; coeffs[9]=45758; coeffc[9]=-204586;

        fD[10]=0; fMms[10]=1; fMmm[10]=-1; fF[10]=0; coeffs[10]=-40923; coeffc[10]=-129620;
        fD[11]=1; fMms[11]=0; fMmm[11]=0; fF[11]=0; coeffs[11]=-34720; coeffc[11]=108743;
        fD[12]=0; fMms[12]=1; fMmm[12]=1; fF[12]=0; coeffs[12]=-30383; coeffc[12]=104755;
        fD[13]=2; fMms[13]=0; fMmm[13]=0; fF[13]=-2; coeffs[13]=15327; coeffc[13]=10321;
        fD[14]=0; fMms[14]=0; fMmm[14]=1; fF[14]=2; coeffs[14]=-12528; coeffc[14]=0;
        fD[15]=0; fMms[15]=0; fMmm[15]=1; fF[15]=-2; coeffs[15]=10980; coeffc[15]=79661;
        fD[16]=4; fMms[16]=0; fMmm[16]=-1; fF[16]=0; coeffs[16]=10675; coeffc[16]=-34782;
        fD[17]=0; fMms[17]=0; fMmm[17]=3; fF[17]=0; coeffs[17]=10034; coeffc[17]=-23210;
        fD[18]=4; fMms[18]=0; fMmm[18]=-2; fF[18]=0; coeffs[18]=8548; coeffc[18]=-21636;
        fD[19]=2; fMms[19]=1; fMmm[19]=-1; fF[19]=0; coeffs[19]=-7888; coeffc[19]=24208;

        fD[20]=2; fMms[20]=1; fMmm[20]=0; fF[20]=0; coeffs[20]=-6766; coeffc[20]=30824;
        fD[21]=1; fMms[21]=0; fMmm[21]=-1; fF[21]=0; coeffs[21]=-5163; coeffc[21]=-8379;
        fD[22]=1; fMms[22]=1; fMmm[22]=0; fF[22]=0; coeffs[22]=4987; coeffc[22]=-16675;
        fD[23]=2; fMms[23]=-1; fMmm[23]=1; fF[23]=0; coeffs[23]=4036; coeffc[23]=-12831;
        fD[24]=2; fMms[24]=0; fMmm[24]=2; fF[24]=0; coeffs[24]=3994; coeffc[24]=-10445;
        fD[25]=4; fMms[25]=0; fMmm[25]=0; fF[25]=0; coeffs[25]=3861; coeffc[25]=-11650;
        fD[26]=2; fMms[26]=0; fMmm[26]=-3; fF[26]=0; coeffs[26]=3665; coeffc[26]=14403;
        fD[27]=0; fMms[27]=1; fMmm[27]=-2; fF[27]=0; coeffs[27]=-2689; coeffc[27]=-7003;
        fD[28]=2; fMms[28]=0; fMmm[28]=-1; fF[28]=2; coeffs[28]=-2602; coeffc[28]=0;
        fD[29]=2; fMms[29]=-1; fMmm[29]=-2; fF[29]=0; coeffs[29]=2390; coeffc[29]=10056;

        fD[30]=1; fMms[30]=0; fMmm[30]=1; fF[30]=0; coeffs[30]=-2348; coeffc[30]=6322;
        fD[31]=2; fMms[31]=-2; fMmm[31]=0; fF[31]=0; coeffs[31]=2236; coeffc[31]=-9884;
        fD[32]=0; fMms[32]=1; fMmm[32]=2; fF[32]=0; coeffs[32]=-2120; coeffc[32]=5751;
        fD[33]=0; fMms[33]=2; fMmm[33]=0; fF[33]=0; coeffs[33]=-2069; coeffc[33]=0;
        fD[34]=2; fMms[34]=-2; fMmm[34]=-1; fF[34]=0; coeffs[34]=2048; coeffc[34]=-4950;
        fD[35]=2; fMms[35]=0; fMmm[35]=1; fF[35]=-2; coeffs[35]=-1773; coeffc[35]=4130;
        fD[36]=2; fMms[36]=0; fMmm[36]=0; fF[36]=2; coeffs[36]=-1595; coeffc[36]=0;
        fD[37]=4; fMms[37]=-1; fMmm[37]=-1; fF[37]=0; coeffs[37]=1215; coeffc[37]=-3958;
        fD[38]=0; fMms[38]=0; fMmm[38]=2; fF[38]=2; coeffs[38]=-1110; coeffc[38]=0;
        fD[39]=3; fMms[39]=0; fMmm[39]=-1; fF[39]=0; coeffs[39]=-892; coeffc[39]=3258;

        fD[40]=2; fMms[40]=1; fMmm[40]=1; fF[40]=0; coeffs[40]=-810; coeffc[40]=2616;
        fD[41]=4; fMms[41]=-1; fMmm[41]=-2; fF[41]=0; coeffs[41]=759; coeffc[41]=-1897;
        fD[42]=0; fMms[42]=2; fMmm[42]=-1; fF[42]=0; coeffs[42]=-713; coeffc[42]=-2117;
        fD[43]=2; fMms[43]=2; fMmm[43]=-1; fF[43]=0; coeffs[43]=-700; coeffc[43]=2354;
        fD[44]=2; fMms[44]=1; fMmm[44]=-2; fF[44]=0; coeffs[44]=691; coeffc[44]=0;
        fD[45]=2; fMms[45]=-1; fMmm[45]=0; fF[45]=-2; coeffs[45]=596; coeffc[45]=0;
        fD[46]=4; fMms[46]=0; fMmm[46]=1; fF[46]=0; coeffs[46]=549; coeffc[46]=-1423;
        fD[47]=0; fMms[47]=0; fMmm[47]=4; fF[47]=0; coeffs[47]=537; coeffc[47]=-1117;
        fD[48]=4; fMms[48]=-1; fMmm[48]=0; fF[48]=0; coeffs[48]=520; coeffc[48]=-1571;
        fD[49]=1; fMms[49]=0; fMmm[49]=-2; fF[49]=0; coeffs[49]=-487; coeffc[49]=-1739;

        fD[50]=2; fMms[50]=1; fMmm[50]=0; fF[50]=-2; coeffs[50]=-399; coeffc[50]=0;
        fD[51]=0; fMms[51]=0; fMmm[51]=2; fF[51]=-2; coeffs[51]=-381; coeffc[51]=-4421;
        fD[52]=1; fMms[52]=1; fMmm[52]=1; fF[52]=0; coeffs[52]=351; coeffc[52]=0;
        fD[53]=3; fMms[53]=0; fMmm[53]=-2; fF[53]=0; coeffs[53]=-340; coeffc[53]=0;
        fD[54]=4; fMms[54]=0; fMmm[54]=-3; fF[54]=0; coeffs[54]=330; coeffc[54]=0;
        fD[55]=2; fMms[55]=-1; fMmm[55]=2; fF[55]=0; coeffs[55]=327; coeffc[55]=0;
        fD[56]=0; fMms[56]=2; fMmm[56]=1; fF[56]=0; coeffs[56]=-323; coeffc[56]=1165;
        fD[57]=1; fMms[57]=1; fMmm[57]=-1; fF[57]=0; coeffs[57]=299; coeffc[57]=0;
        fD[58]=2; fMms[58]=0; fMmm[58]=3; fF[58]=0; coeffs[58]=294; coeffc[58]=0;
        fD[59]=2; fMms[59]=0; fMmm[59]=-1; fF[59]=-2; coeffs[59]=0; coeffc[59]=8752;

        //Latitude
        fD2 = new Array(60);
        fMms2= new Array(60);
        fMmm2 = new Array(60);
        fF2 = new Array(60);
        coeffs2 = new Array(60);
	
        fD2[0]=0; fMms2[0]=0; fMmm2[0]=0; fF2[0]=1; coeffs2[0]=5128122;
        fD2[1]=0; fMms2[1]=0; fMmm2[1]=1; fF2[1]=1; coeffs2[1]=280602;
        fD2[2]=0; fMms2[2]=0; fMmm2[2]=1; fF2[2]=-1; coeffs2[2]=277693;
        fD2[3]=2; fMms2[3]=0; fMmm2[3]=0; fF2[3]=-1; coeffs2[3]=173237;
        fD2[4]=2; fMms2[4]=0; fMmm2[4]=-1; fF2[4]=1; coeffs2[4]=55413;
        fD2[5]=2; fMms2[5]=0; fMmm2[5]=-1; fF2[5]=-1; coeffs2[5]=46271;
        fD2[6]=2; fMms2[6]=0; fMmm2[6]=0; fF2[6]=1; coeffs2[6]=32573;
        fD2[7]=0; fMms2[7]=0; fMmm2[7]=2; fF2[7]=1; coeffs2[7]=17198;
        fD2[8]=2; fMms2[8]=0; fMmm2[8]=1; fF2[8]=-1; coeffs2[8]=9266;
        fD2[9]=0; fMms2[9]=0; fMmm2[9]=2; fF2[9]=-1; coeffs2[9]=8822;

        fD2[10]=2; fMms2[10]=-1; fMmm2[10]=0; fF2[10]=-1; coeffs2[10]=8216;
        fD2[11]=2; fMms2[11]=0; fMmm2[11]=-2; fF2[11]=-1; coeffs2[11]=4324;
        fD2[12]=2; fMms2[12]=0; fMmm2[12]=1; fF2[12]=1; coeffs2[12]=4200;
        fD2[13]=2; fMms2[13]=1; fMmm2[13]=0; fF2[13]=-1; coeffs2[13]=-3359;
        fD2[14]=2; fMms2[14]=-1; fMmm2[14]=-1; fF2[14]=1; coeffs2[14]=2463;
        fD2[15]=2; fMms2[15]=-1; fMmm2[15]=0; fF2[15]=1; coeffs2[15]=2211;
        fD2[16]=2; fMms2[16]=-1; fMmm2[16]=-1; fF2[16]=-1; coeffs2[16]=2065;
        fD2[17]=0; fMms2[17]=1; fMmm2[17]=-1; fF2[17]=-1; coeffs2[17]=-1870;
        fD2[18]=4; fMms2[18]=0; fMmm2[18]=-1; fF2[18]=-1; coeffs2[18]=1828;
        fD2[19]=0; fMms2[19]=1; fMmm2[19]=0; fF2[19]=1; coeffs2[19]=-1794;
	
        fD2[20]=0; fMms2[20]=0; fMmm2[20]=0; fF2[20]=3; coeffs2[20]=-1749;
        fD2[21]=0; fMms2[21]=1; fMmm2[21]=-1; fF2[21]=1; coeffs2[21]=-1565;
        fD2[22]=1; fMms2[22]=0; fMmm2[22]=0; fF2[22]=1; coeffs2[22]=-1491;
        fD2[23]=0; fMms2[23]=1; fMmm2[23]=1; fF2[23]=1; coeffs2[23]=-1475;
        fD2[24]=0; fMms2[24]=1; fMmm2[24]=1; fF2[24]=-1; coeffs2[24]=-1410;
        fD2[25]=0; fMms2[25]=1; fMmm2[25]=0; fF2[25]=-1; coeffs2[25]=-1344;
        fD2[26]=1; fMms2[26]=0; fMmm2[26]=0; fF2[26]=-1; coeffs2[26]=-1335;
        fD2[27]=0; fMms2[27]=0; fMmm2[27]=3; fF2[27]=1; coeffs2[27]=1107;
        fD2[28]=4; fMms2[28]=0; fMmm2[28]=0; fF2[28]=-1; coeffs2[28]=1021;
        fD2[29]=4; fMms2[29]=0; fMmm2[29]=-1; fF2[29]=1; coeffs2[29]=833;
	
        fD2[30]=0; fMms2[30]=0; fMmm2[30]=1; fF2[30]=-3; coeffs2[30]=777;
        fD2[31]=4; fMms2[31]=0; fMmm2[31]=-2; fF2[31]=1; coeffs2[31]=671;
        fD2[32]=2; fMms2[32]=0; fMmm2[32]=0; fF2[32]=-3; coeffs2[32]=607;
        fD2[33]=2; fMms2[33]=0; fMmm2[33]=2; fF2[33]=-1; coeffs2[33]=596;
        fD2[34]=2; fMms2[34]=-1; fMmm2[34]=1; fF2[34]=-1; coeffs2[34]=491;
        fD2[35]=2; fMms2[35]=0; fMmm2[35]=-2; fF2[35]=1; coeffs2[35]=-451;
        fD2[36]=0; fMms2[36]=0; fMmm2[36]=3; fF2[36]=-1; coeffs2[36]=439;
        fD2[37]=2; fMms2[37]=0; fMmm2[37]=2; fF2[37]=1; coeffs2[37]=422;
        fD2[38]=2; fMms2[38]=0; fMmm2[38]=-3; fF2[38]=-1; coeffs2[38]=421;
        fD2[39]=2; fMms2[39]=1; fMmm2[39]=-1; fF2[39]=1; coeffs2[39]=-366;

        fD2[40]=2; fMms2[40]=1; fMmm2[40]=0; fF2[40]=1; coeffs2[40]=-351;
        fD2[41]=4; fMms2[41]=0; fMmm2[41]=0; fF2[41]=1; coeffs2[41]=331;
        fD2[42]=2; fMms2[42]=-1; fMmm2[42]=1; fF2[42]=1; coeffs2[42]=315;
        fD2[43]=2; fMms2[43]=-2; fMmm2[43]=0; fF2[43]=-1; coeffs2[43]=302;
        fD2[44]=0; fMms2[44]=0; fMmm2[44]=1; fF2[44]=3; coeffs2[44]=-283;
        fD2[45]=2; fMms2[45]=1; fMmm2[45]=1; fF2[45]=-1; coeffs2[45]=-229;
        fD2[46]=1; fMms2[46]=1; fMmm2[46]=0; fF2[46]=-1; coeffs2[46]=223;
        fD2[47]=1; fMms2[47]=1; fMmm2[47]=0; fF2[47]=1; coeffs2[47]=223;
        fD2[48]=0; fMms2[48]=1; fMmm2[48]=-2; fF2[48]=-1; coeffs2[48]=-220;
        fD2[49]=2; fMms2[49]=1; fMmm2[49]=-1; fF2[49]=-1; coeffs2[49]=-220;

        fD2[50]=1; fMms2[50]=0; fMmm2[50]=1; fF2[50]=1; coeffs2[50]=-185;
        fD2[51]=2; fMms2[51]=-1; fMmm2[51]=-2; fF2[51]=-1; coeffs2[51]=181;
        fD2[52]=0; fMms2[52]=1; fMmm2[52]=2; fF2[52]=1; coeffs2[52]=-177;
        fD2[53]=4; fMms2[53]=0; fMmm2[53]=-2; fF2[53]=-1; coeffs2[53]=176;
        fD2[54]=4; fMms2[54]=-1; fMmm2[54]=-1; fF2[54]=-1; coeffs2[54]=166;
        fD2[55]=1; fMms2[55]=0; fMmm2[55]=1; fF2[55]=-1; coeffs2[55]=-164;
        fD2[56]=4; fMms2[56]=0; fMmm2[56]=1; fF2[56]=-1; coeffs2[56]=132;
        fD2[57]=1; fMms2[57]=0; fMmm2[57]=-1; fF2[57]=-1; coeffs2[57]=-119;
        fD2[58]=4; fMms2[58]=-1; fMmm2[58]=0; fF2[58]=-1; coeffs2[58]=115;
        fD2[59]=2; fMms2[59]=-2; fMmm2[59]=0; fF2[59]=1; coeffs2[59]=107;	

        var sumL = 0;
        var sumr = 0;
        var sumB = 0;

        for (x = 0; x < 60; x++) {
            var f = 1;
            if (abs(fMms[x]) == 1) f = fE;
            if (abs(fMms[x]) == 2) f = fE2;
            sumL += f * (coeffs[x] * sind(fD[x] * D + fMms[x] * Msun_mean + fMmm[x] * Mmoon_mean + fF[x] * F));
            sumr += f * (coeffc[x] * cosd(fD[x] * D + fMms[x] * Msun_mean + fMmm[x] * Mmoon_mean + fF[x] * F));
            f = 1;
            if (abs(fMms2[x]) == 1) f = fE;
            if (abs(fMms2[x]) == 2) f = fE2;
            sumB += f * (coeffs2[x] * sind(fD2[x] * D + fMms2[x] * Msun_mean + fMmm2[x] * Mmoon_mean + fF2[x] * F));
        }

        //Corrections
        sumL = sumL + 3958 * sind(A1) + 1962 * sind(Lmoon_mean - F) + 318 * sind(A2);
        sumB = sumB - 2235 * sind(Lmoon_mean) + 382 * sind(A3) + 175 * sind(A1 - F) + 175 * sind(A1 + F) + 127 * sind(Lmoon_mean - Mmoon_mean) - 115 * sind(Lmoon_mean + Mmoon_mean);

        //Longitude of the moon
        lambdaMm = trunc(Lmoon_mean + sumL / 1000000);

        //Latitude of the moon
        betaM = sumB / 1000000;

        //Distance earth-moon
        dEM = 385000.56 + sumr / 1000;

        //Apparent longitude of the moon
        lambdaMapp = lambdaMm + delta_psi;

        //Right ascension of the moon, apparent
        RAmoon = trunc(atan2((sind(lambdaMapp) * cosd(eps) - tand(betaM) * sind(eps)), cosd(lambdaMapp)) / dtr);

        //Sidereal hour angle of the moon, apparent
        SHAmoon = 360 - RAmoon;

        //Declination of the moon 
        DECmoon = asin(sind(betaM) * cosd(eps) + cosd(betaM) * sind(eps) * sind(lambdaMapp)) / dtr;
        Dmoon = DECmoon;

        //GHA of the moon
        GHAmoon = trunc(GHAAtrue - RAmoon);

        //Horizontal parallax of the moon
        //HPmoon = 3600*asin(6378.14/dEM)/dtr;
        //Semidiameter of the moon
        //SDmoon = 3600*asin(1738/dEM)/dtr;
        //Geocentric angular distance between moon and sun
        //LDist = acos(sind(Dmoon)*sind(Dsun)+cosd(Dmoon)*cosd(Dsun)*cosd(RAmoon-RAsun))/dtr;

        //Phase of the moon
//        var i = lambdaMapp - lambda;
//        k = 100 * (1 - cosd(i)) / 2;
//        k = round(10 * k) / 10;
    }
}
