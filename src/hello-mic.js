// hello-mic.js
const mic = require('mic');
const fs = require('fs')

const THRESHOLD_DB = -80; // Adjust to taste
const CHUNK_MS = 100;
const autoStop = false; // Set to true to stop after 5 seconds
const autoLevel = true; // adjust threshold automatically
const PERCENTAGE_ABOVE_THRESHOLD = 3; // Percentage above the threshold to trigger recording

// TODO: this should be a percentage of the average, not a fixed value
const AUTO_THRESHOLD_MARGIN = 2; // how much above the average a sample needs to be to be recorded
const dbSampleCooldown = 20; // Number of samples to keep for running average

const micInstance = mic({
    rate: '16000',
    channels: '1',
    // debug: !false,
    //   exitOnSilence: 16,
});

const micInputStream = micInstance.getAudioStream();
const outputFileStream = fs.WriteStream('output.raw');


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

let buffer = [];
let lastFlush = Date.now();

const dbSamples = []
let averageDb = 0

const updateRunningDBAverage = (db) => {
    dbSamples.push(db);
    // We only want a running average, not a full history.
    if (dbSamples.length > dbSampleCooldown) {
        dbSamples.shift();
    }
    const sum = dbSamples.reduce((acc, val) => acc + val, 0);
    return sum / dbSamples.length;
}

const inspectBuffer = (buf) => {
    console.log("Buffer length:", buf.length);
    const ints = []
    for (let i = 0; i < buf.length; i += 2) {
        const sample = buf.readInt16LE(i);
        ints.push(sample);
        // console.log(`Sample ${i / 2}:`, sample);
    }
    console.log(Math.max(...ints), Math.min(...ints));
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
        // inspectBuffer(chunk);
        const threshold = autoLevel
            ? averageDb + AUTO_THRESHOLD_MARGIN
            : THRESHOLD_DB;
        const percentageAboveThreshold = (db - threshold) / Math.abs(threshold) * 100;
        averageDb = updateRunningDBAverage(db);
        const shouldRecord = percentageAboveThreshold > PERCENTAGE_ABOVE_THRESHOLD

        if (percentageAboveThreshold > PERCENTAGE_ABOVE_THRESHOLD) {
            // console.log("Over threshold");
        }
        if (percentageAboveThreshold < 0) {
            // if we wanted to cool down faster, do it here
        }

        if (shouldRecord) {
            const ts = new Date(now).toISOString();
            console.log(`${ts}, dB: ${db.toFixed(5)}, threshold: ${threshold.toFixed(5)}, above: ${percentageAboveThreshold}`);
            outputFileStream.write(chunk);
        }
    }
}

micInputStream.on('data', onData)

micInputStream.on('silence', function () {
    // console.log("Got SIGNAL silence");
});

micInputStream.on('error', function (err) {
    // console.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function () {
    // console.log("Got SIGNAL startComplete");
    if (autoStop) {
        setTimeout(function () {
            micInstance.stop();
        }, 5000);
    }
});

micInputStream.on('stopComplete', function () {
    // console.log("Got SIGNAL stopComplete");
});

micInputStream.on('pauseComplete', function () {
    // console.log("Got SIGNAL pauseComplete");
    setTimeout(function () {
        micInstance.resume();
    }, 5000);
});

micInputStream.on('resumeComplete', function () {
    // console.log("Got SIGNAL resumeComplete");
    setTimeout(function () {
        micInstance.stop();
    }, 5000);
});

micInputStream.on('silence', function () {
    // console.log("Got SIGNAL silence");
});

micInputStream.on('processExitComplete', function () {
    // console.log("Got SIGNAL processExitComplete");
});

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

micInstance.start();

