async function checkIfTokenValid(token) {
    let res = await fetch("http://localhost:3011/auth?token=" + token).then(data => data.json())
    console.log(res)
    if (res.valid == true)
        return true
    else
        return false
}

async function login() {
    jQuery(async function() {
        $("#logInButton").off("click")
        let email = $("#inputEmail").val();
        let password = $("#inputPassword").val();

        let data = JSON.stringify({
            "email": email,
            "password": sha256(password)
        })

        let res = await fetch("http://localhost:3011/login", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        }).then(data => data.json())

        if (res.valid) {
            createCookie(res.token)
            window.location = 'index.php';
        } else {
            // TODO error prompt
            console.log("could not log in")
            $("#inputPassword").val("")
            $("#logInButton").on("click", login)
        }
    });
}

async function register() {
    jQuery(async function() {
        $("#registerButton").off("click")
        let email = $("#inputEmail").val();
        let password = $("#inputPassword").val();

        let data = JSON.stringify({
            "email": email,
            "password": sha256(password)
        })

        let res = await fetch("http://localhost:3011/register", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        }).then(data => data.json())

        if (res.valid) {
            createCookie(res.token)
            window.location = 'index.php';
        } else {
            // TODO error prompt EMAIL ALREADY IN USE, and so on
            console.log("could not register")
            $("#inputPassword").val("")
            $("#registerButton").on("click", register)
        }
    });
}

async function logOut() {
    jQuery(async function() {
        $("#logOutLink").off("click")

        let res = await fetch("http://localhost:3011/logout?token=" + session_token).then(data => data.json())

        if (res.valid) {
            window.location = 'login.php';
        } else {
            // TODO repeat?
            console.log("could not log out")
            $("#logOutLink").on("click", logOut)
        }
    });
}

function createCookie(token) {
    Cookies.set('charging_stations_session_token', token, { path: '/', sameSite: 'strict' })
}

function getTokenFromCookie() {
    let token = Cookies.get('charging_stations_session_token')
    if (token !== undefined && token.length == 32)
        return { "exists": true, "value": token }
    else
        return { "exists": false, "value": '' }
}