window.onload = init;


async function init() {
    let token = getTokenFromCookie();
    if (token.exists && (await checkIfTokenValid(token.value))) {
        window.location = 'index.php';
    } else {
        jQuery(function() {
            $("#logInButton").on("click", login)
            $("#goToRegisterButton").on("click", function(e) { window.location = 'register.php' })
        })
    }
}