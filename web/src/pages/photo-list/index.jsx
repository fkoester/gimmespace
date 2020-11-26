import React from 'react'
import PropTypes from 'prop-types'
import qs from 'query-string'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Button,
  Card,
  Modal,
} from 'react-bootstrap'
import { DateTime } from 'luxon'
import {
  getPendingPhotosRequest,
  setPhotosIgnoredRequest,
  crawlPhotosRequest,
} from '../../actions/photos'

class IncidentListPage extends React.Component {
  static propTypes = {
    getPendingPhotos: PropTypes.func.isRequired,
    setPhotosIgnored: PropTypes.func.isRequired,
    crawlPhotos: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      photos: null,
      selectedPhotos: {}
    }
  }

  componentDidMount() {
    this.loadPhotos()
  }

  loadPhotos = async () => {
    const {
      getPendingPhotos,
    } = this.props

    await this.setState({
      loading: true,
    })

    try {
      const photos = await getPendingPhotos()
      await this.setState({
        photos,
      })
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  ignoreSelectedPhotos = async () => {
    const {
      setPhotosIgnored,
    } = this.props

    const {
      selectedPhotos,
    } = this.state

    const filenames = Object.keys(selectedPhotos).filter((filename) => selectedPhotos[filename])

    await setPhotosIgnored(filenames, true)
    await this.loadPhotos()
  }

  createNewIncident = async () => {
    const {
      history,
    } = this.props

    const {
      selectedPhotos,
      photos,
    } = this.state

    const photoPathes = (
      Object.keys(selectedPhotos)
        .filter((filename) => selectedPhotos[filename])
        .map((filename) => {
          const photo = photos.find((p) => p.filename === filename)
          return `${photo.dirpath}/${photo.filename}`
        }))

    const query = qs.stringify({ photos: photoPathes })

    history.push(`/incidents/new?${query}`)
  }

  crawl = async () => {
    const {
      crawlPhotos,
    } = this.props

    await crawlPhotos()
    await this.loadPhotos()
  }

  renderPhotoOverlay() {
    const {
      showPhotoOverlay,
      photos,
    } = this.state

    const photo = photos.find((p) => p.filename === showPhotoOverlay)

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

  render() {
    const {
      photos,
      selectedPhotos,
    } = this.state

    if (!photos) {
      return <div>Loading...</div>
    }
    return (
      <div style={{ width: '100%' }}>
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
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
        }}>
          <Button
            variant="secondary"
            size="lg"
            onClick={this.crawl}
          >
            Crawl
          </Button>
          <Button
            variant="danger"
            size="lg"
            style={{ marginLeft: '1em'}}
            onClick={this.ignoreSelectedPhotos}
          >
            Ignore
          </Button>
          <Button
            variant="success"
            size="lg"
            style={{ marginLeft: '1em'}}
            onClick={this.createNewIncident}
          >
            Create Incident
          </Button>
          <Button variant="primary" size="lg" style={{ marginLeft: '1em'}}>
            Add to existing
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})


const mapDispatchToProps = (dispatch) => bindActionCreators({
  getPendingPhotos: getPendingPhotosRequest,
  setPhotosIgnored: setPhotosIgnoredRequest,
  crawlPhotos: crawlPhotosRequest,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(IncidentListPage)
