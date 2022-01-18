function errorPromptShow(title, message, otherModal) {
    $("#alertModalMessage").empty()

    $("#alertModalTitle").first().text(title)
    $("#alertModalMessage").append('<p>' + message + '</p>')

    if (otherModal != false) {
        $("#" + otherModal).modal("hide")
        $("#alertModalCloseButton").on("click", function(e) { alertModalHide(otherModal) })
    } else {
        $("#alertModalCloseButton").on("click", function(e) { alertModalHide() })
    }

    $("#alertModal").modal("show")
}

function alertModalHide(otherModal) {
    $("#alertModalCloseButton").off("click")
    $("#alertModal").modal("hide")
    $("#alertModalMessage").empty()

    if (otherModal != false)
        $("#" + otherModal).modal("show")
}