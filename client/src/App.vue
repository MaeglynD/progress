<template>
	<v-app>

		<!-- REF: NAVBAR -->
		<div class="l-navbar">
			<div class="l-logo">
				<v-icon size="28">mdi-graph</v-icon>
			</div>
			<v-tooltip 
				class="b-tooltip"
				right
				transition="slide-x-reverse-transition"
				v-for="(x, i) in navbar"
				:key="i"
				color="#242424"
				nudge-right="10"
			>
				<template v-slot:activator="{ on }">
					<div 
						class="l-tile"
						v-on="on"
						@click="x.method" 
						v-ripple
					>
						<v-icon 
							size="22" 
							color="#e6e6e6"
						>
							mdi-{{x.icon}}
						</v-icon>
					</div>
				</template>
				<span>
					{{ x.text }}
				</span>
			</v-tooltip>
		</div>
		<!-- END: NAVBAR -->

		<!-- REF: MAIN -->
		<div class="l-main">
			<grid-layout
				class="l-grid-layout"
				:layout.sync="grid_layout"
				:col-num="30"
				:row-height="20"
				:is-draggable="true"
				:is-resizable="true"
				:is-mirrored="false"
				:vertical-compact="true"
				:margin="[20, 20]"
				:use-css-transforms="true"
				@layout-ready="grid_resize_all_charts()" 
			>
				<grid-item 
					class="l-grid-item elevation-10"
					v-for="(item, i) in grid_layout"
					:x="item.x"
					:y="item.y"
					:w="item.w"
					:h="item.h"
					:i="item.i"
					:key="item.i"
					@resized="
						grid_resize_chart(item.i),
						grid_save()
					"
					@moved="grid_save()"
				>
					<div class="l-chart-container">
						<div class="l-sub">
							{{ item.Name ? item.Name : `Analytic ${item.i + 1}` }}
							<div class="l-grid-item-edit">
								<v-menu 
									offset-y
									:nudge-top="30"
								>
									<template v-slot:activator="{ on, attrs }">
										<v-btn
											v-bind="attrs"
											dark
											icon
											v-on="on"
											small
										>
											<v-icon size="20">
												mdi-dots-vertical
											</v-icon>
										</v-btn>
									</template>
									<v-list>
										<v-list-item @click="grid_edit_item(item)">
											<v-list-item-title class="subtitle-2">
												Edit item
											</v-list-item-title>
										</v-list-item>
										<v-list-item @click="grid_delete_item(i)">
											<v-list-item-title class="subtitle-2">
												Delete item
											</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</div>
						<Chart 
							class="l-highcharts" 
							:options="item.chart"
							:ref="`chart${item.i}`"
						/>
					</div>
				</grid-item>
			</grid-layout>
		</div>
		<!-- END: MAIN -->

		<!-- REF: SNACKBAR -->
		<v-snackbar
			v-model="snackbar"
			color="#242424"
			top
			right
		>
			{{ snackbar_text }}
		</v-snackbar>
		<!-- END: SNACKBAR -->

		<!-- REF: SHEET_DATASETS -->
		<v-bottom-sheet 
			content-class="l-sheet-container" 
			v-model="sheet_datasets" 
			inset
			persistent
		>
			<v-sheet class="l-sheet">
				<v-progress-linear
					v-show="datasets_loading"
					color="white"
					class="l-sheet-loading"
					indeterminate
					rounded
					height="2"
				/>
				<div class="l-line"></div>
				<div class="l-sheet-title">
					Datasets
				</div>
				<div class="l-sheet-inner">
					<div class="l-flex">
						<v-text-field
							class="l-search"
							v-model="datasets_search"
							label="Search"
							dark
							prepend-inner-icon="mdi-magnify"
							solo-inverted
							hide-details
							:disabled="datasets_loading"
						/>
					</div>
					<div class="l-datasets-list">
						<v-form
							ref="datasets_sheet_add_form"
							v-model="datasets_sheet_add_form"
							class="l-datasets-list-row l-add"
							:disabled="datasets_loading"
							:style="{ 
								opacity: Object.values(datasets_add_set)
									.some((x) => !!x) ? 1 : 0.5 
							}"
						>
							<v-text-field
								v-bind="datasets_defaults"
								label="Workout"
								v-model="datasets_add_set['Workout']"
							/>
							<v-select
								v-bind="datasets_defaults"
								:items="datasets_select_y"
								label="Y Axis"
								v-model="datasets_add_set['Y Axis']"
							/>
							<v-select
								v-bind="datasets_defaults"
								:items="datasets_select_x"
								label="X Axis"
								v-model="datasets_add_set['X Axis']"
							/>
							<v-text-field
								v-bind="datasets_defaults"
								label="Weight"
								v-model.number="datasets_add_set['Weight']"
								type="number"
							/>
							<v-btn
								class="l-datasets-edit mr-1 ml-3"
								icon
								:disabled="!datasets_sheet_add_form || datasets_loading"
								@click="datasets_edit_save"
							>
								<v-icon 
									color="#e6e6e6"
									size="16"
								>
									mdi-check
								</v-icon>
							</v-btn>
							<v-btn
								class="l-datasets-edit"
								icon
								@click="datasets_edit_cancel"
								:disabled="datasets_loading"
							>
								<v-icon 
									color="#e6e6e6"
									size="16"
								>
									mdi-close
								</v-icon>
							</v-btn>
						</v-form>
						<v-form
							ref="datasets_sheet_form"
							v-model="datasets_sheet_form"
							:disabled="datasets_loading"
						>
							<div 
								class="l-datasets-list-row" 
								v-for="(x, i) in datasets_virtual.filter((x) => 
										x.Workout.toLowerCase().includes(
											datasets_search.toLowerCase()
										)
									)
								.sort((a, b) => a.Workout.localeCompare(b.Workout))"
								:key="`row-${i}`"
							>
								<v-text-field
									v-bind="datasets_defaults"
									label="Workout"
									v-model="x['Workout']"
								/>
								<v-select
									v-bind="datasets_defaults"
									:items="datasets_select_y"
									label="Y Axis"
									v-model="x['Y Axis']"
								/>
								<v-select
									v-bind="datasets_defaults"
									:items="datasets_select_x"
									label="X Axis"
									v-model="x['X Axis']"
								/>
								<v-text-field
									v-bind="datasets_defaults"
									label="Weight"
									v-model.number="x['Weight']"
									type="number"
								/>
								<v-btn
									class="l-datasets-edit mr-1 ml-3"
									@click="datasets_view_data(x)"
									:disabled="datasets_loading"
									icon
								>
									<v-icon 
										color="#e6e6e6"
										size="16"
									>
										mdi-database-search
									</v-icon>
								</v-btn>
								<v-btn
									class="l-datasets-edit"
									:disabled="datasets_loading"
									@click="
										(datasets_delete_temp = non_reactive(x)),
										(dialog_datasets_confirm = true)
									"
									icon
								>
									<v-icon 
										color="#e6e6e6"
										size="16"
									>
										mdi-delete
									</v-icon>
								</v-btn>
							</div>
						</v-form>
					</div>
				</div>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="#f24069"
						text
						@click="sheet_datasets = false"
						:disabled="datasets_loading"
					>
						cancel
					</v-btn>
		
					<v-btn
						color="#f24069"
						text
						:disabled="!datasets_sheet_form"
						@click="datasets_save()"
						:loading="datasets_loading"
					>
						save
					</v-btn>
				</v-card-actions>
			</v-sheet>
		</v-bottom-sheet>
		<!-- END: SHEET_DATASETS -->

		<!-- REF: SHEET_ANALYTICS -->
		<v-bottom-sheet 
			content-class="l-sheet-container" 
			v-model="sheet_analytics" 
			inset
			persistent
		>
			<v-sheet class="l-sheet l-analytics-sheet">
				<v-text-field
					class="l-analytics-title"
					v-model="analytics_temp.Name"
					v-if="sheet_analytics"
					counter="50"
					single-line
					label="Chart name"
					height="38"
					maxlength="50"
				/>
				<div class="l-analytics-content">
					<div class="l-analytics-a">
						<div class="l-analytics-sub">
							Datasets
						</div>
						<div 
							class="l-analytics-a-inner"
							v-if="sheet_analytics"
						>
							<div 
								class="l-analytic"
								v-for="(x, i) in analytics_temp.config"
								:key="`analytic-${i}`"
							>
								<template v-if="x.Edit">
									<div class="l-point">
										{{ datasets[i].Workout }}
										<div class="l-edit-controls">
											<v-btn 
												icon
												color="#e6e6e6"
												@click="analytics_edit_close(i)"
											>
												<v-icon size="14">mdi-close</v-icon>
											</v-btn>
											<v-btn 
												icon
												color="#e6e6e6"
												@click="analytics_edit_save(i)"
											>
												<v-icon size="14">mdi-check</v-icon>
											</v-btn>
										</div>
									</div>
									<v-select
										class="l-edit-input a"
										:items="analytics_select_charts"
										label="Chart Type"
										outlined
										v-model="analytics_temp.unsaved[i].Chart"
										hide-details
									/>
									<v-select
										class="l-edit-input"
										:items="analytics_select_visibility"
										label="Axis Visibility"
										outlined
										v-model="analytics_temp.unsaved[i].Visible"
										hide-details
									/>
									<v-color-picker 
										class="l-edit-input"
										v-model="analytics_temp.unsaved[i].Color"
										flat
										hide-canvas
										hide-inputs
									/>
								</template>
								<template v-else>
									<div class="l-point">
										{{ datasets[i].Workout }}
										<v-btn 
											class="l-edit"
											icon
											color="#e6e6e6"
											@click="analytics_edit_open(i)"
										>
											<v-icon size="14">mdi-pencil</v-icon>
										</v-btn>
									</div>
									<div class="l-point">
										{{ x.Chart }}
									</div>
									<div class="l-point">
										{{ x.Visible }}
									</div>
									<div 
										class="l-point" 
										:style="{ color: x.Color }"
									>
										{{ x.Color }}
									</div>
									<v-checkbox 
										class="l-checkbox ma-0 pa-0"
										v-model="x.Value"
										color="#f24069"
										@change="analytics_update_preview()"
										hide-details
									/>
								</template>
							</div>
						</div>
					</div>
					<div class="l-analytics-b">
						<div class="l-analytics-sub">
							Preview
						</div>
						<div class="l-analytics-chart-container">
							<Chart 
								class="l-highcharts" 
								:options="default_options" 
							/>
						</div>
					</div>
				</div>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="#f24069"
						text
						@click="(sheet_analytics = false), (active_grid_item_edit = null)"
					>
						cancel
					</v-btn>
		
					<v-btn
						color="#f24069"
						text
						@click="analytics_save()"
					>
						save
					</v-btn>
				</v-card-actions>
			</v-sheet>
		</v-bottom-sheet>
		<!-- END: SHEET_ANALYTICS -->

		<!-- REF: DIALOG_DATASETS -->
		<v-dialog
			content-class="l-dialog-datasets"
			v-model="dialog_datasets"
			persistent
			transition="dialog-transition"
			overlay-opacity="0.7"
			overlay-color="black"
		>
			<v-card v-if="dialog_datasets">
				<div class="l-datasets-inner-dialog">
					<div class="l-datasets-data">
						<div class="l-datasets-data-display">
							<div 
								class="l-row"
								v-for="(x, i) in datasets_temp.Data"
								:key="`record-${i}`"
							>
								{ y: 
								<span class="l-a">
									{{ x.y }}
								</span> 
								}
								<span class="l-b"></span>
								{ x: 
								<span class="l-c">
									{{  datasets_temp.datepicker_dates[i] }}
								</span> 
								}
								<v-btn 
									color="#e6e6e6"
									x-small
									icon
									@click="datasets_delete_row(i)"
								>
									<v-icon size="14">mdi-delete</v-icon>
								</v-btn>
							</div>
						</div>
						<div class="l-datasets-data-inputs">
							<div>
								<v-text-field
									class="l-a"
									v-model="datasets_temp.y"
									:label="datasets_temp['Y Axis']"
									outlined
									dense
									hide-details
								/>
								<v-menu
									content-class="l-datasets-menu-dialog"
									v-model="datasets_menu_dialog"
									:close-on-content-click="false"
									:nudge-top="40"
									transition="scale-transition"
									offset-y
									min-width="290px"
								>
									<template v-slot:activator="{ on, attrs }">
										<v-text-field
											class="mt-3"
											v-model="datasets_temp.x"
											:label="datasets_temp['X Axis']"
											outlined
											dense
											readonly
											v-bind="attrs"
											v-on="on"
											hide-details
										/>
									</template>
									<v-date-picker
										v-model="datasets_temp.x"
										no-title
										@input="datasets_menu_dialog = false"
									/>
								</v-menu>
							</div>
							<v-btn
								class="l-datasets-input-add"
								color="rgba(255, 255, 255, 0.1)"
								@click="datasets_add_row()"
								:disabled="!datasets_temp.x || !datasets_temp.y"
							>	
								<v-icon>mdi-plus</v-icon>
							</v-btn>
						</div>
					</div>
					<v-date-picker
						class="l-datasets-datepicker"
						v-model="datasets_temp.datepicker_dates"
						multiple
						dark
						color="#151515"
						readonly
						:selected-items-text="`${datasets_temp.Data.length} Records`"
						flat
					/>
				</div>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="#f24069"
						text
						@click="datasets_dialog_cancel()"
					>
						cancel
					</v-btn>
		
					<v-btn
						color="#f24069"
						text
						@click="datasets_dialog_save()"
					>
						save
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- END: DIALOG_DATASETS -->

		<!-- REF: DIALOG_CONFIRM -->
		<v-dialog
			v-model="dialog_datasets_confirm"
			max-width="300"
		>
			<v-card>
				<v-card-title v-if="dialog_datasets_confirm">
					Are you sure you want to delete dataset '{{ datasets_delete_temp.Workout }}'
				</v-card-title>
				<v-card-text>
					This delete is permanent and will only be staged upon clicking 'Agree' and then 'Save'
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="#f24069"
						text
						@click="dialog_datasets_confirm = false"
					>
						cancel
					</v-btn>
					<v-btn
						color="#f24069"
						text
						@click="datasets_delete_data()"
					>
						confirm	
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- END: DIALOG_CONFIRM -->

	</v-app>
</template>

<script>
/* eslint-disable no-console */

import axios from 'axios';
// Highcharts chart component 
import { Chart } from 'highcharts-vue';
// Grid layout and grid item
import { GridLayout, GridItem } from 'vue-grid-layout';
// The default options for all charts
import default_options from './components/default_options';
// Selection options, default colors, various utilities
import utils from './components/utils';


export default {

	components: {
		Chart,
		GridLayout,
		GridItem,
	},

	data() {
		return {
			...utils,
			default_options,
			active_grid_item_edit: null,
			snackbar: false,
			sheet_datasets: false,
			sheet_analytics: false,
			dialog_datasets: false,
			dialog_datasets_confirm: false,
			datasets_menu_dialog: false,
			datasets_loading: false,
			datasets_sheet_form: true,
			datasets_sheet_add_form: true,
			default_analytics_config: null,
			datasets_temp: null,
			datasets_delete_temp: null,
			snackbar_text: '',
			datasets_search: '',
			analytics_temp: {
				Name: '',
				config: null,
				unsaved: [],
			},
			datasets_defaults: {
				'outlined': true,
				'autocomplete': 'new-password',
				'hide-details': true,
				'rules': [
					(v) => v == 0 ? true : !!v || 'Required',
				],
			},
			datasets_add_set: {
				'Data': []
			},
			navbar: [
				{ icon: 'chart-box-plus-outline', text: 'Add analytics', method: this.analytics_open },
				{ icon: 'database-plus', text: 'Add a dataset', method: this.datasets_open },
				{ icon: 'sort', text: 'Sort graphs', method: this.grid_resize_all_charts },
			],
			grid_layout: [],
			datasets_virtual: [],
			datasets: []
			
		}
	},

	created() {
		//
	},

	mounted() {
		// Initialise
		this.requests_get_datasets();
	},

	methods: {

		// Takes an array of configs (cfg). Creates chart
		// options (src) based on said array
		update_config(cfg, src) {
			// Any pre-existing data is removed
			src.series = [];
			src.yAxis = [];

			// Filter based on what the user's selected
			cfg = cfg.filter((x) => x.Value);
			
			cfg.forEach((x, i) => {
				// Find correlating data
				const data = this.datasets.find((y) => x.id == y.id);

				// Extra measure incase the data has been deleted
				// but the config hasn't updated (shouldn't happen)
				if (!data) return;

				const series = {
					name: data['Workout'],
					// Chart type
					type:  x.Chart.toLowerCase(),
					// Y axis refrence
					yAxis: i,
					// Add the data
					data: data.Data,
					// Add default stylings 
					...this.analytics_default_stylings(x, cfg.length > 1),
				}

				if (x.Chart === 'Pie (v > 0)') {
					series.type = 'pie';
					const present = series.data.filter(({ y }) => y > 0);

					series.tooltip = {
						headerFormat: '<span style="font-size: 10px">{series.name}</span><br/>',
						pointFormat: '<span style="color:{point.color}">●</span> {point.name}: <b>{point.y}</b><br/>',
					},

					series.data = [
						{ 
							name: `${data['Workout']} succeeded`,
							y: present.length,
							color: '#90ee7e',
						},
						{ 
							name: `${data['Workout']} failed`, 
							y: series.data.length - present.length,
							color: '#f45b5b',
						}
					]
				}

				// Add a Y axis for the series to refrence
				src.yAxis.push({
					title: data['Workout'],
					opposite: i !== 0,
					visible: x.Visible === "Visible"
				});

				// Add series
				src.series.push(series)
			});
		},

		// Displays a snackbar with err contents
		handle_err(err) {
			// Show error in snackbar
			this.snackbar = true;
			this.snackbar_text = err ?? 'Something went wrong'; 
		},

		// Returns non-vue-reactive data
		non_reactive(x) {
			return JSON.parse(JSON.stringify(x));
		},

		// Hex to rgba, used for graph colors
		hex_to_rgba(c, opacity) {
			return `rgba(${c.substr(1).match(/../g).map(x=>+`0x${x}`)}, ${opacity})`;
		},

		// 'Create a new chart', cycles through datasets and
		// assigns them default config's for graph usage
		analytics_open() {
			// Prepare 'Datasets' list for viewing and editting
			const datasets = this.datasets.map(({ id }, i) => {
				
				// If there editting a grid item, check for a pre-existing cfg
				if (this.active_grid_item_edit) {
					const found = this.active_grid_item_edit.config
						.find((x) => x.id == id);
					
					if (found) return found
				}

				// Else prepare / return default values
				return {
					Edit: false,
					Value: i === 0,
					Chart: this.analytics_select_charts[
						i - ~~ (i / this.analytics_select_charts.length) *
						this.analytics_select_charts.length
					],
					Visible: 'Invisible',
					Color: this.default_colors[
						i - ~~ (i / this.default_colors.length) * 
						this.default_colors.length
					],
					id
				}
			});

			this.analytics_temp.Name = this.active_grid_item_edit?.Name ?? '';
			this.analytics_temp.config = this.non_reactive(datasets);
			this.analytics_temp.unsaved = this.non_reactive(datasets);
			
			this.analytics_update_preview();
			this.sheet_analytics = true;
		},

		// Adds the newly created chart to the grid layout
		analytics_save() {
			const chart = this.non_reactive(this.default_options);
			const { config, Name } = this.analytics_temp;

			// If they're editting a grid item
			if (this.active_grid_item_edit) {
				// Find the item, change cfg and chart accordingly
				let index = this.grid_layout.findIndex((x) => 
					x.i == this.active_grid_item_edit.i
				);
				
				this.$set(this.grid_layout, index, this.non_reactive({
					...this.grid_layout[index],
					chart,
					config,
					Name
				}));

				this.grid_save();
			} else {
				// Else create a new item and add it to the grid
				this.grid_add_item(chart, config, Name);
			}
			
			this.active_grid_item_edit = null;
			this.sheet_analytics = false;
		},

		// Allows user to edit a given config (i)
		analytics_edit_open(i) {
			this.$set(this.analytics_temp.config[i], 'Edit', true);
		},

		// Cancels the editting of a given config (i)
		analytics_edit_close(i) {
			this.$set(this.analytics_temp.config[i], 'Edit', false);

			this.$set(this.analytics_temp.unsaved, i, this.non_reactive(
				this.analytics_temp.config[i]
			));
		},

		// Saves the editted given config (i)
		analytics_edit_save(i) {
			this.$set(this.analytics_temp.config, i, {
				...this.non_reactive(this.analytics_temp.unsaved[i]),
				Value: this.analytics_temp.config[i].Value,
				Edit: false,
			});

			this.analytics_update_preview();
		},

		// Updates the 'preview graph'
		analytics_update_preview() {
			this.update_config(
				this.analytics_temp.config,
				this.default_options
			);
		},

		// Deals with any styiling configuration the
		// graphs require
		analytics_default_stylings(x, multiple) {
			let styles = {
				lineWidth: 4,
				color: x.Chart === 'Column' ? 
					this.hex_to_rgba(x.Color, 0.1) :
					x.Color,
				borderColor: x.Color,
				borderWidth: 2,
			};

			// If there are multiple datasets
			if (multiple) {
				if (x.Chart === 'Pie') {
					styles.center = ['90%', '20%'];
					styles.size = 100;
				}
			}
			
			return styles;
		},

		// Returns a temporary Id for the interim of editting datasets
		datasets_get_temp_id() {
			// Get array of ids
			const ids = this.datasets_virtual.map((x) => x.id);
			// Return a 'max' placeholder value
			return Math.max(...(ids.length ? ids : [0])) * 100000;
		},

		// Save a new row to datasets (to be staged upon secondary save)
		datasets_edit_save() {
			this.datasets_virtual.push({
				...this.datasets_add_set,
				id: this.datasets_get_temp_id(), 
			})

			this.datasets_edit_cancel();
		},

		// Resets 'add a row' inputs
		datasets_edit_cancel() {
			this.datasets_add_set = {
				...this.non_reactive(
					this.dataset_template
				),
				id: this.datasets_get_temp_id(),
			}

			this.$refs.datasets_sheet_add_form.reset();
		},

		// Validates if 'add row' inputs are valid
		datasets_sheet_validate() {
			this.$refs.datasets_sheet_validate.validate();
		},

		// Opens the datasets sheet
		datasets_open() {
			this.datasets_virtual = this.non_reactive(this.datasets);
			this.sheet_datasets = true
		},

		// Saves any changes made to the datasets
		async datasets_save() {
			// Add loading bar
			this.datasets_loading = true;
			// Errors will be appended to this string
			let error_batch = '';
			// Current crud action
			let action = 'Create';
			// Ids present pre-editting
			const pre_ids = this.datasets.map((x) => x.id);
			// Ids present post editting
			const post_ids = this.datasets_virtual.map((x) => x.id);
			// Lambda for the network requests
			const request_lambda = async (x) => {
				await axios
					.post(`/Post${action}Dataset`, {
						...x,
						Data: JSON.stringify(x.Data),
					})
					.catch((err) => 
						error_batch + `\n${err}`
					)
			};

			// Add array
			const Add = this.datasets_virtual.filter((x) => 
				!pre_ids.includes(x.id)
			);
			// Update array
			const Update = this.datasets_virtual.filter((x) => 
				pre_ids.includes(x.id) && 
				JSON.stringify(x) !== JSON.stringify(
					this.datasets
						.find((y) => 
							y.id == x.id
						)
				)
			)
			// Delete array
			const Delete = this.datasets.filter((x) => 
				!post_ids.includes(x.id)
			);

			// ADD 
			for (const a of Add) await request_lambda(a);
			
			action = 'Update';
			
			// UPDATE 
			for (const a of Update) await request_lambda(a);

			action = 'Delete';

			// DELETE
			for (const a of Delete) await request_lambda(a);

			// Report any errors found
			if (error_batch.length) this.handle_err(error_batch);

			await this.requests_get_datasets();
			this.datasets_loading = false;
			this.sheet_datasets = false;
		},

		// Views the data of a given dataset (i)
		datasets_view_data(x) {
			const selected = this.non_reactive(x);

			this.datasets_temp = {
				...selected,
				// Has a previous data point? Use that!
				y: selected.Data[0]?.y ?? '0',
				// Todays date
				x: (new Date()).toISOString().substr(0, 10),
				// Add currently recorded dates to the calendar
				datepicker_dates: selected.Data.map((x) => 
					// Format for vuetify's datepicker
					(new Date(x.x)).toISOString().substr(0, 10)
				),
			}

			this.dialog_datasets = true;
			
		},

		// After confirmation, deletes a dataset
		datasets_delete_data() {
			this.dialog_datasets_confirm = false;
			this.datasets_virtual.splice(
				this.datasets_virtual.findIndex((x) => 
					x.id == this.datasets_delete_temp.id
				), 1
			);

			this.datasets_delete_temp = null;
			
		},

		// Inside the 'view data' dialog, deletes a row
		datasets_delete_row(i) {
			this.datasets_temp.Data.splice(i, 1);
			this.datasets_temp.datepicker_dates.splice(i, 1);
		},

		// Cancels the 'view data' dialog. No edits made
		datasets_dialog_cancel() {
			this.datasets_temp = null;
			this.dialog_datasets = false;
		},

		// Saves changes made to aformentioned data
		// Will only be staged upon 'Save' of datasets sheet
		datasets_dialog_save() {
			// eslint-disable-next-line no-unused-vars
			const { x, y, datepicker_dates, ...dataset } = this.datasets_temp;
			const index = this.datasets_virtual.findIndex((x) =>
				x.id === dataset.id
			);

			this.datasets_virtual[index] = this.non_reactive(dataset);
			this.datasets_temp = null;
			this.dialog_datasets = false;
		},

		// Adds a row of data to aformentioned data
		datasets_add_row() {
			let { x, y } = this.datasets_temp;
			
			// Calculate average for a set of data
			y = y.toString().split(',').filter((x) => !isNaN(x));
			y = +(y.reduce((a, b) => 
				parseFloat(a) + parseFloat(b), 0) / y.length
			).toFixed(1);
			
			this.datasets_temp.Data.push({ y, x: Date.parse(x) });
			this.datasets_temp.Data.sort((a, b) => a.x - b.x);
			
			this.datasets_temp.datepicker_dates.push(x);
			this.datasets_temp.datepicker_dates.sort();
			this.datasets_temp.x = '';
			this.datasets_temp.y = '';

		},

		// Resize all charts to their respective container
		grid_resize_all_charts() {
			for (const { i } of this.grid_layout) {
				this.grid_resize_chart(i);
			}
		},

		// Resizes a singular chart to their respective container
		grid_resize_chart(i) {
			this.$nextTick(() => 
				this.$refs[`chart${i}`][0].chart.reflow()
			);
		},

		// Adds a grid item to the grid layout.
		// Stores a chart and a config inside said item, ready to
		// save / display as neccessary 
		grid_add_item(chart, config, Name) {
			// Grid layout
			const g = this.grid_layout;

			// A default grid item
			const item = { x: 0, y: 0, w: 10, h: 11, i: 0, chart, config, Name };

			// If there are currently no grid items
			if (!g.length){
				g.push(item);
				this.grid_resize_chart(0);
				this.grid_save()
				return;
			}
			
			// The row we'll be adding the next item to, if possible
			const row = g
				.filter((x) =>
					// Filter by highest 'y' value
					x.y === Math.max(...g.map(z => z.y))
				)
				.sort((a, b) =>
				// Sort to find highest 'x' value
					a.x - b.x
				)
				.pop()
			
			// Space taken up on the last row
			const row_length = (row.x + row.w);

			// Is there space to add our next item on the same row?
			if (row_length > 20) {
				// No space
				g.push({
					...item,
					x: 0,
					y: row.y + 1,
					i: g.length
				})

			} else {
				// Space
				g.push({
					...item,
					x: row_length,
					y: row.y,
					i: g.length
				})
			}

			this.grid_save()
			this.grid_resize_chart(g.length - 1);
		},

		// Delete a grid item
		grid_delete_item(i) {
			this.grid_layout.splice(i, 1);
			this.grid_save();
		},
		
		// Delete a grid item
		grid_edit_item(item) {
			this.active_grid_item_edit = item;
			this.analytics_open();
		},

		// Loads the users 'grid layout' from localstorage
		grid_load() {
			if ('grid' in localStorage) {
				const grid = JSON.parse(localStorage.grid);

				grid.forEach((x) => {
					x.chart = this.non_reactive(this.default_options);
					this.update_config(x.config, x.chart)
				});

				this.grid_layout = grid;
				this.grid_resize_all_charts();
			}
		},

		// Saves the grid layout to localstorage
		grid_save() {
			// eslint-disable-next-line no-unused-vars
			const grid = this.grid_layout.map(({ chart, ...keep }) => keep)
			localStorage.setItem('grid', JSON.stringify(grid));
		},

		async requests_get_datasets() {
			await axios.get('/GetDatasets')
				.then(({ data }) => {
					this.datasets = data.sort((a, b) => 
						a.Workout.localeCompare(b.Workout)
					);
					this.grid_load();
				})
				.catch((err) => {
					this.handle_err(err);
				});
		}
	}
};
</script>

<style lang="scss">
	@import './assets/chart_styles.scss';
	@import './assets/global.scss';
</style>
