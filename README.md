# TailLog

> 

## About

This project uses [Feathers](http://feathersjs.com) for websockets on node. It 
implements tail -f like functionality for a given log file. The logFile path is 
hardcoded, but could be added to a config. When a client connects through web,
they see last 10 line of the log. Any new addition to the the logFile is automatically
updated in the client using websockets.


## Design Choices
1. Log file is read once to find the last 10 lines, at the time of starting the 
application. This design choice keeps the code simple, with tradeoff being a slower
start time (if log file is huge). It however does not impact client latency. The
file is read as a stream, so memory footprint is small.
2. Last 10 lines of the log are kept in memory as (a FIFO queue of size 10) to 
serve to client quickly. Any new line addition to the file, is added to the queue.
3. Log file is watched for any changes, in an event driven manner using nodejs's
fs.watch function. It is very efficient compared to polling for change. When a change
is detected, the file is read from last read location and converted into new lines.
4. If the lines are deleted from the logFile, it is an exception as log is not 
expected to delete lines. An error is logged in that scenario while resetting 
the last read location to correctly  read the file when a new line is added. 
5. New changes are transmitted using Feathersjs event emitter based channel approach.
All clients are listenting to the same channel where the upate is sent.
6. Multiple clients can access the app. When a new client sends a connection request
it recieves the latest snapshot of last 10 log lines, and then it listens to the updates


## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/logmonitoring
    npm install
    ```

3. Start your app

    ```
    npm start
    ```
4. Log file location: '''lib/logs/log.txt'''. Please make sure you look at lib folder
and not at src folder. Since typescript compiles the code into lib, the web app
reads from lib folder. Add new lines to log.txt manually (or linux commands) to see 
it udpated in the client side automatically.


## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.




