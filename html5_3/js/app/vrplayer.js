define("vrplayer",["require","html5video","flashvideo","syncsocket","recommend"],function (require, Html5Video, FlashVideo, Syncsocket, Recommend) {


			
			var VideoTimer = function(){
				var _interval = 1000;
				var _id = 0;
				this.start = function(fn){	
					if(fn){
						_id = setInterval(fn, _interval);
					 }
				}
				this.stop = function(){
					clearInterval(_id);
				}
			};
			var hls;
			var player = this;
			var that =this;
			var _aQuality = [];
			var vrVideo;	
			var _titileNo = getParameterByName('title_no');
			var _withVR = getParameterByName('withvr')=='true'?1:0;
			var _isBJ = getParameterByName('bj')=='true'?1:0;
			var _isEmbed = getParameterByName('embed')=='true'?1:0;
			var _bjid = getParameterByName('bj_id');

		
			//IE 
			if ( getInternetExplorerVersion() > 0 )
			{
				vrVideo = new FlashVideo();
				vrVideo.create($('#vr-video'));
			} 
			//Chrome, Firfox
			else
			{
				vrVideo = new Html5Video();
				vrVideo.create($('#vr-video'));
			}

			var _timer = new VideoTimer();
			var syncSocket = new Syncsocket();
			syncSocket.setVideo(vrVideo);

			function dataLoad(title_no)
			{
				$.ajax({
						url : 'http://vr.afreeca.com/Api/get_play_info',
						dataType : 'jsonp',
						jsonp : "callback",
						data : {title_no:_titileNo},
						success : function ( response ) {
						console.log(response);
							if(response.result==1)
							{
								that.init(response);
							}else
							{
		
							}
						},
						error : function ( data, status, err ) {
						}
					});
			}

			//VR모드 가능벼부
			if(vrVideo.isVRMode()==false)
			{
				$('.vr-menu-vrtoggle').hide();
			}

			
			var $container = $('.vr-menu-container')
			$(vrVideo).bind('BUFFERING PLAY PLAYING PAUSE STOP ERROR', function ( e ) {
				switch ( e.type )
				{
					case 'BUFFERING':
						//if ( !isMobile() )
						{
							$('.vr-menu-loading').show();
						}
						break;
					case 'PLAY':
						$('.vrrecomm').hide();
						$('.vr-menu-poster').hide();
						$('.vr-menu-loading').show();
						break;
					case 'PAUSE':
						$container.removeClass('vr-menu-playing');
						syncSocket.pause();
						break;
					case 'PLAYING':
						$('.vrrecomm').hide();
						$('.vr-menu-poster').hide();
						$('.vr-menu-loading').hide();
						$container.addClass('vr-menu-playing');
						syncSocket.play();
						_timer.start(updateCurrentTime);
						updateDuration();
						break;
					case 'STOP':
						if(!_withVR)
						{
							var recommend = new Recommend(_titileNo)
							recommend.create();
							$('.vrrecomm').show();
						}
						$('.vr-menu-poster').hide();
						$('.vr-menu-loading').hide();
						_timer.stop();
						break;	
					case 'ERROR':
						_timer.stop();
						break;
				}
			})

			//마우스
			$container.on('mouseover', function () {
				$container.addClass('vr-menu-mouseover');
			});
			$container.on('mouseout', function () {
				$container.removeClass('vr-menu-mouseover');
			});
			//전체화면
			document.addEventListener('fullscreenchange', onFullscreenChange);
			document.addEventListener('webkitfullscreenchange', onFullscreenChange);
			document.addEventListener('mozfullscreenchange', onFullscreenChange);

			


			//Play 버튼
			$('.vr-menu-icon-play, .vr-menu-poster-play-container').click(function ( e ) {
				vrVideo.play();
			})
			$('.vr-menu-icon-pause').click(function ( e ) {
				vrVideo.pause();
			})
			//VR모드
			$('.vr-menu-vrtoggle').click(function ( e ) {

				if ( !manager.isVRMode() ) {
					$container.addClass('vr-menu-stereo');
					manager.enterVR();
				} else {
					$container.removeClass('vr-menu-stereo');
					manager.exitVR();
				}
			})

			$('.vr-menu-volume').click(function ( e ) {
				//if ( vrVideo.getVolume() > 0 )
				{

				}
				//else
				{

				}
			})

			//화질설정
			$('.vr-menu-set-btn').click(function ( e ) { 
				if ( $container.hasClass('vr-menu-set') ) {
					$container.removeClass('vr-menu-set');
				} else {
					$container.addClass('vr-menu-set');
				}
			})

			//전체화면
			$('.vr-menu-maximize').click(function ( e ) {
				that.toggleFullScreen();
			})
			var dragX = 0;
			var bDrag = false;
			$('.vr-menu-progress-slider').bind('mousedown mousemove mouseup mouseleave', function ( event ) {
				switch ( event.type ) {
					case 'mousedown':
						var pos = event.pageX - event.currentTarget.offsetLeft;
						$('.vr-menu-play-progress').width(pos);						
						var time = pos * vrVideo.getDuration()/ $(event.currentTarget).width();
						vrVideo.seek(time);
						syncSocket.seek(time);

						break;
					case 'mouseup':
						bDrag = false;
						break;
				}

			})
			$('.vr-menu-volume-slider').bind('mousedown', function ( event ) {
				switch ( event.type ) {
					case 'mousedown':
						var x = event.offsetX;
						$('.vr-menu-volume-progress').width(x);
						$('.vr-menu-seek-handle').css('left', x-5);								
						vrVideo.setVolume(x/50);

						break;
					case 'mousemove':
						console.log(event.pageX, event.offsetX);
						if ( bDrag ) {
							dragX = event.pageX - event.currentTarget.offsetLeft;
							dragX = Math.min(event.currentTarget.clientWidth - 4, dragX)
						var x = event.offsetX;
							$('.vr-menu-volume-progress').width(x);
							$('.vr-menu-seek-handle').css('left', x);
						}
						break;
					case 'mouseup':
						bDrag = false;
						break;
				}

			})
			//Embed 모드
			if(!_isEmbed){
				$container.removeClass('vr-menu-controls_off');
			}

			function setVolume(){
				var volume = vrVideo.getVolume();
				var pos = volume*50;
				$('.vr-menu-volume-progress').width(pos);
				$('.vr-menu-seek-handle').css('left', pos);				
		
			}

			function posToVolume ( pos ) {
				var width = $('.vr-menu-progress-slider').get(0).clientWidth - 4;
				return Math.min(1, Math.max(0, (pos / width)));
			}
			function volumeToPos ( volume ) {
				var width = $('.vr-menu-progress-slider').get(0).clientWidth - 4;
				return width * volume;
			}

			function updateDuration(){
				//time
				var duration = vrVideo.getDuration();
				$('#duration').text(duration.toHHMMSS());
			}

			function updateCurrentTime(){
				//time
				var currentTime = vrVideo.currentTime();
				var duration = vrVideo.getDuration();
				$('#current').text(currentTime.toHHMMSS());	

				//progress
				var pos = currentTime *	$('.vr-menu-progress-slider').width() / duration;
				$('.vr-menu-play-progress').width(pos);

				//withvr
				syncSocket.currentTime(currentTime);
			}

			function isFullscreen () {
				return (document.fullScreenElement || document.mozFullScreenElement || document.isFullScreen || document.webkitIsFullScreen || document.mozIsFullScreen || document.msIsFullScreen || false);
			}
			function onFullscreenChange ( e ) {
				var isFull = isFullscreen();
				if ( isFull )
				{
					$container.addClass('vr-menu-full').removeClass('vr-menu-min');
					$container.removeClass('vr-menu-inactive').addClass('vr-menu-active');

				} else
				{
					$container.removeClass('vr-menu-full').addClass('vr-menu-min');
					$container.addClass('vr-menu-inactive').removeClass('vr-menu-active');
				}
			}

			this.toggleFullScreen = function ()
			{
				//var element = document.documentElement;						
				var element = document.getElementById("vr-player");
				if (
						document.fullscreenElement ||
						document.webkitFullscreenElement ||
						document.mozFullScreenElement ||
						document.msFullscreenElement
						) {
					// exit full-screen
					if ( document.exitFullscreen ) {
						document.exitFullscreen();
					} else if ( document.webkitExitFullscreen ) {
						document.webkitExitFullscreen();
					} else if ( document.mozCancelFullScreen ) {
						document.mozCancelFullScreen();
					} else if ( document.msExitFullscreen ) {
						document.msExitFullscreen();
					}
				} else {
					// go full-screen
					if ( element.requestFullscreen ) {
						this.requestFullscreen();
					} else if ( element.webkitRequestFullscreen ) {
						element.webkitRequestFullscreen();
					} else if ( element.mozRequestFullScreen ) {
						element.mozRequestFullScreen();
					} else if ( element.msRequestFullscreen ) {
						element.msRequestFullscreen();
					}
				}
			}
			this.init = function(data)
			{
				setVolume();
				this.setThumbnail(data.thumb)
				this.setQuality(data.video);

				var duration = parseInt(data.duration)/1000;
				$('#duration').text(duration.toHHMMSS());

				//WithVR인지
				if(_withVR){
					syncSocket.create(vrVideo).then(function(){
							if(_isBJ)
							{
								syncSocket.connectBJ(_bjid);
							}
							else
							{
								syncSocket.connectUser(_bjid);
								$('.vr-menu-poster-play-container').hide();
								$('.layer_vr').hide();
							}

					});
				}
			}
			//썸네일
			this.setThumbnail =function(url)
			{
				$('#thumbnail').attr('src',url); 
			}
			//해상도
			this.setQuality = function(aQuality)
			{
				_aQuality = aQuality;
				var i=0;
				var defaultElme;
				$.each(_aQuality, function(key,value){
					var txt = $('<a>').addClass('q-txt').text(value.name).data('key',key).click(that.qualityChangeHandler);
					$('<span>').append(txt).appendTo('.set-quality');
					if(i==0)
					{
						defaultElme =txt;;
					}
					i++;
				});

				//첫번째요소 선택
				$(defaultElme).addClass('on');
				var key = $(defaultElme).data('key');
				vrVideo.source(_aQuality[key])
				

			}
			//화질변경
			this.qualityChangeHandler = function(e){					
				$container.removeClass('vr-menu-set');
				$('.q-txt').removeClass('on');
				$(e.target).addClass('on');
				var key = $(e.target).data('key');
				
				vrVideo.source(_aQuality[key]);
				vrVideo.play(vrVideo.currentTime());
			}

			
			dataLoad(_titileNo);


			return this;

});