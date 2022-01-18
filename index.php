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
                            <button class="btn" onclick="filterStations()">Search</button>
                        </li>
                    </ul>
                    <div id="userLink"><button class="btn" id="userNameButton" disabled></button></div>
                    <div id="logOutLink"><button class="btn">Log out</button></div>
                </div>

            </div>
        </nav>
        <!-- MAP -->
        <div class="h-100" id="mapSection">
            <div id="map" class="h-100"></div>
        </div>
        <!-- ALERT MODAL -->
        <div class="modal fade" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="modalLabl3" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <h5 class="modal-title" id="alertModalTitle"></h5>
                    </div>
                    <div class="modal-body justify-content-center">
                        <div id="alertModalMessage">
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center d-block text-center">
                        <div>
                            <button type="button" class="btn btn-primary justify-content-center" onclick="alertModalHide()">Ok</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- STATION INFO MODAL -->
        <div class="modal fade" id="stationInfoModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel1" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center d-block text-center">
                        <h5 class="modal-title" id="stationName"></h5>
                        <div>
                            <button type="button" class="btn btn-lg btn-outline-info" id="stationRatingsLink"></button>
                            <button type="button" class="btn btn-lg btn-outline-warning" id="stationCommentsLink"></button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <h6 class="modal-subtitle" id="stationOperatorName"></h6>
                        <h6 class="modal-subtitle" id="stationCity"></h6>
                        <h6 class="modal-subtitle" id="stationStreet"></h6>
                        <h6 class="modal-subtitle" id="stationHouseNumber"></h6>
                        <h6 class="modal-subtitle" id="stationFree"></h6>
                        <h6 class="modal-subtitle" id="stationCapacity"></h6>

                        <div class="accordion" id="accordionPanelsChargers"></div>

                        <hr>
                        <div class="justify-content-center d-block text-center">
                            <p>Do you know this place?</p>
                            <button type="button" class="btn btn-secondary" id="addChargerButton" data-dismiss="modal">Add a charger</button>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center" id="stationInfoModalFooter">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="closeStationInfo()">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- COMMENTS MODAL -->
        <div class="modal fade" id="stationCommentsModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel2" aria-hidden="true">
            <div class="modal-dialog modal-dialog-scrollable" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center" id="commentsModalHead">
                    </div>
                    <div class="modal-body" id="commentsModalBody">

                    </div>
                    <div class="modal-footer justify-content-center" id="commentsModalFooter">

                        <input type="text" class="form-control" id="newCommentBox">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="addCommentButton">Add Comment</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="closeStationComments()">Close</button>
                    </div>
                    <div id="commentErrorMessage" class='justify-content-center text-center d-block'>
                    </div>
                </div>
            </div>
        </div>
        <!-- RATE MODAL -->
        <div class="modal fade" id="stationRateModal" tabindex="-1" role="dialog" aria-labelledby="modalLabl3" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center" id="ratesModalHead">
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
                    <div id="alreadyRatedErrorMessage" class='justify-content-center text-center d-block'>
                    </div>
                    <div class="modal-footer justify-content-center" id="ratesModalFooter">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="addRateButton">Rate</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="cancelStationRate()">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- ADD STATION MODAL -->
        <div class="modal fade" id="addStationModal" tabindex="-1" role="dialog" aria-labelledby="modalLabl3" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <h5 class="modal-title">Add Station</h5>
                    </div>
                    <div class="modal-body justify-content-center">
                        <form>
                            <div class="form-group">
                                <label for="inputOperator">Operator name</label>
                                <input type="text" class="form-control" id="inputOperator" placeholder="Operator">
                            </div>
                            <div class="form-group">
                                <label for="inputCity">City</label>
                                <input type="text" class="form-control" id="inputCity" placeholder="City">
                            </div>
                            <div class="form-group">
                                <label for="inputStreet">Street</label>
                                <input type="text" class="form-control" id="inputStreet" placeholder="Street">
                            </div>
                            <div class="form-group">
                                <label for="inputHousenumber">House number</label>
                                <input type="text" class="form-control" id="inputHousenumber" placeholder="House number">
                            </div>
                            <div class="form-group">
                                <label for="inputIsFree">Free of charge</label>
                                <div class="justify-content-center text-center" id="inputIsFree">
                                    <label class="radio-inline"><input type="radio" name="freeOption" id="isFreeOption" value="true" checked> Free </label>
                                    <label class="radio-inline"><input type="radio" name="freeOption" id="isNotFreeOption" value="false"> Not free </label>
                                </div>
                            </div>
                        </form>
                        <div id="newStationErrorMessage" class='justify-content-center text-center d-block'>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center d-block text-center">
                        <div>
                            <button type="button" class="btn btn-primary justify-content-center" id="submitNewStationButton">Submit</button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="cancelNewStationSubmit()">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- ADD CHARGER MODAL -->
        <div class="modal fade" id="addChargerModal" tabindex="-1" role="dialog" aria-labelledby="modalLabl3" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <h5 class="modal-title">Add Charger</h5>
                    </div>
                    <div class="modal-body justify-content-center">
                        <form>
                            <div class="form-group">
                                <label for="inputPower">Power</label>
                                <input type="text" class="form-control" id="inputPower" placeholder="Power [kW]">
                            </div>
                            <div class="form-group">
                                <label for="inputPlugType">Plug type</label>
                                <input type="text" class="form-control" id="inputPlugType" placeholder="Plug type">
                            </div>
                        </form>
                        <div id="newChargerErrorMessage" class='justify-content-center text-center d-block'>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center d-block text-center">
                        <div>
                            <button type="button" class="btn btn-primary justify-content-center" id="submitNewChargerButton">Submit</button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="cancelNewChargerSubmit()">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- FILTER STATIONS -->
        <div class="modal fade" id="applyFilterModal" tabindex="-1" role="dialog" aria-labelledby="modalLabl3" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header justify-content-center">
                        <h5 class="modal-title">Filters</h5>
                    </div>
                    <div class="modal-body justify-content-center">
                        <form id="filterStationModalForm">
                            <div class="form-group">
                                <label for="inputOperatorFilter">Operator name</label>
                                <input type="text" class="form-control" id="inputOperatorFilter" placeholder="Operator name">
                            </div>
                            <div class="form-group">
                                <label for="inputPlugTypeFilter">Plug type</label>
                                <input type="text" class="form-control" id="inputPlugTypeFilter" placeholder="Plug type">
                            </div>
                            <div class="form-group">
                                <label for="inputPowerFilter">Power</label>
                                <input type="text" class="form-control" id="inputPowerFilter" placeholder="Power [kW]">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer justify-content-center d-block text-center">
                        <div>
                            <button type="button" class="btn btn-primary justify-content-center" id="applyFiltersButton" onclick="applyFilters()">Apply</button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="closeFilterButton()">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>