var canvas, pings, ping_selected_index = -1;

function start () {
	
	setUpCanvas ();
	
	updatePeriodically ();
	
	showInfoOnHover ();
	
}

function setUpCanvas () {
	
	canvas = document
		
		.getElementById ( "canvas" )
		
		.getContext ( "2d" );
	
	canvas.canvas.width = canvas.canvas.offsetWidth;
	
	canvas.canvas.height = canvas.canvas.offsetHeight;
	
}

function updatePeriodically () {
	
	var fourSeconds = 1000 * 4;
	
	setInterval ( getLatestPings, fourSeconds );
	
	getLatestPings ();
	
}

function showInfoOnHover () {
	
	infoPanel = document.getElementById ( "info" );
	
	canvas.canvas.addEventListener ( "mousemove", showNearestDotInfo );
	
	canvas.canvas.addEventListener ( "mouseout", hideInfo );
	
}

function showNearestDotInfo ( event ) {
	
	// http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
	
	var canvasCoordinates = canvas.canvas.getBoundingClientRect ();
	
	var mouseX = event.clientX - canvasCoordinates.left;
	
	var nearest_dot_index = -1;
	
	var nearest_dot_distance = Number.POSITIVE_INFINITY;
	
	for ( var i = 0; i < pings.length; i++ ) {
		
		var ping = pings [ i ];
		
		var distance = Math.abs ( ping.x - mouseX );
		
		if ( distance <= nearest_dot_distance ) {
			
			nearest_dot_index = i;
			
			nearest_dot_distance = distance;
			
		}
		
	}
	
	
	if ( nearest_dot_index == -1 ) {
		
		ping_selected_index = -1;
		
		return;
		
	}
	
	
	ping_selected_index = nearest_dot_index;
	
	
	var ping = pings [ ping_selected_index ];
	
	if ( ! ping ) {
		
		hideInfo ();
		
		return;
		
	}
	
	showPings ();
	
	showInfo ( event, ping );
	
}

function showInfo ( event, ping ) {
	
	// Add information
	
	var whenText = ( new Date ( Number ( ping.when ) ) ).toLocaleString ();
	
	var destinationText = ping.destination;
	
	infoPanel.querySelector ( ".when" ).innerHTML = whenText;
	
	infoPanel.querySelector ( ".destination" ).innerHTML = destinationText;
	
	infoPanel.querySelector ( ".timeTaken" ).innerHTML = ping.timeTaken + " ms";
	
	
	// Move it near the mouse
	
	var y = event.pageY + 10;
	
	var x = event.pageX;
	
	var middleX = window.innerWidth / 2;
	
	if ( x < middleX ) {
		
		// Left side to middle
		
		x = x + 10;
		
	} else {
		
		// Right side to middle
		
		x = x - infoPanel.offsetWidth - 10;
		
	}
	
	infoPanel.style.top = y + "px";
	
	infoPanel.style.left = x + "px";
	
	
	// Make it visible
	
	infoPanel.className = "shown";
	
}

function hideInfo () {
	
	infoPanel.className = "hidden";
	
}


function getLatestPings () {
	
	var request = new XMLHttpRequest ();
	
	request.open ( "GET", "pings.json?latest=100" );
	
	request.onload = gotPings;
	
	request.send ();
	
}

function gotPings ( event ) {
	
	try {
		
		var pingsGotten = JSON.parse ( event.target.responseText );
		
		pings = pingsGotten;
		
	} catch ( e ) {
		
		console.log ( "Error when parsing pings received", e );
		
	}
	
	showPings ();
	
}

function showPings () {
	
	// Define settings
	
	var end_x = canvas.canvas.width;
	
	var baseline_x = 0;
	
	var end_y = canvas.canvas.height;
	
	var baseline_y = end_y - 2;
	
	var above_baseline_y = end_y - 2;
	
	var shift_dots_y = 10;
	
	
	var point_spacing = canvas.canvas.width / ( pings.length + 1 );
	
	var maximum_y = above_baseline_y - shift_dots_y;
	
	var maximum_timeTaken = 0;
	
	for ( var i = 0; i < pings.length; i++ ) {
		
		maximum_timeTaken = Math.max ( Number ( pings [ i ].timeTaken ), maximum_timeTaken );
		
	}
	
	pings = plotPings ( pings, baseline_y, maximum_y, point_spacing, maximum_timeTaken, shift_dots_y );
	
	
	// Draw
	
	clearCanvas ();
	
	drawBaselineY ( baseline_x, baseline_y, end_x, "black" );
	
	connectTheDots ( pings, "rgb(150,150,150)" );
	
	plotDots ( pings, "rgb(150,150,150)", "black" );
	
}

function plotPings ( pings, baseline_y, maximum_y, point_spacing, maximum_timeTaken, shift_dots_y ) {
	
	for ( var i = 0; i < pings.length; i++ ) {
		
		var ping = pings [ i ];
		
		var position_x = point_spacing * i;
		
		var proportion_y = ping.timeTaken / maximum_timeTaken;
		
		var position_y = maximum_y - ( maximum_y * proportion_y ) + shift_dots_y;
		
		ping.x = position_x;
		
		ping.y = position_y;
		
	}
	
	return pings;
	
}

function plotDots ( pings, defaultColor, selectedColor ) {
	
	// Settings
	
	var dot_size = 10;
	
	
	// Draw each ping
	
	for ( var i = 0; i < pings.length; i++ ) {
		
		var ping = pings [ i ];
		
		var color = defaultColor;
		
		if ( ping_selected_index == i ) {
			
			color = selectedColor;
			
		}
		
		drawSquare ( canvas, ping.x, ping.y, dot_size, color );
		
		//drawCircle ( canvas, ping.x, ping.y, dot_size / 2, color, 0, color );
		
	}
	
}

function drawSquare ( canvas, position_x, position_y, dot_size, color ) {
	
	position_x -= ( dot_size / 2 );
	
	position_y -= ( dot_size / 2 );
	
	canvas.save ();
	
	canvas.fillStyle = color;
	
	canvas.fillRect ( position_x, position_y, dot_size, dot_size );
	
	canvas.restore ();
	
}

function drawCircle ( canvas, x, y, size, color, borderWidth, borderColor ) {
	
	canvas.save ();
	
	canvas.beginPath ();
	
	canvas.arc ( x, y, size, 0, 2 * Math.PI, false );
	
	canvas.fillStyle = color;
	
	canvas.fill ();
	
	canvas.lineWidth = borderWidth;
	
	canvas.strokeStyle = borderColor;
	
	canvas.stroke ();
	
	canvas.restore ();
	
}

function connectTheDots ( pings, color ) {
	
	// Draw each ping
	
	canvas.save ();
	
	canvas.beginPath ();
	
	for ( var i = 0; i < pings.length; i++ ) {
		
		var ping = pings [ i ];
		
		if ( i == 0 ) canvas.moveTo ( ping.x, ping.y );
		
		canvas.lineTo ( ping.x, ping.y );
		
	}
	
	canvas.strokeStyle = color;
	
	canvas.lineWidth = 2.0;
	
	canvas.setLineDash ( [ 4 ] );
	
	canvas.stroke ();
	
	canvas.restore ();
	
}

function clearCanvas () {
	
	canvas.save ();
	
	canvas.clearRect ( 0, 0, canvas.canvas.width, canvas.canvas.height );
	
	canvas.restore ();
	
}

function drawBaselineY ( baseline_x, baseline_y, end_x, color ) {
	
	canvas.save ();
	
	canvas.beginPath ();
	
	canvas.moveTo ( baseline_x, baseline_y );
	
	canvas.lineTo ( end_x, baseline_y );
	
	canvas.strokeStyle = color;
	
	canvas.lineWidth = 1.0;
	
	canvas.stroke ();
	
	canvas.restore ();
}

window.addEventListener ( "load", start, false );