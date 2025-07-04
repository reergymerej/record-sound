import env from './env'
import audioListener from './recorder'
import { getDb, getFlusher } from './util'
import output, { shutdown as shutdownRecorder } from './output'

// TODO: move to env
const THRESHOLD_DB = -80
const FLUSH_RATE = 100 // how often the buffer is flushed
const autoLevel = true // adjust threshold automatically
const PERCENTAGE_ABOVE_THRESHOLD = 3 // Percentage above the threshold to trigger recording
const AUTO_THRESHOLD_MARGIN = 2 // how much above the average a sample needs to be to be recorded
const dbSampleCooldown = 20 // Number of samples to keep for running average

const dbSamples: number[] = []
let averageDb = 0

const updateRunningDBAverage = (db: number) => {
  dbSamples.push(db)
  // We only want a running average, not a full history.
  if (dbSamples.length > dbSampleCooldown) {
    dbSamples.shift()
  }
  const sum = dbSamples.reduce((acc, val) => acc + val, 0)
  return sum / dbSamples.length
}

const onData = getFlusher(FLUSH_RATE, (chunk: Buffer, now: number) => {
  const db = getDb(chunk)
  // inspectBuffer(buffer)
  const threshold = autoLevel ? averageDb + AUTO_THRESHOLD_MARGIN : THRESHOLD_DB
  const percentageAboveThreshold =
    ((db - threshold) / Math.abs(threshold)) * 100
  averageDb = updateRunningDBAverage(db)
  const shouldRecord = percentageAboveThreshold > PERCENTAGE_ABOVE_THRESHOLD

  if (percentageAboveThreshold > PERCENTAGE_ABOVE_THRESHOLD) {
    // console.log("Over threshold");
  }
  if (percentageAboveThreshold < 0) {
    // if we wanted to cool down faster, do it here
  }

  if (shouldRecord) {
    output({
      chunk,
      now,
      db,
      threshold,
      percentageAboveThreshold,
    })
  }
})

const stopAudioListener = audioListener.start(onData)

const shutdown = () => {
  console.log('\nGracefully shutting down...')
  stopAudioListener()
  shutdownRecorder()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
