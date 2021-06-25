/*
 * Copyright 2015 Boris Smus. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * Helper for getting in and out of VR mode.
 * Here we assume VR mode == full screen mode.
 *
 * 1. Detects whether or not VR mode is possible by feature detecting for
 * WebVR (or polyfill).
 *
 * 2. If WebVR is available, provides means of entering VR mode:
 * - Double click
 * - Double tap
 * - Click "Enter VR" button
 *
 * 3. Provides best practices while in VR mode.
 * - Full screen
 * - Wake lock
 * - Orientation lock (mobile only)
 */
(function () {

	var Modes = {
		// Incompatible with WebVR.
		MONO: 1,
		// Compatible with WebVR.
		STEREO: 2,
		// In virtual reality via WebVR.
		VR: 3,
	};

	function WebVRManager(renderer, params) {
		this.params = params || {};

		// Save the THREE.js renderer and effect for later.
		this.renderer = renderer;
		this.effect = this.renderer;
		this.vrEffect = new THREE.VREffect(this.renderer);
		this.stereoEffect = new THREE.StereoEffect(this.renderer);

		// Set the right mode.
		this.defaultMode = Modes.MONO;
		this.setMode(this.defaultMode);
		this.hmd = false;

		// Check if the browser is compatible with WebVR.
		this.getHMD().then(function (hmd) {
			// Activate either VR or Immersive mode.
			this.hmd = hmd;
			if (hmd) {
				this.activateVR();
			}
		}.bind(this));

		this.os = this.getOS();
	}


	/**
	 * Promise returns true if there is at least one HMD device available.
	 */
	WebVRManager.prototype.getHMD = function () {
		return new Promise(function (resolve, reject) {
			navigator.getVRDevices().then(function (devices) {
				// Promise succeeds, but check if there are any devices actually.
				for (var i = 0; i < devices.length; i++) {
					if (devices[i] instanceof HMDVRDevice) {
						resolve(devices[i]);
						break;
					}
				}
				resolve(null);
			}, function () {
				// No devices are found.
				resolve(null);
			});
		});
	};

	WebVRManager.prototype.isVRMode = function () {
		return this.mode == Modes.VR;
	};

	WebVRManager.prototype.render = function (scene, camera) {
		this.effect.render(scene, camera);
	};

	WebVRManager.prototype.setMode = function (mode) {
		this.mode = mode;
		if (this.mode == Modes.VR)
		{
			if (this.hmd)
				this.effect = this.vrEffect;
			else
				this.effect = this.stereoEffect;

		} else
		{
			this.effect = this.renderer;
		}
		this.effect.setSize(this.innerWidth, this.innerHeight);
	};


	/**
	 * Makes it possible to go into VR mode.
	 */
	WebVRManager.prototype.activateVR = function () {
		// Make it possible to enter VR via double click.
		window.addEventListener('dblclick', this.enterVR.bind(this));
		// Or via double tap.
		window.addEventListener('touchend', this.onTouchEnd.bind(this));
		// Or by hitting the 'f' key.
		window.addEventListener('keydown', this.onKeyDown.bind(this));

		// Whenever we enter fullscreen, this is tantamount to entering VR mode.
		document.addEventListener('webkitfullscreenchange',
			this.onFullscreenChange.bind(this));
		document.addEventListener('mozfullscreenchange',
			this.onFullscreenChange.bind(this));

	};


	WebVRManager.prototype.enterImmersive = function () {
		this.requestPointerLock();
		this.requestFullscreen();
	};


	WebVRManager.prototype.onTouchEnd = function (e) {
		// TODO: Implement better double tap that takes distance into account.
		// https://github.com/mckamey/doubleTap.js/blob/master/doubleTap.js

		var now = new Date();
		if (now - this.lastTouchTime < 300) {
			this.enterVR();
		}
		this.lastTouchTime = now;
	};

	WebVRManager.prototype.onButtonClick = function (e) {
		e.stopPropagation();
		e.preventDefault();
		this.toggleVRMode();
	};

	WebVRManager.prototype.onKeyDown = function (e) {
		if (e.keyCode == 70) { // 'f'
			this.toggleVRMode();
		}
	};

	WebVRManager.prototype.toggleVRMode = function () {
		if (!this.isVRMode()) {
			// Enter VR mode.
			this.enterVR();
		} else {
			this.exitVR();
		}
	};

	WebVRManager.prototype.onFullscreenChange = function (e) {
		// If we leave full-screen, also exit VR mode.
		if (document.webkitFullscreenElement === null ||
			document.mozFullScreenElement === null) {
			this.exitVR();
		}
	};



	WebVRManager.prototype.requestPointerLock = function () {
		var canvas = this.renderer.domElement;
		canvas.requestPointerLock = canvas.requestPointerLock ||
			canvas.mozRequestPointerLock ||
			canvas.webkitRequestPointerLock;

		if (canvas.requestPointerLock) {
			canvas.requestPointerLock();
		}
	};

	WebVRManager.prototype.releasePointerLock = function () {
		document.exitPointerLock = document.exitPointerLock ||
			document.mozExitPointerLock ||
			document.webkitExitPointerLock;

		document.exitPointerLock();
	};

	WebVRManager.prototype.requestOrientationLock = function () {
		if (screen.orientation) {
			screen.orientation.lock('landscape');
		}
	};

	WebVRManager.prototype.releaseOrientationLock = function () {
		if (screen.orientation) {
			screen.orientation.unlock();
		}
	};

	WebVRManager.prototype.requestFullscreen = function () {
		var canvas = this.renderer.domElement;
		if (canvas.mozRequestFullScreen) {
			canvas.mozRequestFullScreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen();
		}
	};

	WebVRManager.prototype.releaseFullscreen = function () {
	};

	WebVRManager.prototype.getOS = function (osName) {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
			return 'iOS';
		} else if (userAgent.match(/Android/i)) {
			return 'Android';
		}
		return 'unknown';
	};


	/**
	 * 전체화면
	 * @returns {undefined}
	 */
	WebVRManager.prototype.enterVR = function () {
		console.log('Entering VR.');
		// Set style on button.
		this.setMode(Modes.VR);

		// Enter fullscreen mode (note: this doesn't work in iOS).
		if (this.hmd && (this.effect instanceof THREE.VREffect))
		{
			this.effect.setFullScreen(true);
			// Lock down orientation, pointer, etc.
			this.requestOrientationLock();
		}
	};

	/**
	 * 전체화면 
	 * @returns {undefined}
	 */
	WebVRManager.prototype.exitVR = function () {
		console.log('Exiting VR.');
		if (this.hmd && (this.effect instanceof THREE.VREffect)) {
			// Leave fullscreen mode (note: this doesn't work in iOS).
			this.effect.setFullScreen(false);
			// Release orientation, wake, pointer lock.
			this.releaseOrientationLock();
		}
		// Also, work around a problem in VREffect and resize the window.
		this.effect.setSize(this.innerWidth, this.innerHeight);

		// Go back to the default mode.
		this.setMode(this.defaultMode);
	};

	WebVRManager.prototype.setSize = function (width, height) {
		this.innerWidth = width;
		this.innerHeight = height;
		this.effect.setSize(this.innerWidth, this.innerHeight);
	};

// Expose the WebVRManager class globally.
	window.WebVRManager = WebVRManager;

})();
