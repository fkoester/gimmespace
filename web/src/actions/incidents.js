import { getResponseBody } from '../utils'
import { notificationError } from './notifications'

export function getIncidentRequest(incidentId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}`, {
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


export function ignoreIncidentRequest(incidentId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}/ignore`, {
        method: 'PUT',
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

export function setIncidentIgnorePhotoRequest(incidentId, filename, ignorePhoto) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}/photos/${filename}/ignore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ignorePhoto,
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

export function removePhotoFromIncidentRequest(incidentId, filename) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}/photos/{$filename}`, {
        method: 'DELETE',
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

export function reportIncidentRequest(incidentId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}/report`, {
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

export function getIncidentReportPreviewRequest(incidentId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}/reportPreview`, {
        method: 'Get',
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

export function openPhotoEditorRequest(incidentId) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/${incidentId}/openPhotoEditor`, {
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

export function getPendingIncidentsRequest() {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/`, {
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

export function createIncidentRequest(incident) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/incidents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incident),
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
    }
    return []
  }
}
