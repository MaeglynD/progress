import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8081';

Vue.config.productionTip = false

new Vue({
	render: h => h(App),
	vuetify
}).$mount('#app')
