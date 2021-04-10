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
  getEvidencesRequest,
} from '../../actions/evidences'

class EvidenceListPage extends React.Component {
  static propTypes = {
    getEvidecnes: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      evidences: null,
    }
  }

  componentDidMount() {
    this.loadEvidences()
  }

  loadEvidences = async () => {
    const {
      getEvidences,
    } = this.props

    await this.setState({
      loading: true,
    })

    try {
      const evidences = await getEvidences()
      await this.setState({
        evidences,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  render() {
    const {
      evidences,
    } = this.state

    if (!evidences) {
      return <div>Loading...</div>
    }
    return (
      <Container>
        <Table bordered>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Location</th>
              <th>Seen at</th>
              <th>Seen until</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              evidences.map((evidence, index) => (
                <tr style={evidences[index + 1]?.vehicleRegistrationId === evidence.vehicleRegistrationId ? { backgroundColor: 'red' } : {}}>
                  <td>{ evidence.vehicleRegistrationId } { evidence.vehicleBrandId } { evidence.vehicleColorId }</td>
                  <td>{ evidence.locationDisplayName }</td>
                  <td style={{ fontFamily: 'monospace' }}>{ DateTime.fromISO(evidence.firstSeenAt).toFormat('dd.MM. HH:mm')}</td>
                  <td style={{ fontFamily: 'monospace' }}>{ DateTime.fromISO(evidence.seenUntil).toFormat('dd.MM. HH:mm')}</td>
                  <td>
                    <Link to={`/evidences/${evidence.evidenceId}`}>Detail</Link>
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
  getEvidences: getEvidencesRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(EvidenceListPage)
