// Live Stream Functionality Code

// Edits: Make it so if something (a query) is being processed, do not process anything else

var Post = Parse.Object.extend("Post");

var HTMLpost = "<div class='alert alert-info'><p>%data%</p></div>";

var extensions = 0;
var count = 0;
var endReached = false;
var intervalID;
var processLoading = false;

var pubnub;

$(document).ready(function() {

	var data = {
		"a": "pub-c-0e8bbdbf-c3ff-4d9c-b4b8-3d29c95cd165",
		"b": "sub-c-b2a65320-4845-11e5-8287-0619f8945a4f",
		"c": "FpqdxVn71eqgrovU54528AIyZBJBS5BLo6CRIv9t",
		"d": "URIG1Kz3NST34PRBQOidQGAdNUrols1Sw7lje49G"
	};

	Parse.initialize(data.c, data.d);
	pubnub = PUBNUB.init({
		publish_key: data.a,
		subscribe_key: data.b
	});

	queryPosts(0); // load most recent posts

	pubnub.subscribe({
		channel: 'pubnub_testing_channel_543678',
		message: function(m){
			$("#messages").prepend(displayPost(m.message));
			countManager();
		},
		connect: function(){ $("#post-input").fadeIn(1000); }
	});

	intervalID = setInterval(function() {
		console.log("Checking scroll position...");
		if($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
			console.log("Scrolled to bottom...loading posts");
			if (!endReached) { queryPosts( (extensions * 10) + (count % 10) ); }
		}
	}, 1000 );

	$("#post-submit").on('click', function() { newPost(); });

});

function displayPost(message) { return $(HTMLpost.replace("%data%", message)).hide().fadeIn(1000); }
function countManager() { count++; if (count % 10 == 0 && count != 0) { extensions++; } }

function newPost() {
	if (!processLoading) {
		var message = $("#post-content").val().trim();
		processLoading = true;
		var post = new Post();
		post.set("message", message);
		post.save(null, {
			success: function(post) {
				pubnub.publish({
					channel: 'pubnub_testing_channel_543678',
					message: {"message":message},
					callback : function(m){ $("#post-content").val(""); processLoading = false; }
				});
			}, error: function(post, error) {
				alert("Error");
				console.log("Error: " + error.code + " " + error.message);
				processLoading = false;
			}
		});
	} else {
		//alert("Error: Something is already loading...please try again in a few seconds.");
		console.log("Error: Something is already loading...please try again in a few seconds.");
	}
}

function queryPosts(skip) {
	if (!processLoading) {
		//if (skip != 0) { alert("Loading older posts..."); }
		processLoading = true;
		var query = new Parse.Query(Post);
		query.descending("createdAt");
		query.limit(10);
		query.skip(skip);
		query.find({
			success: function(results) {
				for (var i = 0; i < results.length; i++) {
					$("#messages").append(displayPost(results[i].get("message")));
					countManager();
				}
				if (results.length < 10) { 
					endReached = true; 
					clearInterval(intervalID); 
					$("#messages").append("<p class='text-center'>end</p>");
				}
				processLoading = false;
			}, error: function(error) {
				alert("Error");
				console.log("Error: " + error.code + " " + error.message);
				processLoading = false;
			}
		});
	} else {
		//alert("Error: Something is already loading...please try again in a few seconds.");
		console.log("Error: Something is already loading...please try again in a few seconds.");
	}
}