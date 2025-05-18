export const getRms = (chunk: Buffer): number => {
  // returns the RMS value of the audio samples in the chunk

  const sampleSize = 2 // 16-bit samples
  const numberOfSamples = chunk.length / sampleSize
  let sum = 0
  for (let i = 0; i < chunk.length; i += sampleSize) {
    const val = chunk.readInt16LE(i) / 32768 // Normalize to -1.0 to 1.0
    sum += val * val
  }
  return Math.sqrt(sum / numberOfSamples)
}

export const getDb = (chunk: Buffer): number => {
  const rms = getRms(chunk)
  return 20 * Math.log10(rms / 128) // Convert to dB
}

export const inspectBuffer = (buf: Buffer) => {
  console.log('Buffer length:', buf.length)
  const ints = []
  for (let i = 0; i < buf.length; i += 2) {
    const sample = buf.readInt16LE(i)
    ints.push(sample)
    // console.log(`Sample ${i / 2}:`, sample);
  }
  console.log(Math.max(...ints), Math.min(...ints))
}

export const getFlusher = (
  chunkMilliseconds: number,
  callback: (
    chunk: Buffer,
    now: number, // unix ts
  ) => void,
) => {
  let buffer: Buffer[] = []
  let lastFlush = Date.now()

  return (data: Buffer) => {
    buffer.push(data)
    const now = Date.now()
    if (now - lastFlush >= chunkMilliseconds) {
      const chunk = Buffer.concat(buffer)
      buffer = []
      lastFlush = now
      callback(chunk, now)
    }
  }
}
