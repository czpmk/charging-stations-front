let chargerOptions = ["Type 2", "Type 1 combo", "CHAdeMO", "Type 2 combo", "Type 1", "Type 2 combo 2"];

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
        await stations_resp.results.forEach(async s => {
            if (!stations.hasOwnProperty(s.id)) {
                stations[s.id] = new Station(s);
                addStationToMap(stations[s.id]);
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
        .on('mouseover', function (e) { this.openPopup() })
        .on('mouseout', function (e) { this.closePopup() })
        .on('click', function (e) { openStationInfo(station.id) })
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
        .on('click', function (e) { this.openPopup() })
        .addTo(map)
}

function addEndPointToMap(lat, lon) {
    if (map.hasLayer(endPoint))
        map.removeLayer(endPoint)

    let removeEndPointButtonString = '<button type="button" class="btn btn-outline-success"' +
        'id="removeEndPointButton" onclick="removeEndPoint()">Remove Finish Point</button>'

    endPoint = L.marker([lat, lon], {
        riseOnHover: true,
        icon: endPointIcon
    })
        .bindPopup('<div class="justify-content-center d-block text-center">' +
            removeEndPointButtonString +
            '</div>', { offset: [0, -10] })
        .on('click', function (e) { this.openPopup() })
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
    $("#showRouteStationInfoDiv").empty()

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

    if (map.hasLayer(startingPoint)) {
        $("#showRouteStationInfoDiv").append('<button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="addRouteToMap(' +
            stationId +
            ')">Find Route to this Station</button>')
    }
    else {
        $("#showRouteStationInfoDiv").append('<p><i>Specify a starting point to show the route.</i></p>')
        map.hasLayer
    }

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

            let pow = chargerData.getPower()
            if (chargerData.power != 0)
                pow += ' kW'
            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Power: ' + pow + '</h6>')
            $("#" + bodyItemTag).append('<h6 class="chargerInfo">Plug type: ' + chargerData.getPlugType() + '</h6>')

            if (userAdmin)
                $("#" + bodyItemTag).append('<button type="button" class="btn btn-danger justify-content-center" id="removeChargerButton" onclick="removeCharger(' +
                    chargerData.getId() + ', ' + stationId +
                    ')">REMOVE CHARGER</button>')
        }
    }

    $("#stationRatingsLink").on("click", function (e) { openStationRate(stationId) })

    $("#stationCommentsLink").on("click", function (e) { openStationComments(stationId) })

    $("#addChargerButton").on("click", function (e) { openAddChargerModal(stationId) })

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
    $("#addCommentButton").on("click", function (e) { submitComment(stationId) })
    $("#stationCommentsModal").modal("show")
}

async function submitComment(stationId) {
    let newComment = $("#newCommentBox").val()
    $("#addCommentButton").off("click")
    $("#commentErrorMessage").empty()

    newComment = newComment.normalize()

    if (newComment.length == 0) {
        $("#commentErrorMessage").append('<p style="color:red">Cannot submit an empty comment</p>')
        $("#addCommentButton").on("click", function (e) { submitComment(stationId) })
        return
    } else if (newComment.length > 360) {
        $("#commentErrorMessage").append('<p style="color:red">Comment length exceeds the limit of 360 characters</p>')
        $("#addCommentButton").on("click", function (e) { submitComment(stationId) })
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

    $("#addRateButton").on("click", function (e) { submitRate(stationId) })
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

    let placeStartingPointButtonString = '<button type="button" class="btn btn-outline-warning"' +
        'id="setStartingPointButton" onclick="setStartingPoint(' +
        arg.latlng.lat + ', ' + arg.latlng.lng +
        ')">Set Starting Point</button>'

    let placeEndPointButtonString = '<button type="button" class="btn btn-outline-success"' +
        'id="setEndPointButton" onclick="setEndPoint(' +
        arg.latlng.lat + ', ' + arg.latlng.lng +
        ')">Set Finish Point</button>'

    if (map.hasLayer(startingPoint)) {
        L.popup()
            .setLatLng(arg.latlng)
            .setContent('<div class="justify-content-center d-block text-center">' +
                newStationButtonString + '<br>' +
                placeStartingPointButtonString + '<br>' +
                placeEndPointButtonString +
                '</div>')
            .openOn(map)
    }
    else {
        L.popup()
            .setLatLng(arg.latlng)
            .setContent('<div class="justify-content-center d-block text-center">' +
                newStationButtonString + '<br>' +
                placeStartingPointButtonString + '<br>' +
                '<p><i><b>Finish Point</b> not available until the <b>Starting Point</b> is established</i></p>' +
                '</div>')
            .openOn(map)
    }
}

async function openAddStationModal(lat, lon) {
    $("#newStationErrorMessage").empty()
    map.closePopup()
    let address = await getAddressByCoodrinates(lat, lon);
    if (address.valid === true) {
        if (address.results.city !== null)
            $("#inputCity").val(address.results.city);

        if (address.results.street !== null)
            $("#inputStreet").val(address.results.street);

        if (address.results.street_number !== null)
            $("#inputHousenumber").val(address.results.street_number);
    }
    $("#submitNewStationButton").on("click", function (e) { addStation(lat, lon) })
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
            $("#submitNewStationButton").on("click", function (e) { addStation(lat, lon) })
            return
        } else if (argsList[key].value.length > argsList[key].maxLength) {
            $("#newStationErrorMessage").append('<p style="color:red">The value of <b>' + key +
                '</b> parameter exceeds the length limit of <b>' + argsList[key].maxLength + '</b> characters</p>')
            $("#submitNewStationButton").on("click", function (e) { addStation(lat, lon) })
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

    const otherOption = 'other'

    $("#selectPlugTypeList").empty();
    $("#inputPlugType").val("");

    chargerOptions.sort();
    for (let o of chargerOptions) {
        $("#selectPlugTypeList").append(`<option value="${o}">${o}</option>`);
    }
    $("#selectPlugTypeList").append(`<option value="${otherOption}">${otherOption}</option>`);

    $("#selectPlugTypeList").on('change', () => {
        if ($("#selectPlugTypeList").val() === 'other') {
            $("#inputPlugType").prop("disabled", false);
        }
        else {
            $("#inputPlugType").val("");
            $("#inputPlugType").prop("disabled", true);
        }
    });

    if ($("#selectPlugTypeList").val() !== 'other') {
        $("#inputPlugType").val("");
        $("#inputPlugType").prop("disabled", true);
    }

    $("#stationInfoModal").modal("hide")
    $("#submitNewChargerButton").off("click")
    $("#submitNewChargerButton").on("click", function (e) { addCharger(stationId) })
    $("#addChargerModal").modal("show")
}


const isNumeric = n => !isNaN(n)

async function addCharger(stationId) {
    $("#newChargerErrorMessage").empty()
    $("#submitNewChargerButton").off("click")
    let power = $("#inputPower").val();
    let plugTypeFromList = $("#selectPlugTypeList").val();
    let plugTypeFromInput = $("#inputPlugType").val();
    let plugType = "";

    if (plugTypeFromList !== 'other') {
        plugType = plugTypeFromList;
    }
    else {
        plugType = plugTypeFromInput;
    }

    power = power.normalize()
    plugType = plugType.normalize()

    if (power.length == 0) {
        $("#newChargerErrorMessage").append('<p style="color:red">Empty value of <b>Power</b> parameter not allowed</p>')
        $("#submitNewChargerButton").on("click", function (e) { addCharger(stationId) })
        return
    } else if (!isNumeric(power)) {
        $("#newChargerErrorMessage").append('<p style="color:red"><b>Power</b> has to be numeric</p>')
        $("#submitNewChargerButton").on("click", function (e) { addCharger(stationId) })
        return
    }

    power = parseInt(power)

    if (power <= 0) {
        $("#newChargerErrorMessage").append('<p style="color:red"><b>Power</b> has to be greater then 0</p>')
        $("#submitNewChargerButton").on("click", function (e) { addCharger(stationId) })
        return
    }

    if (plugType.length == 0) {
        $("#newChargerErrorMessage").append('<p style="color:red">Empty value of <b>Plug type</b> parameter not allowed</p>')
        $("#submitNewChargerButton").on("click", function (e) { addCharger(stationId) })
        return
    } else if (plugType.length > 64) {
        $("#newChargerErrorMessage").append('<p style="color:red">The value of <b>Plug type</b> parameter exceeds the length limit of <b>64</b> characters</p>')
        $("#submitNewChargerButton").on("click", function (e) { addCharger(stationId) })
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

function setEndPoint(lat, lon) {
    $("#setEndPointButton").off("click")
    addEndPointToMap(lat, lon)
    map.closePopup()
}

function removeStartingPoint() {
    $("#removeStartingPointButton").off("click")
    if (map.hasLayer(startingPoint))
        map.removeLayer(startingPoint)

    if (map.hasLayer(endPoint))
        map.removeLayer(endPoint)

    map.closePopup()
}

function removeEndPoint() {
    $("#removeEndPointButton").off("click")
    if (map.hasLayer(endPoint))
        map.removeLayer(endPoint)

    map.closePopup()
}

function showFilterStationModal() {

}

function filterStations() {
    $("#rangeFormInput").remove()
    $("#filterModalError").empty()

    let rangeFormInput = '<div class="form-group" id="rangeFormInput">' +
        '<label for="inputRangeFilter">Range</label>'


    if (map.hasLayer(startingPoint)) {
        rangeFormInput +=
            '<input type="text" class="form-control" id="inputRangeFilter" placeholder="Range [km]">\n' +
            '<div class="justify-content-center text-center">' +
            '<input type="checkbox" id="straightLineOnlyCheckbox" value="straightLineOnly">\n' +
            '<label for="straightLineOnlyCheckbox">Range in straight line only</label>' +
            '</div>\n'
    } else {
        rangeFormInput += '<p><i>Place Starting Point on the map to find stations in a specified range.</i></p>'
    }

    rangeFormInput += '</div>'
    $("#filterStationModalForm").append(rangeFormInput)

    $("#applyFilterModal").modal("show")
}

function enableSearchFilterRemovalButton() {
    $("#clearSearchFiltersButton").prop("disabled", false);
    stationsFiltered = true;
}

function clearSearchFilters() {
    if (stationsFiltered) {
        for (const [k, v] of Object.entries(stations)) {
            if (!map.hasLayer(v.marker))
                v.marker.addTo(map)
        }
        $("#clearSearchFiltersButton").prop("disabled", true);

        selectedRoute.clearLayers();

        if (map.hasLayer(startingPointCircle))
            map.removeLayer(startingPointCircle)
    }

    stationsFiltered = false;
}

function validateFilters(operator, plugType, power, range, filterByRealRange) {
    if (operator.length > 64) {
        $("#filterModalError").append('<p style="color:red">The value of <b>Operator</b> parameter exceeds the length limit of <b>64</b> characters</p>')
        return false
    }

    if (plugType.length > 64) {
        $("#filterModalError").append('<p style="color:red">The value of <b>Plug type</b> parameter exceeds the length limit of <b>64</b> characters</p>')
        return false
    }

    if (power.length != 0) {
        if (!isNumeric(power)) {
            $("#filterModalError").append('<p style="color:red"><b>Power</b> has to be numeric</p>')
            return false
        }

        power = parseInt(power)

        if (power <= 0) {
            $("#filterModalError").append('<p style="color:red"><b>Power</b> has to be greater then 0</p>')
            return false
        }
    }

    if (range.length != 0) {
        if (!isNumeric(range)) {
            $("#filterModalError").append('<p style="color:red"><b>Range</b> has to be numeric</p>')
            return false
        }

        range = parseInt(range)

        if (range <= 0) {
            $("#filterModalError").append('<p style="color:red"><b>Range</b> has to be greater then 0</p>')
            return false
        }

        if (filterByRealRange && range > 5) {
            $("#filterModalError").append('<p style="color:red"><b>Range</b> value greater than 5 km is valid when searching in a <b>straight line</b> only</p>')
            return false
        }
    }

    return true
}

function stationWithinFilterConstraints(station, operatorNameSplitList, cityNameSplitList, plugTypeSplitList, free, power) {
    // OPERATOR
    if (operatorNameSplitList !== null) {
        for (const element of operatorNameSplitList) {
            if (!station.getOperatorName().toLowerCase().includes(element))
                return false;
        }
    }

    // CITY
    if (cityNameSplitList !== null) {
        for (const element of cityNameSplitList) {
            if (!station.getCity().toLowerCase().includes(element))
                return false
        }
    }

    // PLUG TYPE
    if (plugTypeSplitList !== null) {
        // do not display stations without chargers specified when filtering by a plug type
        if (station.getNumberOfChargers() === 0)
            return false

        // check if at least 1 charger has a propper plug type, since there might be multiple
        let chargerWithCorrectPlugTypeFound = false
        chargersLoop: for (const cIdx in station.chargers) {

            let allMatch = true
            plugTypeNameElemetsLoop: for (const element in plugTypeSplitList) {
                if (!station.chargers[cIdx].getPlugType().toLowerCase().includes(plugTypeSplitList[element])) {
                    allMatch = false
                    break plugTypeNameElemetsLoop
                }
            }

            if (allMatch) {
                chargerWithCorrectPlugTypeFound = true
                break chargersLoop
            }
        }

        if (!chargerWithCorrectPlugTypeFound)
            return false
    }

    // FEE
    if (free !== null && free !== "both") {
        if (free === "free" && station.isFree() !== "yes")
            return false
        else if (free === "paid" && station.isFree() !== "no")
            return false
    }

    // POWER
    if (power !== null) {
        if (Object.entries(station.chargers).length == 0)
            return false
        else {
            for (const cIdx in station.chargers) {
                if (parseFloat(station.chargers[cIdx].power) < power) {
                    return false
                }
            }
        }
    }

    // OK
    return true
}

async function getNearestStationRealDistance(startLat, startLon) {
    let nearestStationId = null;
    let shortestDistance = 1000000000;
    for (const [k, station] of Object.entries(stations)) {
        if (!map.hasLayer(station.marker)) {
            continue;
        }
        else {
            let newRoute = await getRoute(startLat, startLon, station.lat, station.lon);
            let newDistance = newRoute.routes.features[0].attributes.Total_Kilometers;
            if (newDistance < shortestDistance) {
                shortestDistance = newDistance;
                nearestStationId = k;
            }
        }
    }

    return nearestStationId
}

function getNearestStationStraightLine(startLat, startLon) {
    let nearestStationId = null;
    let shortestDistance = 1000000000;
    for (const [k, station] of Object.entries(stations)) {
        if (!map.hasLayer(station.marker)) {
            continue;
        }
        else {
            let newDistance = lonLatDistance(startLat, startLon, station.lat, station.lon);
            if (newDistance < shortestDistance) {
                shortestDistance = newDistance;
                nearestStationId = k;
            }
        }
    }

    return nearestStationId
}

async function applyFilters() {
    $("#filterModalError").empty()

    let operator = $("#inputOperatorFilter").val().normalize();
    let plugType = $("#inputPlugTypeFilter").val().normalize();
    let power = $("#inputPowerFilter").val().normalize();
    let city = $("#inputCityFilter").val().normalize();
    let free = $("input[name=freeOptionFilter]:checked").val()
    let range = map.hasLayer(startingPoint) ? $("#inputRangeFilter").val().normalize() : "";
    let filterByRange = map.hasLayer(startingPoint) && isNumeric(range) && range > 0;
    let filterByRealRange = filterByRange && ($("#straightLineOnlyCheckbox").is(':checked')) === false;
    let rangeFromEndPoint = filterByRange && map.hasLayer(endPoint)

    // check input, display error message and wait for 'Cancel' button or input data fixed
    if (!validateFilters(operator, plugType, power, range, filterByRealRange))
        return

    // clear the last route
    selectedRoute.clearLayers()

    let toListNullOrStripped = function (inputValue) {
        if (inputValue === undefined || inputValue === null || inputValue === "")
            return null
        let aList = inputValue.toLowerCase().split(' ')
        aList = aList.map(x => x.replace(' ', ''));
        aList = aList.filter(x => x.length !== 0);
        return aList.lenght === 0 ? null : aList
    };

    let numericOrNull = function (inputValue) {
        if (inputValue === undefined || inputValue.length === 0 || !isNumeric(inputValue))
            return null
        return inputValue
    }

    let operatorNameSplit = toListNullOrStripped(operator)
    let plugTypeSplit = toListNullOrStripped(plugType)
    let cityNameSplit = toListNullOrStripped(city)
    let powerNumeric = numericOrNull(power)
    let rangeNumeric = filterByRange ? parseFloat(numericOrNull(range)) : null

    if (map.hasLayer(startingPointCircle))
        map.removeLayer(startingPointCircle)


    let circleLatLng = 0
    // draw the circle
    if (filterByRange) {
        circleLatLng = rangeFromEndPoint ? endPoint.getLatLng() : startingPoint.getLatLng()
        startingPointCircle = L.circle([circleLatLng.lat, circleLatLng.lng], { radius: rangeNumeric * 1000 }).addTo(map)
    }

    // REMOVE ALL STATIONS FROM MAP
    for (const [k, station] of Object.entries(stations)) {
        map.removeLayer(station.marker)
    }

    // ADD STATIONS BY FILTERS (range excluded)
    for (const [k, station] of Object.entries(stations)) {
        let display = true;
        if (!stationWithinFilterConstraints(station, operatorNameSplit, cityNameSplit, plugTypeSplit, free, powerNumeric)) {
            display = false;
        }

        // check straight line range
        if (display && filterByRange && rangeNumeric !== null) {
            if (lonLatDistance(circleLatLng.lat, circleLatLng.lng, station.lat, station.lon) > rangeNumeric) {
                display = false
            }
        }

        if (display)
            station.marker.addTo(map)
        else if (!display && map.hasLayer(station.marker))
            map.removeLayer(station.marker)
    }

    if (filterByRange) {
        if (filterByRealRange) {
            $("#waitingInfoNavBar").append('<button class="btn" disabled>Please wait, calculating routes...</button>')

            let nearestStationId = await getNearestStationRealDistance(circleLatLng.lat, circleLatLng.lng);
            await addRouteToMap(nearestStationId);

            $("#waitingInfoNavBar").empty()
        }
        else {
            let nearestStationId = getNearestStationStraightLine(circleLatLng.lat, circleLatLng.lng);
            await addRouteToMap(nearestStationId);
        }
    }


    enableSearchFilterRemovalButton();
}

function closeFilterButton() {
    $("#applyFilterModal").modal("hide")
}

async function getAddressByCoodrinates(lat, lng) {
    let data = JSON.stringify({
        "longitude": lng,
        "latitude": lat,
    })

    let res = await fetch("http://localhost:3011/mapUtils/reverseGeocode?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    return res;
}

async function getRoute(lat1, lng1, lat2, lng2) {
    let data = JSON.stringify({
        "longitude1": lng1,
        "latitude1": lat1,
        "longitude2": lng2,
        "latitude2": lat2,
    })

    let res = await fetch("http://localhost:3011/mapUtils/findRoute?token=" + session_token, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: data
    }).then(data => data.json())

    // DISTANCE IN KILOMETERS

    if (res.valid === false)
        return null;
    else
        return res.results;
}

async function addRouteToMap(nearestStationId) {
    selectedRoute.clearLayers()
    if (nearestStationId !== null) {
        let nearestStationCoords = stations[nearestStationId];
        let startCoords = startingPoint.getLatLng();

        let newRoute = await getRoute(startCoords.lat, startCoords.lng, nearestStationCoords.lat, nearestStationCoords.lon);
        if (newRoute !== null) {
            stationRouteDict[nearestStationId] = {
                'route': newRoute.routes.geoJson,
                'distance': newRoute.routes.features[0].attributes.Total_Kilometers
            }
            selectedStationId = nearestStationId;
            L.geoJSON(stationRouteDict[nearestStationId].route,
                {
                    style:
                    {
                        "color": "red",
                        "weight": 5,
                        "opacity": 0.5
                    }

                }
            )
                .bindPopup('<div class="justify-content-center d-block text-center">' +
                    "Route length: " + stationRouteDict[nearestStationId].distance.toFixed(2) + " km" +
                    '</div>', { offset: [0, -10] })
                .on('click', function (e) { this.openPopup() })
                .addTo(selectedRoute);
                
            enableSearchFilterRemovalButton();
        }
    }
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