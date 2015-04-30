secondsBetweenPings=60

logFolder="logs"

logFile="$logFolder/pings.txt"


monitorAddress () {
	
	ping -c 1 $1
	
}

reformat () {
	
	while read line
	
	do
		
		echo "$line" \
		| awk '{
			
			if ( match ( $0, "^[0-9]+ bytes from [^:]+:" ) ) {
				
				split ( $4, destinationParts, ":" );
				
				destination = destinationParts [ 1 ];
				
				
				split ( $7, timeParts, "=" );
				
				time = timeParts [ 2 ];
				
				
				print ( destination ", " time );
				
			}
			
		}'
		
	done
	
}

save () {
	
	while read line
	
	do
		
		echo "`date`, $line"
		
		echo "`millisecondsSinceUnixEpoch`, $line" >> $logFile
		
	done
	
}

currentDateAndTime () {
	
	date
	
}

millisecondsSinceUnixEpoch () {
	
	date +%s%N | cut -b1-13
	
}


# Make the log folder and file

test -d $logFolder || mkdir $logFolder

touch $logFile

{
	
	while true
	
	do
		
		# Verizon router
		monitorAddress 192.168.1.1 &
		
		# Sunny
		monitorAddress 192.168.1.2 &
		
		# Timey
		monitorAddress 192.168.1.3 &
		
		# Cloudy
		monitorAddress 192.168.1.4 &
		
		# Google.com
		monitorAddress google.com &
		
		# Wait a minute (literally? :P)
		sleep $secondsBetweenPings
		
	done
	
} \
| reformat \
| save