export default {
  legend: { enabled: false },

  title: {
    text: ''
  },

  xAxis: {
    type: 'linear',
    gridLineWidth: 1,
    tickInterval: 1,
    tickColor: '#d6d6d6',
    crosshair: {
      width: 1,
      color: '#7e7e7e'
    },

    plotLines: [{
      color: 'black',
      width: 2,
      zIndex: 20
    }]
  },

  yAxis: {
    type: 'linear',
    gridLineWidth: 0,
    minRange: 1,
    allowDecimals: false
  },

  tooltip: {
    crosshairs: true,
    shared: true,
    backgroundColor: 'white',
    borderColor: '#7e7e7e',
    valueDecimals: 0,
    borderRadius: 10,
    borderWidth: 2,
    headerFormat: '<span style="font-size: 14px; text-decoration: underline; font-weight: bold;">{point.key}</span><br/>'
  },

  plotOptions: {
    line: {
      enableMouseTracking: true,
      stickyTracking: false,
      marker: {
        enabled: false
      }
    },

    area: {
      stacking: 'normal',
      stickyTracking: false
    }
  }
}
