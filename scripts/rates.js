class Rates {
    constructor(rates_dict, length) {
        this.rates_dict = rates_dict
        this.length = length
    }

    getMean() {
        if (this.length == 0)
            return 0.0
        let sum = 0
        for (let i in this.rates_dict) {
            sum += this.rates_dict[i].rate
        }
        return sum / this.length
    }

    getNumberOfRates() {
        return this.length
    }
}