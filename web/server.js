// Include modules

var	fs = require ( "fs" ),
	
	express = require ( "express" ),
	
	path = require ( "path" ),
	
	StringDecoder = require('string_decoder').StringDecoder,
	
	decoder = new StringDecoder ( "utf8" );


// Settings

var settings = {
	
	WebPort:		3000,
	
	IPAddress:		getLocalIPAddress () [ 1 ],
	
	logFile:		"../logs/pings.txt"
	
};

var logFilePath = path.resolve ( __dirname, settings.logFile );


// Start the Web part

var app = express ();

app.use (

        express.static (

                __dirname + "/public"

        )

);

app.get (
	
	"/pings.json",
	
	getPings
	
);

app.listen ( settings.WebPort );

console.log (

	"\n"

	+ "I'm alive at "

	+ settings.IPAddress

	+ " on port "

	+ settings.WebPort

	+ "!"

	+ "\n"

);


function getPings ( request, response ) {
	
	console.log ( "Get " + request.query.latest + " pings" );
	
	var numberOfPingsToGet = Number ( request.query.latest ) || 50;
	
	var sendPingsLater = new getPingsResponseClosure ( response );
	
	readLastFewPings ( numberOfPingsToGet, sendPingsLater );
	
}

function getPingsResponseClosure ( response ) {
	
	var sendLater = function ( pings ) {
		
		sendPings ( response, pings );
		
	};
	
	return sendLater;
	
}

function sendPings ( response, pings ) {
	
	console.log ( "Sending " + pings.length + " pings\n" );
	
	var responseText = JSON.stringify ( pings );
	
	response.send ( responseText );
	
}

function readLastFewPings ( numberOfPings, next ) {
	
	// Processing
	
	var lastFewPings = new Array ();
	
	function readChunk ( chunk ) {
		
		var chunkString = decoder.write ( chunk );
		
		var lines = chunkString.split ( "\n" );
		
		for ( var i = 0; i < lines.length; i++ ) {
			
			addLine ( lines [ i ] );
			
		}
		
	}
	
	function addLine ( line ) {
		
		addPing ( line );
		
		limitPings ();
		
	}
	
	function addPing ( line ) {
		
		// Only send valid lines
		
		if ( ! line.match ( "^[0-9]+, [^,]+, [0-9.]+$" ) ) return;
		
		
		// Build object for ping data
		
		var lineParts = line.split ( ", " );
		
		var ping = {
			
			"when": lineParts [ 0 ],
			
			"destination": lineParts [ 1 ],
			
			"timeTaken": lineParts [ 2 ]
			
		};
		
		
		// Save it
		
		lastFewPings.push ( ping );
		
	}
	
	function limitPings () {
		
		if ( lastFewPings.length > numberOfPings ) {
			
			lastFewPings.shift ();
			
		}
		
	}
	
	function finishedReading () {
		
		next ( lastFewPings );
		
	}
	
	function reportError () {
		
		console.log ( "Error in readLastFewPings:", arguments, __filename, __dirname );
		
	}
	
	
	// Start reading
	
	var reading = fs.createReadStream ( logFilePath );
	
	reading.on ( "error", reportError );
	
	reading.on ( "data", readChunk );
	
	reading.on ( "end", finishedReading );
	
}

function getLocalIPAddress () {

	var addresses = new Array ();

	var os = require ( "os" );

	var interfaces = os.networkInterfaces ();

	for ( var device in interfaces ) {

		var alias = 0;

		interfaces [ device ].forEach (

			function ( details ) {

				if ( details.family == "IPv4" ) {
			
					addresses.push (

						/*
						device + (
							alias ?
								":" + alias
							:
								""
						)

						+ " "

						+ details.address
						*/

						details.address

					);

					++alias;
				}
			}

		);
	}

	return addresses;

}