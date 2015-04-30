cat logs/pings.txt \
| grep -v '192\.168' \
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
	
' \
| grep -vE '(0|1|1[0-9]|4[0-9]|5[0-9]|6[0-9]) seconds' \
> report.txt

less report.txt
