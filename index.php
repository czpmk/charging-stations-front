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

    <link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css" />
    <script src="node_modules/leaflet/dist/leaflet.js"></script>

    <link rel="stylesheet" href="stylesheets/stylesheet.css">
    <script src="scripts/map-script.js"></script>
    <script src="scripts/station.js"></script>
    <script src="scripts/rates.js"></script>
    <script src="scripts/comments.js"></script>
    <script src="scripts/chargers.js"></script>
</head>

<body>
    <div id="main" class="d-flex flex-column vh-100">
        <!-- NAVBAR -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="http://localhost/charging-stations-front">Charging Stations</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="#">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Link</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Dropdown
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><a class="dropdown-item" href="#">Action</a></li>
                                <li><a class="dropdown-item" href="#">Another action</a></li>
                                <li>
                                    <hr class="dropdown-divider">
                                </li>
                                <li><a class="dropdown-item" href="#">Something else here</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link disabled">Disabled</a>
                        </li>
                    </ul>
                    <form class="d-flex">
                        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>

            </div>
        </nav>
        <div class="h-100">
            <div id="map" class="h-100"></div>
        </div>
        <!-- STATION INFO MODAL -->
        <div class="modal fade" id="stationInfoModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="stationName"></h5>
                    </div>
                    <div class="modal-body">
                        <button type="button" class="btn btn-lg btn-outline-info" id="stationRatingsView">asd</button>
                        <button type="button" class="btn btn-lg btn-outline-warning" id="stationCommentsLink">asd</button>
                        <h6 class="modal-subtitle" id="stationOperatorName"></h6>
                        <h6 class="modal-subtitle" id="stationCity"></h6>
                        <h6 class="modal-subtitle" id="stationStreet"></h6>
                        <h6 class="modal-subtitle" id="stationHouseNumber"></h6>
                        <h6 class="modal-subtitle" id="stationFree"></h6>
                        <h6 class="modal-subtitle" id="stationCapacity"></h6>

                        <div class="accordion" id="accordionPanelsChargers"></div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="closeStationInfo()">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>