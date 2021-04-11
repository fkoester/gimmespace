import React from 'react'
import { Link } from 'react-router-dom'

class DashboardPage extends React.Component {
  render() {
    return (
      <ul>
        <li>
          <Link to="/photos">Photos</Link>
        </li>
        <li>
          <Link to="/evidences">Evidences</Link>
        </li>
        <li>
          <Link to="/incidents">Incidents</Link>
        </li>
      </ul>
    )
  }
}

export default DashboardPage
