<?php
session_start();
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title>Electric Vehicles Charging Stations</title>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css">
    <script src="node_modules/bootstrap/dist/js/bootstrap.js"></script>

    <link rel="stylesheet" href="stylesheets/stylesheet.css">

    <script src="scripts/user-utils.js"></script>
    <script src="scripts/register.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>
</head>

<body>
    <!-- NAVBAR -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="http://localhost/charging-stations-front">Charging Stations</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
    </nav>
    <!-- REGISTER FORM -->
    <div class="modal  fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header justify-content-center">
                    <h5 class="modal-title">Register</h5>
                </div>
                <div class="modal-body justify-content-center">
                    <form>
                        <div class="form-group">
                            <label for="inputEmail">Email</label>
                            <input type="email" class="form-control" id="inputEmail" aria-describedby="emailHelp" placeholder="email">
                        </div>
                        <div class="form-group">
                            <label for="inputPassword">Password</label>
                            <input type="password" class="form-control" id="inputPassword" placeholder="password">
                        </div>
                        <hr>
                        <div class="justify-content-center text-center">
                            <button type="button" class="btn btn-primary justify-content-center" id="registerButton">Register</button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer justify-content-center d-block text-center">
                    <p>Already have an account?</p>
                    <div>
                        <button type="button" class="btn btn-outline-primary" id="goToLogInButton">Log In</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>