/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var THREEx = THREEx || {}

THREEx.VideoTexture = function (video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy) {

	THREE.Texture.call(this, video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

	this.generateMipmaps = false;

	var scope = this;

	function update() {

		requestAnimationFrame(update);
		//FireFox 일경우 HLS값이 3이상 올라 가지 않음
		if (navigator.userAgent.toLowerCase().indexOf('firefox') > 1 && video.readyState >= video.HAVE_FUTURE_DATA)
		{
			scope.needsUpdate = true;
		} else if (video.readyState === video.HAVE_ENOUGH_DATA)
		{
			scope.needsUpdate = true;
		}
	}

	update();

};
THREEx.VideoTexture.prototype = Object.create(THREE.Texture.prototype);
THREEx.VideoTexture.prototype.constructor = THREE.VideoTexture;