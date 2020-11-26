import logger from '../logger'
import { HttpError } from '../errors'

export const getResponseBody = async (response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('Content-Type')

  const isJson = contentType && contentType.indexOf('application/json') >= 0

  let data = null

  try {
    data = isJson ? await response.json() : await response.text()
  } catch (err) {
    logger.error('Failed to parse response body:')
    logger.error(err)
  }

  if (response.status >= 200 && response.status < 300 && response.ok) {
    return data
  }

  const message = data ? JSON.stringify(data) : `${response.statusText} ${response.status})`

  throw new HttpError(message, response.status, response.url)
}

export function rejectionHandler(asyncFunction) {
  return async (req, res, next) => {
    try {
      res.locals.result = await asyncFunction(req)
      next()
    } catch (err) {
      next(err)
    }
  }
}
