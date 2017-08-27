'use strict';

const START_TIME = Date.now();
const OUTPUT_THRESHOLD = 200;
let last_output = 0;
let bytes = 0;
let lines = 0;

const countLines = str => {
  let pos = 0;
  let count = 0;
  while ((pos = (str.indexOf('\n', pos) + 1)) !== 0) count++;
  return count;
}

const output = (duration_ms, bytes, lines) => {
  const duration_s = (duration_ms / 1000) | 0;
  const rate = ((bytes / duration_s / 1024) | 0).toLocaleString();
  const line_rate = ((lines / duration_s) | 0).toLocaleString();
  process.stderr.write(`\r\x1b[K${duration_s.toLocaleString()} seconds | ${bytes.toLocaleString()} bytes [ ${rate} kb/sec ] | ${lines.toLocaleString()} lines [ ${line_rate} lines/sec ]`);
}

process.stdin.on('data', data => {
  const time = Date.now();
  bytes += data.length;
  lines += countLines(data);

  if (time - last_output > OUTPUT_THRESHOLD) {
    last_output = time;
    output(time - START_TIME, bytes, lines);
  }
});

process.stdin.pipe(process.stdout);
