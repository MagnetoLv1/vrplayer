//jquery.min.js 파일 내 임의의 라인에서,
define(['hls'],function(Hls) {
	return function(){
		
				// video element 생성
				var video = document.createElement('video');
				video.setAttribute('crossorigin', 'anonymous'); //The video element contains cross-origin data
				
				var that = this;
				var _autoPlay=false;
				var _url = "";
				this.create = function ( elem )
				{
					var that = this;
					$(video).bind('canplay  error loadeddata loadedmetadata loadstart play playing pause ended waiting', function ( e ) {					
						var type = '';
						switch ( e.type )
						{
						
							case 'loadstart':
							case 'waiting':
								$(that).trigger('BUFFERING');
								break;
							case 'play':
								$(that).trigger('PLAY');
								break;
							case 'playing':
								$(that).trigger('PLAYING');
								break;
							case 'pause':
								$(that).trigger('PAUSE');
								break;
							case 'error':
								$(that).trigger('ERROR');
								break;
							case 'ended':
								$(that).trigger('STOP');
								break;
						}
					})
					

					var renderer = new THREE.WebGLRenderer({antialias : true});
					renderer.autoClear = false;
					renderer.setClearColor(0x000000);
					$(elem).append(renderer.domElement)




					// set camera position so that OrbitControls works properly.
					var resolutionRate = 16 / 9
					camera = new THREE.PerspectiveCamera(75, resolutionRate, 1, 10000);
					camera.position.z = 0.0001;

					var controls = new THREE.VRControls(camera);
					// Initialize the WebVR manager.
					manager = new WebVRManager(renderer);


					// panorma mesh
					var geometry = new THREE.SphereGeometry(1000, 60, 60);
					geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

					//Vieo Texture 생성
					videoTexture = new THREEx.VideoTexture(video);
					videoTexture.minFilter = THREE.LinearFilter;

					//Material
					var material = new THREE.MeshBasicMaterial({color : 0xffffff, map : videoTexture});

					//Mesh
					var mesh = new THREE.Mesh(geometry, material);
					mesh.renderDepth = 2;
					mesh.rotation.set(0, -90 * Math.PI / 180, 0);

					//Scene
					var scene = new THREE.Scene();
					scene.add(mesh);


					//리사이즈
					$(window).on("resize orientationchange", onWindowResize);
					onWindowResize();

					// window events
					function onWindowResize () {
						var width = window.innerWidth;
						var height = Math.ceil(width / 16 * 9);
						camera.aspect = resolutionRate;
						camera.updateProjectionMatrix();
						manager.setSize(window.innerWidth, height);
					}

					function animate () {
						controls.update();
						manager.render(scene, camera);
						window.requestAnimationFrame(animate);
					}
					window.requestAnimationFrame(animate);

				}
				this.source = function ( aUrl )
				{
					var url = aUrl.mp4;
					//PC & HLS 이면
					if ( isMobile() == false && url.indexOf('m3u8') > 0 ) {

						hls = new Hls();
						hls.loadSource(url);
						hls.attachMedia(video);
						hls.on(Hls.Events.MANIFEST_PARSED, function () {
							video.play();
						});
						//HLS 로드
						hls.on(Hls.Events.ERROR, function ( errType, event ) {
							console.log(errType, event)
							switch ( event.type ) {
								case 'hlsNetworkError':
									$('.sign').show();
									$('#readyImg').attr("src", "http://www.afreeca.com/afevent/promotion/award2015/images/m/sign2.gif");
									break;
							}
						});
					} else
					{
						_url = url;
						if(_autoPlay){
							this.play();
						}						
					}
				}
				this.getDuration = function()
				{
					return video.duration?video.duration:0;
				}
				this.play = function (time)
				{
					console.log(video.played);
					if(video.readyState==4 && video.paused){
						video.play();
					}
					else
					{
						if(video.src != _url)
						{
							video.src = _url;
							if(time)
								video.currentTime= time;
						}
						video.play();
					}

				}
				this.pause = function ()
				{
					video.pause();
				}
				this.seek =function(time)
				{
					video.currentTime = time;
				}
				this.autoPlay = function(value)
				{
					_autoPlay = value;
					video.autoplay = _autoPlay;
				}
				this.currentTime = function()
				{
					return	video.currentTime;
				}			
				this.setVolume = function ( value ) {
					video.volume =value;
				}
				this.getVolume = function () {
					return video.volume;
				}
				this.isVRMode = function()
				{
					return true;
				}	
	};
});