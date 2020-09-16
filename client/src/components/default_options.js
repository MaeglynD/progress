export default {
	chart: {
		type: 'areaspline',
	},

	title: {
		text: undefined,
	},

	yAxis: [],

	xAxis: {
		type: 'datetime',
		crosshair: {
			color: 'rgba(255, 255, 255, 0.1)'
		}

	},

	tooltip: {
		backgroundColor: 'rgba(33, 33, 33, 0.8)',
		padding: 15,
		borderRadius: 4,
		borderColor: 'rgba(255, 255, 255, 0.01)',
		style: {
			color: 'white',
			lineHeight: '23px'
		},
		shared: true
	},

	legend: {
		enabled: false
	},

	credits: {
		enabled: false,
	},

	plotOptions: {
		series: {
			fillOpacity: 0.1,
			lineWidth: 4,
			label: {
				connectorAllowed: false,
			},
		},
		pie: {
			dataLabels: {
				enabled: false
			}
		}
	},

	series: [
	],
};
