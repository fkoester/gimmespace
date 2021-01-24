import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Container,
  Button,
  Form,
  Table,
  Row,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ReactRouterPropTypes from '../../utils/react-router-prop-types'
import {
  createVehicleRequest,
  getVehicleBrandsRequest,
  getVehicleColorsRequest,
  getVehicleRequest,
} from '../../actions/vehicles'


class VehiclePage extends React.Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
    createVehicle: PropTypes.func.isRequired,
    getVehicleBrands: PropTypes.func.isRequired,
    getVehicleColors: PropTypes.func.isRequired,
    getVehicle: PropTypes.func.isRequired,
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
      vehicle: null,
    }
  }

  componentDidMount() {
    this.load()
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.vehicleId !== prevProps.match.params.vehicleId) {
      this.load()
    }
  }

  load = async () => {
    const {
      match: {
        params: {
          vehicleId,
        },
      },
      getVehicleBrands,
      getVehicleColors,
      getVehicle,
    } = this.props

    const vehicleBrands = await getVehicleBrands()
    const vehicleColors = await getVehicleColors()

    let vehicle = null

    if (vehicleId !== 'new') {
      vehicle = await getVehicle(vehicleId)
    }

    await this.setState({
      vehicleBrands,
      vehicleColors,
      vehicle,
    })
  }

  createVehicle = async (event) => {
    event.preventDefault()
    const {
      createVehicle,
      history,
    } = this.props

    const {
      vehicleRegistrationId,
      vehicleBrandId,
      vehicleColorId,
      firstSeenAt,
    } = this.state

    const { vehicleId } = await createVehicle({
      vehicleRegistrationId,
      vehicleBrandId,
      vehicleColorId,
      firstSeenAt,
    })

    history.push(`/vehicles/${vehicleId}`)

    await this.setState({
      vehicleRegistrationId: '',
      vehicleBrandId: null,
      vehicleColorId: null,
      firstSeenAt: null,
    })
  }

  renderNewVehicleForm() {
    const {
      vehicleRegistrationId,
      vehicleBrandId,
      vehicleColorId,
      vehicleBrands,
      vehicleColors,
      firstSeenAt,
    } = this.state

    return (
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
    )
  }

  renderVehicle() {
    const {
      vehicle: {
        vehicleRegistrationId,
        vehicleBrandId,
        vehicleColorId,
      },
    } = this.state

    return (
      <>
        <Row style={{ marginTop: '1em'}}>
          <Link to="/vehicles/new">
            <Button>New Vehicle</Button>
          </Link>
        </Row>
        <Row style={{ marginTop: '1em'}}>
          <Table bordered>
            <tbody>
              <tr>
                <th>Kennzeichen</th>
                <td>{ vehicleRegistrationId }</td>
              </tr>
              <tr>
                <th>Marke</th>
                <td>{ vehicleBrandId }</td>
              </tr>
              <tr>
                <th>Farbe</th>
                <td>{ vehicleColorId }</td>
              </tr>
            </tbody>
          </Table>
        </Row>
      </>
    )
  }

  render() {
    const {
      vehicle,
    } = this.state

    return (
      <Container key={vehicle?.vehicleId ?? 'new'}>
        {
          vehicle ? this.renderVehicle() : this.renderNewVehicleForm ()
        }
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
  getVehicle: getVehicleRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(VehiclePage)
