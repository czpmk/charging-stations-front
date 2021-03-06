window.onload = init;

let eti_coords = { "lon": 18.612704654420106, "lat": 54.37165722576064 }
let stations = {}
let session_token = ""
let map = 0
let userId = 0
let userAdmin = false
let userEmail = "USR_EMAIL"
let startingPointCircle = 0
let startingPoint = 0
let startingPointIcon = L.icon({
    iconUrl: "http://localhost/charging-stations-front/assets/starting-point.png",
    iconSize: [32, 32]
});
let endPointCircle = 0
let endPoint = 0
let endPointIcon = L.icon({
    iconUrl: "http://localhost/charging-stations-front/assets/end-point.png",
    iconSize: [32, 32]
});
let stationRouteDict = null
let selectedStationId = null
let selectedRoute = null;
let stationsFiltered = false;

async function init() {
    let token = getTokenFromCookie();
    if (!token.exists || !(await checkIfTokenValid(token.value))) {
        window.location = 'login.php';
    } else {
        session_token = token.value
        userInfo = (await getUserInfo(session_token))
        userAdmin = userInfo.is_admin;
        userEmail = userInfo.email;
        userId = userInfo.user_id

        map = L.map('map')
        map.on('click', function(e) { openPlaceOnMapSelection(e) })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        stationRouteDict = Object()
        selectedRoute = L.layerGroup().addTo(map);

        await synchronizeDbData()
        $("#userNameButton").text(userEmail)
        $("#logOutLink").on("click", logOut)
        map.setView([eti_coords.lat, eti_coords.lon], 13);
    }
}