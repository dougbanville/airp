function currentShow(stationID){
	$('#on_air_now').css('display','none');
	var callback = "jsonpCurrentShow";
	var url_base = "http://feeds.rasset.ie/rtelistings/cal/" + stationID + "/delta/";
	var now = Date.now();
	timestamp = Math.round(now / 1000);	

	var url = url_base+timestamp;
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
				var title = result.fields.progtitle;
				var desc = result.fields.progdescription + '<br /><a class="on-air-email" href="mailto:'+ result.fields.progemail +'">email the show</a>';
				var piaID = result.fields.listingid;
				var imageURL = result.fields.progimage1x1;
				var twitterID = getTwitter(piaID,stationID);
				if(imageURL == null){	
					image = '<img src="http://img.rasset.ie/'+getStationLogo(stationID)+'-420.jpg" alt="' + result.fields.progtitle + '" />';
				}
				else{	
					imageURL = imageURL.replace(".jpg","-420.jpg");
					image = '<img src="' + imageURL + '" alt="' + result.fields.progtitle + '" />';
				}							
				$('#on-air-img').html(image);				
				$('#on-air-title').html(title);
				$('#on-air-desc').html(desc);
				$('#twitter-container').html('<a class="twitter-timeline" data-widget-id="'+ twitterID +'" width="800px"></a>');
				
				setTimeout(function(){
					!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
				}, 100);
				$("iframe#twitter-widget-0").waitUntilExists(function(){
					$("iframe#twitter-widget-0").css("height","1000px");
					$("iframe#twitter-widget-0").contents().find("body").append('<link href="http://www.rte.ie/digitalradio/radioplayer/css/twitter.css" type="text/css" rel="stylesheet">');
					
				});	
			});
		}
	});
}


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

function getPlayoutTime(playTime){
	var d = new Date(playTime);	
	playTime = d.getTime();
	var n = new Date();
	var now = n.getTime();	
	var diff = Math.round(((now-playTime)/60000));	
	return diff;		
}

function playoutHistory(stationID){	
	var rows = "10";
	var url = 	"http://www.rte.ie/sitesearch/tracklistinglive/select?q=*:*&wt=json&fq=channel:" + stationID + "&sort=bdate%20desc&rows="+rows;
	stationLogo = getStationLogo(stationID);
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
				///if (result.image_url == null || typeof result.image_url == undefined || result.image_url==""){					  
				if (typeof result.image_url !== 'undefined' ){		
					var image = '<img src="' + result.image_url + '" title="' + result.performer + '" />';
					
				}
				else{
					var image = '<img src="http://img.rasset.ie/' + stationLogo + '-100.jpg" title="' + result.performer + '" />';
				}
				var html = '<div class="playout-item">';
				html +='<div class="playout-item-img">'+ image +' </div> ';
				html +='<div class="playout-item-metadata">';
				html += '<div class="playout-item-artist"> ' + result.performer + '</div>';
				html += '<div class="playout-item-title"> ' + result.track_title + '</div>';				
				html += '</div>';               
				//html += '<div class="playout-item-playout-time">'+ getPlayoutTime(result.bdate) +' mins ago</div>';		
				html += '</div>';				
		
				$('#playout-inner').append(html);
			});
		}
	});
	
}


(function ($) {

/**
* @function
* @property {object} jQuery plugin which runs handler function once specified element is inserted into the DOM
* @param {function} handler A function to execute at the time when the element is inserted
* @param {bool} shouldRunHandlerOnce Optional: if true, handler is unbound after its first invocation
* @example $(selector).waitUntilExists(function);
*/

$.fn.waitUntilExists    = function (handler, shouldRunHandlerOnce, isChild) {
    var found       = 'found';
    var $this       = $(this.selector);
    var $elements   = $this.not(function () { return $(this).data(found); }).each(handler).data(found, true);

    if (!isChild)
    {
        (window.waitUntilExists_Intervals = window.waitUntilExists_Intervals || {})[this.selector] =
            window.setInterval(function () { $this.waitUntilExists(handler, shouldRunHandlerOnce, true); }, 500)
        ;
    }
    else if (shouldRunHandlerOnce && $elements.length)
    {
        window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
    }

    return $this;
}

}(jQuery));  

function getStationLogo(stationID){
	var imageRef = "";
	if (stationID == 1){
		imageRef = "00048e0d";
	}
	else if (stationID == 9){
		imageRef = "00048e29";
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
