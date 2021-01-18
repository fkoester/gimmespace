import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'
import { bindActionCreators } from 'redux'
import {
  Container,
  Button,
  Form,
} from 'react-bootstrap'
import ReactRouterPropTypes from '../../utils/react-router-prop-types'
import {
  createLocationRequest,
} from '../../actions/locations'

import 'leaflet/dist/leaflet.css';

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

const mapCenter = {
  latitude: 50.0064,
  longitude: 8.2596,
}

class LocationPage extends React.Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
    createLocation: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      geolocation: mapCenter,
      postcode: '',
      street: '',
      housenumber: '',
      displayName: '',
      description: '',
      validated: false,
    }
  }

  onCreateLocation = async (event) => {
    event.preventDefault()
    const {
      createLocation,
    } = this.props

    await this.setState({
      validated: true,
    })

    const {
      geolocation,
      postcode,
      street,
      housenumber,
      displayName,
      description,
    } = this.state

    await createLocation({
      geolocation,
      postcode,
      street,
      housenumber,
      displayName,
      description,
    })

    // history.push(`/vehicles/${vehicleId}`)

    await this.setState({
      geolocation: mapCenter,
      postcode: '',
      street: '',
      housenumber: '',
      displayName: '',
      description: '',
      validated: false,
    })
  }

  onMarkerDragged = async (event) => {
    await this.setState({
      geolocation: {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      }
    })
  }

  render() {
    const {
      geolocation: {
        longitude,
        latitude,
      },
      postcode,
      street,
      housenumber,
      displayName,
      description,
      validated,
    } = this.state

    return (
      <Container>
        <Form onSubmit={this.onCreateLocation} validated={validated}>
          <Form.Group>
            <Form.Label>Postcode</Form.Label>
            <Form.Control
              value={postcode}
              required
              onChange={(e) => this.setState({ postcode: e.target.value })}
              />
          </Form.Group>
          <Form.Group>
            <Form.Label>Street</Form.Label>
            <Form.Control
              value={street}
              required
              onChange={(e) => this.setState({ street: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Housenumber</Form.Label>
            <Form.Control
              value={housenumber}
              required
              onChange={(e) => this.setState({ housenumber: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              value={displayName}
              required
              onChange={(e) => this.setState({ displayName: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => this.setState({ description: e.target.value })}
            />
          </Form.Group>
          <p>
            Latitude: { latitude }<br />
            Longitude: { longitude }
          </p>
          <div className="map">
            <MapContainer center={[mapCenter.latitude, mapCenter.longitude]} zoom={14} style={{ height: "40vh"}}>
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[latitude, longitude]}
                draggable
                eventHandlers={{ move: this.onMarkerDragged }}
              >
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <Button variant="primary" type="submit">
            Create location
          </Button>
        </Form>
      </Container>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  createLocation: createLocationRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(LocationPage)
