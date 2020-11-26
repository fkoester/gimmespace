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
    }
    return []
  }
}
