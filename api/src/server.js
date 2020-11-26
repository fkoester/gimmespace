import http from 'http'
import logger from './logger'
import app from './app'

const httpServer = http.createServer(app)

const serverConfig = {
  protocol: 'http',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || '62452',
}

httpServer.listen(serverConfig.port, () => {
  logger.log('info', `API server is available at http://${serverConfig.host}:${serverConfig.port}`)
})
