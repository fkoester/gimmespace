import { getResponseBody } from '../utils'
import { notificationError } from './notifications'

export function getPendingPhotosRequest() {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/photos/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
    }
    return []
  }
}

export function setPhotosIgnoredRequest(filenames, ignored) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/photos/ignored`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filenames,
          ignored,
        })
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
    }
    return []
  }
}

export function setPhotosAttributesRequest(filenames, locationId, vehicleId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/photos/attributes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filenames,
          locationId,
          vehicleId,
        })
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
    }
    return []
  }
}

export function crawlPhotosRequest(filenames, ignored) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/photos/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
    }
    return []
  }
}
