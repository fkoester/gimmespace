import { getResponseBody } from '../utils'
import { notificationError } from './notifications'

export function searchVehiclesRequest(query) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/vehicles/search?query=${query}`, {
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

export function getVehicleBrandsRequest() {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/vehicles/brands`, {
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

export function getVehicleColorsRequest() {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/vehicles/colors`, {
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

export function createVehicleRequest(vehicle) {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(`http://localhost:62452/vehicles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
      })

      const body = await getResponseBody(response)
      return body
    } catch (error) {
      dispatch(notificationError(error))
    }
    return []
  }
}
