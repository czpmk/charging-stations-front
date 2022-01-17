class Charger {
    constructor(data) {
        this.id = data.id;
        this.station_id = data.station_id;
        this.voltage = data.voltage;
        this.amperage = data.amperage;
        this.plug_type = data.plug_type;
        this.power = 0;
    }

    getId() {
        return this.id;
    }

    getPlugType() {
        if (this.plug_type == null || this.plug_type == "")
            return "Unknown"
        else
            return this.plug_type
    }

    getVoltage() {
        if (this.voltage == 0)
            return "Unknown"
        else
            return this.voltage
    }

    getAmperage() {
        if (this.amperage == 0)
            return "Unknown"
        else
            return this.amperage
    }

    getPower() {
        return this.power
    }
}