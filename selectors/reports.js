import {
  createSelector
} from 'reselect'

import {
  List
} from 'immutable'

import moment from 'moment-timezone'

const _getReportingUserOnCall = state => state.reportingOnCall

export const getReportingUserOnCall = createSelector(
  [_getReportingUserOnCall],
  state => {
    const ON_CALL_LIMIT = 101
    const timeZone = moment.tz.guess()

    const spansMultipleDays = (onCall) => {
      const localStart = moment(onCall.get('start_epoch')).tz(timeZone)
      const localEnd = moment(onCall.get('end_epoch')).tz(timeZone)
      return !localStart.isSame(localEnd, 'day')
    }

    const segmentByDay = (onCall) => {
      let segmented = List()
      let currentOnCall = onCall
      while (spansMultipleDays(currentOnCall) && segmented.size < ON_CALL_LIMIT) {
        let localStart = moment(currentOnCall.get('start_epoch')).tz(timeZone)
        const newOnCallSegment = currentOnCall.set('end_epoch', localStart.endOf('day').valueOf())
        segmented = segmented.push(newOnCallSegment)
        currentOnCall = currentOnCall.set('start_epoch', localStart.endOf('day').add(1, 'millisecond').valueOf())
      }
      segmented = segmented.push(currentOnCall)
      return segmented
    }

    const nonSegmentedOnCalls = state.getIn(['userData', 'on_call'], List())
    let segmentedOnCalls = List()
    nonSegmentedOnCalls.forEach((onCall) => {
      // Make sure API returns a start that is before the end to avoid infinite while loop
      if (onCall.get('start_epoch') < onCall.get('end_epoch')) {
        if (segmentedOnCalls.size < ON_CALL_LIMIT) {
          if (spansMultipleDays(onCall)) {
            segmentedOnCalls = segmentedOnCalls.concat(segmentByDay(onCall))
          } else {
            segmentedOnCalls = segmentedOnCalls.push(onCall)
          }
        }
      }
    })

    return segmentedOnCalls
  }
)
