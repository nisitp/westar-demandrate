<template src="./templates/App.html"></template>

<script>
export default {
    name: 'app',
    render: h => h(app),

    props: ['p_serviceFee', 'p_limitedData', 'p_riderCharge',
            'p_kwh', 'p_kwhMin', 'p_kwhMax', 'p_kwhRateS', 'p_kwhRateW',
            'p_kwhRateS900', 'p_kwhRateSadd', 'p_kwhRateW900', 'p_kwhRateWadd',
            'p_demand', 'p_demandMin', 'p_demandMax', 'p_demandRateS', 'p_demandRateW',
            'p_kWhAnnual', 'p_demandAvg'],

    // Default values for variables
    data () {
        return {
            energyUseRange: 184.21052631578948,     // Manages the position of the thumb on the energy use slider
            peakDemandRange: 434.34343434343435,    // Manages the position of the thumb on the peak demand slider

            kwh: 900,               // Default kWh for slider, changeable by user
            kwhMin: 100,            // Minimum bound of kWh
            kwhMax: 2500,           // Maximum bound of kWh
            kwhRateS: 0.04584,      // kWh rate during the summer (Peak Efficiency Rate)
            kwhRateS900: 0.073512,  // kWh rate for first 900 kWh during summer (Standard Residential Rate)
            kwhRateSadd: 0.081088,  // kWh rate for all additional kWh during summer (Standard Residential Rate)
            kwhRateW: 0.04584,      // kWh rate during the winter (Peak Efficiency Rate)
            kwhRateW900: 0.073512,  // kWh rate for first 900 kWh during winter (Standard Residential Rate)
            kwhRateWadd: 0.060089,  // kWh rate for all additional kWh during winter (Standard Residential Rate)

            demand: 6,          // Default peak demand for slider, changeable by user
            demandMin: 1,       // Minimum bound of peak demand
            demandMax: 25,      // Maximum bound of peak demand
            demandRateS: 9,     // Peak demand rate during the summer
            demandRateW: 3,     // Peak demand rate during the winter

            kWhAnnual: 12000,   // Total past annual kWh usage of user
            demandAvg: 6,      // Average past annual peak demand of user

            basicServiceFee: 14.5,      // Baseline service fee that is always added to the end calculation
            limitedData: false,          // Whether data is limited
            riderCharge: 0.04074975,    // Constant average fee added after everything else

            peakDemandOpen: false,  // Whether the peak demand overlay is open or not

            appliances: {       // Controls the state of each appliance in the peak demand overlay
                ac: true,           // Air Conditioning
                ewh: true,          // Electric Water Heater
                dryer: true,        // Dryer
                eo: true,           // Electric Oven
                hd: true,           // Hair Dryer
                micro: true,        // Microwave
                light: true,        // Incandescent Lighting
                iron: true,         // Clothes Iron
                fridge: true,       // Refrigerator
                space: true,        // Space Heater
                wash: true,         // Washing Machine
                tv: true,           // Television
                freezer: true,      // Freezer
                dish: true,         // Dishwasher
                console: true       // Gaming Console/DVR
            },

            energyUseRangeBubble: { display: "block" },   // Object containing number indicator above energy use slider
            peakDemandRangeBubble: { display: "block" },  // Object containing number indicator above peak demand slider
            energyBubble: false,    // Whether the energy use bubble is currently active or not
            demandBubble: false,    // Whether the peak demand bubble is currently active or not

            energyReset: false,     // Toggle for reset button below energy use slider
            demandReset: false,     // Toggle for reset button below peak demand slider
            resetChanged: 0,        // Status variable used to detect whether a slider has changed due to user input or a reset
        }
    },

    // Computed variables are set whenever one of the variables involved changes value
    computed: {
        // energyUse: The kWh used by the customer
        // Manages both the kWh displayed and the position of the thumb on the energy use slider
        energyUse: {
            get() {
                return this.range2val(this.energyUseRange, this.kwhMin, this.kwhMax);
            },
            set(newValue) {
                this.energyUseRange = this.val2range(newValue, this.kwhMin, this.kwhMax);
            }
        },

        // peakDemand: The demand used by the customer
        // Manages both the demand displayed and the position of the thumb on the peak demand slider
        peakDemand: {
            get() {
                return this.peakDemandRange;
            },
            set(newValue) {
                this.peakDemandRange = newValue;
            }
        },

        // resRateS: Standard Residential Rate for Summer
        resRateS() {
            return this.resRate(this.energyUse, this.kwhRateS900, this.kwhRateSadd);
        },

        // resRateW: Standard Residential Rate for Winter
        resRateW() {
            return this.resRate(this.energyUse, this.kwhRateW900, this.kwhRateWadd);
        },

        // resRateW: Standard Residential Rate for Winter
        resRateY() {
            return (this.resRateS * 4) + (this.resRateW * 8);
        },

        // effRateS: Peak Efficiency Rate for Summer
        effRateS() {
            return this.effRate(this.energyUse, this.kwhRateS, this.peakDemand, this.demandRateS);
        },

        // effRateW: Peak Efficiency Rate for Winter
        effRateW() {
            return this.effRate(this.energyUse, this.kwhRateW, this.peakDemand, this.demandRateW);
        },

        // resRateW: Standard Residential Rate for Winter
        effRateY() {
            return (this.effRateS * 4) + (this.effRateW * 8);
        },

        // resProj: Projected Annual Bill for Standard Residential Rate
        resProj() {
            let monthlyAvg = this.kWhAnnual / 12;
            return (this.resRate(monthlyAvg, this.kwhRateS900, this.kwhRateSadd) * 4) + (this.resRate(monthlyAvg, this.kwhRateW900, this.kwhRateWadd) * 8);
        },

        // effProj: Projected Annual Bill for Peak Efficiency Rate
        effProj() {
            let monthlyAvg = this.kWhAnnual / 12;
            return (this.effRate(monthlyAvg, this.kwhRateS, this.demandAvg, this.demandRateS) * 4) + (this.effRate(monthlyAvg, this.kwhRateW, this.demandAvg, this.demandRateW) * 8);
        },

        // projDiff: Difference between the two rates
        projDiff() {
            return Math.abs(this.effProj - this.resProj);
        },

        // projDesc: Text displayed directly after projDiff
        // Returns "more" if Projected Peak Efficiency Rate Bill is greater than Projected Standard Residential Rate Bill, "less" otherwise
        projDesc() {
            if (this.effProj > this.resProj) {
                return "more";
            } else {
                return "less";
            }
        },

        // diffS: Difference between Standard Residential Rate and Peak Efficiency Rate in the Summer
        // Positive if resRateS is larger than effRateS, negative otherwise
        diffS() {
            return this.diffString(this.resRateS, this.effRateS);
        },

        // diffW: Difference between Standard Residential Rate and Peak Efficiency Rate in the Winter
        // Positive if resRateW is larger than effRateW, negative otherwise
        diffW() {
            return this.diffString(this.resRateW, this.effRateW);
        },

        // diffY: Difference between Standard Residential Rate and Peak Efficiency Rate over an entire year
        // Positive if resRateW is larger than effRateW, negative otherwise
        diffY() {
            return this.diffString(this.resRateY, this.effRateY);
        },

        // Lists the values associated with each appliance in the peak demand overlay, depending on the season
        applianceMultiplier() {
            return {
                    ac: 3.5,
                    ewh: 4.5,
                    dryer: 3.0,
                    eo: 2.4,
                    hd: 1.5,
                    micro: 1.5,
                    light: 0.8,
                    iron: 1.1,
                    fridge: 0.2,
                    space: 1.5,
                    wash: 0.5,
                    tv: 0.3,
                    freezer: 0.2,
                    dish: 1.8,
                    console: 0.1
                }
        },

        // estimatedPeakDemand: The estimated demand at the end of the peak demand overlay
        // Changes based on what appliances are currently active
        estimatedPeakDemand() {
            let ret = 1;
            if (this.appliances.ac) ret += this.applianceMultiplier.ac;
            if (this.appliances.ewh) ret += this.applianceMultiplier.ewh;
            if (this.appliances.dryer) ret += this.applianceMultiplier.dryer;
            if (this.appliances.eo) ret += this.applianceMultiplier.eo;
            if (this.appliances.hd) ret += this.applianceMultiplier.hd;
            if (this.appliances.micro) ret += this.applianceMultiplier.micro;
            if (this.appliances.light) ret += this.applianceMultiplier.light;
            if (this.appliances.iron) ret += this.applianceMultiplier.iron;
            if (this.appliances.fridge) ret += this.applianceMultiplier.fridge;
            if (this.appliances.space) ret += this.applianceMultiplier.space;
            if (this.appliances.wash) ret += this.applianceMultiplier.wash;
            if (this.appliances.tv) ret += this.applianceMultiplier.tv;
            if (this.appliances.freezer) ret += this.applianceMultiplier.freezer;
            if (this.appliances.dish) ret += this.applianceMultiplier.dish;
            if (this.appliances.console) ret += this.applianceMultiplier.console;
            return ret;
        },

        potentialSavings() {
            return this.effProj * 0.1;
        }
    },

    // Watched variables execute commands whenever the associated variable changes
    watch: {

        // p_*: Initializes variables based on the parameters passed in, uses a default test value if no variable is passed in
        // Parameter variables shouldn't be used outside of this block
        p_kwhMin: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseInt(v) >= 0 && !isNaN(v)) {
                this.kwhMin = parseInt(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhMin: kwhMin must be a number >= 0, setting to 0");
                this.kwhMin = 0;
            } else {
                console.log("WARNING, kwhMin: kwhMin is not set, using default value of " + this.kwhMin);
            }
        }},
        p_kwhMax: { immediate: true, handler(v) {
            if (typeof this.p_kwhMin != 'undefined') {
                if (typeof v != 'undefined' && parseInt(v) >= this.p_kwhMin && !isNaN(v)) {
                    this.kwhMax = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, kwhMax: kwhMax must be a number > kwhMin, setting to kwhMin + 1");
                    this.kwhMax = this.p_kwhMin + 1;
                } else {
                    console.log("WARNING, kwhMax: kwhMax is not set, using default value of " + this.kwhMax);
                }
            } else {
                console.log("WARNING, kwhMax: kwhMin is not set, using default value as bound for kwhMax");
                if (typeof v != 'undefined' && parseInt(v) >= this.kwhMin && !isNaN(v)) {
                    this.kwhMax = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, kwhMax: kwhMax must be a number > kwhMin, setting to kwhMin + 1");
                    this.kwhMax = this.kwhMin + 1;
                } else {
                    console.log("WARNING, kwhMax: kwhMax is not set, using default value of " + this.kwhMax);
                }
            }
        }},
        p_kwh: { immediate: true, handler(v) {
            // Sets the default for kwh slider
            if (typeof this.p_kwhMin != 'undefined' && typeof this.p_kwhMax != 'undefined') {
                if (typeof v != 'undefined' && parseInt(v) >= this.p_kwhMin && parseInt(v) <= this.p_kwhMax && !isNaN(v)) {
                    this.kwh = parseInt(v);
                    this.energyUse = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, kwh: kwh must be a number within the bounds of kwhMin and kwhMax, setting to kwhMin");
                    this.kwh = this.p_kwhMin;
                    this.energyUse = this.p_kwhMin;
                } else {
                    console.log("WARNING, kwh: kwh is not set, using default value of " + this.kwh);
                    this.energyUse = this.kwh;
                }
            } else {
                console.log("WARNING, kwh: Either kwhMin or kwhMax is not set, using default values as bounds for kwh");
                if (typeof v != 'undefined' && parseInt(v) >= this.kwhMin && parseInt(v) <= this.kwhMax && !isNaN(v)) {
                    this.kwh = parseInt(v);
                    this.energyUse = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, kwh: kwh must be a number within the bounds of kwhMin and kwhMax, setting to kwhMin");
                    this.kwh = this.kwhMin;
                    this.energyUse = this.kwhMin;
                } else {
                    console.log("WARNING, kwh: kwh is not set, using default value of " + this.kwh);
                    this.energyUse = this.kwh;
                }
            }
        }},
        p_kwhRateS: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.kwhRateS = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhRateS: kwhRateS must be a number >= 0, setting to 0");
                this.kwhRateS = 0;
            } else {
                console.log("WARNING, kwhRateS: kwhRateS is not set, using default value of " + this.kwhRateS);
            }
        }},
        p_kwhRateS900: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.kwhRateS900 = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhRateS900: kwhRateS900 must be a number >= 0, setting to 0");
                this.kwhRateS900 = 0;
            } else {
                console.log("WARNING, kwhRateS900: kwhRateS900 is not set, using default value of " + this.kwhRateS900);
            }
        }},
        p_kwhRateSadd: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.kwhRateSadd = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhRateSadd: kwhRateSadd must be a number >= 0, setting to 0");
                this.kwhRateSadd = 0;
            } else {
                console.log("WARNING, kwhRateSadd: kwhRateSadd is not set, using default value of " + this.kwhRateSadd);
            }
        }},
        p_kwhRateW: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.kwhRateW = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhRateW: kwhRateW must be a number >= 0, setting to 0");
                this.kwhRateW = 0;
            } else {
                console.log("WARNING, kwhRateW: kwhRateW is not set, using default value of " + this.kwhRateW);
            }
        }},
        p_kwhRateW900: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.kwhRateW900 = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhRateW900: kwhRateW900 must be a number >= 0, setting to 0");
                this.kwhRateW900 = 0;
            } else {
                console.log("WARNING, kwhRateW900: kwhRateW900 is not set, using default value of " + this.kwhRateW900);
            }
        }},
        p_kwhRateWadd: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.kwhRateWadd = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kwhRateWadd: kwhRateWadd must be a number >= 0, setting to 0");
                this.kwhRateWadd = 0;
            } else {
                console.log("WARNING, kwhRateWadd: kwhRateWadd is not set, using default value of " + this.kwhRateWadd);
            }
        }},

        p_demandMin: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseInt(v) >= 0 && !isNaN(v)) {
                this.demandMin = parseInt(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, demandMin: demandMin must be a number >= 0, setting to 0");
                this.demandMin = 0;
            } else {
                console.log("WARNING, demandMin: demandMin is not set, using default value of " + this.demandMin);
            }
        }},
        p_demandMax: { immediate: true, handler(v) {
            if (typeof this.p_demandMin != 'undefined') {
                if (typeof v != 'undefined' && parseInt(v) >= this.p_demandMin && !isNaN(v)) {
                    this.demandMax = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, demandMax: demandMax must be a number > demandMin, setting to demandMin + 1");
                    this.demandMax = this.p_demandMin + 1;
                } else {
                    console.log("WARNING, demandMax: demandMax is not set, using default value of " + this.demandMax);
                }
            } else {
                console.log("WARNING, demandMax: demandMin is not set, using default value as bound for demandMax");
                if (typeof v != 'undefined' && parseInt(v) >= this.demandMin && !isNaN(v)) {
                    this.demandMax = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, demandMax: demandMax must be a number > demandMin, setting to demandMin + 1");
                    this.demandMax = this.demandMin + 1;
                } else {
                    console.log("WARNING, demandMax: demandMax is not set, using default value of " + this.demandMax);
                }
            }
        }},
        p_demand: { immediate: true, handler(v) {
            // Sets the default for demand slider
            if (typeof this.p_demandMin != 'undefined' && typeof this.p_demandMax != 'undefined') {
                if (typeof v != 'undefined' && parseInt(v) >= this.p_demandMin && parseInt(v) <= this.p_demandMax && !isNaN(v)) {
                    this.demand = parseInt(v);
                    this.peakDemand = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, demand: demand must be a number within the bounds of demandMin and demandMax, setting to demandMin");
                    this.demand = this.p_demandMin;
                    this.peakDemand = this.p_demandMin;
                } else {
                    console.log("WARNING, demand: demand is not set, using default value of " + this.demand);
                    this.peakDemand = this.demand;
                }
            } else {
                console.log("WARNING, demand: Either demandMin or demandMax is not set, using default values as bounds for demand");
                if (typeof v != 'undefined' && parseInt(v) >= this.demandMin && parseInt(v) <= this.demandMax && !isNaN(v)) {
                    this.demand = parseInt(v);
                    this.peakDemand = parseInt(v);
                } else if (typeof v != 'undefined') {
                    console.log("WARNING, demand: demand must be a number within the bounds of demandMin and demandMax, setting to demandMin");
                    this.demand = this.demandMin;
                    this.peakDemand = this.demandMin;
                } else {
                    console.log("WARNING, demand: demand is not set, using default value of " + this.demand);
                    this.peakDemand = this.demand;
                }
            }
        }},
        p_demandRateS: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.demandRateS = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, demandRateS: demandRateS must be a number >= 0, setting to 0");
                this.demandRateS = 0;
            } else {
                console.log("WARNING, demandRateS: demandRateS is not set, using default value of " + this.demandRateS);
            }
        }},
        p_demandRateW: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.demandRateW = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNIN, demandRateW: demandRateW must be a number >= 0, setting to 0");
                this.demandRateW = 0;
            } else {
                console.log("WARNING, demandRateW: demandRateW is not set, using default value of " + this.demandRateW);
            }
        }},

        p_serviceFee: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.basicServiceFee = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, serviceFee: serviceFee must be a number >= 0, setting to 0");
                this.basicServiceFee = 0;
            } else {
                console.log("WARNING, serviceFee: serviceFee is not set, using default value of " + this.serviceFee);
            }
        }},
        p_riderCharge: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseFloat(v) >= 0 && !isNaN(v)) {
                this.riderCharge = parseFloat(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, riderCharge: riderCharge must be a number >= 0, setting to 0");
                this.riderCharge = 0;
            } else {
                console.log("WARNING, riderCharge: riderCharge is not set, using default value of " + this.riderCharge);
            }
        }},
        p_limitedData: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && (v == 1 || v == 0) && !isNaN(v)) {
                this.limitedData = v;
            } else if (typeof v != 'undefined') {
                console.log("WARNING, limitedData: limitedData must be either true (1) or false (0), setting to false");
                this.limitedData = false;
            } else {
                console.log("WARNING, limitedData: limitedData is not set, using default value of " + this.limitedData);
            }
        }},
        p_kWhAnnual: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseInt(v) >= 0 && !isNaN(v)) {
                this.kWhAnnual = parseInt(v);
                this.kwh = parseInt(v) / 12;
                this.energyUse = parseInt(v) / 12;
            } else if (typeof v != 'undefined') {
                console.log("WARNING, kWhAnnual: kWhAnnual must be a number >= 0, setting to 0");
                this.kWhAnnual = 0;
            } else {
                console.log("WARNING, kWhAnnual: kWhAnnual is not set, using default value of " + this.kWhAnnual);
            }
        }},
        p_demandAvg: { immediate: true, handler(v) {
            if (typeof v != 'undefined' && parseInt(v) >= 0 && !isNaN(v)) {
                this.demandAvg = parseInt(v);
                this.demand = parseInt(v);
                this.peakDemand = parseInt(v);
            } else if (typeof v != 'undefined') {
                console.log("WARNING, demandAvg: demandAvg must be a number >= 0, setting to 0");
                this.demandAvg = 0;
            } else {
                console.log("WARNING, demandAvg: demandAvg is not set, using default value of " + this.demandAvg);
            }
        }},

        // Updates the bubble above the energy slider
        // Sets the reset button below the energy slider to be visible if the user has changed the value
        // Sets the reset button to be invisible if it was just pressed
        energyUseRange() {
            this.energyUseRangeBubble = this.calcRangeBubble(this.$refs.energyUseRange, this.energyUseRange);
            this.energyBubble = true;
            if (this.resetChanged) {
                this.energyReset = true;
            } else {
                this.resetChanged = true;
                this.energyReset = false;
            }
        },

        // Updates the bubble above the energy slider
        // Sets the reset button below the energy slider to be visible if the user has changed the value
        // Sets the reset button to be invisible if it was just pressed
        peakDemandRange() {
            this.peakDemandRangeBubble = this.calcRangeBubble(this.$refs.peakDemandRange, this.peakDemandRange);
            this.demandBubble = true;
            if (this.resetChanged) {
                this.demandReset = true;
            } else {
                this.resetChanged = true;
                this.demandReset = false;
            }
        },
    },

    // Functions that can be called
    methods: {
        // resRate: Standard Residential Rate
        resRate(kwh, rate900, rateAdd) {
            let ret = this.basicServiceFee;
            if (kwh > 900) {
                ret += 900 * rate900;
                ret += (kwh - 900) * rateAdd;
            } else {
                ret += kwh * rate900;
            }

            ret += this.riderCharge * kwh;
            return ret;
        },

        // effRateS: Peak Efficiency Rate
        effRate(kwh, kwhRate, demand, demandRate) {
            let ret = this.basicServiceFee;
            ret += kwh * kwhRate;
            ret += demand * demandRate;
            ret += this.riderCharge * kwh;
            return ret;
        },

        // Resets the energy slider
        resetEnergy() {
            this.energyUse = this.kwh;
            this.resetChanged = false;
        },

        // Resets the demand slider
        resetDemand() {
            this.peakDemand = this.demand;
            this.resetChanged = false;
        },

        // Toggles the active state of an appliance in the peak demand overlay
        toggleAppliance(appliance) {
            this.appliances[appliance] = !this.appliances[appliance];
        },

        // Toggles the peak demand overlay
        togglePeakDemand() {
            this.peakDemandOpen = !this.peakDemandOpen;
        },

        // Applies the estimated peak demand from the peak demand overlay the peak demand slider, then disables the overlay
        applyDemand() {
            this.peakDemand = this.estimatedPeakDemand;
            this.togglePeakDemand();
        },

        // Converts a range value between a minimum and maximum to the real value it represents
        // val: where the value is between the minimum and maximum values
        // min: minimum allowed value
        // max: maximum allowed value
        range2val(val, min, max) {
            return (val / 1000) * (max - min) + min;
        },

        // Converts a value to be on a scale between a minimum and maximum value
        // val: value to scale
        // min: minimum allowed value
        // max: maximum allowed value
        val2range(val, min, max) {
            return -1000 * (min - val) / (max - min);
        },

        // Calculates the position of a bubble above a slider
        // range: the slider
        // val: the position of the thumb
        calcRangeBubble(range, val) {
            if (range) {
                var rootRect = this.$el.getBoundingClientRect();
                var elementRect = range.getBoundingClientRect();
                var fromLeft = elementRect.left - rootRect.left + 15;
                var toLeft = elementRect.right - rootRect.left - 15;
                var positionLeft = (toLeft - fromLeft) * (val - range.min) / (range.max - range.min) + fromLeft;
                return {
                    top:  (elementRect.top - rootRect.top) + 'px',
                    left: (positionLeft) + 'px',
                    display: "block"
                };
            }

            return { };
        },

        // Hides both slider bubbles
        hideBubbles() {
            this.energyBubble = false;
            this.demandBubble = false;
        },

        // Finds the dollar difference between two values. If a > b, gives a positive string (ex: + $32), negative otherwise (- $32)
        diffString(a, b) {
            let val = b - a;
            val = Math.round(val);
            //val = parseFloat((val * 100).toFixed(11));
            //val = (Math.round(val) / 100).toFixed(2);
            var str = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (val < 0) {
                return str.slice(0, 1) + " $" + str.slice(1);
            } else {
                return "+ $" + str;
            }
        },

        // Scrolls to a reference in the html
        scrollMeTo(refName) {
            var element = this.$refs[refName];
            var top = element.offsetTop;
            window.scrollTo(0, top);
        }
    },
}
</script>

<style lang="scss" src="./styles/App.scss" scoped></style>
