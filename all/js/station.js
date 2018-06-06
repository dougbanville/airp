'use strict';

//console.log(stations)
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var station = getParameterByName('station');


var selectedStation = stations.filter(result=>{
    return result.id ===  parseInt(station);
   
})
console.log(selectedStation);
//var station = 1;
console.log(station);
$(document).ready(function () {

    function getStationLogo(stationID) {
        var imageRef = "";
        if (stationID == 1) {
            imageRef = "000b9b0c";
        }
        else if (stationID == 9) {
            imageRef = "000681f9";
        }
        else if (stationID == 16) {
            imageRef = "00048e0e";
        }
        else if (stationID == 17) {
            imageRef = "0008ecfe";
        }
        else if (stationID == 24) {
            imageRef = "0009a0fe";
        }
        else if (stationID == 23) {
            imageRef = "00048e3d"
        }
        else if (stationID == 18) {
            imageRef = "00048e38"
        }
        else if (stationID == 22) {
            imageRef = "00048e3b"
        }

        return imageRef;
    }

    function getOnAir(station) {
        console.log("getting on air");
        var url = "https://feeds.rasset.ie/rtelistings/cal/" + station + "/delta/0000000000/";
        $.ajax({
            url: url,
            dataType: "jsonp",
            async: false,
            cache: true,
            jsonpCallback: "jsonpCurrentShow",
            contentType: "application/jsonp",
            success: function (data) {
                var onAir = (data["0"].fields);
                if (onAir.imageref) {
                    var showImage = onAir.imageref;
                    showImage = showImage.replace(".jpg", "-1000.jpg");
                }


                showImage = showImage.replace("http://", "https://");
                var showTitle = onAir.progtitle;
                var showDesc = onAir.description;
                //console.log(onAir);
                $(".onAir").attr("src", showImage);
                $(".showTitle").text(showTitle);
                $(".showDescription").text(showDesc);

            }
        })
    };

    function getTrackList(station, rows) {
        console.log("getting tracklist");
        var url = "https://feeds.rasset.ie/sitesearch/tracklistinglive/select?q=*:*&wt=json&fq=bdate:[NOW/DAY-1DAYS%20TO%20NOW]&fq=channel:" + station + "&sort=bdate%20desc&rows=" + rows + "&json.wrf=irishRadioApp";
        var i = 0;
        $.ajax({
            url: url,
            dataType: "jsonp",
            async: false,
            cache: true,
            jsonpCallback: "irishRadioApp",
            contentType: "application/jsonp",
            success: function (data) {

                var tracks = data.response.docs;
                tracks.map(function (track) {
                    if (station == 16) {
                        var artist = track.composer;
                    } else {
                        var artist = track.performer;
                    }
                    if (typeof track.image_url !== 'undefined') {
                        var imageUrl = track.image_url.replace("http://", "https://");
                        var image = '<img src="' + imageUrl + '" title="' + artist + '"  class="img" />';
                    } else {
                        var image = '<img src="https://img.rasset.ie/' + stationLogo + '-100.jpg" title="' + artist + '" class="img" />'
                    }
                    $("tbody").append("<tr><td>" + image + "</td><td>" + track.track_title + " " + artist + "</td></tr>");



                })
            }
        })

    }
    $("body").css("background-color", selectedStation[0].station_color);
    var stationLogo = getStationLogo(station);
    setInterval(function () {
        getTrackList(station, 20);
        getOnAir(station);
    }, 3000)
    getOnAir(station);
    getTrackList(station, 20);
});