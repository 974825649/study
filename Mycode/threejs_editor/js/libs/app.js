/**
 * @author mrdoob / http://mrdoob.com/
 */

var APP = {

	Player: function () {

		var loader = new THREE.ObjectLoader();
		var camera, cameraRecord, cameraHelper, cameraMini, scene, sceneMini, renderer, rendererMini;

		var events = {};

		var dom = document.createElement( 'div' );

		var domMini = document.createElement( 'div' );

		this.dom = dom;

		this.domMini = domMini;

		this.width = 500;
		this.height = 500;

		var controls, controlsMini;

		var moveForward = false;
		var moveBackward = false;
		var moveLeft = false;
		var moveRight = false;
		var moveUp = false;
		var moveDown = false;

		var velocity = new THREE.Vector3();
		var cameraVelocity = 1;
		var direction = new THREE.Vector3();

		var pointerControls, cameraPlaying = false, cameraPausing = false;

		this.load = function ( json ) {

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setClearColor( 0x000000 );
			renderer.setPixelRatio( window.devicePixelRatio );

			rendererMini = new THREE.WebGLRenderer( { antialias: true } );
			rendererMini.setClearColor( 0x000000 );
			rendererMini.setPixelRatio( window.devicePixelRatio );

			var project = json.project;

			if ( project.gammaInput ) renderer.gammaInput = true;
			if ( project.gammaOutput ) renderer.gammaOutput = true;
			if ( project.shadows ) renderer.shadowMap.enabled = true;
			if ( project.vr ) renderer.vr.enabled = true;

			dom.appendChild( renderer.domElement );

			domMini.appendChild( rendererMini.domElement );

			this.setCamera( loader.parse( json.camera ) );
			this.setScene( loader.parse( json.scene ) );

			cameraRecord = json.cameraRecord;
			timeLen = cameraRecord.end - cameraRecord.start;

			controls = new THREE.EditorControls( camera, dom );

			controlsMini = new THREE.EditorControls( cameraMini, domMini );

			pointerControls = new THREE.PointerLockControls( camera, dom );
			pointerControls.addEventListener( 'unlock', function () {

				this.changeControls();

			}.bind(this) );

			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				mousedown: [],
				mouseup: [],
				mousemove: [],
				touchstart: [],
				touchend: [],
				touchmove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for ( var eventKey in events ) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[ eventKey ] = eventKey;

			}

			var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

			for ( var uuid in json.scripts ) {

				var object = scene.getObjectByProperty( 'uuid', uuid, true );

				if ( object === undefined ) {

					console.warn( 'APP.Player: Script without object.', uuid );
					continue;

				}

				var scripts = json.scripts[ uuid ];

				for ( var i = 0; i < scripts.length; i ++ ) {

					var script = scripts[ i ];

					var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

					for ( var name in functions ) {

						if ( functions[ name ] === undefined ) continue;

						if ( events[ name ] === undefined ) {

							console.warn( 'APP.Player: Event type not supported (', name, ')' );
							continue;

						}

						events[ name ].push( functions[ name ].bind( object ) );

					}

				}

			}

			dispatch( events.init, arguments );

		};

		this.setCamera = function ( value ) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			if ( renderer.vr.enabled ) {

				dom.appendChild( WEBVR.createButton( renderer ) );

			}

			cameraHelper = new THREE.CameraHelper( camera );
			cameraMini = camera.clone();
			cameraMini.far = 10000;
			cameraMini.position.z = 500;
			cameraMini.updateProjectionMatrix();

		};

		this.setScene = function ( value ) {

			scene = value;
			sceneMini = scene.clone();
			sceneMini.add( cameraHelper );

		};

		this.setSize = function ( width, height ) {

			this.width = width;
			this.height = height;

			if ( camera ) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			if ( renderer ) {

				renderer.setSize( width, height );
				dom.style.cssText = 'width: ' + width + 'px; height: ' + height + 'px';

			}

		};

		this.setSizeMini = function ( width, height ) {

			if ( cameraMini ) {

				cameraMini.aspect = this.width / this.height;
				cameraMini.updateProjectionMatrix();

			}

			if ( rendererMini ) {

				rendererMini.setSize( width, height );
				domMini.style.cssText = 'position: absolute; bottom: 0; left: 0; border: 1px solid #fff; width: ' + width + 'px; height: ' + height + 'px';

			}

		};

		// 切换按钮

		this.changeControls = function () {

			if ( controls.enabled ) {
				controls.enabled = false;
				pointerControls.lock();
			} else {
				controls.enabled = true;
			}

		}

		// 播放按钮

		this.getCameraRecord = function () {

			return cameraRecord;

		}

		this.getCameraPlaying = function () {

			return cameraPlaying;

		}

		this.getCameraPausing = function () {

			return cameraPausing;

		}

		function setCameraKey( key, val ) {

			return function () {

				switch ( key.type ) {

					case 'moveForward':
						moveForward = val;
						break;

					case 'moveBackward':
						moveBackward = val;
						break;

					case 'moveLeft':
						moveLeft = val;
						break;

					case 'moveRight':
						moveRight = val;
						break;

					case 'moveUp':
						moveUp = val;
						break;

					case 'moveDown':
						moveDown = val;
						break;

				}

				var lookAt = new THREE.Vector3();

				if ( val ) {

					lookAt.set( key.lookStart.x, key.lookStart.y, key.lookStart.z );

				} else {

					lookAt.set( key.lookEnd.x, key.lookEnd.y, key.lookEnd.z );

				}

				lookAt.add( camera.position );
				camera.lookAt( lookAt );

			};

		}

		function setCameraMove( key, val ) {

			switch ( key.type ) {

				case 'moveForward':
					moveForward = val;
					break;

				case 'moveBackward':
					moveBackward = val;
					break;

				case 'moveLeft':
					moveLeft = val;
					break;

				case 'moveRight':
					moveRight = val;
					break;

				case 'moveUp':
					moveUp = val;
					break;

				case 'moveDown':
					moveDown = val;
					break;

			}

		}

		function resetCameraKey() {

			moveForward = false;
			moveBackward = false;
			moveLeft = false;
			moveRight = false;
			moveUp = false;
			moveDown = false;

		}

		var startCamera, pauseCamera = 0, pauseCameraLen = 0, playDom, pauseDom;

		this.playCamera = function ( dom, domPause ) {

			if ( ! cameraRecord || cameraRecord.looksCount === 0 ) {

				alert( '没有播放内容，在定位相机时录制' );
				return;

			}

			controls.enabled = false;
			cameraPlaying = true;
			startCamera = performance.now();

			playDom = dom;
			pauseDom = domPause;

		}

		this.pauseCamera = function ( dom ) {

			cameraPausing = true;
			pauseCamera = performance.now();
			dom.innerHTML = '继 续';

		}

		this.resumeCamera = function ( dom ) {

			cameraPausing = false;
			pauseCameraLen += performance.now() - pauseCamera;
			dom.innerHTML = '暂 停';

		}

		this.stopCamera = function ( dom, domPause ) {

			controls.enabled = true;
			cameraPlaying = false;
			cameraPausing = false;
			pauseCameraLen = 0;
			resetCameraKey();
			lookIndex = 0;

			dom.innerHTML = '播 放';
			domPause.innerHTML = '暂 停';
			domPause.style.cssText = 'display: none;';

		}

		//

		function dispatch( array, event ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				array[ i ]( event );

			}

		}

		var prevTime, lookAt = new THREE.Vector3(), lookIndex = 0, that = this, timeLen;

		function animate( time ) {

			if ( cameraPlaying && ! cameraPausing ) {

				if ( lookIndex < cameraRecord.looksCount ) {

					var cameraTime = cameraRecord.looks[ lookIndex * 4 ] - cameraRecord.start;

					while ( cameraTime < ( time - startCamera - pauseCameraLen + 10 ) ) {

						lookIndex++;
						cameraTime = cameraRecord.looks[ lookIndex * 4 ] - cameraRecord.start;

					}
					lookIndex > 0 ? lookIndex-- : '';

					lookAt.set( cameraRecord.looks[ lookIndex * 4 + 1 ], cameraRecord.looks[ lookIndex * 4 + 2 ], cameraRecord.looks[ lookIndex * 4 + 3 ] );
					lookAt.add( camera.position );
					camera.lookAt( lookAt );

					camera.position.set( cameraRecord.moves[ lookIndex * 3 ], cameraRecord.moves[ lookIndex * 3 + 1 ], cameraRecord.moves[ lookIndex * 3 + 2 ] );

					lookIndex++;

					timeNow = time - startCamera - pauseCameraLen;
					playDom.innerHTML = '停止（' + (timeNow/1000).toFixed(1) + '/' + (timeLen/1000).toFixed(1) + '）';

				} else {

					that.stopCamera( playDom, pauseDom );

				}

			}

			if ( pointerControls.isLocked ) {

				var delta = ( time - prevTime ) / 1000;

				velocity.x -= velocity.x * 10.0 * delta;
				velocity.z -= velocity.z * 10.0 * delta;
				velocity.y -= velocity.y * 10.0 * delta;

				direction.z = Number( moveForward ) - Number( moveBackward );
				direction.x = Number( moveLeft ) - Number( moveRight );
				direction.y = Number( moveDown ) - Number( moveUp );
				direction.normalize(); // this ensures consistent movements in all directions

				if ( moveForward || moveBackward ) velocity.z -= direction.z * 40.0 * cameraVelocity * delta;
				if ( moveLeft || moveRight ) velocity.x -= direction.x * 40.0 * cameraVelocity * delta;
				if ( moveUp || moveDown ) velocity.y -= direction.y * 40.0 * cameraVelocity * delta;

				camera.translateX( velocity.x * delta );
				camera.translateY( velocity.y * delta );
				camera.translateZ( velocity.z * delta );

			}

			try {

				dispatch( events.update, { time: time, delta: time - prevTime } );

			} catch ( e ) {

				console.error( ( e.message || e ), ( e.stack || "" ) );

			}

			renderer.render( scene, camera );
			rendererMini.render( sceneMini, cameraMini );

			prevTime = time;

		}

		this.play = function () {

			prevTime = performance.now();

			document.addEventListener( 'keydown', onDocumentKeyDown );
			document.addEventListener( 'keyup', onDocumentKeyUp );
			document.addEventListener( 'mousedown', onDocumentMouseDown );
			document.addEventListener( 'mouseup', onDocumentMouseUp );
			document.addEventListener( 'mousemove', onDocumentMouseMove );
			document.addEventListener( 'touchstart', onDocumentTouchStart );
			document.addEventListener( 'touchend', onDocumentTouchEnd );
			document.addEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.start, arguments );

			renderer.setAnimationLoop( animate );

		};

		this.stop = function () {

			document.removeEventListener( 'keydown', onDocumentKeyDown );
			document.removeEventListener( 'keyup', onDocumentKeyUp );
			document.removeEventListener( 'mousedown', onDocumentMouseDown );
			document.removeEventListener( 'mouseup', onDocumentMouseUp );
			document.removeEventListener( 'mousemove', onDocumentMouseMove );
			document.removeEventListener( 'touchstart', onDocumentTouchStart );
			document.removeEventListener( 'touchend', onDocumentTouchEnd );
			document.removeEventListener( 'touchmove', onDocumentTouchMove );

			dispatch( events.stop, arguments );

			renderer.setAnimationLoop( null );

		};

		this.dispose = function () {

			while ( dom.children.length ) {

				dom.removeChild( dom.firstChild );

			}

			renderer.dispose();

			rendererMini.dispose();

			controls = undefined;
			pointerControls = undefined;

			camera = undefined;
			scene = undefined;
			renderer = undefined;

			cameraMini = undefined;
			sceneMini = undefined;
			rendererMini = undefined;

		};

		//

		function onDocumentKeyDown( event ) {

			switch ( event.keyCode ) {

				case 32: // 空格
					if ( cameraPlaying ) {

						if ( cameraPausing ) {
							that.resumeCamera( pauseDom );
						} else {
							that.pauseCamera( pauseDom );
						}

					}
					break;

				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true;
					break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;

				case 67: // c
					moveUp = true;
					break;

				case 88: // x
					moveDown = true;
					break;

			}

			dispatch( events.keydown, event );

		}

		function onDocumentKeyUp( event ) {

			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
					moveLeft = false;
					break;

				case 40: // down
				case 83: // s
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;

				case 67: // c
					moveUp = false;
					break;

				case 88: // x
					moveDown = false;
					break;

			}


			dispatch( events.keyup, event );

		}

		function onDocumentMouseDown( event ) {

			dispatch( events.mousedown, event );

		}

		function onDocumentMouseUp( event ) {

			dispatch( events.mouseup, event );

		}

		function onDocumentMouseMove( event ) {

			dispatch( events.mousemove, event );

		}

		function onDocumentTouchStart( event ) {

			dispatch( events.touchstart, event );

		}

		function onDocumentTouchEnd( event ) {

			dispatch( events.touchend, event );

		}

		function onDocumentTouchMove( event ) {

			dispatch( events.touchmove, event );

		}

	}

};
