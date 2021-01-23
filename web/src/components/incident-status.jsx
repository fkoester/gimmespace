import React from 'react'
import {
  Badge,
} from 'react-bootstrap'
import { DateTime } from 'luxon'

class IncidentStatus extends React.Component {
  render() {
    const {
      incident,
    } = this.props

    if (incident.reportedAt) {
      return (
        <>
          <Badge variant="success">Reported</Badge>
          <span>( { DateTime.fromISO(incident.reportedAt).toLocaleString(DateTime.DATETIME_FULL) } )</span>
        </>
      )
    }

    if (incident.ignoreIncident) {
      return <Badge variant="warning">Ignored</Badge>
    }

    return <Badge variant="primary">Pending</Badge>
  }
}

export default IncidentStatus
