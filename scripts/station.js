class Station {
    static teslaIcon = L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/tesla.ico",
        iconSize: [32, 32]
    });
    static orlenIcon = new L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/orlen.ico",
        iconSize: [32, 32]
    });
    static energaIcon = new L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/energa.ico",
        iconSize: [32, 32]
    });
    static greenWayIcon = new L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/greenway.ico",
        iconSize: [32, 32]
    });
    static pgeIcon = new L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/pge.ico",
        iconSize: [32, 32]
    });
    static tauronIcon = new L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/tauron.ico",
        iconSize: [32, 32]
    });
    static goEAutoIcon = new L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/goeauto.ico",
        iconSize: [32, 32]
    });
    static unkonwnIcon = L.icon({
        iconUrl: "http://localhost/SIP-projekt/assets/unknown.ico",
        iconSize: [32, 32]
    });

    constructor(id, lon, lat, name, operator, capacity, fee) {
        this.id = id;
        this.lon = lon;
        this.lat = lat;
        this.name = name;
        this.operator = operator;
        this.capacity = capacity;
        this.fee = fee;
        this.capacity = 0;
    }

    getLonLat() {
        return [this.lat, this.lon]
    }

    getName() {
        if (this.name == null || this.name == "")
            return "Unknown station"
        else
            return this.name
    }

    getOperatorName() {
        if (this.name == null || this.name == "")
            return "Unknown operator"
        else
            return this.operator
    }

    getNumberOfChargers() {
        return this.capacity
    }

    isFree() {
        if (this.name == null || this.name == "")
            return "Unknown"
        else {
            if (this.fee)
                return "no"
            else
                return "yes"
        }
    }

    getNumberOfRates() {
        return 1
    }

    getRatings() {
        return 5
    }

    getNumberOfComments() {
        return 1
    }

    getComments() {
        return "a comment"
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
}