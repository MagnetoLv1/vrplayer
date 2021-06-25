// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
	baseUrl : 'js/app',
	shim : {
		// --- Use shim to mix together all THREE.js subcomponents
		'threeCore' : {exports : 'THREE'}
	},
	paths : {
		three : '../lib/amd-three/three',
		threeCore : '../lib/amd-three/three.min',
		AMDTHREE : '../lib/amd-three/',
		jquery : '../lib/jquery',
		swfobject : '../lib/swfobject',
		hls : '../lib/hls/hls',
	}
});

require(['vrplayer'], function ( vrplayer ) {
});