async function synchronizeDbData(scope) {
    switch (scope) {
        case "stations":
            {
                await loadStations()
            }
        case "chargers":
            {
                await loadChargers()
            }
        case "comments":
            {
                await loadComments()
            }
        case "ratings":
            {
                await loadRatings()
            }
        default:
            {
                await loadStations()
                await loadChargers()
                await loadComments()
                await loadRatings()
            }
    }
}

async function loadStations() {
    let stations_resp = await fetch("http://localhost:3011/stations?token=" + session_token).then(data => data.json())
    if (!stations_resp.valid) {
        alert("Internal application error - could not get server response")
        return;
    } else {
        stations_resp.results.forEach(s => {
            if (!stations.hasOwnProperty(s.id)) {
                stations[s.id] = new Station(s)
                addStationToMap(stations[s.id])
            }
        })
    }
}

async function loadChargers() {
    let chargers_resp = await fetch("http://localhost:3011/chargers?token=" + session_token).then(data => data.json())
    if (!chargers_resp.valid) {
        alert("Internal application error - could not get server response")
        return;
    } else {
        chargers_resp.results.forEach(c => { if (stations.hasOwnProperty(c.station_id)) stations[c.station_id].addCharger(c) })
    }
}

async function loadComments() {
    let comments_resp = await fetch("http://localhost:3011/comments?token=" + session_token).then(data => data.json())
    if (!comments_resp.valid) {
        alert("Internal application error - could not get server response")
        return;
    } else {
        comments_resp.results.forEach(c => { if (stations.hasOwnProperty(c.station_id)) stations[c.station_id].addComment(c) })
    }
}

async function loadRatings() {
    let ratings_resp = await fetch("http://localhost:3011/ratings?token=" + session_token).then(data => data.json())
    if (!ratings_resp.valid) {
        alert("Internal application error - could not get server response")
        return;
    } else {
        ratings_resp.results.forEach(r => { if (stations.hasOwnProperty(r.station_id)) stations[r.station_id].addRate(r) })
    }
}

function addStationToMap(station) {
    station.marker = L.marker(station.getLonLat(), {
            riseOnHover: true,
            icon: station.getIcon()
        })
        .bindPopup(station.getName(), { offset: [0, -10], closeButton: false })
        .on('mouseover', function(e) { this.openPopup() })
        .on('mouseout', function(e) { this.closePopup() })
        .on('click', function(e) { openStationInfo(station.id) })
        .addTo(map)
}

function addStartingPointToMap(lat, lon) {
    if (map.hasLayer(startingPoint))
        map.removeLayer(startingPoint)

    let removeStartingPointButtonString = '<button type="button" class="btn btn-outline-success"' +
        'id="removeStartingPointButton" onclick="removeStartingPoint()">Remove Starting Point</button>'

    startingPoint = L.marker([lat, lon], {
            riseOnHover: true,
            icon: startingPointIcon
        })
        .bindPopup('<div class="justify-content-center d-block text-center">' +
            removeStartingPointButtonString +
            '</div>', { offset: [0, -10] })
        .on('click', function(e) { this.openPopup() })
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

    $("#removeStationButton").remove()

    if (userAdmin)
        $("#stationInfoModalFooter").append('<button type="button" class="btn btn-danger justify-content-center" id="removeStationButton" onclick="removeStation(' +
            stationId +
            ')">REMOVE STATION</button>')

    // process chargers
    let keys = Object.keys(s.chargers)
    if (keys.length != 0) {
        $("#accordionPanelsChargers").append('<hr>')
        for (let i = 0; i < keys.length; i++) {
            const chargerData = s.chargers[keys[i]]

            let chargerIndex = (parseInt(i) + 1).toString()
            let chargerName = "Charger " + chargerIndex
            let bodyItemTag = createAcordeonSection(chargerIndex, chargerName)


            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Voltage: ' + chargerData.getVoltage() + '</h6>')
            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Amperage: ' + chargerData.getAmperage() + '</h6>')
            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Plug type: ' + chargerData.getPlugType() + '</h6>')

            if (userAdmin)
                $("#" + bodyItemTag).append('<button type="button" class="btn btn-danger justify-content-center" id="removeChargerButton" onclick="removeCharger(' +
                    chargerData.getId() + ', ' + stationId +
                    ')">REMOVE CHARGER</button>')
        }
    }

    $("#stationRatingsLink").on("click", function(e) { openStationRate(stationId) })
    $("#addRateButton").on("click", function(e) { submitRate(stationId) })

    $("#stationCommentsLink").on("click", function(e) { openStationComments(stationId) })
    $("#addCommentButton").on("click", function(e) { submitComment(stationId) })

    $("#addChargerButton").on("click", function(e) { openAddChargerModal(stationId) })

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

        if (userAdmin)
            $("#commentsModalBody").append('<button type="button" class="btn btn-danger justify-content-center" id="removeCommentButton" onclick="removeComment(' +
                s.comments[i].id + ', ' + stationId +
                ')">REMOVE Comment</button>')
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

    await synchronizeDbData("comments")

    $("#stationCommentsModal").modal("hide")
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
    $("#addRateButton").off("click")

    let data = JSON.stringify({
        "station_id": stationId,
        "rate": newRate
    })

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

    await synchronizeDbData("ratings")

    $("#stationRateModal").modal("hide")
}

function cancelStationRate() {
    $("#stationRateModal").modal("hide")
}

function openPlaceOnMapSelection(arg) {
    let newStationButtonString = '<button type="button" class="btn btn-outline-primary"' +
        'id="goToAddStationModalButton" onclick="openAddStationModal(' +
        arg.latlng.lat + ', ' + arg.latlng.lng +
        ')">New Station</button>'

    let placeStartingPointButtonString = '<button type="button" class="btn btn-outline-success"' +
        'id="setStartingPointButton" onclick="setStartingPoint(' +
        arg.latlng.lat + ', ' + arg.latlng.lng +
        ')">Set Starting Point</button>'

    L.popup()
        .setLatLng(arg.latlng)
        .setContent('<div class="justify-content-center d-block text-center">' +
            newStationButtonString + '<br>' + placeStartingPointButtonString +
            '</div>')
        .openOn(map)
}

function openAddStationModal(lat, lon) {
    map.closePopup()
    $("#submitNewStationButton").on("click", function(e) { addStation(lat, lon) })
    $("#addStationModal").modal("show")
}

async function addStation(lat, lon) {
    $("#submitNewStationButton").off("click")
    let operator = $("#inputOperator").val();
    let city = $("#inputCity").val();
    let street = $("#inputStreet").val();
    let housenumber = $("#inputHousenumber").val();
    let isFree = $("input[name=freeOption]:checked").val()
    let fee = (isFree == "true") ? false : true


    let data = JSON.stringify({
        "longitude": lon,
        "latitude": lat,
        "operator": operator,
        "city": city,
        "street": street,
        "housenumber": housenumber,
        "fee": fee
    })

    let res = await fetch("http://localhost:3011/stations/new?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    await synchronizeDbData("stations")

    $("#addStationModal").modal("hide")
}

function openAddChargerModal(stationId) {
    console.log('entered openAddChargerModal')
    $("#addChargerButton").off("click")
    $("#stationInfoModal").modal("hide")
    $("#submitNewChargerButton").off("click")
    $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
    $("#addChargerModal").modal("show")
}

async function addCharger(stationId) {
    console.log('entered addCharger')
    $("#submitNewChargerButton").off("click")
    let voltage = $("#inputVoltage").val();
    let amperage = $("#inputAmperage").val();
    let plugType = $("#inputPlugType").val();

    // if (voltage.length == 0 || amperage == 0 || plugType == 0)
    //     TODO: error prompt

    let data = JSON.stringify({
        "station_id": stationId,
        "voltage": voltage,
        "amperage": amperage,
        "plug_type": plugType,
    })

    let res = await fetch("http://localhost:3011/chargers/new?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    await synchronizeDbData("chargers")

    $("#addChargerModal").modal("hide")
}

async function removeStation(stationId) {
    $("#removeStationButton").off("click")

    let data = JSON.stringify({
        "station_id": stationId
    })

    let res = await fetch("http://localhost:3011/stations/remove?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    map.removeLayer(stations[stationId].marker)

    delete stations[stationId]

    await synchronizeDbData("stations")

    $("#stationInfoModal").modal("hide")
}

async function removeCharger(chargerId, stationId) {
    $("#removeChargerButton").off("click")

    let data = JSON.stringify({
        "charger_id": chargerId
    })

    let res = await fetch("http://localhost:3011/chargers/remove?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    stations[stationId].removeCharger(chargerId)

    await synchronizeDbData("chargers")

    $("#stationInfoModal").modal("hide")
}

async function removeComment(commentId, stationId) {
    $("#removeCommentButton").off("click")

    let data = JSON.stringify({
        "comment_id": commentId
    })

    let res = await fetch("http://localhost:3011/comments/remove?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    stations[stationId].removeComment(commentId)

    await synchronizeDbData("comments")

    $("#stationCommentsModal").modal("hide")
}

function setStartingPoint(lat, lon) {
    $("#setStartingPointButton").off("click")
    addStartingPointToMap(lat, lon)

    map.closePopup()
}

function removeStartingPoint() {
    $("#removeStartingPointButton").off("click")
    if (map.hasLayer(startingPoint))
        map.removeLayer(startingPoint)

    map.closePopup()
}