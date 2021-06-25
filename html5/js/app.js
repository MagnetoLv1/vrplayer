// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/app',
    paths: {
		lib:'../lib',
		swfobject:'../lib/swfobject',
		hls:'../lib/hls/hls',
			
		'tree':'../lib/tree/three.min',
		'threex.videotexture':'../lib/tree/threex.videotexture',
		'three.stereoeffect':'../lib/tree/three.stereoeffect',
		'VRControls':'../lib/tree/VRControls',
		'VREffect':'../lib/tree/VREffect',
		'OrbitControls':'../lib/tree/OrbitControls',
		'webvr-polyfill':'../lib/tree/webvr-polyfill',
		'webvr-manager':'../lib/tree/webvr-manager'
    }
});

require(['vrplayer'], function(vrplayer){
	console.log(vrplayer)	
});