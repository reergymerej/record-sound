import mic from 'mic'

const micInstance = mic({
  rate: '16000',
  channels: '1',
  debug: true,
  //   exitOnSilence: 16,
  // [AVFoundation indev @ 0x15be12120] AVFoundation audio devices:
  // [AVFoundation indev @ 0x15be12120] [0] USBAudio1.0
  // [AVFoundation indev @ 0x15be12120] [1] MacBook Pro Microphone
  // [AVFoundation indev @ 0x15be12120] [2] USBAudio1.0
  // [AVFoundation indev @ 0x15be12120] [3] Microsoft Teams Audio"
  // device: 'USBAudio1.0',
  // device: '0'
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
