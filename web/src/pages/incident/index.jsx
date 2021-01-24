import React from 'react'
import PropTypes from 'prop-types'
import qs from 'query-string'
import path from 'path'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import {
  Button,
  Table,
  Carousel,
  Modal,
  Form,
} from 'react-bootstrap'
import { DateTime } from 'luxon'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet'
import L from 'leaflet'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import ReactRouterPropTypes from '../../utils/react-router-prop-types'
import IncidentStatus from '../../components/incident-status'
import {
  getIncidentRequest,
  getPendingIncidentsRequest,
  ignoreIncidentRequest,
  getIncidentReportPreviewRequest,
  reportIncidentRequest,
  openPhotoEditorRequest,
  setIncidentIgnorePhotoRequest,
  setIncidentAlreadyFinedRequest,
  setIncidentReportedViaPhoneRequest,
  removePhotoFromIncidentRequest,
  createIncidentRequest,
} from '../../actions/incidents'
import {
  searchVehiclesRequest,
} from '../../actions/vehicles'
import {
  searchLocationsRequest,
} from '../../actions/locations'
import {
  searchViolationTypesRequest,
} from '../../actions/violationTypes'
import { renderValvePositions } from '../../utils'

import 'leaflet/dist/leaflet.css';
import './style.css'


// Fix an issue causing the map marker icon to not be shown when using
// webpack
// https://machtfit.atlassian.net/browse/MAC-2692
// https://github.com/Leaflet/Leaflet/issues/4968
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
})

class IncidentPage extends React.Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
    getIncident: PropTypes.func.isRequired,
    getPendingIncidents: PropTypes.func.isRequired,
    ignoreIncident: PropTypes.func.isRequired,
    reportIncident: PropTypes.func.isRequired,
    openPhotoEditor: PropTypes.func.isRequired,
    setIncidentIgnorePhoto: PropTypes.func.isRequired,
    setIncidentAlreadyFined: PropTypes.func.isRequired,
    setIncidentReportedViaPhone: PropTypes.func.isRequired,
    removePhotoFromIncident: PropTypes.func.isRequired,
    searchVehicles: PropTypes.func.isRequired,
    searchLocations: PropTypes.func.isRequired,
    searchViolationTypes: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      incident: null,
      preview: null,
      previousIncidentId: null,
      nextIncidentId: null,
      editing: false,
      loadingVehicles: false,
      vehicleOptions: [],
      loadingLocations: false,
      locationOptions: [],
      loadingViolationTypes: false,
      violationTypeOptions: [],
      reportInProgress: false,
    }
  }

  componentDidMount() {
    this.reload()
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.incidentId !== prevProps.match.params.incidentId) {
      this.reload()
    }
  }

  reload = async () => {
    await this.loadIncident()
    await this.loadPendingIncidents()
  }

  loadIncident = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      location: {
        search,
      },
      getIncident,
    } = this.props

    if (incidentId === 'new') {
      const query = qs.parse(search, { ignoreQueryPrefix: true })

      const filenames = Array.isArray(query.photos) ? query.photos : [query.photos]

      await this.setState({
        editing: true,
        incident: {
          photos: filenames.map((p) => ({
            filename: path.basename(p),
            dirpath: path.dirname(p),
          }))
        },
      })
      return
    }

    try {
      const incident = await getIncident(incidentId)
      await this.setState({
        incident,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  loadPendingIncidents = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      getPendingIncidents,
    } = this.props

    const pendingIncidents = await getPendingIncidents()

    const thisIncidentIndex = pendingIncidents.findIndex((incident) => incident.incidentId === parseInt(incidentId))

    const previousIncidentIndex = thisIncidentIndex < 1 ? null : thisIncidentIndex - 1
    const nextIncidentIndex = thisIncidentIndex + 1

    const previousIncidentId = pendingIncidents[previousIncidentIndex]?.incidentId
    const nextIncidentId = pendingIncidents[nextIncidentIndex]?.incidentId

    await this.setState({
      previousIncidentId,
      nextIncidentId,
    })
  }

  ignoreIncident = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      ignoreIncident,
    } = this.props

    await ignoreIncident(incidentId)
    await this.loadIncident()
  }

  setIncidentAlreadyFined = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      setIncidentAlreadyFined,
    } = this.props

    await setIncidentAlreadyFined(incidentId)
    await this.loadIncident()
  }


  setIncidentReportedViaPhone = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      setIncidentReportedViaPhone,
    } = this.props

    await setIncidentReportedViaPhone(incidentId)
    await this.loadIncident()
  }

  createIncident = async () => {
    const {
      createIncident,
      history,
    } = this.props

    const {
      incident: {
        photos,
      },
      selectedVehicleId,
      selectedLocationId,
      selectedViolationTypeId,
      valvePositionFrontLeft,
      valvePositionFrontRight,
      valvePositionRearLeft,
      valvePositionRearRight,
    } = this.state

    const { incidentId } = await createIncident({
      vehicleId: selectedVehicleId,
      locationId: selectedLocationId,
      violationTypeId: selectedViolationTypeId,
      photos: photos.map((photo) => photo.filename),
      valvePositionFrontLeft,
      valvePositionFrontRight,
      valvePositionRearLeft,
      valvePositionRearRight,
    })

    await this.setState({
      editing: false,
    })

    // history.push(`/incidents/${incidentId}`)
    history.push('/photos')
  }

  showIncidentReportPreview = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      getIncidentReportPreview,
    } = this.props

    const preview = await getIncidentReportPreview(incidentId)
    await this.setState({
      preview,
    })
  }

  reportIncident = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      reportIncident,
    } = this.props

    await this.setState({
      reportInProgress: true,
    })

    try {
    await reportIncident(incidentId)
    await this.loadIncident()

    await this.setState({
      preview: null,
    })
    } finally {
      await this.setState({
        reportInProgress: false,
      })
    }
  }

  setIgnorePhoto = async (filename, ignorePhoto) => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      setIncidentIgnorePhoto,
    } = this.props

    await setIncidentIgnorePhoto(incidentId, filename, ignorePhoto)
    await this.loadIncident()
  }

  removePhoto = async (filename) => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      removePhotoFromIncident,
    } = this.props

    await removePhotoFromIncident(incidentId, filename)
    await this.loadIncident()
  }

  openPhotoEditor = async () => {
    const {
      match: {
        params: {
          incidentId,
        },
      },
      openPhotoEditor,
    } = this.props

    await openPhotoEditor(incidentId)
  }

  searchVehicles = async (query) => {
    const {
      searchVehicles,
    } = this.props

    await this.setState({
      loadingVehicles: true,
    })

    try {
      const vehicleOptions = await searchVehicles(query)
      await this.setState({
        vehicleOptions,
      })
    } finally {
      await this.setState({
        loadingVehicles: false,
      })
    }
  }

  searchLocations = async (query) => {
    const {
      searchLocations,
    } = this.props

    await this.setState({
      loadingLocations: true,
    })

    try {
      const locationOptions = await searchLocations(query)
      await this.setState({
        locationOptions,
      })
    } finally {
      await this.setState({
        loadingLocations: false,
      })
    }
  }

  searchViolationTypes = async (query) => {
    const {
      searchViolationTypes,
    } = this.props

    await this.setState({
      loadingViolationTypes: true,
    })

    try {
      const violationTypeOptions = await searchViolationTypes(query)
      await this.setState({
        violationTypeOptions,
      })
    } finally {
      await this.setState({
        loadingViolationTypes: false,
      })
    }
  }

  renderEmailPreviewOverlay() {
    const {
      preview,
      incident: {
        photos,
      },
      reportInProgress,
    } = this.state

    return (
      <Modal
        dialogClassName="modal-90w"
        size="lg"
        show={Boolean(preview)}
        onHide={() => this.setState({ preview: null })}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Vorschau
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea value={ preview } style={{ width: '100%', height: '660px' }} readOnly />
          <Carousel className="photos" interval={null}>
            {
              photos.filter((photo) => !photo.ignorePhoto).map((photo) => (
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => this.setState({ preview: null })}
          >
            Abbrechen
          </Button>
          <Button
            variant="success"
            disabled={reportInProgress}
            onClick={this.reportIncident}
          >
            {
              reportInProgress ? 'Wird gesendet' : 'Absenden'
            }
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }


  renderNavigationButton(label, incidentId) {
    if (!incidentId) {
      return (
        <Button
          variant="info"
          disabled
        >
          { label }
        </Button>
      )
    }

    return (
      <Link to={`/incidents/${incidentId}`}>
        <Button
          variant="info"
        >
          { label }
        </Button>
      </Link>
    )
  }

  renderIncidentMetadata() {
    const {
      incident,
      editing,
      loadingVehicles,
      vehicleOptions,
      loadingLocations,
      locationOptions,
      loadingViolationTypes,
      violationTypeOptions,
    } = this.state

    if (editing) {
      return (
        <Form>
          <Form.Group>
            <Form.Label>Fahrzeug</Form.Label>
            <AsyncTypeahead
              id="vehicleField"
              filterBy={() => true}
              placeholder="Kennzeichen"
              isLoading={loadingVehicles}
              useCache={false}
              labelKey={({
                vehicleRegistrationId,
                vehicleBrandId,
                vehicleColorId,
              }) => `${vehicleRegistrationId} (${vehicleBrandId} ${vehicleColorId})`}
              minLength={2}
              onSearch={this.searchVehicles}
              options={vehicleOptions}
              onChange={(selections) => this.setState({
                selectedVehicleId: selections[0]?.vehicleId
              })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ort</Form.Label>
            <AsyncTypeahead
              id="locationField"
              filterBy={() => true}
              placeholder="Suchen..."
              isLoading={loadingLocations}
              useCache={false}
              labelKey="displayName"
              minLength={3}
              onSearch={this.searchLocations}
              options={locationOptions}
              onChange={(selections) => this.setState({
                selectedLocationId: selections[0]?.locationId
              })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ordnungswidrigkeit</Form.Label>
            <AsyncTypeahead
              id="violationTypeField"
              filterBy={() => true}
              placeholder="Suchen..."
              isLoading={loadingViolationTypes}
              useCache={false}
              labelKey="shortName"
              minLength={3}
              onSearch={this.searchViolationTypes}
              options={violationTypeOptions}
              onChange={(selections) => this.setState({
                selectedViolationTypeId: selections[0]?.violationTypeId
              })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ventil vorne links</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="11"
              onChange={(event) => this.setState({ valvePositionFrontLeft: parseInt(event.target.value, 10) })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ventil vorne rechts</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="11"
              onChange={(event) => this.setState({ valvePositionFrontRight: parseInt(event.target.value, 10) })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ventil hinten links</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="11"
              onChange={(event) => this.setState({ valvePositionRearLeft: parseInt(event.target.value, 10) })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ventil hinten rechts</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="11"
              onChange={(event) => this.setState({ valvePositionRearRight: parseInt(event.target.value, 10) })}
            />
          </Form.Group>
        </Form>
      )
    }

    return (
      <Table bordered>
        <tbody>
          <tr>
            <th>Gesehen</th>
            <td>{ DateTime.fromISO(incident.seenAt).toLocaleString(DateTime.DATETIME_FULL) }</td>
          </tr>
          <tr>
            <th>Ort</th>
            <td>{ incident.displayName }</td>
          </tr>
          <tr>
            <th>Fahrzeug</th>
            <td>{ incident.vehicleRegistrationId } { incident.vehicleBrandId } { incident.vehicleColorId }</td>
          </tr>
          <tr>
            <th>Ordnungswidrigkeit</th>
            <td>{ incident.fullName }</td>
          </tr>
          <tr>
            <th>Ventilstellungen</th>
            <td>{ renderValvePositions(incident) }</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>
              <IncidentStatus incident={incident} />
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }

  renderMap() {
    const {
      incident,
    } = this.state

    if (!incident.geolocation) {
      return null
    }

    const position = [incident.geolocation.latitude, incident.geolocation.longitude]

    return (
      <div className="map">
        <MapContainer center={position} zoom={18} scrollWheelZoom={false} style={{ height: "40vh"}}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    )
  }

  renderPhotos() {
    const {
      incident,
    } = this.state

    if (!incident.photos) {
      return null
    }

    return (
        <Carousel className="photos" interval={null}>
          {
            incident.photos.map((photo) => (
              <Carousel.Item key={photo.filename}>
                <img
                  style={{ maxWidth: '100%', maxHeight: '1200px'}}
                  src={`http://localhost:62452/photos${photo.dirpath}/${photo.filename}`}
                  alt={photo.filename}
                />
                <Carousel.Caption>
                  <p>{ photo.filename }</p>
                  {
                    photo.ignorePhoto ? (
                      <Button
                        onClick={() => this.setIgnorePhoto(photo.filename, false)}
                        variant="link"
                      >
                        Unignore Photo
                      </Button>
                    ) : (
                      <Button
                        onClick={() => this.setIgnorePhoto(photo.filename, true)}
                        variant="link"
                      >
                        Ignore Photo
                      </Button>
                    )
                  }
                  <Button
                    variant="link"
                    onClick={() => this.removePhoto(photo.filename)}
                  >
                    Remove photo from incident
                  </Button>
                </Carousel.Caption>
              </Carousel.Item>
            ))
          }
        </Carousel>
    )
  }

  renderActions() {
    const {
      editing,
      incident,
      previousIncidentId,
      nextIncidentId,
    } = this.state

    if (editing) {
      return (
        <div className="actions">
          <Button
            variant="success"
            onClick={this.createIncident}
          >
            Speichern
          </Button>
        </div>
      )
    }

    return (
      <div className="actions">
        <div>
          <Button
            variant="success"
            onClick={this.showIncidentReportPreview}
            disabled={Boolean(incident.reportedAt)}
          >
            Melden
          </Button>
          <Button
            variant="danger"
            onClick={this.ignoreIncident}
            disabled={Boolean(incident.ignoreIncident || incident.reportedAt)}
          >
            Ignorieren
          </Button>
          <Button
            variant="warning"
            onClick={this.setIncidentAlreadyFined}
            disabled={Boolean(incident.ignoreIncident || incident.reportedAt)}
          >
            Already fined
          </Button>
          <Button
            variant="warning"
            onClick={this.setIncidentReportedViaPhone}
            disabled={incident.reportedViaPhone}
          >
            Reported via phone
          </Button>
          <Button
            variant="secondary"
            onClick={this.openPhotoEditor}
            disabled={Boolean(incident.ignoreIncident || incident.reportedAt)}
          >
            In Bildebarbeitung öffnen
          </Button>
        </div>
        <div>
          {
            this.renderNavigationButton('Vorheriger', previousIncidentId)
          }
          {
            this.renderNavigationButton('Nächster', nextIncidentId)
          }
        </div>
      </div>
    )
  }

  render() {
    const {
      incident,
    } = this.state

    if (!incident) {
      return <div>Loading...</div>
    }


    return (
      <div className="wrapper" key={incident.incidentId}>
        {
          this.renderPhotos()
        }
        <div className="metadata">
          {
            this.renderIncidentMetadata()
          }
          {
            this.renderActions()
          }
        </div>
        {
          this.renderMap()
        }
        {
          this.renderEmailPreviewOverlay()
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  getIncident: getIncidentRequest,
  getPendingIncidents: getPendingIncidentsRequest,
  ignoreIncident: ignoreIncidentRequest,
  getIncidentReportPreview: getIncidentReportPreviewRequest,
  reportIncident: reportIncidentRequest,
  openPhotoEditor: openPhotoEditorRequest,
  setIncidentIgnorePhoto: setIncidentIgnorePhotoRequest,
  setIncidentAlreadyFined: setIncidentAlreadyFinedRequest,
  setIncidentReportedViaPhone: setIncidentReportedViaPhoneRequest,
  removePhotoFromIncident: removePhotoFromIncidentRequest,
  searchVehicles: searchVehiclesRequest,
  searchLocations: searchLocationsRequest,
  searchViolationTypes: searchViolationTypesRequest,
  createIncident: createIncidentRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(IncidentPage)
