class Charger {
    constructor(data) {
        this.id = data.id;
        this.station_id = data.station_id;
        this.plug_type = data.plug_type;
        this.power = data.power;
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

    getPower() {
        if (this.power == 0)
            return "Unknown"
        else
            return parseFloat(this.power)
    }
}