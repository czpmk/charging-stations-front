window.onload = init;

let eti_coords = { "lon": 54.37165722576064, "lat": 18.612704654420106 }
let stations = {}
let session_token = "ba4efeda797348a3af96705bac963c7e"
let map = 0

async function init() {
    map = L.map('map').setView([eti_coords.lon, eti_coords.lat], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    await loadStations()

    for (let k in stations) {
        addStationToMap(stations[k])
    }
}

async function loadStations() {
    let response = await fetch("http://localhost:3011/stations?token=" + session_token).then(data => data.json())

    if (!response.valid) {
        alert("Internal application error")
        return
    }

    let data = response.results

    let record = 0
    for (let idx in data) {
        record = data[idx]
        stations[record.id] = new Station(
            record.id,
            record.longitude,
            record.latitude,
            record.name,
            record.operator,
            0,
            record.fee)
    }
}

function addStationToMap(station) {
    L.marker(station.getLonLat(), {
            riseOnHover: true,
            icon: station.getIcon()
        })
        .bindPopup(station.getName(), { offset: [0, -10] })
        .on('mouseover', function(e) { this.openPopup() })
        .on('mouseout', function(e) { this.closePopup() })
        .on('click', function(e) { openStationInfo(station.id) })
        .addTo(map)
}

function openStationInfo(stationId) {
    let s = stations[stationId]

    $("#stationName").first().text(s.getName())
    $("#stationRatingsView").first().text("Rating " + s.getRatings() + "/5")
    $("#stationCommentsLink").first().text("Comments (" + s.getNumberOfComments() + ")")
    $("#stationOperatorName").first().text("Operator : " + s.getOperatorName())
    $("#stationCity").first().text("City : " + s.getOperatorName())
    $("#stationStreet").first().text("Street : " + s.getOperatorName())
    $("#stationHouseNumber").first().text("House number : " + s.getOperatorName())
    $("#stationFee").first().text("Free : " + s.isFree())
    $("#stationCapacity").first().text("Number of chargers : " + s.getNumberOfChargers())

    $("#stationInfoModal").modal("show")
}

function closeStationInfo() {
    $("#stationInfoModal").modal("hide")
}

function testFunc() {
    console.log("test")
}