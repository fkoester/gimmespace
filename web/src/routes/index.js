import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'

import IncidentPage from '../pages/incident'
import IncidentListPage from '../pages/incident-list'
import EvidencePage from '../pages/evidence'
import EvidenceListPage from '../pages/evidence-list'
import PhotoListPage from '../pages/photo-list'
import VehiclePage from '../pages/vehicle'
import LocationPage from '../pages/location'
import PhotoAttributePage from '../pages/photo-attribute'

const routes = (history) => (
  <Router history={history}>
    <Switch>
      <Route exact path="/incidents/" component={IncidentListPage} />
      <Route path="/incidents/:incidentId" component={IncidentPage} />
      <Route exact path="/evidences/" component={EvidenceListPage} />
      <Route path="/evidences/:evidenceId" component={EvidencePage} />
      <Route exact path="/photos/" component={PhotoListPage} />
      <Route exact path="/photos/attribute" component={PhotoAttributePage} />
      <Route path="/vehicles/:vehicleId" component={VehiclePage} />
      <Route path="/locations/:locationId" component={LocationPage} />
    </Switch>
  </Router>
)

export default routes
