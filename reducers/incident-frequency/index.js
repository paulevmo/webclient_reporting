import {
  fromJS as _fromJS,
  List
} from 'immutable'

import moment from 'moment'

import {
  INCIDENT_FREQUENCY_GRAPH_GET,
  INCIDENT_FREQUENCY_GRAPH_UPDATE,
  INCIDENT_FREQUENCY_GRAPH_ERROR,
  INCIDENT_FREQUENCY_TABLE_GET,
  INCIDENT_FREQUENCY_TABLE_UPDATE,
  INCIDENT_FREQUENCY_TABLE_ERROR,
  INCIDENT_FREQUENCY_FILTER_UPDATE,
  INCIDENT_FREQUENCY_TABLE_REDUCE,
  INCIDENT_FREQUENCY_TABLE_RESET
} from 'reporting/actions/incident-frequency'

export const initialState = _fromJS({
  loadingData: true,
  beginDate: moment().subtract(1, 'month').valueOf(),
  endDate: moment().valueOf(),
  timezoneOffset: moment().utcOffset() / 60,
  selectedTeam: '',
  chartType: 'Area',
  segmentationType: 'Segment by integration',
  resolutionType: 'Display weekly',
  tableData: List(),
  graphData: null,
  error: {
    graph: false,
    table: false
  },
  reducedData: {
    reducedRows: null,
    animation: true,
    columnTitle: null
  }
})

export default function incidentFrequencyReport (state = initialState, action) {
  switch (action.type) {
    case INCIDENT_FREQUENCY_TABLE_GET:
    case INCIDENT_FREQUENCY_GRAPH_GET:
      return _loadingData(state)
    case INCIDENT_FREQUENCY_GRAPH_UPDATE:
      return _updateGraph(state, action.payload)
    case INCIDENT_FREQUENCY_TABLE_UPDATE:
      return _updateTable(state, action.payload)
    case INCIDENT_FREQUENCY_FILTER_UPDATE:
      return _filterUpdate(state, action.payload)
    case INCIDENT_FREQUENCY_GRAPH_ERROR:
      return _setIncidentFrequencyGraphError(state, action.payload)
    case INCIDENT_FREQUENCY_TABLE_ERROR:
      return _setIncidentFrequencyTableError(state, action.payload)
    case INCIDENT_FREQUENCY_TABLE_REDUCE:
      return _updateReducedTable(state, action.payload)
    case INCIDENT_FREQUENCY_TABLE_RESET:
      return _resetReducedTable(state, action.payload)
    default : return state
  }
}

const _loadingData = (state) => state.update('loadingData', () => true)
const _filterUpdate = (state, payload) => state.merge(state, payload)

function _updateTable (state, payload) {
  return state.set('tableData', _fromJS(payload))
              .update('loadingData', () => false)
              .setIn(['error', 'table'], false)
}

function _setIncidentFrequencyTableError (state, payload) {
  return state.setIn(['error', 'table'], _fromJS(payload.error))
}

function _updateGraph (state, payload) {
  return state.set('graphData', _fromJS(payload))
              .update('loadingData', () => false)
              .setIn(['error', 'table'], false)
}

function _setIncidentFrequencyGraphError (state, payload) {
  return state.setIn(['error', 'graph'], _fromJS(payload.error))
}

function _updateReducedTable (state, payload) {
  return state.set('reducedData', _fromJS(payload))
}

function _resetReducedTable (state, payload) {
  return state.set('reducedData', _fromJS({
    reducedRows: null,
    animation: true,
    columnTitle: null
  }))
}
