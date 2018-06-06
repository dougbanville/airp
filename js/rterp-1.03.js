/*
checkLive(stationID)
Called on the index page for each station
Uses the Radio Player JavaScript Bridge to check if we are 
playing live or on-demand content and calls relevant function
*/
function checkLive(stationID){
	RPBridge.sendToDevice({
		call: 'meta_data',
		success: function (result) {
			//Check of users is playing ondemand
			if (result.meta_data_type =="ondemand"){
				//Calls ondemand function and 
				//Passes in metadata from the JavaScript Bridge & station ID						
				onDemand(stationID, result);
			}
			if (result.meta_data_type =="live"){
				//call current show function and pass in station ID
				currentShow(stationID);					
			}
		}
	});
}

/*
currentShow(stationID)
Loads the current show information into the webpage
Inserts the twitter widget on the page too
*/

function currentShow(stationID){
	//hide the current onair info
	$('#on_air_now').css('display','none');
	//define jsonp callback
	var callback = "jsonpCurrentShow";
	//define listings url with station id var
	var url = "http://feeds.rasset.ie/rtelistings/cal/" + stationID + "/delta/0000000000/";
	$.ajax({
		type: "GET",
		url: url,
		dataType: "jsonp",
		async: false,
		cache:true,
		jsonpCallback: callback,
		contentType: "application/jsonp", 
		success: function(data) {
			$.each(data, function(i,result){
				//Check if the programme from listings matches what's currently being displayed
				//If they're the same, do nothing
				if($('#on-air-title').html() == result.fields.progtitle){
				}
				//if they're different update the on air now info
				else{
					var title = result.fields.progtitle;
					//add email info to the end of the description
					var desc = result.fields.progdescription + '<br /><a class="on-air-email" href="mailto:'+ result.fields.progemail +'">email the show</a>';
					var piaID = result.fields.listingid;
					var imageURL = result.fields.progimage1x1;
					//getTwitter function uses the stationID and the piaID to return Twitter widget ID
					var twitterID = getTwitter(piaID,stationID);
					//Is programme image defined? if not then return the station logo from js object at the end of this script 
					if(imageURL == null){	
						image = '<img src="http://img.rasset.ie/'+getStationLogo(stationID)+'-420.jpg" alt="' + result.fields.progtitle + '" />';
					}
					//set the width of the image
					else{	
						imageURL = imageURL.replace(".jpg","-420.jpg");
						image = '<img src="' + imageURL + '" alt="' + result.fields.progtitle + '" />';
					}
					
					//insert vars into divs on the webpage							
					$('#on-air-img').html(image);				
					$('#on-air-title').html(title);
					$('#on-air-desc').html(desc);
					//initiate the twitter widget, add twitter id var
					$('#twitter-container').html('<a class="twitter-timeline" data-widget-id="'+ twitterID +'" width="800px"></a>');
					setTimeout(function(){
						!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
					}, 100);
					//inject extra CSS info into twitter iframe to increase font size
					
					setTimeout(function(){						
						$("iframe#twitter-widget-0").css("height","1000px");
						$("iframe#twitter-widget-0").contents().find("head").append('<link href="http://www.rte.ie/digitalradio/radioplayer/css/twitter.css" type="text/css" rel="stylesheet" id="thisheadcss">');					
					},1000);
				}
			});
		}
	});
}


/*
onDemand(stationID, result)
Display show details for ondemand content. 
takes metadata in json from the JavaScript Bridge
*/
function onDemand(stationID, result){
	var imageURL = "";	
	//JavaScript Bridge does not have PIA IDs, use the station's twitter account for ondemand content. 
	//Stations twitter widget ID is in the station's json file with PIA ID 0
	piaID = 0;					
	$.each(result.meta_data.multimedia, function(i,multimedia){
		imageURL = multimedia.url;							
	});
	imageURL = imageURL.replace("288.jpg","400.jpg");
	var image = '<img src="' + imageURL + '" alt="' + result.meta_data.name + '" />';
	var css = '<link href="http://www.rte.ie/digitalradio/radioplayer/css/twitter.css" type="text/css" rel="stylesheet">';
	// get the twitter widget id for the station's main twitter account
	var twitterID = getTwitter(piaID,stationID);
	//insert vars into divs on the webpage
	$('#on-air-img').html(image);				
	$('#on-air-title').html(result.meta_data.name);
	$('#on-air-desc').html(result.meta_data.description);
	//insert twitter widget
	$('#twitter-container').html('<a class="twitter-timeline" data-widget-id="'+ twitterID +'" width="800px"></a>');
	setTimeout(function(){
		!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
	}, 100);
	//inject extra CSS info into twitter iframe to increase font size
	setTimeout(function(){						
		$("iframe#twitter-widget-0").css("height","1000px");
		$("iframe#twitter-widget-0").contents().find("head").append('<link href="http://www.rte.ie/digitalradio/radioplayer/css/twitter.css" type="text/css" rel="stylesheet" id="thisheadcss">');					
		},1000);	
}


/*
getTwitter(piaID,stationID)
twitter widget IDs are stored in the js folder as stationID.json (uses the station ID in filename)
the main station twitter account is defined with a PIA ID of 0.
Each show has a widget id matched to its PIA ID
function returns the widget ID
*/
function getTwitter(piaID,stationID){		
		var twitterID = "";
		$.ajax({
		type: "GET",
		url: "http://www.rte.ie/digitalradio/radioplayer/js/"+ stationID +".json",
		dataType: "json",
		async: false,
		cache:true,
		contentType: "application/json", 		
		success: function(data) {			
			 $.each(data.response.docs, function(i,result){
				if (result.piaid==0){
					twitterID = result.twitterwidgetid;	
				}
				if(result.piaid==piaID){					
			    	twitterID = result.twitterwidgetid;					 					
				}					
			});			
		},
		error: function(xhr, textStatus, errorThrown) {
    		console.log(errorThrown)// Handle error
  		}
	});
	return twitterID;
}


/*
getPlayoutTime(playTime)
No Longer Used!
This was used to return the number of minutes since a song was played
*/
function getPlayoutTime(playTime){
	var d = new Date(playTime);	
	playTime = d.getTime();
	var n = new Date();
	var now = n.getTime();	
	var diff = Math.round(((now-playTime)/60000));	
	return diff;		
}


/*
playoutHistory(stationID)
Gets the latest 10 tracks played via the tracklist solr feed
pass in station id and number of results as vars
adds each song to the webpage
*/

function playoutHistory(stationID){	
	//define number of results
	var rows = "10";
	var date = new Date();
	//get time in ISO Format to get all tracks before NOW
	now = date.toISOString();

	var url = 	"http://feeds.rasset.ie/sitesearch/tracklistinglive/select?q=*:*&wt=json&fq=bdate:[*%20TO%20" + now + "]&fq=channel:" + stationID + "&sort=bdate%20desc&rows="+rows;
	//get the station logo to use when album art is missing
	stationLogo = getStationLogo(stationID);
	//count us only used to identify the first track
	count = 1;
	$.ajax({
		type: "GET",
		url: url,
		dataType: "json",
		async: false,
		cache:true,
		jsonpCallback: "callback",
		contentType: "application/json", 
		success: function(data) {			
			 $.each(data.response.docs, function(i,result){
				// display composer for lyric, performer for other channels
			 	if (stationID == 16){
					artist = result.composer;
				} else {
				artist = result.performer;
				}
				//use album art if it exists				  
				if (typeof result.image_url !== 'undefined' ){		
					var image = '<img src="' + result.image_url + '" title="' + artist + '" />';					
				}
				//use station logo if there's no album art
				else{
					var image = '<img src="http://img.rasset.ie/' + stationLogo + '-100.jpg" title="' + artist + '" />';
				}
				//create html for each track
				var html = '<div class="playout-item">';
				html +='<div class="playout-item-img">'+ image +' </div> ';
				html +='<div class="playout-item-metadata">';
				html += '<div class="playout-item-artist">' + artist + '</div>';
				//if it's the latest track add latest class to change how it's displayed
				if (count==1){
					html += '<div class="playout-item-title latest">' + result.track_title + '</div>';
				}
				else {
					html += '<div class="playout-item-title">' + result.track_title + '</div>';
				}				
				html += '</div>';               
				//html += '<div class="playout-item-playout-time">'+ getPlayoutTime(result.bdate) +' mins ago</div>';		
				html += '</div>';				
				count++;
				//add this to the playout-inner div
				$('#playout-inner').append(html);				
			});
			
			//check if latest track has changed every 60 seconds
			setInterval(function(){
				updatePlayout(stationID);		
			}, 60000);  
		}
	});	
}

/*
updatePlayout(stationID)
Check if the latest track has changed
if it has, add it to the webpage
*/


function updatePlayout(stationID){	
	//get the latest track from solr
	var rows = "1";
	//define filepath to solr
	//2015-04-14T23:59:59Z
	var date = new Date();
	now = date.toISOString();
	var url = 	"http://feeds.rasset.ie/sitesearch/tracklistinglive/select?q=*:*&wt=json&fq=bdate:[*%20TO%20" + now + "]&fq=channel:" + stationID + "&sort=bdate%20desc&rows="+rows;
	//get station logo
	stationLogo = getStationLogo(stationID);
	//get the latest track info
	var latestTrack = $('.latest').html();
	$.ajax({
		type: "GET",
		url: url,
		dataType: "json",
		async: false,
		cache:true,
		jsonpCallback: "callback",
		contentType: "application/json", 
		success: function(data) {			
			 $.each(data.response.docs, function(i,result){
			 	// display composer for lyric, performer for other channels
			 	if (stationID == 16){
					artist = result.composer;
				} else {
				artist = result.performer;
				}
				//if the track has not changed, don't do anything
				if(latestTrack == result.track_title){				
				}				
				// if it has changed then create html for that track
				else{
					//if the image is defined they use it
					if (typeof result.image_url !== 'undefined' ){		
						var image = '<img src="' + result.image_url + '" title="' + artist + '" />';					
					}
					//if no then use the station logo
					else{
						var image = '<img src="http://img.rasset.ie/' + stationLogo + '-100.jpg" title="' + artist + '" />';
					}
					var html = '<div class="playout-item">';
					html +='<div class="playout-item-img">'+ image +' </div> ';
					html +='<div class="playout-item-metadata">';
					html += '<div class="playout-item-artist">' + artist + '</div>';
					html += '<div class="playout-item-title latest">' + result.track_title + '</div>';	
					//remove the latest class from the current track
					$('.latest').removeClass("latest");
					//add the new track
					$('#playout-inner').prepend(html);
				}
			});
		}
	});
	}	
	

/*
getStationLogo
simply returns the rasset image id for a station logo for a given station ID
*/

function getStationLogo(stationID){
	var imageRef = "";
	if (stationID == 1){
		imageRef = "000b9b0c";
	}
	else if (stationID == 9){
		imageRef = "000681f9";
	}
	else if (stationID == 16){
		imageRef = "00048e0e";
	}
	else if (stationID == 17){
		imageRef = "0008ecfe";
	}
	else if (stationID == 24){
		imageRef = "0009a0fe";
	}
	else if (stationID == 23){
		imageRef = "00048e3d"
	}
	else if (stationID == 18){
		imageRef = "00048e38"
	}
	else if (stationID == 22){
		imageRef = "00048e3b"
	}	
	
	return imageRef;
}
//Load programme info from json feed http://feeds.rasset.ie/rtelistings/cal/16/delta/0000000000/?callback=jsonpCurrentShow 
function getDetails(stationID){
    var url = "http://feeds.rasset.ie/rtelistings/cal/" + stationID + "/delta/0000000000/";
    //alert stationID;
    var callback = "jsonpCurrentShow";
    $.ajax({
        type: "GET",
        url: url,
        dataType: "jsonp",
        async: false,
        cache:true,
        jsonpCallback: callback,
        contentType: "application/jsonp",
        success: function(data) {
            $.each(data, function(i,result){
                var divwidth = $(".StationContent").width() / 2;
                var divwidth = divwidth - 25;
                var title = '<h3>' + result.fields.progtitle + '</h3>';
                var thumbnail = '<img src ="'+ result.fields.thumbnail +'" class="imgleft featimg" style="max-width:' + divwidth + 'px"/>';
                var desc = '<p>' + result.fields.progdescription + '</p>';
                if(result.fields.progemail !== null){
				var emailButton = '<a class="btn btn-success" href="mailto:'+ result.fields.progemail +'"><span class="glyphicon glyphicon-envelope"></span> Email the show</a>';
				}else{
				var emailButton =' ';
				}
                var piaID = result.fields.listingid;
				var screenWidth = screen.width;
				var elementWidth = $(".StationContent").width();
                $('.StationContent').html(thumbnail + title + desc + emailButton + screenWidth + ' ' +elementWidth);
            }) 
             
        }
    });
};