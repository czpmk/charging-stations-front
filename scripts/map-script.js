window.onload = init;

let eti_coords = { "lon": 18.612704654420106, "lat": 54.37165722576064 }
let stations = {}
let session_token = "eb8c43c8fd0e411887716f6399476318"
let map = 0

async function init() {
    map = L.map('map').setView([eti_coords.lat, eti_coords.lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    await loadStations()

    Object.entries(stations).forEach(([k, v]) => { addStationToMap(v) })
}

async function loadStations() {
    let stations_resp = await fetch("http://localhost:3011/stations?token=" + session_token).then(data => data.json())
    let chargers_resp = await fetch("http://localhost:3011/chargers?token=" + session_token).then(data => data.json())
    let comments_resp = await fetch("http://localhost:3011/comments?token=" + session_token).then(data => data.json())
    let ratings_resp = await fetch("http://localhost:3011/ratings?token=" + session_token).then(data => data.json())
    if (!stations_resp.valid || !chargers_resp.valid || !comments_resp.valid || !ratings_resp.valid) {
        alert("Internal application error - could not get server response")
        return;
    } else {
        stations_resp.results.forEach(s => { stations[s.id] = new Station(s) })
        chargers_resp.results.forEach(c => { if (stations.hasOwnProperty(c.station_id)) stations[c.station_id].addCharger(c) })
        comments_resp.results.forEach(c => { if (stations.hasOwnProperty(c.station_id)) stations[c.station_id].addComment(c) })
        ratings_resp.results.forEach(r => { if (stations.hasOwnProperty(r.station_id)) stations[r.station_id].addRate(r) })
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

    $("#accordionPanelsChargers").empty()

    $("#stationName").first().text(s.getName())
    $("#stationRatingsLink").first().text("Rating " + s.getRating() + "/5")
    $("#stationCommentsLink").first().text("Comments (" + s.getNumberOfComments() + ")")
    $("#stationOperatorName").first().text("Operator : " + s.getOperatorName())
    $("#stationCity").first().text("City : " + s.getCity())
    $("#stationStreet").first().text("Street : " + s.getStreet())
    $("#stationHouseNumber").first().text("House number : " + s.getHousenumber())
    $("#stationFree").first().text("Free : " + s.isFree())
    $("#stationCapacity").first().text("Number of chargers : " + s.getNumberOfChargers())

    // process chargers
    let keys = Object.keys(s.chargers)
    for (let i = 0; i < keys.length; i++) {
        let chargerIndex = (parseInt(i) + 1).toString()
        let chargerName = "Charger " + chargerIndex
        let bodyItemTag = createAcordeonSection(chargerIndex, chargerName)

        const chargerData = s.chargers[keys[i]]
        $("#" + bodyItemTag).append('<h6 class="chargerInfo">Voltage: ' + chargerData.getVoltage() + '</h6>')
        $("#" + bodyItemTag).append('<h6 class="chargerInfo">Amperage: ' + chargerData.getAmperage() + '</h6>')
        $("#" + bodyItemTag).append('<h6 class="chargerInfo">Plug type: ' + chargerData.getPlugType() + '</h6>')
    }
    $("#stationRatingsLink").on("click", function(e) { openStationRate(stationId) })
    $("#addRateButton").on("click", function(e) { submitRate(stationId) })

    $("#stationCommentsLink").on("click", function(e) { openStationComments(stationId) })
    $("#addCommentButton").on("click", function(e) { submitComment(stationId) })

    $("#stationInfoModal").modal("show")
}

function closeStationInfo() {
    $("#stationInfoModal").modal("hide")
}

async function openStationComments(stationId) {
    $("#stationInfoModal").modal("hide")
    let s = stations[stationId]

    $("#commentsModalBody").empty()
    $("#commentsModalHead").empty()

    $("#commentsModalHead").append('<h5>' + s.getName() + '</h5>')

    if (s.getNumberOfComments() == 0) {
        $("#commentsModalBody").append('<h6><i>No comments.</i></h6>')
    }
    let isFirst = true
    for (let i in s.comments) {
        if (isFirst)
            isFirst = false
        else
            $("#commentsModalBody").append("<hr>")

        $("#commentsModalBody").append('<p>' + s.comments[i].email + '</p>')
        $("#commentsModalBody").append('<h6><i>' + s.comments[i].comment + '</i></h6>')
    }

    $("#stationCommentsModal").modal("show")
}

async function submitComment(stationId) {
    let newComment = $("#newCommentBox").val()
    $("#newCommentBox").val("")
    $("#addCommentButton").off("click")

    if (newComment.length == 0)
        return

    let data = JSON.stringify({
        "station_id": stationId,
        "comment": newComment
    })

    await fetch("http://localhost:3011/comments/new?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())
}

function closeStationComments() {
    $("#stationCommentsModal").modal("hide")
}

async function openStationRate(stationId) {
    $("#stationInfoModal").modal("hide")
    let s = stations[stationId]

    $("#ratesModalHead").empty()

    $("#ratesModalHead").append('<h5>' + s.getName() + '</h5>')

    $("#stationRateModal").modal("show")
}

async function submitRate(stationId) {
    let newRate = $("input[name=rateOption]:checked").val()
    console.log($("input[name=rateOption]:checked").val())
    $("#addRateButton").off("click")

    let data = JSON.stringify({
        "station_id": stationId,
        "rate": newRate
    })
    console.log(data)

    let errorDetails = 0
    let res = await fetch("http://localhost:3011/ratings/new?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    if (!res.valid && res.message == "OPERATION_NOT_ALLOWED")
        console.log("already rated be the user")
        // TODO implementacja bledu

    $("#stationRateModal").modal("hide")
}

function cancelStationRate() {
    $("#stationRateModal").modal("hide")
}