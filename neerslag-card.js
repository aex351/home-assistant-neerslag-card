import {
	LitElement,
	html,
	css
} from "lit";
import annotationPlugin from 'chartjs-plugin-annotation';


import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
Chart.register(annotationPlugin);


// class CombiCardEditor extends LitElement {

// 	setConfig(config) {
// 		this._config = config;
// 	}

// 	configChanged(newConfig) {
// 		const event = new Event("config-changed", {
// 		bubbles: true,
// 		composed: true
// 		});
// 		event.detail = {config: newConfig};
// 		this.dispatchEvent(event);
// 	}
// }
class CombiCard extends LitElement {

	static get properties() {
		return {
			hass: {},
			_config: {},
			myChart: {}
		};
	}

	static getStubConfig() {
		return {
			entity: "sensor.neerslag_buienalarm_regen_data",
			title: "Neerslag"
		}
	}

	// static getConfigElement() {
	// 	return document.createElement("combi-card-editor");
	// }

	static get styles() {
		return css`
			ha-card {
				position: relative;
			}
			ha-icon {
				position: absolute;
				top: 30px;
				right: 40px;
			}
			#plotGraphCard {
				padding: 0px 16px 16px 16px;
			}
		`;
	}

	setConfig(config) {

		// console.log("setConfig");
		if (!config.entity && !config.entities) {
			throw new Error('You need to define an entity or a list of entities. See readme file for available entities (sensors)');
		}
		this._config = config;

		//default zoom waarde
		this.zoomwaarde = 5.5;
	}

	getCardSize() {
		return 2;
	}

	vertaling = {
		nl : {
			regenMmUur : 'Regen (mm / uur)',
			regenvalVoorspelling : 'Regenval voorspelling',
			licht : 'Licht',
			matig : 'Matig',
			zwaar : 'Zwaar',
			geenDataBeschikbaar: 'Geen sensor data beschikbaar',
		},
		en : {
			regenMmUur : 'Rain (mm / hr)',
			regenvalVoorspelling : 'Rainfall forecast',
			licht : 'Light',
			matig : 'Moderate',
			zwaar : 'Heavy',
			geenDataBeschikbaar: 'No sensor data available',
		},
		fr : {
			regenMmUur : 'Pluie (mm / h)',
			regenvalVoorspelling : 'Prévision de précipitations',
			licht : 'Légère',
			matig : 'Moyenne',
			zwaar : 'Forte',
			geenDataBeschikbaar: 'Pas de données du senseur disponibles',
		}
	}


	localize(key){

		let lang = this.getCurrentLanguage();

		if(!this.vertaling[lang]){
			// language does not exist, default back to Dutch language
			lang = 'nl'
		}

		let translatedText
		// key - translation found
		if(this.vertaling[lang][key]){
			translatedText = this.vertaling[lang][key];
		} else {
			if(lang != 'nl') {
				lang = 'nl'
				if(this.vertaling[lang][key]){
					// default back to dutch
					translatedText = this.vertaling[lang][key];
				} else {
					translatedText = 'No translation text found'
				}
			}
		}

		return translatedText
	}

	getCurrentLanguage() {
		let lang = (localStorage.getItem('selectedLanguage') || '') .replace(/['"]+/g, '').replace('-', '_');
		if(lang == '') {
			lang = (navigator.language || navigator.userLanguage).replace(/['"]+/g, '').replace('-', ' ').substring(0, 2);
		}
		return lang
	}


	render() {

		if (!this._config || !this.hass) {
			return html``;
		}

		let stateObj;
		const stateMultiObj = [];

		if (this._config.entity) {
			stateObj = this.hass.states[this._config.entity];
		}
		if (this._config.entities) {
			this._config.entities.forEach(value => {
				stateMultiObj.push(this.hass.states[value]);
			})
		}

		if (this._config.autozoom === true) {
			this.zoomwaarde = 0.5;
		}

		// Display "No Entity or Entities found card"
		if (!stateObj && !stateMultiObj) {
			return html`
				<style>
					.not-found {
						flex: 1;
						background-color: red;
						padding: 8px;
					}
				</style>
				<ha-card>
					<h1 class="card-header">${this._config.title}</h1>

					<div class="not-found">
						Entity or Entities not available.
					</div>
					<ha-icon icon="mdi:weather-rainy"></ha-icon>
				</ha-card>
				`;
		}
		let check = customElements.get("buien-rain-forecast");
		if(check) {
			return html`
				<style>
					.not-found {
						flex: 1;
						background-color: red;
						padding: 8px;
					}
				</style>
			<ha-card>

				<ha-icon style="right:20px" icon="mdi:weather-rainy"></ha-icon>

				<h1 class="card-header">
					<div class="name">
						${this._config.title}
					</div>

				</h1>

				<div id="plotGraphCard">
					<div class="not-found">
						Error: Incompatible integration detected
						<ol>
							<li>buien-rain-forecast</li>
						</ol>
						This integration/plugin is known for causing problems with the Neerslag Card. Please remove it from your Home Assistant installation and filesystem.
					</div>
				</div>
			</ha-card>
			`
		}

		/*
		// Display "No Sensor Data card"
		if (!stateObj && !stateMultiObj) {
			if(this.hass.states[this._config.entity].attributes.data === "")  {
				this.dontMakeGraph = true
				return html`
					<ha-card>
					<h1 class="card-header">${this._config.title}</h1>

						<ha-icon icon="mdi:weather-rainy"></ha-icon>
						<div class="not-found">
						<div id="plotGraphCard">
							<div>No sensor data available</div>
						</div>
						</div>
					<ha-icon icon="mdi:weather-rainy"></ha-icon>
					</ha-card>
				`
			}
		}
		*/

		// console.log(this.hass.localize);

		this.dontMakeGraph = false;

		if(this.prepareChartDataSets().getChartsDataAlsArray()[0] === undefined) {
			this.dontMakeGraph = true;
			this.myChart = null;
			return html`

			<ha-card>

				<ha-icon style="right:20px" icon="mdi:weather-rainy"></ha-icon>

				<h1 class="card-header">
					<div class="name">
						${this._config.title}
					</div>

				</h1>

				<div id="plotGraphCard">
					<div style="display: block;">
						${this.localize('geenDataBeschikbaar')}
					</div>
				</div>


			</ha-card>
		`;


		}

		// Display "Plot a graph card"
		return html`

			<ha-card>

				<ha-icon style="right:20px" icon="mdi:weather-rainy"></ha-icon>

				<h1 class="card-header">
					<div class="name">
						${this._config.title}
					</div>

				</h1>

				<div id="plotGraphCard">
					<div id="neerslagChartContainer" style="display: block;">
						<canvas id="neerslagChart"></canvas>
					</div>
				</div>


			</ha-card>
		`;
	}

	firstUpdated(changedProperties) {

		if(this.dontMakeGraph == true) {
			return;
		}

		// changedProperties.forEach((oldValue, propName) => {
		// 	console.log(`${propName} changed. oldValue: ${oldValue}`);
		// });
		this.makeGraph();
		if (this.myChart.width === 0) {
			//console.log("firstUpdated: chart is niet zichtbaar!");
			this.myChart.resize();
		}

		//document.addEventListener('resize',this.test());

	}


	updated(changedProperties) {

		if(this.myChart === null) {
			this.makeGraph();
		}

		if (this.myChart) {
			if (this.myChart.width === 0) {
				//console.log("updated(): chart is no visible!");
				this.myChart.resize();
			}
		}

		changedProperties.forEach((oldValue, propName) => {

			// wanneer de kaart configuratie veranderd, zal _config veranderen
			if (propName == "_config") {
				this.makeGraph();
			}

			// wanneer data veranderd, zal hass veranderen
			if (propName == "hass") {
				if (typeof oldValue != 'undefined') {
					// when using single entity
					if (this._config.entity) {
						//console.log(this._config.entity);
						if (this.hass.states[this._config.entity].attributes.data !== oldValue.states[this._config.entity].attributes.data) {
							//console.log("data has changed, lets update")
							this.updateGrafiek()
						}
					}

					//when using multiple entities
					if (this._config.entities) {
						for (const entity of this._config.entities) {
							//console.log(entity)
							if (this.hass.states[entity].attributes.data !== oldValue.states[entity].attributes.data) {
								//  console.log("data has changed, lets update")
								//  console.log(entity)
								this.updateGrafiek()
							}
						}
					}
				}
			}
		});
	}


	makeGraph() {

		if(this.dontMakeGraph == true) {
			return;
		}


		//https://stackoverflow.com/a/35663683/4181822
		function hexify(color) {
			let values = color
				.replace(/rgba?\(/, '')
				.replace(/\)/, '')
				.replace(/[\s+]/g, '')
				.split(',');
			let a = parseFloat(values[3] || 1),
				r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
				g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
				b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
			return "#" +
				("0" + r.toString(16)).slice(-2) +
				("0" + g.toString(16)).slice(-2) +
				("0" + b.toString(16)).slice(-2);
			}

		//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
		const hexToRgb = hex =>
		hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
					,(m, r, g, b) => '#' + r + r + g + g + b + b)
			.substring(1).match(/.{2}/g)
			.map(x => parseInt(x, 16))

		// https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4#gistcomment-3036936
		const percentToHex = (p) => {
			const percent = Math.max(0, Math.min(100, p)); // bound percent from 0 to 100
			const intValue = Math.round(p / 100 * 255); // map percent to nearest integer (0 - 255)
			const hexValue = intValue.toString(16); // get hexadecimal representation
			return hexValue.padStart(2, '0').toUpperCase(); // format with leading 0 and upper case characters
		}

		function convertToHexIfNeeded(color) {
			if(color.includes("#") == false){
				color = hexify(color)
			}
			return color
		}

		let style = getComputedStyle(document.body);
		let primaryColor = convertToHexIfNeeded(style.getPropertyValue('--primary-color'));
		let accentColor = convertToHexIfNeeded(style.getPropertyValue('--accent-color'));
		let primaryTextColor = convertToHexIfNeeded(style.getPropertyValue('--primary-text-color'));
		let secondaryTextColor = convertToHexIfNeeded(style.getPropertyValue('--secondary-text-color'));



		// verwijder de kaart
		if(this.myChart) {

			this.myChart=null;
			this.renderRoot.getElementById("neerslagChart").remove();
			let canvas = document.createElement('canvas');
			canvas.setAttribute('id','neerslagChart');
			this.renderRoot.getElementById("neerslagChartContainer").appendChild(canvas)
		}


		if (!this.myChart) {

			let ctx;
			if (this.shadowRoot) {
				ctx = this.shadowRoot.getElementById("neerslagChart").getContext('2d');
			}
			// this.myChart.options.transitions.active.animation.duration = 0

			this.myChart = new Chart(ctx, {
				type: 'line',
				options: {
					backgroundColor: [
						primaryColor.replace(' ','')+percentToHex(20)
					],
					borderColor: [
						primaryColor
					],
					scales: {
						y: {
							ticks:{color: secondaryTextColor,},
							beginAtZero: true,
							title: {
								display: true,
								text: this.localize('regenMmUur'),
								color: primaryTextColor,
							},
							suggestedMax: this.zoomwaarde,
							suggestedMin: 0.0,
							beginAtZero: true,
							stepSize: 10,

						},
						x: {
							ticks:{color: secondaryTextColor,},
							title: {
								display: true,
								text: this.localize('regenvalVoorspelling'),
								color: primaryTextColor,
							},
						}
					},
					animation: false,
					// animation: { easing: 'easeOutCirc', duration: 500},
					interaction: {
						intersect: false,
						mode: 'index',
					},
					borderWidth: 2,
					tension: 0.4,
					pointRadius: 0,
					spanGaps: true,
					fill: true,

					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							displayColors: false, //disable color boxes/legend
							callbacks: {
								label: function (context) {

									let label = context.dataset.label || '';

									if (label) {
										label += ': ';
									}
									if (context.parsed.y !== null) {
										label += context.parsed.y + " mm/u";
									}
									return label;
								},

							}
						},


						annotation: {
							annotations: {
								lineZwaar: {
									type: 'line',
									yMin: 5,
									yMax: 5,
									borderColor: 'grey', //'rgb(255, 99, 132)',
									borderWidth: 1,
									label: {
										enabled: true,
										content: this.localize('zwaar'),
										position: 'end',
										font: { size: 10 },
										xPadding: 3,
										yPadding: 3,
										yAdjust: 10,
									}
								},
								lineMatig: {
									type: 'line',
									yMin: 2,
									yMax: 2,
									borderColor: 'grey', //'rgb(255, 99, 132)',
									borderWidth: 1,
									label: {
										enabled: true,
										content: this.localize('matig'),
										position: 'end',
										font: { size: 10 },
										xPadding: 3,
										yPadding: 3,
										yAdjust: -11,
									}
								},
								lineLicht: {
									type: 'line',
									yMin: 0.4,
									yMax: 0.4,
									borderColor: 'grey', //'rgb(255, 99, 132)',
									borderWidth: 1,
									label: {
										enabled: true,
										content: this.localize('licht'),
										position: 'end',
										font: { size: 10 },
										xPadding: 3,
										yPadding: 3,
										yAdjust: -11,
									}
								},
							}
						},
					},
				},

				plugins: [{
					beforeDraw: chart => {
						if (chart.tooltip?._active?.length) {
							let x = chart.tooltip._active[0].element.x;
							let yAxis = chart.scales.y;
							let ctx = chart.ctx;
							ctx.save();
							ctx.beginPath();
							ctx.moveTo(x, yAxis.top);
							ctx.lineTo(x, yAxis.bottom);
							ctx.lineWidth = 1;
							ctx.strokeStyle = 'rgba(190, 190, 190, 1)'; //rgba(0, 0, 255, 0.4)
							ctx.stroke();
							ctx.restore();
						}
					}
				}],
				data: {
					labels: this.prepareChartDataSets().getChartsDataAlsArray()[0][0],
					datasets: this.prepareChartDataSets().getChartDatasets()

				},
			});
		}
	}



	/**
	 *
	 * @param {*} data = array
	 * @param {*} vlabel = defineer de label van de dataset (NAAM)
	 */
	generateDatasetObject(data, vlabel = "Regen") {

		// entities in card moet object worden
		// dan is het - entity:
		// https://www.home-assistant.io/lovelace/entities/
		// waardoor je zelf de naam kan opgeven

		if (vlabel.includes("arm")) {
			vlabel = "Buienalarm";
		}
		if (vlabel.includes("dar")) {
			vlabel = "Buienradar";
		}

		return {
			label: vlabel,
			data: data,
			// backgroundColor: [
			// 	'rgba(89, 160, 238, 0.2)'
			// ],
			// borderColor: [
			// 	'rgba(89, 160, 238, 1)'
			// ],
			// borderWidth: 2
		}
	}

	//sync buienradar en buienalarm
	//beide zijn objecten dus wanneer deze worden aangepast, dan wijzigt het ook meteen
	combineTwoArray(array1, array2) {

		// fix - if only 1 entity is used
		if(!array1 || !array2) {
			return;
		}

		//console.log(array1[0])
		//console.log(array2[0])

		if (!array2[0] || !array1[0]) {
			return;
		}

		/**
		 * wanneer buienalarm achterloopt in zijn geheel
		 * werkt het onderstaande prima
		 */

		// fix dataset van array 2
		for (const data of array1[0]) {
			if (!array2[0].includes(data)) {
				// console.log("1 waarde niet gevonden: " + data);

				let index = array1[0].indexOf(data)
				// console.log("1 waarde heeft index: " + index);
				// console.log(array2[0])

				array2[0].splice(index, 0, array1[0][index])
				array2[1].splice(index, 0, '0')
			}
		}

		// geen idee of dit gaat werken
		// fix dataset van array 1
		for (const data of array2[0]) {
			if (!array1[0].includes(data)) {
				// console.log("2 waarde niet gevonden: " + data);

				let index = array2[0].indexOf(data)
				// console.log("2 waarde heeft index: " + index);
				// console.log(array1[0])

				array1[0].splice(index, 0, array2[0][index])
				array1[1].splice(index, 0, '0')
			}
		}
	}

	/**
	 * Make modifications to active objects.
	 * Does not return a value, but activily modifies values
	 */
	prepareChartDataSets() {

		let chartData
		let chartsDataAlsArray = []
		let chartDatasets = []
		if (this._config.entity) {
			if (this.hass.states[this._config.entity].attributes.data) {
				chartData = this.prepareData(this.hass.states[this._config.entity].attributes.data, this._config.entity);
				chartsDataAlsArray.push(chartData);
				chartDatasets.push(this.generateDatasetObject(chartData[1]))
			}
		} else {
			for (const entity of this._config.entities) {
				chartData = this.prepareData(this.hass.states[entity].attributes.data, entity);

				// potential fix for when one of the services does not contain data
				// the dataset becomes invalid and the graph doesnt load correctly
				if( chartData.length > 0 ) {
					chartsDataAlsArray.push(chartData);
					chartDatasets.push(this.generateDatasetObject(chartData[1], entity))
				}
			}

			this.combineTwoArray(chartsDataAlsArray[0], chartsDataAlsArray[1]);
		}

		return {
			getChartsDataAlsArray : function() {
				return chartsDataAlsArray;
			},
			getChartDatasets : function() {
				return chartDatasets;
			}

		}
	}

	prepareData(data, entity) {

		//console.log(this._config.entity);
		if (!data || data.length === 0) {
			return html``;
		}

		// data can be buienalarm or buienradar
		if (entity == "sensor.neerslag_buienradar_regen_data") {
			return this.formatBuienradarData(data);
		}

		if (entity == "sensor.neerslag_buienalarm_regen_data_oud") {
			return this.formatBuienalarmData(data);
		}

		if (entity == "sensor.neerslag_buienalarm_regen_data") {
			return this.formatBuienalarmDataAndere(data);
		}
	}

	/**
	 * Op basis van gpsgadget.buienradar.nl/data/raintext
	 * 	params: 	lat
	 * 				long
	 *
	 * @param {string} data text blob
	 * 			- each entry on a new line
	 * 			- format per new line: 000|00:00
	 * @return 	- data[0] = array[value, value] = time
	 * 		   	- data[1] = array[value, value] = preciption
	 */
	formatBuienradarData(data) {
		const dataArray = data.trim().split(' ');

		let tijd = [];
		let rain = [];

		for (const defaultElement of dataArray) {

			let num = Math.pow(10, ((parseInt(defaultElement.split('|')[0] - 109) / 32)));
			let value = Math.round(num * 100) / 100

			rain.push(value); // regen
			tijd.push(defaultElement.split('|')[1]); // tijd
		}

		let returnData = [];
		returnData[0] = tijd;
		returnData[1] = rain;
		return returnData
	}

	/*
	* Op basis van www.buienalarm.nl/api/weather/splash?
	*/
	formatBuienalarmData(data) {

		// https://www.w3schools.com/jsref/jsref_getHours.asp
		// Met JavaScript Date naar uren/minuten getallen kleiner dan 10 zijn 1 decimaal
		function addZero(i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}

		let rain = [];
		let tijd = []

		//rain
		data.forEach(function (item, index) {
			rain.push(item.rain)
		});

		//tijd
		data.forEach(function (item, index) {
			let d = new Date(item.date);
			tijd.push(addZero(d.getHours()) + ":" + addZero(d.getMinutes()));
		});



		let returnData = [];
		returnData[0] = tijd;
		returnData[1] = rain;

		return returnData
	}

	/*
	* Op basis van https://cdn-secure.buienalarm.nl/api/3.4/forecast.php
	*/
	formatBuienalarmDataAndere(data) {

		// https://www.w3schools.com/jsref/jsref_getHours.asp
		// Met JavaScript Date naar uren/minuten getallen kleiner dan 10 zijn 1 decimaal
		function addZero(i) {
			if (i < 10) {
				i = "0" + i;
			}
			return i;
		}

		// console.log(data)
		let tijd = []
		let rain = [];

		data.precip.forEach(function (item, index) {
			rain.push(parseFloat(Math.pow(10, (item - 109) / 32)).toFixed(2));
		});


		data.precip.forEach(function (item, index) {
			let nieuweWaarde = index * data.delta
			let nieuweTimestamp = data.start + nieuweWaarde
			let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
			d.setUTCSeconds(nieuweTimestamp);
			tijd.push(addZero(d.getHours()) + ":" + addZero(d.getMinutes()));
		});

		// console.log(tijd)
		// console.log(rain);

		let returnData = [];
		returnData[0] = tijd;
		returnData[1] = rain;

		return returnData
	}

	updateGrafiek() {

		let chartData
		let chartsDataAlsArray = []
		let chartDatasets = []

		if (this.dontMakeGraph === true) {
			console.log('updateGrafiek - dontMakeGraph')
			return;
		}
		this.myChart.data.labels = this.prepareChartDataSets().getChartsDataAlsArray()[0][0];
		this.myChart.data.datasets = this.prepareChartDataSets().getChartDatasets();
		this.myChart.update();
	}
}

// customElements.define("combi-card-editor", CombiCardEditor);
customElements.define('neerslag-card', CombiCard);

window.customCards = window.customCards || [];
window.customCards.push({
	type: "neerslag-card", //name of the card
	name: "Neerslag Card",
	preview: true, // Optional - defaults to false
	description: "Display rain forecast using BuienAlarm and/or BuienRadar data." // Optional
});

console.info(
	`%c NEERSLAG-CARD %c 2024.05.05.0`,
	"Color: white; font-weight: bold; background: red;",
	""
);
