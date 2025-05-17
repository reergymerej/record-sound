// hello-mic.js
const mic = require('mic');
const fs = require('fs')

const THRESHOLD_DB = -80; // Adjust to taste
const CHUNK_MS = 100;
const autoStop = false; // Set to true to stop after 5 seconds

const micInstance = mic({
    //   rate: '48000',
    channels: '1',
    // debug: !false,
    //   exitOnSilence: 16,
});

const micInputStream = micInstance.getAudioStream();
const outputFileStream = fs.WriteStream('output.raw');

let buffer = [];
let lastFlush = Date.now();

const getRms = (chunk) => {
    let sum = 0;
    for (let i = 0; i < chunk.length; i += 2) {
        let val = chunk.readInt16LE(i) / 32768; // Normalize to -1.0 to 1.0
        sum += val * val;
    }
    const rms = Math.sqrt(sum / (chunk.length / 2)); // Divide by number of samples
    return rms
}

const shutdown = () => {
    console.log('\nGracefully shutting down...');
    micInstance.stop();             // If using mic module
    outputFileStream.close();       // If writing to a file
    process.exit(0);
}

const onData = (data) => {
    buffer.push(data);
    const now = Date.now();
    if (now - lastFlush >= CHUNK_MS) {
        const chunk = Buffer.concat(buffer);
        buffer = [];
        lastFlush = now;
        const rms = getRms(chunk);
        const db = 20 * Math.log10(rms / 128);
        const overThreshold = db > THRESHOLD_DB;
        console.log(`RMS: ${rms.toFixed(5)}, dB: ${db.toFixed(5)}${overThreshold ? ' 🎤' : ''}`);
        if (overThreshold) {
            outputFileStream.write(chunk);
        }
    }
}

micInputStream.on('data', onData)

micInputStream.on('silence', function () {
    console.log("Got SIGNAL silence");
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
});

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

micInstance.start();

