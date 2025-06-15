import fs from 'fs'

const outputFilePath = 'output.raw'
const outputFileStream = fs.createWriteStream(outputFilePath)

const outputToFile = true
const outputToLog = true

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
  if (outputToLog) {
    console.log(
      `${ts}, dB: ${db.toFixed(5)}, threshold: ${threshold.toFixed(5)}, above: ${percentageAboveThreshold}`,
    )
  }

  if (outputToFile) {
    outputFileStream.write(chunk)
  }
}

export const shutdown = () => {
  outputFileStream.close()
}

export default output
