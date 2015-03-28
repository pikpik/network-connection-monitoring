cat logs/pings.txt \
| grep google \
| awk '
	
	BEGIN {
		
		priorTime = 0;
		
	}
	
	{
		
		timeField = $1;
		
		split ( timeField, timeParts, "," );
		
		millisecondTime = int ( timeParts [ 1 ] / 1000 );
		
		difference = millisecondTime - priorTime;
		
		system ( "echo $(date --date=\"@" millisecondTime "\" +\"%a %b %d, %Y, %I:%M:%S %p\"), " difference " seconds later" );
		
		priorTime = millisecondTime;
		
	}
	
'
