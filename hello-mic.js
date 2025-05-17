// hello-mic.js
const mic = require('mic');
const { Writable } = require('stream');
const fs = require('fs')

const THRESHOLD_DB = -80; // Adjust to taste
const CHUNK_MS = 100;
const autoStop = false; // Set to true to stop after 5 seconds

const micInstance = mic({
  rate: '16000',
  channels: '1',
    // debug: !false,
//   exitOnSilence: 6,
});

const micInputStream = micInstance.getAudioStream();
var outputFileStream = fs.WriteStream('output.raw');

micInputStream.pipe(outputFileStream);

var outputFileStream2 = fs.WriteStream('output2.raw');


let buffer = [];
let lastFlush = Date.now();

micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence");
});

const getRms_notworking = (chunk) => {
    let sum = 0;
    for (let i = 0; i < chunk.length; i++) {
      const val = chunk[i];
      sum += val * val;
    }
    const rms = Math.sqrt(sum / chunk.length);
    return rms
}

const getRms = (chunk) => {
    let sum = 0;
    for (let i = 0; i < chunk.length; i += 2) {
    let val = chunk.readInt16LE(i) / 32768; // Normalize to -1.0 to 1.0
    sum += val * val;
    }
    const rms = Math.sqrt(sum / (chunk.length / 2)); // Divide by number of samples
    return rms
}

micInputStream.on('data', (data) => {
  buffer.push(data);

  const now = Date.now();
  if (now - lastFlush >= CHUNK_MS) {
    const chunk = Buffer.concat(buffer);
    buffer = [];
    lastFlush = now;

    // Rough RMS -> dBFS conversion
    const rms = getRms(chunk);
    const db = 20 * Math.log10(rms / 128); // 8-bit PCM center is 128
    const overThreshold = db > THRESHOLD_DB;
    console.log(`RMS: ${rms.toFixed(5)}, dB: ${db.toFixed(5)}${overThreshold ? ' 🎤' : ''}`);

    if (db > THRESHOLD_DB) {
      // only writing once past a certain threshold
        outputFileStream2.write(chunk);
    }
  }
});


micInputStream.on('error', function (err) {
    console.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function () {
    console.log("Got SIGNAL startComplete");
    if (autoStop) {
        setTimeout(function () {
            micInstance.stop();
        }, 5000);
    }
});

micInputStream.on('stopComplete', function () {
    console.log("Got SIGNAL stopComplete");
    outputFileStream2.end(); // Make sure to close the stream
});

micInputStream.on('pauseComplete', function () {
    console.log("Got SIGNAL pauseComplete");
    setTimeout(function () {
        micInstance.resume();
    }, 5000);
});

micInputStream.on('resumeComplete', function () {
    console.log("Got SIGNAL resumeComplete");
    setTimeout(function () {
        micInstance.stop();
    }, 5000);
});

micInputStream.on('silence', function () {
    console.log("Got SIGNAL silence");
});

micInputStream.on('processExitComplete', function () {
    console.log("Got SIGNAL processExitComplete");

    outputFileStream2.end(); // Make sure to close the stream
});


micInputStream.on('end', () => {
    console.log("Got SIGNAL end");
    outputFileStream2.end(); // Make sure to close the stream
})
micInstance.start();
