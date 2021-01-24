import React from 'react'
import {
  Badge,
} from 'react-bootstrap'
import { DateTime } from 'luxon'

class IncidentStatus extends React.Component {
  render() {
    const {
      incident: {
        reportedAt,
        ignoreIncident,
        reportedViaPhone,
        alreadyFined,
      },
    } = this.props

    if (reportedAt) {
      return (
        <>
          <Badge variant="success">Reported</Badge>
          <span>( { DateTime.fromISO(reportedAt).toLocaleString(DateTime.DATETIME_FULL) } )</span>
        </>
      )
    }

    if (alreadyFined) {
      return <Badge variant="success">Already Fined</Badge>
    }

    if (reportedViaPhone && ignoreIncident) {
      return <Badge variant="success">Reported via Phone &amp; ignored</Badge>
    }

    if (reportedViaPhone) {
      return <Badge variant="primary">Reported via Phone &amp; pending</Badge>
    }

    if (ignoreIncident) {
      return <Badge variant="warning">Ignored</Badge>
    }

    return <Badge variant="primary">Pending</Badge>
  }
}

export default IncidentStatus
