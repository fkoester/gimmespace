import { createLogger, format, transports } from 'winston'

const logFormat = format.printf((info) => {
  const {
    timestamp,
    level,
    message,
    stack,
  } = info

  let msg = `${timestamp} ${level}: ${message}`

  if (stack) {
    msg += `\n${stack}`
  }
  return msg
})

const loggerConfig = {
  level: 'info',
  exitOnError: false,
  transports: [
    new transports.Console({
      handleExceptions: true,
      timestamp: true,
    }),
  ],
  format: format.combine(
    format.errors({ stack: true }),
    format.colorize(),
    format.timestamp(),
    logFormat,
  ),
}

const logger = createLogger(loggerConfig)

export default logger
