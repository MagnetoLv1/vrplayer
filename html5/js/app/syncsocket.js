define(function() {

	
	return function(){
				var ws;
				var video;
				var socketType = 'websocket';
				this.setVideo = function(v){
					video = v;
				}
				this.create =function(){
					return new Promise(function(resolve, reject) {
						if ("WebSocket" in window)
						{				   
							socketType = 'websocket';
							// Let us open a web socket
							ws = new WebSocket("ws://218.38.31.66:10001/Websocket","chat");					
							ws.onopen = function()
							{
								resolve();
							};					
							ws.onmessage = function (evt) 
							{ 
								console.log(evt.data);
								var response = evt.data;
								var aDta = response.split('=');
								switch (aDta[0])
								{
									case "PLAY":
										video.play(aDta[1]?aDta[1]:null);
										break;
									case "PAUSE":
										video.pause();
										break;
									case "SEEK":
										video.seek(aDta[1]);
										break;
									case "STOP":
										//video.stop();
										break;
								}
							};

							ws.onclose = function()
							{ 
							};
						}				
						else
						{
							socketType = 'flashsocket';
							$('#VRGallery').get(0).callConnect("ws://218.38.31.66:10001/Websocket","chat");	
							window.flashwebsocket_onopen = function(status){
								resolve();
							}
							window.flashwebsocket_onmessage = function(message){
								var aDta = message.split('=');
								switch (aDta[0])
								{
									case "PLAY":
										video.play();
										break;
									case "PAUSE":
										video.pause();
										break;
									case "SEEK":
										video.seek(aDta[1]);
										break;
									case "STOP":
										//video.stop();
										break;
								}
							}
							window.flashwebsocket_onclose = function(status){
							}
							window.flashwebsocket_onerror = function(status){
							}

						}				

					});
					
				}
				this.send =function(message)
				{
					if(socketType == 'websocket')	{
						 ws.send(message);
					}
					else if(socketType == 'flashsocket')
					{
						$('#VRGallery').get(0).callSend(message);
					}

				}

				this.connectBJ = function(bj_id)
				{
					this.send("JOINBJ=" + bj_id);
				}
				this.connectUser = function(bj_id)
				{
					this.send("VIDEO=" + bj_id);
				}
				this.play = function()
				{
					this.send("PLAY");
				}
				this.pause = function()
				{
					this.send("PAUSE");
				}
				this.currentTime = function(time)
				{
					this.send("TIME=" + time);
				}
				this.seek = function(time)
				{
					this.send("SEEK="+ time);
				}
	}
});