// Mtta-Mttr Report
export const MTTA_MTTR_GRAPH_GET = 'MTTA_MTTR_GRAPH_GET'
export const MTTA_MTTR_GRAPH_UPDATE = 'MTTA_MTTR_GRAPH_UPDATE'
export const MTTA_MTTR_GRAPH_ERROR = 'MTTA_MTTR_GRAPH_ERROR'
export const MTTA_MTTR_TABLE_GET = 'MTTA_MTTR_TABLE_GET'
export const MTTA_MTTR_TABLE_UPDATE = 'MTTA_MTTR_TABLE_UPDATE'
export const MTTA_MTTR_TABLE_ERROR = 'MTTA_MTTR_TABLE_ERROR'
export const MTTA_MTTR_FILTER_UPDATE = 'MTTA_MTTR_FILTER_UPDATE'
export const MTTA_MTTR_ROUTE_KEY_UPDATE = 'MTTA_MTTR_ROUTE_KEY_UPDATE'

export function mttaMttrGraphGet (payload = {}) {
  return {
    type: MTTA_MTTR_GRAPH_GET,
    payload
  }
}

export function mttaMttrGraphUpdate (payload = {}) {
  return {
    type: MTTA_MTTR_GRAPH_UPDATE,
    payload
  }
}

export function mttaMttrGraphError (payload = {}) {
  return {
    type: MTTA_MTTR_GRAPH_ERROR,
    payload
  }
}

export function mttaMttrTableGet (payload = {}) {
  return {
    type: MTTA_MTTR_TABLE_GET,
    payload
  }
}

export function mttaMttrTableUpdate (payload = {}) {
  return {
    type: MTTA_MTTR_TABLE_UPDATE,
    payload
  }
}

export function mttaMttrTableError (payload = {}) {
  return {
    type: MTTA_MTTR_TABLE_ERROR,
    payload
  }
}

export function mttaMttrFilterUpdate (payload = {}) {
  return {
    type: MTTA_MTTR_FILTER_UPDATE,
    payload
  }
}

export function mttaMttrRouteKeyUpdate (payload = {}) {
  return {
    type: MTTA_MTTR_ROUTE_KEY_UPDATE,
    payload
  }
}
