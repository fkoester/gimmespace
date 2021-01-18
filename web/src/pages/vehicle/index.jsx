import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Container,
  Button,
  Form,
} from 'react-bootstrap'
import ReactRouterPropTypes from '../../utils/react-router-prop-types'
import {
  createVehicleRequest,
  getVehicleBrandsRequest,
  getVehicleColorsRequest,
} from '../../actions/vehicles'


class VehiclePage extends React.Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
    createVehicle: PropTypes.func.isRequired,
    getVehicleBrands: PropTypes.func.isRequired,
    getVehicleColors: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      vehicleRegistrationId: '',
      vehicleBrandId: null,
      vehicleColorId: null,
      vehicleBrands: [],
      vehicleColors: [],
      firstSeenAt: null,
    }
  }

  componentDidMount() {
    this.load()
  }

  load = async () => {
    const {
      getVehicleBrands,
      getVehicleColors,
    } = this.props

    const vehicleBrands = await getVehicleBrands()
    const vehicleColors = await getVehicleColors()

    await this.setState({
      vehicleBrands,
      vehicleColors,
    })
  }

  createVehicle = async (event) => {
    event.preventDefault()
    const {
      createVehicle,
    } = this.props

    const {
      vehicleRegistrationId,
      vehicleBrandId,
      vehicleColorId,
      firstSeenAt,
    } = this.state

    await createVehicle({
      vehicleRegistrationId,
      vehicleBrandId,
      vehicleColorId,
      firstSeenAt,
    })

    // history.push(`/vehicles/${vehicleId}`)

    await this.setState({
      vehicleRegistrationId: '',
      vehicleBrandId: null,
      vehicleColorId: null,
      firstSeenAt: null,
    })
  }

  render() {
    const {
      vehicleRegistrationId,
      vehicleBrandId,
      vehicleColorId,
      vehicleBrands,
      vehicleColors,
      firstSeenAt,
    } = this.state

    return (
      <Container>
        <Form onSubmit={this.createVehicle}>
          <Form.Group>
            <Form.Label>Kennzeichen</Form.Label>
            <Form.Control
              value={vehicleRegistrationId}
              required
              onChange={(e) => this.setState({ vehicleRegistrationId: e.target.value })}
              />
          </Form.Group>
          <Form.Group>
            <Form.Label>Marke</Form.Label>
            <Form.Control
              as="select"
              required
              value={vehicleBrandId}
              onChange={(e) => this.setState({ vehicleBrandId: e.target.value })}
            >
              {
                vehicleBrands.map((vehicleBrand) => (
                  <option value={vehicleBrand.vehicleBrandId}>
                    { vehicleBrand.vehicleBrandId }
                  </option>))
              }
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Farbe</Form.Label>
            <Form.Control
              as="select"
              required
              value={vehicleColorId}
              onChange={(e) => this.setState({ vehicleColorId: e.target.value })}
            >
              {
                vehicleColors.map((vehicleColor) => (
                  <option value={vehicleColor.vehicleColorId}>
                    { vehicleColor.vehicleColorId }
                  </option>))
              }
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Erstmalig gesehen</Form.Label>
            <Form.Control
              value={firstSeenAt}
              required
              type="date"
              lang="de"
              onChange={(e) => this.setState({ firstSeenAt: e.target.value })}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Create vehicle
          </Button>
        </Form>
      </Container>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  createVehicle: createVehicleRequest,
  getVehicleBrands: getVehicleBrandsRequest,
  getVehicleColors: getVehicleColorsRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(VehiclePage)
