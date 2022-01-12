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

    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sha256/0.9.0/sha256.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>

    <link rel="stylesheet" href="stylesheets/stylesheet.css">
    <script src="scripts/user-utils.js"></script>
    <script src="scripts/map-utils.js"></script>
    <script src="scripts/map.js"></script>
    <script src="scripts/station.js"></script>
    <script src="scripts/rate.js"></script>
    <script src="scripts/comment.js"></script>
    <script src="scripts/charger.js"></script>
</head>

<body>
    <div id="main" class="d-flex flex-column vh-100">
        <!-- NAVBAR -->
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="http://localhost/charging-stations-front">Charging Stations</a>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link disabled">Search</a>
                        </li>
                    </ul>
                    <div id="userLink"><button class="btn">User</button></div>
                    <div id="logOutLink"><button class="btn">Log out</button></div>
                </div>

            </div>
        </nav>
        <!-- MAP -->
        <div class="h-100" id="mapSection">
            <div id="map" class="h-100"></div>
        </div>
        <!-- STATION INFO MODAL -->
        <div class="modal fade" id="stationInfoModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel1" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="stationName"></h5>
                    </div>
                    <div class="modal-body">
                        <button type="button" class="btn btn-lg btn-outline-info" id="stationRatingsLink"></button>
                        <button type="button" class="btn btn-lg btn-outline-warning" id="stationCommentsLink"></button>
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
        <!-- COMMENTS MODAL -->
        <div class="modal fade" id="stationCommentsModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel2" aria-hidden="true">
            <div class="modal-dialog modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header" id="commentsModalHead">
                    </div>
                    <div class="modal-body" id="commentsModalBody">

                    </div>
                    <div class="modal-footer" id="commentsModalFooter">
                        <input type="text" class="form-control" id="newCommentBox">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="addCommentButton">Add Comment</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="closeStationComments()">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- RATE MODAL -->
        <div class="modal fade" id="stationRateModal" tabindex="-1" role="dialog" aria-labelledby="modalLabl3" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header" id="ratesModalHead">
                    </div>
                    <div class="modal-body" id="ratesModalBody">
                        <div class="btn-toolbar justify-content-center" role="toolbar" id="dupa" aria-label="radioControlRate">
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="rateOption" id="rateOption1" value=1>
                                <label class="form-check-label" for="rateOption1">1</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="rateOption" id="rateOption2" value=2>
                                <label class="form-check-label" for="rateOption2">2</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="rateOption" id="rateOption3" value=3>
                                <label class="form-check-label" for="rateOption3">3</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="rateOption" id="rateOption4" value=4>
                                <label class="form-check-label" for="rateOption4">4</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="rateOption" id="rateOption5" value=5>
                                <label class="form-check-label" for="rateOption5">5</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" id="ratesModalFooter">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="addRateButton">Rate</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="cancelStationRate()">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>