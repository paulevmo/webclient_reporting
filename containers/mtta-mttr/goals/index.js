import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import {
  mttaMttrGoalSetMtta,
  mttaMttrGoalSetMttr
} from 'reporting/actions/mtta-mttr'

import {
  hideModal,
  showModal
} from 'reporting/actions/modal'

import GoalsModal from './goalsModal'
import _transformTime from '../utilities/transformTime'

function mapStateToProps (state) {
  return {
    mtta: state.mttaMttr.getIn(['graphData', 'tta_period_avg'], 0),
    mttr: state.mttaMttr.getIn(['graphData', 'ttr_period_avg'], 0),
    incidents: state.mttaMttr.getIn(['graphData', 'total_incidents'], 0),
    mttaGoal: state.mttaMttr.getIn(['goals', 'mtta'], null),
    mttrGoal: state.mttaMttr.getIn(['goals', 'mttr'], null)
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setMttaGoal: (payload) => dispatch(mttaMttrGoalSetMtta(payload)),
    setMttrGoal: (payload) => dispatch(mttaMttrGoalSetMttr(payload)),
    hideModal: (payload) => dispatch(hideModal(payload)),
    showModal: (payload) => dispatch(showModal(payload))
  }
}

class mttaMttrGoals extends Component {
  _openGoalModal (type, value, title, text) {
    const modalConfig = {
      modalType: 'confirm',
      modalProps: {
        actionBar: false,
        title: title,
        component: <GoalsModal value={value} text={text} type={type} />,
        onCancel: () => this.props.hideModal(),
        cancelButtonText: 'Cancel',
        cancelButtonType: 'secondary',
        confirmButtonText: 'Add Goal',
        confirmButtonType: 'info',
        modalClass: 'mtta-mttr--goal-modal'
      }
    }

    this.props.showModal(modalConfig)
  }

  _goal (type, value, title, text) {
    const duration = moment.duration(value)
    let GoalText = <a className='underline-decoration'>add goal</a>
    if (value) {
      GoalText = <span className='underline-decoration'>goal: {_transformTime(duration, this.props.incidents)}</span>
    }
    const modalText =
      <span
        onClick={() => this._openGoalModal(type, value, title, text)}>
        {GoalText}
      </span>
    return <span> ({modalText}{this._addOrDeleteButton(type)})</span>
  }

  _addOrDeleteButton (type) {
    let value = null
    let deleteFunc = null
    if (type === 'mtta') {
      value = this.props.mttaGoal
      deleteFunc = () => { this.props.setMttaGoal({mtta: null}) }
    } else if (type === 'mttr') {
      value = this.props.mttrGoal
      deleteFunc = () => { this.props.setMttrGoal({mttr: null}) }
    }

    const deleteButton = <a onClick={deleteFunc} className='mtta-mttr--goals--goal--delete'> - remove</a>
    return value ? deleteButton : null
  }

  render () {
    const mtta = _transformTime(this.props.mtta, this.props.incidents)
    const mttr = _transformTime(this.props.mttr, this.props.incidents)

    const addMttaGoal = this._goal(
      'mtta',
      this.props.mttaGoal,
      'Add time to acknowledge goal',
      'This will show the number of acknowledgements within your stated goal.'
    )

    const addMttrGoal = this._goal(
      'mttr',
      this.props.mttrGoal,
      'Add time to resolve goal',
      'This will show the number of resolutions within your stated goal.'
    )

    const noMttaMttrData = !this.props.mtta && !this.props.mttr
    return (
      <div className='mtta-mttr--goals'>
        <span className='mtta-mttr--goals--goal'>
          <strong>MTTA: </strong>
          {mtta}
          {noMttaMttrData ? null : addMttaGoal}
        </span>
        <span className='mtta-mttr--goals--goal'>
          <strong>MTTR: </strong>
          {mttr}
          {noMttaMttrData ? null : addMttrGoal}
        </span>
        <span className='mtta-mttr--goals--goal'>
          <strong>Incidents: </strong>
          {noMttaMttrData ? 'N/A' : this.props.incidents}
          {this.props.incidents < 5000 ? null : ' (showing 5000)'}
        </span>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(mttaMttrGoals)
