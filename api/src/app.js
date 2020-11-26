import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routes from './routes'
import logger from './logger'
import dbConnection from './db'

const {
  NODE_ENV,
} = process.env

const app = express()
app.set('env', NODE_ENV)

app.use(cors())
app.use(bodyParser.json({
  limit: '100mb',
}))

app.use('/photos', express.static('/'))

app.use('/', routes)

app.use((req, res, next) => {
  if (res.locals.result) {
    res.status(200).send(res.locals.result)
    return
  }

  res.status(204).send()
})

app.use((err, req, res, next) => {
  logger.error(`${err.message}\n${err.stack}`)
  res.status(err.status || 500)
  res.json({ error: err.message })
})

process.on('SIGINT', () => {
  // calling shutdown allows your process to exit normally
  dbConnection.end()
  process.exit()
})

export default app
