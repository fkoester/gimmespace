import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Table,
  Container,
} from 'react-bootstrap'
import { DateTime } from 'luxon'
import { Link } from 'react-router-dom'
import {
  getPendingIncidentsRequest,
} from '../../actions/incidents'

class IncidentListPage extends React.Component {
  static propTypes = {
    getIncidents: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      incidents: null,
    }
  }

  componentDidMount() {
    this.loadIncidents()
  }

  loadIncidents = async () => {
    const {
      getPendingIncidents,
    } = this.props

    await this.setState({
      loading: true,
    })

    try {
      const incidents = await getPendingIncidents()
      await this.setState({
        incidents,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  render() {
    const {
      incidents,
    } = this.state

    if (!incidents) {
      return <div>Loading...</div>
    }
    return (
      <Container>
        <Table bordered>
          <thead>
            <tr>
              <th>Seen at</th>
              <th>Location</th>
              <th>Vehicle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              incidents.map((incident) => (
                <tr>
                  <td>{ DateTime.fromISO(incident.seenAt).toLocaleString(DateTime.DATETIME_FULL) }</td>
                  <td>{ incident.displayName }</td>
                  <td>{ incident.vehicleRegistrationId } { incident.vehicleBrandId } { incident.vehicleColorId }</td>
                  <td>
                    <Link to={`/incidents/${incident.incidentId}`}>Detail</Link>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </Container>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  getPendingIncidents: getPendingIncidentsRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(IncidentListPage)
