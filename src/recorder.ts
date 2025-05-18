import mic from 'mic'
import { start } from 'repl'

const micInstance = mic({
  rate: '16000',
  channels: '1',
  // debug: !false,
  //   exitOnSilence: 16,
})

type OnData = (data: Buffer) => void

export type Recorder = typeof recorder

const recorder = {
  start: (onData: OnData) => {
    const micInputStream = micInstance.getAudioStream()
    const micInputStreamConfig = {
      data: onData,
      silence: () => {},
      error: (err: Error) => {},
      startComplete: () => {},
      stopComplete: () => {},
      pauseComplete: () => {},
      resumeComplete: () => {},
      processExitComplete: () => {},
    }
    for (const [event, handler] of Object.entries(micInputStreamConfig)) {
      micInputStream.on(event, handler)
    }
    micInstance.start()

    const stop = () => {
      micInputStream.removeAllListeners()
      micInstance.stop()
    }
    return stop
  },
}
export default recorder
