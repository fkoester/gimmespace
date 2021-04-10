import { getResponseBody } from '../utils'
import { notificationError } from './notifications'

export function getEvidencesRequest() {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/evidences/`, {
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

export function getEvidenceRequest(evidenceId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/evidences/${evidenceId}`, {
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
