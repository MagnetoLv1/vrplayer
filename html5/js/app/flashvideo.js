define(['swfobject'],function(swfobject2) {
				
	return function(){	

				var _id = 'VRGallery',_autoPlay=false, _source;
				var that = this;
				this.create = function ( elem )
				{
					return new Promise(function(resolve, reject) {
						var flashvars = {};
						flashvars.share = false;
						flashvars.autoplay = true;

						var params = {quality : 'high', bgcolor : '#000000', allowscriptaccess : 'always', allowfullscreen : 'true', wmode:'transparent'};
						var attributes = {id : _id, name : _id, align : 'middle'};
						swfobject2.embedSWF(
								"flash/"+_id+".swf", $(elem).attr('id'),
								"100%", "100%",
								"10.2.0", "",
								flashvars, params, attributes);
						//ExternalInterface.call 호출
						window.flashLoaded = function()
						{
								resolve();
						}
					});

				}
				this.autoPlay =function (value)
				{
					_autoPlay =value;
				}
				this.currentTime = function()
				{
					return	$('#'+_id).get(0).getCurrentTime();
				}
				this.source = function ( aUrl )
				{
					_source = aUrl['rtmp_url'];
				}
				this.play = function (time)
				{
					$('#'+_id).get(0).setSource(_source);
					$('#'+_id).get(0).callPlay(time);
				}
				this.pause = function ()
				{
					$('#'+_id).get(0).callPause();
				}
				this.seek = function(time)
				{
					return $('#'+_id).get(0).callSeek(time);
				}		
				this.setVolume = function ( value ) {
					$('#'+_id).get(0).setVolume(value);
				}
				this.getVolume = function () {
					try{
						return $('#'+_id).get(0).getVolume();
					}
					catch(e){
						return 1;
					}
				}
				this.isVRMode = function()
				{
					return false;
				}
				this.getDuration = function()
				{
					return $('#'+_id).get(0).getDuration();
				}
				window.videoStatusEvent = function(status){
					console.log(status);
					switch ( status )
					{
							case 'buffering':
								$(that).trigger('BUFFERING');
								break;
							case 'played':
								$(that).trigger('PLAYING');
								break;
							case 'paused':
								$(that).trigger('PAUSE');
								break;
							case 'stoped':
								$(that).trigger('STOP');
								break;
							case 'error':
								$(that).trigger('ERROR');
								break;
					}
				}

	}
});