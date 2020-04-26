import { strict as assert } from 'assert';
import app from '../../src/app';
import { LogReader } from '../../src/logio/logreader';
import * as path from 'path';
import * as fs from 'fs';
import logger from '../../src/logger';

describe('logreader', () => {
	var logReader: LogReader;

	it('should preread the log file and store only last 10 values', () => {
		var logFile = path.join(__dirname, "testlog.txt");
		logReader = new LogReader(app, logFile);
		logReader.preReadLogTail().then(() => {
			let tailLog = logReader.getTailAsArray();
			console.log("Taillog length %d", tailLog.length);
			assert.ok(tailLog);
			assert.equal(tailLog.length, 10);
			assert.equal(tailLog[0].text, "Line 3");
			assert.equal(tailLog[9].text, "Line 12");
		},
			error => { assert.fail("Error: " + error) }
		);
	});

	it('should monitor for file change and read from the lastread loc', () => {
		var logFile = path.join(__dirname, "testlog2.txt");
		fs.writeFileSync(logFile, "Line 1\nLine 2\nLine 3");
		logReader = new LogReader(app, logFile);
		var stats = fs.statSync(logFile);
		logReader.setLogObserver((length, position) => {
			assert.equal(position, stats.size);
			fs.unlinkSync(logFile);
		});

		logReader.preReadLogTail().then(() => {
			let tailLog = logReader.getTailAsArray();
			assert.equal(tailLog.length, 3);
			fs.appendFileSync(logFile, "\nLine 4");
		});

	});

});
