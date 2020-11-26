export const INFO = 'NOTIFICATIONS/INFO'
export const ERROR = 'NOTIFICATIONS/ERROR'
export const WARNING = 'NOTIFICATIONS/WARNING'
export const SUCCESS = 'NOTIFICATIONS/SUCCESS'
export const DISMISS = 'NOTIFICATIONS/DISMISS'
export const CLEAR = 'NOTIFICATIONS/CLEAR'
export const CLEANUP_OLD = 'NOTIFICATIONS/CLEANUP_OLD'

export const generateTempId = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

  return `${s4()}${s4()}-${s4()}`
}

export const notificationError = (e) => ({
  type: ERROR,
  notification: {
    id: `noti-error-${generateTempId()}`,
    message: e.message,
    timestamp: Date.now(),
    level: 'error',
  },
})

export const notificationSuccess = (message) => ({
  type: SUCCESS,
  notification: {
    id: `noti-success-${generateTempId()}`,
    message,
    timestamp: Date.now(),
    level: 'success',
  },
})

export const notificationInfo = (message) => ({
  type: INFO,
  notification: {
    id: `noti-info-${generateTempId()}`,
    message,
    timestamp: Date.now(),
    level: 'info',
  },
})

export const notificationWarning = (message) => ({
  type: WARNING,
  notification: {
    id: `noti-warning-${generateTempId()}`,
    message,
    timestamp: Date.now(),
    level: 'warning',
  },
})

export const dismissNotification = (id) => ({
  type: DISMISS,
  id,
})

export const clearNotifications = () => ({
  type: CLEAR,
})

export const cleanupOldNotifications = () => ({
  type: CLEANUP_OLD,
})
