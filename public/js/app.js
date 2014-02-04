var watchID = null;
var currentPosition;
var positionListeners = [];

// function hideAddressBar() {
//     if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio)
//         document.documentElement.style.height = (window.outerHeight / window.devicePixelRatio) + 'px';
//     setTimeout(window.scrollTo(1, 1), 0);
// }
// window.addEventListener("load", function () {
//     hideAddressBar();
// });
// window.addEventListener("orientationchange", function () {
//     hideAddressBar();
// });

$("a[data-role=tab]").each(function () {
    var anchor = $(this);
    anchor.bind("click", function () {
        $.mobile.changePage(anchor.attr("href"), {
            transition: "none",
            changeHash: false
        });
        return false;
    });
});

$("div[data-role=page]").bind("pagebeforeshow", function (e, data) {
    $.mobile.silentScroll(0);
    $.mobile.changePage.defaults.transition = 'slide';
});

var updateUIGeo = function(pos) {
    $("div[data-role=header]>h1").each(function(){
        var header = $(this);
        header.text(pos);
    });
}

var geoUpdate = function(pos) {
    updateUIGeo(pos);
}

function clearWatch() {
    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
}
var wsuccess = function (pos) {
    var text = "Latitude: " + pos.coords.latitude +
        " " + "Longitude: " + pos.coords.longitude +
        "Accuracy: " + pos.coords.accuracy + "m";
    currentPosition = pos;
    console.log(text);
    positionListeners.forEach(function(entry){
        entry(pos);
    });
    console.log("listener count:" + positionListeners.length);
};
var wfail = function (error) {
    console.log("Error getting geolocation: code=" + error.code + " message=" + error.message);
};
var toggleWatchPosition = function () {
    if (watchID) {
        console.log("Stopped watching position");
        positionListeners.length = 0;
        clearWatch();
    } else {
        positionListeners.push(function(pos){
            geoUpdate(pos);
        });
        var options = {
            frequency: 3000,
            maximumAge: 5000,
            timeout: 5000,
            enableHighAccuracy: true
        };
        watchID = navigator.geolocation.watchPosition(wsuccess, wfail, options);
    }
};

// Watching Geolocation
$(document).on("ready", function () {
    if(!watchID) {
        toggleWatchPosition();
    }
});

//var ROOT_URL = "http://treehole-server.elasticbeanstalk.com";
var ROOT_URL = "http://localhost:3000";
var LIST_URL = ROOT_URL + "/list/";

var json_objs_for_finding = [];
$('#findings').on("pageinit", function () {
    $.getJSON(LIST_URL + "sadsa", function (data) {
        var items = [];
        var i = 0;
        $.each(data, function (key, val) {
            var date = new Date(val["time"]);
            json_objs_for_finding.push(val);
            var content_cise = val["content"].substring(0, 30) + (val["content"].length > 30 ? "..." : "");
            items.push("\
                            <li>\
                                <a href='#' onclick='showDetail(" + i + ")' data-rel='popup' data-position-to='window' data-transition='pop'>\
                                    <h2>Jesery City, New Jersey, Newport</h2>\
                                    <p>" + content_cise + "</p>\
                                    <p class='ui-li-aside'>" + date.getDate() + "日<strong>" + date.getHours() + ":" + date.getMinutes() + "</strong></p>\
                                </a>\
                            </li>");
            i++;
        });
        $(".it-list").append(items.join(""));
        $(".it-list").listview('refresh');
    });
});

function showDetail(index) {
    var json_obj = json_objs_for_finding[index];
    $("#popup-title").html("Add some HTML!");
    $("#popup-content").html(json_obj["content"]);
    var popupW = Math.round($(window).width() * 0.8);
    $("#findings_map").style = "width:" + popupW + "px;height:100px";
    var mapdata = {
        destination: new google.maps.LatLng(json_obj["lat"], json_obj["lon"])
    };
    var mapH = $("#findings_map").height();
    var mapW = $("#findings_map").width();
    $('#findings_map').attr('src', "http://maps.googleapis.com/maps/api/staticmap?center=" +
        json_obj["lat"] + "," + json_obj["lon"] +
        "&zoom=13&size=" + popupW + "x" + mapH + "&maptype=roadmap&markers=color:red%7C" +
        json_obj["lat"] + "," + json_obj["lon"] + "&sensor=false");
    $("#popupDialog").popup("open", {
        transition: "pop"
    });
}

var updateTimer;
var mapdata = {
    destination: new google.maps.LatLng(59.3327881, 18.064488100000062)
};

var is_submitted;
$('#create').on("pageinit", function(event){
    // $('hide_it_btn').click(function(){

    // });
    $('#post_form').on('submit',function(e){
        e.preventDefault();
        if (is_submitted) {
            is_submitted.abort();
        }
        var form = $(this);
        var coord = currentPosition.coords;
        var text = $("#textarea-a", this).text();
        
        var inputs = form.find("input, select, button, textarea");
        inputs.prop("disabled", true);

        var serializedData = new Object();
        serializedData.lon = coord.longitude;
        serializedData.lat = coord.latitude;
        serializedData.content = text;

        console.log("serialize: " + serializedData);
        is_submitted = $.ajax({
            url: "postit",
            data: serializedData,
            type: "post"
        });

        is_submitted.done(function(resp, status, jqXHR){
            if(resp.state != "success") {
                console.log("fail");
                window.location.href = "/login";
            } else {
                // This means the Secret has been accepted by the server.
                $('#hide_success_alert').popup('open');
            }
        });
        is_submitted.fail(function (jqXHR, textStatus, errorThrown){
            console.error(
                "The following error occured: "+
                textStatus, errorThrown
            );
        });

        is_submitted.always(function () {
            inputs.prop("disabled", false);
        });
    });
});

$('#create').on("pageshow", function () {
    console.log($('#hide_it_btn').height());
    var pageHeight = $('#create').height();
    var pageWidth = $('#create').width();
    $('#map').height(pageHeight - $('#create_header').height() - $('#create_footer').height());
    $('#create_pop').width(pageWidth - 40);
    $('#create_pop').height($('#map').height()*0.6);
    $('#map').gmap({
        'center': mapdata.destination,
        'zoom': 12,
        'mapTypeControl': false,
        'navigationControl': false,
        'streetViewControl': false
    })
        .bind('init', function (evt, map) {
            var submit_btn = $('hide_it_btn');
            submit_btn.prop("disabled", true);
            if(currentPosition != 'undefined') {
                $('#map').gmap('option', 'center'
                    , new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude));
            }
            positionListeners.push(function(pos){
                submit_btn.prop("disabled", false);
                $('#map').gmap('option', 'center', new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            });
        });

    $('#map').click(function () {
        $.mobile.changePage($('#create'), {});
    });
});