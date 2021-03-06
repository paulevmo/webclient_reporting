import React, { Component } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  BreadCrumbs,
  Button
} from '@victorops/victory'

import Filter from './filter'
import IncidentFrequencyGraph from './graph'
import IncidentFrequencyTable from './table'

import { incidentFrequencyTableReset } from 'reporting/actions/incident-frequency'

import {
  getIncidentFrequencyFilledBuckets
} from 'reporting/selectors'

const config = window.VO_CONFIG
const CSV_SIZE_WARNING_LIMIT = 10000

const COLOR_LIST = [
  '#FFD163', '#F1582F', '#5175CA', '#ABCB79', '#6C6C6C',
  '#FF8D22', '#B664E4', '#69E7C7', '#E762A7', '#0037AB',
  '#72EA31', '#51A8CA', '#DCA326', '#5A3EBA', '#52F39A', '#B7B7B7'
]

function mapStateToProps (state) {
  return {
    data: getIncidentFrequencyFilledBuckets(state),
    graphDataExists: state.incidentFrequency.getIn(['graphData', 'has_data_flag'], true),
    graphData: state.incidentFrequency.getIn(['graphData', 'display_buckets']),
    loadingData: state.incidentFrequency.get('loadingGraphData', false),
    reducedData: state.incidentFrequency.getIn(['reducedData', 'reducedRows'])
  }
}

function mapDispatchToProps (dispatch) {
  return {
    resetReducedTable: (payload) => dispatch(incidentFrequencyTableReset(payload))
  }
}

class IncidentFrequency extends Component {
  constructor (props) {
    super(props)

    this._resetTableData = this._resetTableData.bind(this)
    this._determineTotalIncidents = this._determineTotalIncidents.bind(this)
  }

  _resetTableData () {
    const plotLine = document.getElementsByClassName('highcharts-plot-lines-9999')[0]
    plotLine.style.display = 'none'
    this.props.resetReducedTable()
  }

  _determineTotalIncidents () {
    let total = 0
    if (this.props.data && this.props.data.segments) {
      total = this.props.data.segments.reduce((acc, i) => acc + i.total_incidents, 0)
    } return total
  }

  render () {
    const graphIsEmpty = this.props.graphData.size === 0 && !this.props.loadingData
    const ReportHomeLink = <Link className='link--default' to={`/reports/${config.orgslug}`}>Reports</Link>

    const ClearBucketSelectionButton =
      <Button
        content='Reset'
        type='btn btn-warning incident-frequency--graph--button'
        clickHandler={this._resetTableData}
      />

    let totalIncidents = this._determineTotalIncidents()

    return (
      <div className='container module-wrapper'>
        <BreadCrumbs breadcrumbs={[
          {label: ReportHomeLink, active: true},
          {label: 'Incident Frequency Report', uri: '#reports/incident-frequency', active: true}
        ]} light />

        <h1 className='heading-3'>Incident Frequency Report</h1>

        <Filter
          totalIncidents={totalIncidents}
          CSV_SIZE_WARNING_LIMIT={CSV_SIZE_WARNING_LIMIT}
        />

        <div className='incident-frequency-graph--wrapper'>
          { this.props.reducedData ? ClearBucketSelectionButton : null }

          <IncidentFrequencyGraph
            data={this.props.data}
            colorList={COLOR_LIST}
          />
        </div>
        <IncidentFrequencyTable
          graphIsEmpty={graphIsEmpty && !this.props.loadingData}
          colorList={COLOR_LIST}
          CSV_SIZE_WARNING_LIMIT={CSV_SIZE_WARNING_LIMIT}
          totalIncidents={totalIncidents}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IncidentFrequency)
