import { Application } from '../declarations';
import * as fs from 'fs';
import * as os from 'os';
import readline = require('readline');
import chokidar = require('chokidar');
var LinkedList = require('dbly-linked-list');

export class LogReader {
  app: Application;
  logFile: string;
  logList = new LinkedList();
  lastReadSize = 0;
  lastModTime: number = 0;
  maxListSize: number = 10;
  nextLine: number = 0;

  constructor(app: Application, logFile: string) {
    this.app = app;
    this.logFile = logFile;
    this.preReadLogTail();
  }

  /* Reads the log file as a stream, stores only last 10 entries.
     This is a one time cost when the service is starting up, it
     does not impact the client latency.
  */
  preReadLogTail() {
    var readInterface = readline.createInterface({
      input: fs.createReadStream(this.logFile),
      output: process.stdout,
      terminal: false
    });

    // read file as a stream and populate last 10 
    readInterface.on('line', (line) => {
      this.populateTailLines(line);
    }).on('close', () => {
      var stats = fs.statSync(this.logFile);
      this.lastReadSize = stats.size;
      this.lastModTime = stats.mtimeMs;
    }).on('error', (error) => {
      //TODO handle error
    });
  }

  /* Saves the latest 10 lines in a linkedlist, with fifo. O(1) for removing 
     and adding a new line
  */
  populateTailLines(line: string) {
    console.log("Line read: %s \n", line);
    const logLine = { index: this.nextLine, text: line };
    if (this.logList.getSize() >= this.maxListSize) {
      this.logList.removeFirst();
    }
    this.logList.insert(logLine);
    this.nextLine++;
  }

  public getTailAsArray() {
    return this.logList.toArray();
  }

  setLogObserver() {
    var lastSize = 0;
    var watcher = chokidar.watch(this.logFile, {
      persistent: true,
      alwaysStat: true,
    });

    watcher.on('add', (path, stats) => {
      lastSize = stats!.size;
      console.log("file %s has been added to watch\n", path);
    }).on('change', (path, stats) => {
      console.log("File change observed")
      var diff = stats!.size - lastSize;
      if (diff <= 0) {
        //no change or deleted
        lastSize = stats!.size;
        return;
      }
      // Create a buffer to read the diff bytes in.
      var buffer = Buffer.alloc(diff);
      var fileDescriptor = fs.openSync(this.logFile, 'r');
      // read diff bytes from lastSize
      fs.read(fileDescriptor, buffer, 0, diff, lastSize, (err) => {
        if (err) {
          return;
        }
        // close file
        fs.closeSync(fileDescriptor);
        // convert data read to line
        this.readBufferAsLines(buffer);

      });
      lastSize = stats!.size;

    }).on('error', error => {
      console.log('Watcher error: ${error}');
    })
  }

  readBufferAsLines(buffer: Buffer) {
    buffer.toString().split(os.EOL).forEach((line, idx, ar) => {
      if (idx < ar.length && line) {
        this.processNewLine(line);
      }
    });
  }

  processNewLine(line: string) {
    // notify all listeners
    this.app.service('tail').emit('created', { text: line });
    // update the tail lines
    this.populateTailLines(line);
  }

}
