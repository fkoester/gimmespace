import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'

import IncidentPage from '../pages/incident'
import IncidentListPage from '../pages/incident-list'
import PhotoListPage from '../pages/photo-list'
import VehiclePage from '../pages/vehicle'
import LocationPage from '../pages/location'

const routes = (history) => (
  <Router history={history}>
    <Switch>
      <Route exact path="/incidents/" component={IncidentListPage} />
      <Route path="/incidents/:incidentId" component={IncidentPage} />
      <Route exact path="/photos/" component={PhotoListPage} />
      <Route path="/vehicles/:vehicleId" component={VehiclePage} />
      <Route path="/locations/:locationId" component={LocationPage} />
    </Switch>
  </Router>
)

export default routes
