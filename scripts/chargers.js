class Chargers {
    constructor(chargers_dict, length) {
        this.chargers_dict = chargers_dict
        this.length = length
    }

    getNumberOfChargers() {
        return this.length
    }

    getChargers() {
        return this.chargers_dict
    }

    getChargerData(idx) {
        let data = {}

        if (this.chargers_dict[idx].voltage == 0)
            data.voltage = "Unknown"
        else
            data.voltage = this.chargers_dict[idx].voltage

        if (this.chargers_dict[idx].amperage == 0)
            data.amperage = "Unknown"
        else
            data.amperage = this.chargers_dict[idx].amperage

        if (this.chargers_dict[idx].plug_type === null)
            data.plug_type = "Unknown"
        else
            data.plug_type = (this.chargers_dict[idx].plug_type).split("_").join(" ")

        return data
    }
}