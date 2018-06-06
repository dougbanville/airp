//http://www.rte.ie/sitesearch/tracklistinglive/select?q=*:*&wt=jsonp&fq=channel:1&sort=bdate%20desc&rows=10// JavaScript Document
$(document).ready(function(){
	currentShow();
	
	playoutHistory();
	
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
});

function currentShow(){
	$('#on_air_now').css('display','none');
	var callback = "jsonpCurrentShow";
	var url_base = "http://feeds.rasset.ie/rtelistings/cal/1/delta/";
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
				var desc = result.fields.progdescription;
				var piaID = result.fields.listingid;
				var imageURL = result.fields.progimage1x1;
				if(imageURL == null){	
					image = '<img src="http://img.rasset.ie/00048e3d-350.jpg" alt="' + result.fields.progtitle + '" />';
				}
				else{	
					imageURL = imageURL.replace(".jpg","-350.jpg");
					image = '<img src="' + imageURL + '" alt="' + result.fields.progtitle + '" />';
				}
				
				
				
							
				$('#on-air-img').html(image);
				
				$('#on-air-title').html(title); //  + " " + result.fields.progemail)
				$('#on-air-desc').html(desc);
				var twitterID = getTwitter(piaID);
				$('#twitter-container').html('<a class="twitter-timeline" data-widget-id="'+getTwitter(piaID)+'" width="800px"></a>');
			
			});
		}
	});
}

function getPlayoutTime(playTime){
	var d = new Date(playTime);	
	playTime = d.getTime();
	var n = new Date();
	var now = n.getTime();	
	var diff = Math.round(((now-playTime)/60000));	
	return diff;		
}

function playoutHistory(){
	
	var channelID = "1";
	var rows = "10";
	var url = 	"http://www.rte.ie/sitesearch/tracklistinglive/select?q=*:*&wt=json&fq=channel:" + channelID + "&sort=bdate%20desc&rows="+rows;
	
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
				
				var image = '<img src="' + result.image_url + '" title="' + result.performer + '" />';
				
				var html = '<div class="playout-item">';
				html +='<div class="playout-item-img">'+ image +' </div> ';
				html +='<div class="playout-item-metadata">';
				html += '<div class="playout-item-artist"> ' + result.performer + '</div>';
				html += '<div class="playout-item-title"> ' + result.track_title + '</div>';				
				html += '</div>';               
				html += '<div class="playout-item-playout-time">'+ getPlayoutTime(result.bdate) +' mins ago</div>';		
				html += '</div>';				

				
				$('#playout-inner').append(html);
			});
		}
	});
	
}

function getTwitter(piaID){
		var twitterID = "";
		$.ajax({
		type: "GET",
		url: "http://www.rte.ie/digitalradio/radioplayer/js/2fm.json",
		dataType: "json",
		async: false,
		cache:true,
		contentType: "application/json", 		
		success: function(data) {
			
			 $.each(data.response.docs, function(i,result){
				if(result.piaid==piaID){					
			    	twitterID = result.twitterwidgetid; 					
				}					
			});			
		},
		error: function(xhr, textStatus, errorThrown) {
    		alert(errorThrown)// Handle error
  		}
	});
	return twitterID;
}

          