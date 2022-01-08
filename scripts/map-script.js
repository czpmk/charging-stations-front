window.onload = init;

let eti_coords = { "lon": 18.612704654420106, "lat": 54.37165722576064 }
let stations = {}
let session_token = "54db820273fa4c439d4cc78b8e4c18b4"
let map = 0

async function init() {
    map = L.map('map').setView([eti_coords.lat, eti_coords.lon], 13);

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
            record.city,
            record.street,
            record.housenumber,
            record.capacity,
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

async function getRatings(stationId) {
    let response = await fetch("http://localhost:3011/ratings?token=" + session_token + "&station_id=" + stationId).then(data => data.json())

    if (!response.valid) {
        alert("Internal application error")
        return
    }
    if (response.length == 0)
        return new Rates([], response.length)
    else
        return new Rates(response.results, response.length)
}

async function getComments(stationId) {
    let response = await fetch("http://localhost:3011/comments?token=" + session_token + "&station_id=" + stationId).then(data => data.json())

    if (!response.valid) {
        alert("Internal application error")
        return
    }
    if (response.length == 0)
        return new Comments([], response.length)
    else
        return new Comments(response.results, response.length)
}

async function getChargers(stationId) {
    let response = await fetch("http://localhost:3011/chargers?token=" + session_token + "&station_id=" + stationId).then(data => data.json())

    if (!response.valid) {
        alert("Internal application error")
        return
    }
    if (response.length == 0)
        return new Chargers([], response.length)
    else
        return new Chargers(response.results, response.length)
}

function createAcordeonSection(chargerIndex, chargerName) {
    let acordeonItemName = "ai" + chargerIndex
    let acordeonHeaderName = 'ah' + chargerIndex
    let acordeonBoadyId = 'abi' + chargerIndex
    let acordeonBoadyLabel = 'abl' + chargerIndex

    $("#accordionPanelsChargers").append('<div class="accordion-item" id="' + acordeonItemName + '"></div>')
    $("#" + acordeonItemName).append('<h2 class="accordion-header" id="' + acordeonHeaderName + '"></h2>')
    $("#" + acordeonHeaderName).append('<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#' + acordeonBoadyLabel +
        '" aria-expanded="true" aria-controls="' + acordeonBoadyLabel + '">' + chargerName + '</button>')
    $("#" + acordeonItemName).append('<div id="' + acordeonBoadyLabel + '" class="accordion-collapse collapse hide" aria-labelledby="' + acordeonHeaderName + '"></div>')
    $("#" + acordeonBoadyLabel).append('<div class="accordion-body" id="' + acordeonBoadyId + '"></div>')

    return acordeonBoadyId
}

async function openStationInfo(stationId) {
    let s = stations[stationId]
    let rates = await getRatings(stationId)
    let comments = await getComments(stationId)
    let chargers = await getChargers(stationId)

    $("#accordionPanelsChargers").empty()

    $("#stationName").first().text(s.getName())
    $("#stationRatingsView").first().text("Rating " + rates.getMean().toFixed(1) + "/5")
    $("#stationCommentsLink").first().text("Comments (" + comments.getNumberOfComments() + ")")
    $("#stationOperatorName").first().text("Operator : " + s.getOperatorName())
    $("#stationCity").first().text("City : " + s.getCity())
    $("#stationStreet").first().text("Street : " + s.getStreet())
    $("#stationHouseNumber").first().text("House number : " + s.getHousenumber())
    $("#stationFree").first().text("Free : " + s.isFree())
    $("#stationCapacity").first().text("Number of chargers : " + s.getNumberOfChargers())

    // process chargers
    for (let i in chargers.getChargers()) {
        let chargerIndex = (parseInt(i) + 1).toString()
        let chargerName = "Charger " + chargerIndex
        let bodyItemTag = createAcordeonSection(chargerIndex, chargerName)

        const chargerData = chargers.getChargerData(i)
        $("#" + bodyItemTag).append('<h6 class="chargerInfo">Voltage: ' + chargerData.voltage + '</h6>')
        $("#" + bodyItemTag).append('<h6 class="chargerInfo">Amperage: ' + chargerData.amperage + '</h6>')
        $("#" + bodyItemTag).append('<h6 class="chargerInfo">Plug type: ' + chargerData.plug_type + '</h6>')
    }

    $("#stationCommentsLink").on("click", function(e) { openStationComments(stationId) })

    $("#stationInfoModal").modal("show")
}

function closeStationInfo() {
    $("#stationInfoModal").modal("hide")
}

async function openStationComments(stationId) {
    $("#stationInfoModal").modal("hide")
    let comments = await getComments(stationId)

    $("#commentsModalBody").empty()
    $("#commentsModalHead").empty()

    // $("#commentsModalHead").append('<h5>Comments:</h5>')
    $("#commentsModalHead").append('<h5>' + stations[stationId].getName() + '</h5>')

    if (comments.getNumberOfComments() == 0)
        $("#commentsModalBody").append('<h6><i>No comments.</i></h6>')

    let hasAny = false
    for (let i in comments.getComments()) {
        if (!hasAny) {
            hasAny = true
        } else {
            $("#commentsModalBody").append("<hr>")
        }

        let commentIdx = (parseInt(i) + 1).toString()
        commentsModalBody
        $("#commentsModalBody").append('<p>' + comments.getCommentAt(i).email + '</p>')
        $("#commentsModalBody").append('<h6><i>' + comments.getCommentAt(i).comment + '</i></h6>')
    }

    $("#stationCommentsModal").modal("show")
}

function closeStationComments() {
    $("#stationCommentsModal").modal("hide")
}