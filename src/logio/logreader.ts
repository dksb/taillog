import { Application } from '../declarations';
import * as fs from 'fs';
import * as os from 'os';
import readline = require('readline');
import chokidar = require('chokidar');
import logger from '../logger';
var LinkedList = require('dbly-linked-list');

export class LogReader {
  app: Application;
  logFile: string;
  logList = new LinkedList();
  maxListSize: number = 10;
  nextLine: number = 0;

  constructor(app: Application, logFile: string) {
    this.app = app;
    this.logFile = logFile;
  }

  /* Reads the log file as a stream, stores only last 10 entries.
     This is a one time cost when the service is starting up, it
     should not impact the client latency. Returns a promise that resoves
     when the file is fully read.
  */
  preReadLogTail() {
    var readInterface = readline.createInterface({
      input: fs.createReadStream(this.logFile),
      output: process.stdout,
      terminal: false
    });

    // returns a promise that resolves once the whole file is read.
    return new Promise((resolve, reject) => {
      readInterface.on('line', (line) => {
        this.populateTailLines(line);
      }).on('close', () => {
        resolve();
      }).on('error', (error) => {
        logger.error('Error in reading log file line by line ', error);
        reject(error);
      });
    });
  }

  /* Saves the latest 10 lines in a linkedlist, with fifo. O(1) for removing 
     and adding a new line
  */
  populateTailLines(line: string) {
    logger.verbose("Line read: %s \n", line);
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

  /* Sets up a watcher that watches  changes in the log file using fs module.
     If the file change in size then delgates reading of the new change.
  */
  setLogObserver(callback : Function) {
    var lastSize = 0;
    var watcher = chokidar.watch(this.logFile, {
      persistent: true,
      alwaysStat: true,
    });

    watcher.on('add', (path, stats) => {
      lastSize = stats!.size;
      logger.info("file %s has been added to watch\n", path);
    }).on('change', (path, stats) => {
      logger.verbose("File change observed at path %s", path);
      var diff = stats!.size - lastSize;
      if (diff <= 0) {
        //no change or deleted
        lastSize = stats!.size;
        if (diff <0) {
          logger.error("Lines deleted from log causing incosistent state");
        }
        return;
      }
      // Read file changes
      callback(diff, lastSize);
      // update size
      lastSize = stats!.size;

    }).on('error', error => {
      logger.error('Error watching log file: ' + this.logFile, error);
    })
  }

  /* Reads bytes from logFile from a given position and for given length. 
     Forwards the conversion of bytes to line to another method
  */
  readFileChanges(length: number, position: number) {
    var fileDescriptor = fs.openSync(this.logFile, 'r');
    //fs.read(fd, buffer, offset, length, position, callback)
    var buffer = Buffer.alloc(length);
    // read diff bytes from lastSize
    fs.read(fileDescriptor, buffer, 0, length, position, (err) => {
      if (err) {
        logger.error('Error reading file change', err);
        return;
      }
      // close file
      fs.closeSync(fileDescriptor);
      // convert data read to line
      this.readBufferAsLines(buffer);
    });
  }

  /*  Reads a given buffer as line
  */
  readBufferAsLines(buffer: Buffer) {
    buffer.toString().split(os.EOL).forEach((line, idx, ar) => {
      if (idx < ar.length && line) {
        this.processNewLine(line);
      }
    });
  }

  /* Updates the tail list with new lines, and notifies all listeners for every
     new line.
  */
  processNewLine(line: string) {
    // notify all listeners
    this.app.service('tail').emit('created', { text: line });
    // update the tail lines
    this.populateTailLines(line);
  }

}
