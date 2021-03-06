// vendor
import {
  takeEvery
} from 'redux-saga'

import {
  put,
  select,
  call
} from 'redux-saga/effects'

import {
  receiveTimelineMessageSequence
} from 'components/__entry/__entry-helpers'

import {
  batchedHistoryProtocolStatic
} from '@victorops/message-protocol'

// lib
import {
  POST_MORTEM_ACTION_ITEMS_CREATE,
  POST_MORTEM_ACTION_ITEMS_GET,
  POST_MORTEM_ACTION_ITEMS_REMOVE,
  POST_MORTEM_DATE_UPDATE,
  POST_MORTEM_GET,
  POST_MORTEM_UPDATE,
  POST_MORTEM_SAVE_FORM,
  POST_MORTEM_TIMELINE_NOTES_GET,
  POST_MORTEM_TIMELINE_GET,
  getPostMortemActionItems,
  updatePostMortem,
  timelineLoaded,
  timelineLoading,
  resetPostMortem,
  updatePostMortemActionItems,
  updatePostMortemTimelineNotes
} from 'reporting/actions/post-mortem'

import config from 'components/__utils/config'

export const _getPostMortemState = (state) => state.postMortem.get('report').toJS()

function _savePostMortem ({create}, logError) {
  return function * (action) {
    try {
      const reportFormData = yield select(_getPostMortemState)

      if (reportFormData.end && reportFormData.end && reportFormData.title) {
        const headerData = {
          exclude: reportFormData.exclude,
          begin: reportFormData.begin,
          end: reportFormData.end,
          source: reportFormData.source,
          title: reportFormData.title,
          annotations: reportFormData.annotations,
          can_edit: reportFormData.can_edit,
          can_delete: reportFormData.can_delete,
          is_customer_impacted: reportFormData.is_customer_impacted
        }

        const postmortemEndpoint = `/api/v1/org/${config.auth.org.slug}/reports/postmortems`
        const savedPostMortem = yield call(create, postmortemEndpoint, headerData)
        yield put(updatePostMortem(savedPostMortem))
      }
    } catch (err) {
      yield call(logError, err)
    }
  }
}

function _getTimeline ({fetch}, logError) {
  return function * (action) {
    try {
      const reportFormData = yield select(_getPostMortemState)
      if (reportFormData.begin && reportFormData.end) {
        // show loading screen
        const _timelineLoading = yield call(timelineLoading)
        yield put(_timelineLoading)

        // Clear timeline messages since the reduecers are made to concat not reload
        const reset = yield call(resetPostMortem)
        yield put(reset)

        const actionItemsEndpoint = `/api/v1/org/${config.auth.org.slug}/reporting/timeline?p.begin=${reportFormData.begin}&p.end=${reportFormData.end}&p.limit=1000`
        const timelineItems = yield call(fetch, actionItemsEndpoint)

        const batch = batchedHistoryProtocolStatic(timelineItems.timeline)

        let timelineAction
        receiveTimelineMessageSequence('*', batch, arg => { timelineAction = arg })

        yield put(timelineAction)

        // Hide loading screen
        const _timelineLoaded = yield call(timelineLoaded)
        yield put(_timelineLoaded)
      }
    } catch (err) {
      yield call(logError, err)
    }
  }
}

function _getPostMortemBySlug ({fetch}, logError) {
  return function * (action) {
    const {
      payload: {
        reportId
      }
    } = action
    try {
      if (reportId) {
        const actionItemsEndpoint = `/api/v1/org/${config.auth.org.slug}/reports/postmortems/${reportId}`
        const actionItems = yield call(fetch, actionItemsEndpoint)
        yield put(updatePostMortem(actionItems))
      }
    } catch (err) {
      yield call(logError, err)
    }
  }
}

function _getPostMortemActionItems ({fetch}, logError, reportId) {
  return function * (action) {
    try {
      if (reportId) {
        const actionItemsEndpoint = `/api/v1/org/${config.auth.org.slug}/reports/postmortems/${reportId}/actionitems`
        const actionItems = yield call(fetch, actionItemsEndpoint)
        yield put(updatePostMortemActionItems(actionItems))
      }
    } catch (err) {
      yield call(logError, err)
    }
  }
}

function _createPostMortemActionItem ({create}, logError, token) {
  return function * (action) {
    const {
      payload: {
        reportId,
        actionItemToAdd,
        success
      }
    } = action
    try {
      yield call(create, `/api/v1/org/${config.auth.org.slug}/reports/postmortems/${token}/actionitems`, actionItemToAdd)
      yield put(getPostMortemActionItems({reportId: reportId}))
      yield call(success)
    } catch (err) {
      yield call(logError, err)
    }
  }
}

function _removePostMortemActionItem ({destroy}, logError) {
  return function * (action) {
    const {
      payload: {
        actionItemIdToRemove,
        reportId,
        success
      }
    } = action

    try {
      yield call(destroy, `/api/v1/org/${config.auth.org.slug}/reports/postmortems/${reportId}/actionitems/${actionItemIdToRemove}`)
      yield put(getPostMortemActionItems({reportId: reportId}))
      yield call(success)
    } catch (err) {
      yield call(logError, err)
    }
  }
}

function _getPostMortemTimelineNotes ({fetch}, logError) {
  return function * (action) {
    const {
      payload: {
        reportId
      }
    } = action
    try {
      let annotatedTimelineNotes = []
      if (reportId) {
        const reportEndpoint = `/api/v1/org/${config.auth.org.slug}/reports/postmortems/${reportId}`
        const reportResponse = yield call(fetch, reportEndpoint)

        const timelineEndpoint = `/api/v1/org/${config.auth.org.slug}/reporting/timeline?p.begin=${reportResponse.begin}&p.end=${reportResponse.end}&p.limit=1000`
        const timelineResponse = yield call(fetch, timelineEndpoint)

        const sequenceTimeMap = {}
        timelineResponse.timeline.forEach(
          (t) => { sequenceTimeMap[t.sequence] = t.serviceTime }
        )
        annotatedTimelineNotes = reportResponse.annotations
        annotatedTimelineNotes.forEach((aA) => {
          aA.timeStamp = sequenceTimeMap[aA.sequence] || 'N/A'
        })
      } else {
        annotatedTimelineNotes = []
      }

      yield put(updatePostMortemTimelineNotes(annotatedTimelineNotes))
    } catch (err) {
      yield call(logError, err)
    }
  }
}

export const Test = {
  _getPostMortemActionItems,
  _createPostMortemActionItem,
  _removePostMortemActionItem,
  _getPostMortemTimelineNotes
}

export function * watchPostMortemFormSave (api, logError) {
  yield * takeEvery(POST_MORTEM_SAVE_FORM, _savePostMortem(api, logError))
}

export function * watchGetPostMortemActionItems (api, logError) {
  const reportId = yield select(_getPostMortemState).token
  yield * takeEvery(POST_MORTEM_ACTION_ITEMS_GET, _getPostMortemActionItems(api, logError, reportId))
}

export function * watchCreatePostMortemActionItem (api, logError) {
  const reportFormData = yield select(_getPostMortemState)
  yield * takeEvery(POST_MORTEM_ACTION_ITEMS_CREATE, _createPostMortemActionItem(api, logError, reportFormData.token))
}

export function * watchRemovePostMortemActionItem (api, logError) {
  yield * takeEvery(POST_MORTEM_ACTION_ITEMS_REMOVE, _removePostMortemActionItem(api, logError))
}

export function * watchGetPostMortemTimelineNotes (api, logError) {
  yield * takeEvery(POST_MORTEM_TIMELINE_NOTES_GET, _getPostMortemTimelineNotes(api, logError))
}

export function * watchGetPostMortemBySlug (api, logError) {
  yield * takeEvery(POST_MORTEM_GET, _getPostMortemBySlug(api, logError))
}

export function * watchPostMortemDateChange (api, logError) {
  yield * takeEvery(POST_MORTEM_DATE_UPDATE, _getTimeline(api, logError))
}

export function * watchGetTimelineOnUpdate (api, logError) {
  yield * takeEvery(POST_MORTEM_UPDATE, _getTimeline(api, logError))
}

export function * watchGetTimeline (api, logError) {
  yield * takeEvery(POST_MORTEM_TIMELINE_GET, _getTimeline(api, logError))
}
