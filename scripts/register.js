window.onload = init;


async function init() {
    let token = getTokenFromCookie();
    if (token.exists && (await checkIfTokenValid(token.value))) {
        window.location = 'index.php';
    } else {
        jQuery(function() {
            $("#registerButton").on("click", register)
            $("#goToLogInButton").on("click", function(e) { window.location = 'login.php' })
        })
    }
}