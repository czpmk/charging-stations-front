class Station {
    static teslaIcon = L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/tesla.png",
        iconSize: [32, 32]
    });
    static orlenIcon = new L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/orlen.png",
        iconSize: [32, 32]
    });
    static energaIcon = new L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/energa.png",
        iconSize: [32, 32]
    });
    static greenWayIcon = new L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/greenway.png",
        iconSize: [32, 32]
    });
    static pgeIcon = new L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/pge.png",
        iconSize: [32, 32]
    });
    static tauronIcon = new L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/tauron.png",
        iconSize: [32, 32]
    });
    static goEAutoIcon = new L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/goeauto.png",
        iconSize: [32, 32]
    });
    static unkonwnIcon = L.icon({
        iconUrl: "http://localhost/charging-stations-front/assets/unknown.png",
        iconSize: [32, 32]
    });

    constructor(station_data) {
        this.id = station_data.id;
        this.lon = station_data.longitude;
        this.lat = station_data.latitude;
        this.name = station_data.name;
        this.operator = station_data.operator;
        this.fee = station_data.fee;
        this.city = station_data.city;
        this.street = station_data.street;
        this.housenumber = station_data.housenumber;
        this.chargers = {};
        this.comments = {};
        this.rates = {};
        this.marker = 0;
        this.route = null;
        this.distanceFromStartingPoint = 10000000;
    }

    addCharger(charger) {
        this.chargers[charger.id] = new Charger(charger);
    }

    addComment(comment) {
        this.comments[comment.id] = new Comment(comment);
    }

    addRate(rate) {
        this.rates[rate.id] = new Rate(rate);
    }

    getLonLat() {
        return [this.lat, this.lon]
    }

    getName() {
        if (this.name == null || this.name == "")
            return "Unknown"
        else
            return this.name
    }

    getOperatorName() {
        if (this.operator == null || this.operator == "")
            return "Unknown"
        else
            return this.operator
    }

    getNumberOfChargers() {

        if (Object.keys(this.chargers).length == 0)
            return 0
        else {
            return Object.keys(this.chargers).length
        }

    }

    getNumberOfComments() {
        return Object.keys(this.comments).length
    }

    getCity() {
        if (this.city == null || this.city == "")
            return "Unknown"
        else
            return this.city
    }

    getStreet() {
        if (this.street == null || this.street == "")
            return "Unknown"
        else
            return this.street
    }

    getHousenumber() {
        if (this.housenumber == null || this.housenumber == "")
            return "Unknown"
        else
            return this.housenumber
    }

    isFree() {
        if (this.fee === null)
            return "Unknown"
        else {
            if (this.fee)
                return "no"
            else
                return "yes"
        }
    }

    getRating() {
        let sum = 0.0
        let nRates = Object.keys(this.rates).length
        if (nRates == 0)
            return sum

        for (const [k, v] of Object.entries(this.rates))
            sum += v.rate

        return (sum / nRates).toFixed(1)
    }

    userAlreadyRated(userId) {
        for (const [k, v] of Object.entries(this.rates)) {
            if (v.user_id == userId)
                return true
        }
        return false
    }

    getIcon() {
        switch (this.operator) {
            case 'Tesla':
                return Station.teslaIcon;
            case 'Orlen':
                return Station.orlenIcon;
            case 'Energa':
                return Station.energaIcon;
            case 'GreenWay':
                return Station.greenWayIcon;
            case 'PGE':
                return Station.pgeIcon;
            case 'Tauron':
                return Station.tauronIcon;
            case 'GO+EAuto':
                return Station.goEAutoIcon;
            default:
                return Station.unkonwnIcon;
        }
    }

    getMarker() {
        return this.marker;
    }

    removeCharger(chargerId) {
        if (this.chargers.hasOwnProperty(chargerId))
            delete this.chargers[chargerId]
    }

    removeComment(commentId) {
        if (this.comments.hasOwnProperty(commentId))
            delete this.comments[commentId]
    }
}