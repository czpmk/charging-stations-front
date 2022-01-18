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


            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Power: ' + chargerData.getPower() + '</h6>')
            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Plug type: ' + chargerData.getPlugType() + '</h6>')

            if (userAdmin)
                $("#" + bodyItemTag).append('<button type="button" class="btn btn-danger justify-content-center" id="removeChargerButton" onclick="removeCharger(' +
                    chargerData.getId() + ', ' + stationId +
                    ')">REMOVE CHARGER</button>')
        }
    }

    $("#stationRatingsLink").on("click", function(e) { openStationRate(stationId) })

    $("#stationCommentsLink").on("click", function(e) { openStationComments(stationId) })

    $("#addChargerButton").on("click", function(e) { openAddChargerModal(stationId) })

    $("#stationInfoModal").modal("show")
}

function closeStationInfo() {
    $("#stationInfoModal").modal("hide")
}

async function openStationComments(stationId) {
    $("#stationCommentsLink").off('click')
    $("#stationInfoModal").modal("hide")
    let s = stations[stationId]
    $("#commentErrorMessage").empty()

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
    $("#addCommentButton").on("click", function(e) { submitComment(stationId) })
    $("#stationCommentsModal").modal("show")
}

async function submitComment(stationId) {
    let newComment = $("#newCommentBox").val()
    $("#addCommentButton").off("click")
    $("#commentErrorMessage").empty()

    newComment = newComment.normalize()

    if (newComment.length == 0) {
        $("#commentErrorMessage").append('<p style="color:red">Cannot submit an empty comment</p>')
        $("#addCommentButton").on("click", function(e) { submitComment(stationId) })
        return
    } else if (newComment.length > 360) {
        $("#commentErrorMessage").append('<p style="color:red">Comment length exceeds the limit of 360 characters</p>')
        $("#addCommentButton").on("click", function(e) { submitComment(stationId) })
        return
    }

    $("#newCommentBox").val("")

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
    $("#stationCommentsLink").off('click')
    $("#addCommentButton").off("click")
    $("#stationCommentsModal").modal("hide")
}

async function openStationRate(stationId) {
    $("#alreadyRatedErrorMessage").empty()

    $("#stationInfoModal").modal("hide")

    $("#addRateButton").on("click", function(e) { submitRate(stationId) })
    let s = stations[stationId]

    $("#ratesModalHead").empty()

    $("#ratesModalHead").append('<h5>' + s.getName() + '</h5>')

    $("#stationRateModal").modal("show")
}

async function submitRate(stationId) {
    $("#alreadyRatedErrorMessage").empty()


    if (stations[stationId].userAlreadyRated(userId)) {
        $("#alreadyRatedErrorMessage").append('<p style="color:red">You\'ve already rated this station</p>')
        $("#stationRatingsLink").off("click")
        return
    }

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
        alert("internal application error")

    await synchronizeDbData("ratings")

    $("#stationRateModal").modal("hide")
}

function cancelStationRate() {
    $("#addRateButton").off("click")
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
    $("#newStationErrorMessage").empty()
    map.closePopup()
    $("#submitNewStationButton").on("click", function(e) { addStation(lat, lon) })
    $("#addStationModal").modal("show")
}

async function addStation(lat, lon) {
    $("#newStationErrorMessage").empty()
    $("#submitNewStationButton").off("click")
    let operator = $("#inputOperator").val();
    let city = $("#inputCity").val();
    let street = $("#inputStreet").val();
    let housenumber = $("#inputHousenumber").val();
    let isFree = $("input[name=freeOption]:checked").val()
    let fee = (isFree == "true") ? false : true

    operator = operator.normalize()
    city = city.normalize()
    street = street.normalize()
    housenumber = housenumber.normalize()

    let argsList = {
        'Operator': { 'value': operator, 'maxLength': 64 },
        'City': { 'value': city, 'maxLength': 64 },
        'Street': { 'value': street, 'maxLength': 64 },
        'House number': { 'value': housenumber, 'maxLength': 10 }
    }
    for (const key in argsList) {
        if (argsList[key].value.length == 0) {
            $("#newStationErrorMessage").append('<p style="color:red">Empty value of <b>' + key + '</b> parameter not allowed</p>')
            $("#submitNewStationButton").on("click", function(e) { addStation(lat, lon) })
            return
        } else if (argsList[key].value.length > argsList[key].maxLength) {
            $("#newStationErrorMessage").append('<p style="color:red">The value of <b>' + key +
                '</b> parameter exceeds the length limit of <b>' + argsList[key].maxLength + '</b> characters</p>')
            $("#submitNewStationButton").on("click", function(e) { addStation(lat, lon) })
            return
        }
    }


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

function cancelNewStationSubmit() {
    $("#submitNewStationButton").off("click")
    $("#addStationModal").modal("hide")
}

function openAddChargerModal(stationId) {
    $("#newChargerErrorMessage").empty()
    $("#addChargerButton").off("click")
    $("#stationInfoModal").modal("hide")
    $("#submitNewChargerButton").off("click")
    $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
    $("#addChargerModal").modal("show")
}


const isNumeric = n => !isNaN(n)

async function addCharger(stationId) {
    $("#newChargerErrorMessage").empty()
    $("#submitNewChargerButton").off("click")
    let power = $("#inputPower").val();
    let plugType = $("#inputPlugType").val();

    power = power.normalize()
    plugType = plugType.normalize()

    if (power.length == 0) {
        $("#newChargerErrorMessage").append('<p style="color:red">Empty value of <b>Power</b> parameter not allowed</p>')
        $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
        return
    } else if (!isNumeric(power)) {
        $("#newChargerErrorMessage").append('<p style="color:red"><b>Power</b> has to be numeric</p>')
        $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
        return
    }

    power = parseInt(power)

    if (power <= 0) {
        $("#newChargerErrorMessage").append('<p style="color:red"><b>Power</b> has to be greater then 0</p>')
        $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
        return
    }

    if (plugType.length == 0) {
        $("#newChargerErrorMessage").append('<p style="color:red">Empty value of <b>Plug type</b> parameter not allowed</p>')
        $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
        return
    } else if (plugType.length > 64) {
        $("#newChargerErrorMessage").append('<p style="color:red">The value of <b>Plug type</b> parameter exceeds the length limit of <b>64</b> characters</p>')
        $("#submitNewChargerButton").on("click", function(e) { addCharger(stationId) })
        return
    }

    let data = JSON.stringify({
        "station_id": stationId,
        "power": power,
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

function cancelNewChargerSubmit() {
    $("#submitNewChargerButton").off("click")
    $("#addChargerModal").modal("hide")
}

async function removeStation(stationId) {
    $("#stationRatingsLink").off("click")
    $("#addRateButton").off("click")

    $("#stationCommentsLink").off("click")
    $("#addCommentButton").off("click")

    $("#addChargerButton").off("click")
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

function showFilterStationModal() {

}

function filterStations() {
    $("#rangeFormInput").remove()

    let rangeFormInput = '<div class="form-group" id="rangeFormInput">' +
        '<label for="inputRangeFilter">Range</label>'


    if (map.hasLayer(startingPoint)) {
        rangeFormInput += '<input type="text" class="form-control" id="inputRangeFilter" placeholder="Range [km]">'
    } else
        rangeFormInput += '<p><i>Place Starting Point on the map to find stations in specified range.</i></p>'

    rangeFormInput += '</div>'
    $("#filterStationModalForm").append(rangeFormInput)

    $("#applyFilterModal").modal("show")
}

function applyFilters() {
    let operator = $("#inputOperatorFilter").val();
    let plugType = $("#inputPlugTypeFilter").val();
    let power = $("#inputPowerFilter").val();
    let range = $("#inputRangeFilter").val();

    let filterByOperator = operator != undefined && operator.length != 0
    let filterByPlugType = plugType != undefined && plugType.length != 0
    let filterByPower = power != undefined && power.length != 0
    let filterByRange = map.hasLayer(startingPoint) && range.length != 0

    if (map.hasLayer(startingPointCircle))
        map.removeLayer(startingPointCircle)

    let startLon = 0.0
    let startLat = 0.0

    if (filterByRange) {
        range = parseFloat(range)
        let latLng = startingPoint.getLatLng()
        startLon = latLng.lng
        startLat = latLng.lat
        startingPointCircle = L.circle([startLat, startLon], { radius: range * 1000 }).addTo(map)
    }

    for (const [k, v] of Object.entries(stations)) {
        let display = true


        if (display && filterByOperator)
            display = v.getOperatorName().toLowerCase().includes(operator.toLowerCase())

        if (display && filterByPlugType) {
            display = v.getNumberOfChargers() != 0

            if (display) {
                plugTypeLoop: for (const c in v.chargers) {
                    display = v.chargers[c].getPlugType().toLowerCase().includes(plugType.toLowerCase())
                    if (!display)
                        break plugTypeLoop
                }
            }
        }

        if (display && filterByPower) {
            powerLoop: for (const c in v.chargers) {
                if (display = (v.chargers[c].getPower() >= power) == false)
                    break powerLoop
            }
        }

        if (display && filterByRange) {
            display = lonLatDistance(startLat, startLon, v.lat, v.lon) <= range
        }

        if (display && !map.hasLayer(v.marker))
            v.marker.addTo(map)

        else if (!display && map.hasLayer(v.marker))
            map.removeLayer(v.marker)
    }
}

function closeFilterButton() {
    $("#applyFilterModal").modal("hide")
}

// source: \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
// https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function lonLatDistance(lat1, lon1, lat2, lon2) {
    let earthRadius = 6371
    dLat = toRad(lat2 - lat1);
    dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    d = earthRadius * c;
    return d;
}

function toRad(Value) {
    return Value * Math.PI / 180;
}
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^