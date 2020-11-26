import { getResponseBody } from '../utils'
import { notificationError } from './notifications'

export function searchViolationTypesRequest(query) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/violationTypes/search?query=${query}`, {
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
