import { getResponseBody } from '../utils'
import { notificationError } from './notifications'

export function searchLocationsRequest(query) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/locations/search?query=${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
      throw error
    }
  }
}

export function createLocationRequest(location) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/locations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
      throw error
    }
  }
}
