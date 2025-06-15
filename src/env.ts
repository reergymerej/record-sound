import 'dotenv/config'

type Env = {
  DEBUG: boolean
  INPUT_DEVICE?: string
  OUTPUT_FILE_PATH?: string
  OUTPUT_TO_FILE: boolean
  OUTPUT_TO_LOG: boolean
}

const isCliTrue = (value: string | undefined): boolean => {
  return value?.match(/^(true|1|yes|y)$/i) !== null
}

const getProcessEnvValue = (
  key: keyof Env,
  defaultValue?: string,
): string | undefined => {
  return process.env[key] || defaultValue
}

const device = getProcessEnvValue('INPUT_DEVICE', undefined)
const outputFilePath = getProcessEnvValue('OUTPUT_FILE_PATH', 'output.raw')
const debug = isCliTrue(getProcessEnvValue('DEBUG', 'false'))
const outputToFile = isCliTrue(getProcessEnvValue('OUTPUT_TO_FILE', 'false'))
const outputToLog = isCliTrue(getProcessEnvValue('OUTPUT_TO_LOG', 'false'))

const env: Env = {
  DEBUG: debug,
  INPUT_DEVICE: device,
  OUTPUT_FILE_PATH: outputFilePath,
  OUTPUT_TO_FILE: outputToFile,
  OUTPUT_TO_LOG: outputToLog,
}
console.log(env)

export default env
