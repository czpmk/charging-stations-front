window.onload = init;

let eti_coords = { "lon": 18.612704654420106, "lat": 54.37165722576064 }
let stations = {}
let session_token = "5fe7b178ab69462ca4458b5d7e35b2d1"
let map = 0

async function init() {
    let token = getTokenFromCookie();
    if (!token.exists || !(await checkIfTokenValid(token.value))) {
        window.location = 'login.php';
    } else {
        session_token = token.value
        map = L.map('map')

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        await loadStations()
        $("#logOutLink").on("click", logOut)
        Object.entries(stations).forEach(([k, v]) => { addStationToMap(v) })
        map.setView([eti_coords.lat, eti_coords.lon], 13);

    }
}