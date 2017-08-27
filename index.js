'use strict';

const fs = require('fs');
const { EOL } = require('os');
const { Buffer } = require('buffer');

// Can be customized to optimize for memory usage or cpu usage.
// Higher => ^ Memory v CPU
// Lower  => v Memory ^ CPU
const BUFFER_SIZE = 1024 * 10;
const LINE_DELIMITER = EOL.charCodeAt(0);
const OUTPUT_THRESHOLD_MS = 200;
const START_TIME_MS = Date.now();

const countLines = (buffer, size) => {
  let pos = 0;
  let count = 0;
  // Node's Buffer.p.indexOf() implementation is supa fast/efficient as it uses
  // libc's memchr.  Unfortunately, it doesn't seem like Ruby MRI or Crystal
  // use this for index().
  while ((pos = (buffer.indexOf(LINE_DELIMITER, pos) + 1)) !== 0
         && pos <= size) count++;
  return count;
}

const output = (duration_ms, num_bytes, num_lines) => {
  const duration_s = (duration_ms / 1000) | 0;
  const rate = ((num_bytes / duration_s / 1024) | 0).toLocaleString();
  const line_rate = ((num_lines / duration_s) | 0).toLocaleString();
  process.stderr.write(`\r\x1b[K${duration_s.toLocaleString()} seconds | ${num_bytes.toLocaleString()} bytes [ ${rate} kb/sec ] | ${num_lines.toLocaleString()} lines [ ${line_rate} lines/sec ]`);
}

const stdin = fs.openSync('/dev/stdin', 'r');
const stdout = fs.openSync('/dev/stdout', 'w');
const buf = Buffer.allocUnsafe(BUFFER_SIZE);

let last_output = 0;
let bytes = 0;
let lines = 0;
let num = 0;

while((num = fs.readSync(stdin, buf, 0, BUFFER_SIZE)) > 0) {
  fs.writeSync(stdout, buf, 0, num);

  const time = Date.now();
  bytes += num;
  lines += countLines(buf, num);

  if (time - last_output > OUTPUT_THRESHOLD_MS) {
    last_output = time;
    output(time - START_TIME_MS, bytes, lines);
  }
}

fs.closeSync(stdin);
fs.closeSync(stdout);
