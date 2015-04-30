# network-connection-monitoring
Ping things and see latencies.

## Requirements

 * Node.js (and NPM)
 * Express (to install: npm install express --save)
 * Experimentation and patience

## To run

`sh start.sh`

## To see reports

 1. Open a browser to the IP address and port number Node.js gives you. Hover the mouse over items to see details.
 2. Open `logs/log.txt` to see recorded data.
 3. Run `sh analyzer.sh` to generate `report.txt`. This is useful for looking for large gaps/latencies.

Have fun! :)
