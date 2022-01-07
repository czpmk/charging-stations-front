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

    constructor(id, lon, lat, name, operator, city, street, housenumber, capacity, fee) {
        this.id = id;
        this.lon = lon;
        this.lat = lat;
        this.name = name;
        this.operator = operator;
        this.fee = fee;
        this.capacity = capacity;
        this.city = city;
        this.street = street;
        this.housenumber = housenumber;
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
        if (this.operator == null || this.operator == "")
            return "Unknown operator"
        else
            return this.operator
    }

    getNumberOfChargers() {
        if (this.capacity == null || this.capacity == "")
            return 0
        else
            return this.capacity
    }

    getCity() {
        if (this.city == null || this.city == "")
            return "Unknown city"
        else
            return this.city
    }

    getStreet() {
        if (this.street == null || this.street == "")
            return "Unknown street"
        else
            return this.street
    }

    getHousenumber() {
        if (this.housenumber == null || this.housenumber == "")
            return "Unknown house number"
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