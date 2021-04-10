import React from 'react'
import PropTypes from 'prop-types'
import qs from 'query-string'
import path from 'path'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Button,
  Carousel,
  Form,
} from 'react-bootstrap'
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import ReactRouterPropTypes from '../../utils/react-router-prop-types'
import {
  searchVehiclesRequest,
} from '../../actions/vehicles'
import {
  searchLocationsRequest,
} from '../../actions/locations'
import {
  setPhotosAttributesRequest,
} from '../../actions/photos'

import 'leaflet/dist/leaflet.css';
import './style.css'


class PhotoAttributePage extends React.Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    searchVehicles: PropTypes.func.isRequired,
    searchLocations: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      loadingVehicles: false,
      vehicleOptions: [],
      loadingLocations: false,
      locationOptions: [],
      photos: [],
    }
  }

  componentDidMount() {
    this.load()
  }

  load = async () => {
    const {
      location: {
        search,
      },
    } = this.props

    const query = qs.parse(search, { ignoreQueryPrefix: true })

    const filenames = Array.isArray(query.photos) ? query.photos : [query.photos]

    await this.setState({
      photos: filenames.map((p) => ({
        filename: path.basename(p),
        dirpath: path.dirname(p),
      }))
    })
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

  save = async () => {
    const {
      setPhotosAttributes,
      history,
    } = this.props

    const {
      photos,
      selectedVehicleId,
      selectedLocationId,
    } = this.state

    const filenames =photos.map((photo) => photo.filename)

    await setPhotosAttributes(filenames,
      selectedLocationId,
      selectedVehicleId,
    )

    history.push('/photos')
  }

  renderPhotos() {
    const {
      photos,
    } = this.state
    return (
        <Carousel className="photos" interval={null}>
          {
            photos.map((photo) => (
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
    )
  }

  renderIncidentMetadata() {
    const {
      loadingVehicles,
      vehicleOptions,
      loadingLocations,
      locationOptions,
    } = this.state

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
      </Form>
    )
  }

  renderActions() {
    return (
      <div className="actions">
        <Button
          variant="success"
          onClick={this.save}
        >
          Speichern
        </Button>
      </div>
    )
  }

  render() {
    return (
      <div className="wrapper">
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
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  searchVehicles: searchVehiclesRequest,
  searchLocations: searchLocationsRequest,
  setPhotosAttributes: setPhotosAttributesRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PhotoAttributePage)
