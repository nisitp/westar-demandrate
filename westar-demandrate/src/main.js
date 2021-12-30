import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import Container from './Container.vue'
import store from './store'

Vue.config.productionTip = false
Vue.use(VueRouter)

//Look into consolidating these
Vue.filter("round", function (value) {
    return Math.round(value);
});
Vue.filter("roundDec", function (value) {
    value = parseFloat((value * 10).toFixed(11));
    value = (Math.round(value) / 10).toFixed(1);
    return value;
});
Vue.filter("roundCent", function (value) {
    value = parseFloat((value * 100).toFixed(11));
    value = (Math.round(value) / 100).toFixed(2);
    return value;
});
Vue.filter("comma", function (value) {
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
})

const router = new VueRouter({
    mode: 'history',
    routes: [{
        path: '*',
        // Specify the component to be rendered for this route
        component: App,
        // Inject  props based on route.query values (our query parameters!)
		/* VARIABLE NAME: DESCRIPTION                                                               TYPE                              RESTRICTIONS
		 * kwh: Default kWh for slider, changeable by user                                        	int                               Must be within the bounds of kWhMin and kWhMax
		 * kwhMin: Minimum bound of kWh                                                           	int                               Must be < kWhMax; Must be >= 0
		 * kwhMax: Maximum bound of kWh                                                           	int                               Must be greater than kWhMin
		 * kwhRateS: kWh rate during the summer (Peak Efficiency Rate)                            	float                             Must be >= 0
		 * kwhRateS900: kWh rate for first 900 kWh during summer (Standard Residential Rate)       	float                             Must be >= 0
		 * kwhRateSadd: kWh rate for all additional kWh during summer (Standard Residential Rate) 	float                             Must be >= 0
		 * kwhRateW: kWh rate during the winter (Peak Efficiency Rate)                            	float                             Must be >= 0
		 * kwhRateS900: kWh rate for first 900 kWh during winter (Standard Residential Rate)       	float                             Must be >= 0
		 * kwhRateSadd: kWh rate for all additional kWh during winter (Standard Residential Rate) 	float                             Must be >= 0
		 * demand: Default peak demand for slider, changeable by user                             	int                               Must be within the bounds of demandMin and demandMax
		 * demandMin: Minimum bound of peak demand                                                	int                               Must be < demandMax; Must be >= 0
		 * demandMax: Maximum bound of peak demand                                                	int                               Must be > demandMin; Must be < 100
		 * demandRateS: Peak demand rate during the summer                                        	float                             Must be >= 0
		 * demandRateW: Peak demand rate during the winter                                        	float                             Must be >= 0
		 * serviceFee: Baseline service fee that is always added to the end calculation           	float                             Must be >= 0
		 * limitedData: Whether data is limited                                                   	bool                              Must be true or false
		 * additionalFees: Constant average fee added after everything else                       	float                             Must be >= 0
		 * kWhAnnual: Total annual kWh usage of customer, if available                            	int                               Must be >= 0
		 * demandAvg: Average demand usage of customer over past year, if available               	float                             Must be >= 0
		 */
        props: (route) => ({
        	p_kwh: window.westarRatesOptions.kwh,
        	p_kwhMin: window.westarRatesOptions.kwhMin,
        	p_kwhMax: window.westarRatesOptions.kwhMax,
        	p_kwhRateS: window.westarRatesOptions.kwhRateS,
        	p_kwhRateS500: window.westarRatesOptions.kwhRateS500,
        	p_kwhRateS900: window.westarRatesOptions.kwhRateS900,
        	p_kwhRateSadd: window.westarRatesOptions.kwhRateSadd,
        	p_kwhRateW: window.westarRatesOptions.kwhRateW,
            p_kwhRateW500: window.westarRatesOptions.kwhRateW500,
            p_kwhRateW900: window.westarRatesOptions.kwhRateW900,
            p_kwhRateWadd: window.westarRatesOptions.kwhRateWadd,
        	p_demand: window.westarRatesOptions.demand,
        	p_demandMin: window.westarRatesOptions.demandMin,
        	p_demandMax: window.westarRatesOptions.demandMax,
        	p_demandRateS: window.westarRatesOptions.demandRateS,
        	p_demandRateW: window.westarRatesOptions.demandRateW,
            p_serviceFee: window.westarRatesOptions.serviceFee,
            p_limitedData: window.westarRatesOptions.limitedData,
            p_riderCharge: window.westarRatesOptions.riderCharge,
            p_kWhAnnual: window.westarRatesOptions.kWhAnnual,
            p_demandAvg: window.westarRatesOptions.demandAvg,
        })
    }]
});

new Vue({
    router,
    render: h => h(Container)
}).$mount('#app')
