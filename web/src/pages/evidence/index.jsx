import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import qs from 'query-string'
import {
  Button,
  Card,
  Carousel,
  Form,
  Modal,
  Table,
} from 'react-bootstrap'
import { DateTime } from 'luxon'
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import IncidentStatus from '../../components/incident-status'
import {
  searchIncidentsRequest,
  addPhotosToExistingIncidentRequest,
} from '../../actions/incidents'
import {
  getEvidenceRequest,
} from '../../actions/evidences'

class EvidencePage extends React.Component {
  static propTypes = {
    getEvidece: PropTypes.func.isRequired,
    searchIncidents: PropTypes.func.isRequired,
    addPhotosToExistingIncident: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      evidence: null,
      selectedPhotos: {},
      showAddToExistingIncidentOverlay: false,
    }
  }

  componentDidMount() {
    this.loadEvidence()
  }

  loadEvidence = async () => {
    const {
      match: {
        params: {
          evidenceId,
        },
      },
      getEvidence,
    } = this.props

    await this.setState({
      loading: true,
    })

    try {
      const evidence = await getEvidence(evidenceId)

      const selectedPhotos = evidence.photos.reduce((acc, photo) => {
        acc[photo.filename] = true
        return acc
      }, {})
      await this.setState({
        evidence,
        selectedPhotos,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  onAddToExistingIncident = async () => {
    const {
      addPhotosToExistingIncident,
      history,
    } = this.props
    const {
      selectedIncident,
      evidence,
      selectedPhotos,
    } = this.state

    const {
      incidentId,
    } = selectedIncident

    const filenames = evidence.photos.filter((photo) => selectedPhotos[photo.filename]).map((photo) => photo.filename)

    await addPhotosToExistingIncident(incidentId, filenames)

    await this.setState({
      showAddToExistingIncidentOverlay: false,
      selectedIncident: null,
    })

    history.replace('/evidences')
  }

  searchIncidents = async (query) => {
    const {
      searchIncidents,
    } = this.props

    await this.setState({
      loadingIncidents: true,
    })

    try {
      const incidentOptions = await searchIncidents(query)
      await this.setState({
        incidentOptions,
      })
    } finally {
      await this.setState({
        loadingIncidents: false,
      })
    }
  }

  renderAddToExistingIncidentOverlay() {
    const {
      showAddToExistingIncidentOverlay,
      evidence: {
        photos,
      },
      selectedPhotos,
      loadingIncidents,
      incidentOptions,
      selectedIncident,
    } = this.state

    if (!showAddToExistingIncidentOverlay) {
      return null
    }

    return (
      <Modal
        size="xl"
        show={showAddToExistingIncidentOverlay}
        onHide={() => this.setState({ showAddToExistingIncidentOverlay: false, selectedIncident: null })}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Add to existing incident
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Incident</Form.Label>
              <AsyncTypeahead
                id="vehicleField"
                filterBy={() => true}
                placeholder="Kennzeichen"
                isLoading={loadingIncidents}
                useCache={false}
                labelKey={({
                  vehicleRegistrationId,
                  incidentId,
                  seenAt,
                  displayName,
                  shortName,
                }) => `${vehicleRegistrationId}; #${incidentId}; ${DateTime.fromISO(seenAt).toLocaleString(DateTime.DATETIME_SHORT)}; ${displayName}; ${shortName}`}
                minLength={2}
                onSearch={this.searchIncidents}
                options={incidentOptions}
                onChange={(selections) => this.setState({
                  selectedIncident: selections[0],
                })}
              />
            </Form.Group>
          </Form>
          <Carousel className="photos" interval={null}>
            {
              photos.filter((photo) => selectedPhotos[photo.filename]).map((photo) => (
                <Carousel.Item key={photo.filename}>
                  <img
                    style={{ maxWidth: '100%', maxHeight: '1200px'}}
                    src={`http://localhost:62452/photos${photo.dirpath}/${photo.filename}`}
                    alt={photo.filename}
                  />
                </Carousel.Item>
              ))
            }
          </Carousel>
          {
            selectedIncident && (
              <Table bordered>
                <tbody>
                  <tr>
                    <th>Gesehen</th>
                    <td>{ DateTime.fromISO(selectedIncident.seenAt).toLocaleString(DateTime.DATETIME_FULL) }</td>
                  </tr>
                  <tr>
                    <th>Ort</th>
                    <td>{ selectedIncident.displayName }</td>
                  </tr>
                  <tr>
                    <th>Fahrzeug</th>
                    <td>{ selectedIncident.vehicleRegistrationId } { selectedIncident.vehicleBrandId } { selectedIncident.vehicleColorId }</td>
                  </tr>
                  <tr>
                    <th>Ordnungswidrigkeit</th>
                    <td>{ selectedIncident.fullName }</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <IncidentStatus incident={selectedIncident} />
                    </td>
                  </tr>
                </tbody>
              </Table>
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => this.setState({ showAddToExistingIncidentOverlay: false, selectedIncident: null })}
          >
            Schließen
          </Button>
          <Button
            variant="success"
            disabled={!selectedIncident}
            onClick={this.onAddToExistingIncident}
          >
            Add to existing incident
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  renderPhotoOverlay() {
    const {
      showPhotoOverlay,
      evidence,
    } = this.state

    const photo = evidence?.photos?.find((p) => p.filename === showPhotoOverlay)

    if (!photo) {
      return null
    }

    return (
      <Modal
        size="xl"
        show={true}
        onHide={() => this.setState({ showPhotoOverlay: null })}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            { photo.filename }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img
            style={{ maxWidth: '100%' }}
            src={`http://localhost:62452/photos${photo.dirpath}/${photo.filename}`}
            alt={photo.filename}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => this.setState({ showPhotoOverlay: null })}
          >
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  createNewIncident = async () => {
    const {
      history,
    } = this.props

    const {
      selectedPhotos,
      evidence: {
        evidenceId,
        photos,
      }
    } = this.state

    const photoPathes = (
      Object.keys(selectedPhotos)
        .filter((filename) => selectedPhotos[filename])
        .map((filename) => {
          const photo = photos.find((p) => p.filename === filename)
          return `${photo.dirpath}/${photo.filename}`
        }))

    const query = qs.stringify({
      evidenceId,
      photos: photoPathes,
    })

    history.push(`/incidents/new?${query}`)
  }

  render() {
    const {
      evidence,
      selectedPhotos,
    } = this.state

    if (!evidence) {
      return <div>Loading...</div>
    }

    const {
      photos,
    } = evidence

    return (
      <div style={{ width: '100%' }}>
        <h3>
          {
            evidence.locationDisplayName
          }
          <br />
          {
            evidence.vehicleRegistrationId
          }
        </h3>
        {
          photos.map((photo) => (
            <Card key={photo.filename} style={{  width: '18rem', float: 'left', padding: '1em' }}>
              <Card.Header
                style={{ height: '100px', textAlign: 'center' }}
              >
                { photo.filename }
              </Card.Header>
              <Card.Img
                variant="top" src={`http://localhost:62452/photos${photo.dirpath}/${photo.filename}`}
                style={{ height: '200px' }}
                onClick={() => this.setState({ showPhotoOverlay: photo.filename })}
              />
              <Card.Body style={{ textAlign: 'center'}}>
                <Card.Text>
                  { DateTime.fromISO(photo.timestamp).toLocaleString(DateTime.DATETIME_SHORT) }
                </Card.Text>
                <input
                  type="checkbox"
                  checked={Boolean(selectedPhotos[photo.filename])}
                  onChange={(event) => this.setState({
                    selectedPhotos: {
                      ...selectedPhotos,
                      [photo.filename]: event.target.checked,
                    },
                  })}
                />
              </Card.Body>
            </Card>
          ))
        }
        {
          this.renderPhotoOverlay()
        }
        {
          this.renderAddToExistingIncidentOverlay()
        }
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
        }}>
          <Button
            variant="danger"
            style={{ marginLeft: '1em'}}
            onClick={this.ignoreSelectedPhotos}
          >
            Ignore
          </Button>
          <Button
            variant="primary"
            style={{ marginLeft: '1em'}}
            onClick={() => this.setState({ showAddToExistingIncidentOverlay: true })}
          >
            Add to existing Incident
          </Button>
          <Button
            variant="success"
            size="lg"
            style={{ marginLeft: '1em'}}
            onClick={this.createNewIncident}
          >
            Create Incident
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  searchIncidents: searchIncidentsRequest,
  addPhotosToExistingIncident: addPhotosToExistingIncidentRequest,
  getEvidence: getEvidenceRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(EvidencePage)
