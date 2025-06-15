import fs from 'fs'
import env from './env'

const getFileStream = (() => {
  // Don't create the file stream until it's needed
  if (!env.OUTPUT_FILE_PATH) {
    throw new Error('OUTPUT_FILE_PATH is unset')
  }
  const fileStream = fs.createWriteStream(env.OUTPUT_FILE_PATH)
  return () => fileStream
})()

type OutputData = {
  chunk: Buffer
  db: number
  now: number
  percentageAboveThreshold: number
  threshold: number
}

const output = (outputData: OutputData) => {
  const { chunk, now, db, threshold, percentageAboveThreshold } = outputData
  const ts = new Date(now).toISOString()
  if (env.OUTPUT_TO_LOG) {
    console.log(
      `${ts}, dB: ${db.toFixed(5)}, threshold: ${threshold.toFixed(5)}, above: ${percentageAboveThreshold}`,
    )
  }

  if (env.OUTPUT_TO_FILE) {
    getFileStream().write(chunk)
  }
}

export const shutdown = () => {
  getFileStream().close()
}

export default output
