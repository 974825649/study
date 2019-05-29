/**
 * @author mrdoob / http://mrdoob.com/
 */

var Viewport = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new Viewport.Info( editor ) );

	//

	var renderer = null;

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;
    var sceneSkyBox = editor.sceneSkyBox;
	var lineHelper = editor.lineHelper;
	var textHelper = editor.textHelper;
	var objectHelper = new ObjectHelper();
	var planeHelper = new ObjectHelper.Plane();
    // 模拟天空
    var sky = editor.sky;
    sky.scale.setScalar( 450000 );
    var sunSphere = editor.sunSphere;
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    var effectController  = {
        turbidity: 10,
        rayleigh: 0.35,
        mieCoefficient: 0.001,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.2, // elevation / inclination
        azimuth: 0.21, // Facing front,
        sun: ! true
    };

    var bgMesh; // 天空盒
	var objects = [];

	// scene helper

	var grid = new THREE.GridHelper( 60, 60 );
	sceneHelpers.add( grid );

	function initLineHelper() {

		sceneHelpers.remove( lineHelper.line );

		for ( var i = 0, l = lineHelper.dotObjects.length; i < l; i++ ) {
			sceneHelpers.remove( lineHelper.dotObjects[ i ] );
		}

		lineHelper.dots = [];
		lineHelper.dotIndex = -1;
		lineHelper.dotObjects = [];
		lineHelper.dotObjectsAll = [];
		lineHelper.line = null;

	}

    if(false && !sceneSkyBox.getObjectByName("SkyBox")){
        // 添加天空盒
        // var geometry = new THREE.CubeGeometry( 400, 400, 400 );
        // var cubeMaterials = [
        //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "../threejs_editor/image/nightsky_ft.png" ), side: THREE.DoubleSide }), //front side
        //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '../threejs_editor/image/nightsky_bk.png' ), side: THREE.DoubleSide }), //back side
        //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '../threejs_editor/image/nightsky_up.png' ), side: THREE.DoubleSide }), //up side
        //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '../threejs_editor/image/nightsky_dn.png' ), side: THREE.DoubleSide }), //down side
        //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '../threejs_editor/image/nightsky_rt.png' ), side: THREE.DoubleSide }), //right side
        //     new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( '../threejs_editor/image/nightsky_lf.png' ), side: THREE.DoubleSide }) //left side
        // ];

        // var cubeMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
        // var bgMesh = new THREE.Mesh( geometry, cubeMaterial );
        // bgMesh.name = "SkyBox";
        // console.log("add..");
        // sceneSkyBox.add(bgMesh);

        const loader = new THREE.TextureLoader();
        const texture = loader.load(
        	'../threejs_editor/image/vr_waterlemon.jpg'
            // 'https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg'
        );
		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.magFilter = THREE.LinearFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.encoding = THREE.sRGBEncoding;

        const shader = THREE.ShaderLib.equirect;
        const material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
            depthWrite: false,
			side: THREE.BackSide,
			defaultAttributeValues: {
				'color': [ 1, 1, 1 ],
				'uv': [ 0, 0 ],
				'uv2': [ 0, 0 ]
			}
		});

		material.uniforms.tEquirect.value = texture;
		Object.defineProperty( material, 'map', {
			get: function () {
				return this.uniforms.tEquirect.value;
			}
		} );

        const box = new THREE.BoxBufferGeometry(600, 600, 600);
		bgMesh = new THREE.Mesh(box, material);
        // sceneSkyBox.add(bgMesh);
    }

    // 模拟天空
    if(true){
        sceneSkyBox.add(sky);
        sceneSkyBox.add(sunSphere);

        // gui控制器操控函数
        guiChanged();
    }

    function guiChanged(){
        var distance = 400000;
        var uniforms = sky.material.uniforms;
        uniforms[ "turbidity" ].value = effectController.turbidity;
        uniforms[ "rayleigh" ].value = effectController.rayleigh;
        uniforms[ "luminance" ].value = effectController.luminance;
        uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
        uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        sunSphere.visible = effectController.sun;

        uniforms[ "sunPosition" ].value.copy( sunSphere.position );

        // renderer.render( scene, camera );
    }

	// object helper

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var objectPositionOnDown = null;
	var objectRotationOnDown = null;
	var objectScaleOnDown = null;

	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );
			objectHelper.refreshObjectHelper( object, scene, sceneHelpers, textHelper );

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}

			signals.refreshSidebarObject3D.dispatch( object );

		}

		// render();

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		var object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			switch ( transformControls.getMode() ) {

				case 'translate':

					if ( ! objectPositionOnDown.equals( object.position ) ) {

						editor.execute( new SetPositionCommand( object, object.position, objectPositionOnDown ) );

					}

					break;

				case 'rotate':

					if ( ! objectRotationOnDown.equals( object.rotation ) ) {

						editor.execute( new SetRotationCommand( object, object.rotation, objectRotationOnDown ) );

					}

					break;

				case 'scale':

					if ( ! objectScaleOnDown.equals( object.scale ) ) {

						editor.execute( new SetScaleCommand( object, object.scale, objectScaleOnDown ) );

					}

					break;

			}

		}

		controls.enabled = true;

	} );
	sceneHelpers.add( transformControls );

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var cameraLocated = false;
	var cameraHeight = 0;
	var cameraVelocity = 1;

	// events

	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( objects );

		if ( intersects.length === 0 ) {

			if ( cameraLocated ) {

				// 定位相机

				var plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 0 );
				var point = new THREE.Vector3();
				raycaster.ray.intersectPlane( plane, point );
				intersects = [ { point: point } ];

			} else if ( lineHelper.plane ) {

				// 划线

				intersects = raycaster.intersectObjects( [ lineHelper.plane ] );

			}

		}

		return intersects;

	}

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				if ( cameraLocated ) {

					// 定位相机

					if ( pointerControls.isLocked ) return;

					intersects[ 0 ].point.setY( cameraHeight );
					editor.camera.position.copy( intersects[ 0 ].point );
					signals.cameraChanged.dispatch();

					pointerControls.lock();
					cameraRecord.looks = [];
					cameraRecord.moves = [];
					cameraRecord.looksCount = 0;
					cameraRecord.start = performance.now();

				} else if ( lineHelper.plane ) {

					// 划线

					var obj = objectHelper.getDotObj( { color: 0x00ffff } );
					obj.position.copy( intersects[ 0 ].point );
					sceneHelpers.add( obj );

					lineHelper.dots = lineHelper.dots.slice( 0, lineHelper.dotIndex + 1 );
					lineHelper.dotObjects = lineHelper.dotObjects.slice( 0, lineHelper.dotIndex + 1 );

					lineHelper.dots.push( intersects[ 0 ].point );
					lineHelper.dotIndex++;
					lineHelper.dotObjects.push( obj );

					objectHelper.scaleObjectsRelatively( [obj], camera, 1 );
					lineHelper.dotObjectsAll.push( obj );

					if ( lineHelper.dotIndex > 0 ) {

						sceneHelpers.remove( lineHelper.line );

						lineHelper.line = lineHelper.lineHelper.getLine( lineHelper.dots.slice( 0, lineHelper.dotIndex + 1 ), { color: 0xffffff } );
						sceneHelpers.add( lineHelper.line );

					}

				} else {

					// 选择模型

					var object = intersects[ 0 ].object;

					if ( object.userData.lock ) return;

					if ( object.userData.object !== undefined ) {

						// helper

						editor.select( object.userData.object );

					} else {

						editor.select( object );

					}

				}

			} else {

				editor.select( null );

			}

			// render();

		}

	}

	function onMouseDown( event ) {

		event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseUp( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	}

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	}

	function onDoubleClick( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.cameraChanged.dispatch( camera );

	} );

	// PointerLockControls

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;

	var prevTime = performance.now();
	var velocity = new THREE.Vector3();
	var direction = new THREE.Vector3();

	var pointerControls = new THREE.PointerLockControls( camera, container.dom );

	pointerControls.addEventListener( 'unlock', function () {

		cameraRecord.end = performance.now();

		editor.cameraRecord = {};
		editor.cameraRecord = cameraRecord;
		signals.cameraSetupLocated.dispatch( false );

	} );

	var cameraRecord = {
		looks: [],
		looksCount: 0,
		looksSize: 4, // time, x, y, z
		moves: [],
		movesSize: 3, // x, y, z
		start: 111111,
		end: 11111222,
	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

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

	};

	var onKeyUp = function ( event ) {

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

	};

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	// signals

	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		// render();

	} );

	signals.themeChanged.add( function ( value ) {

		switch ( value ) {

			case 'css/light.css':
				sceneHelpers.remove( grid );
				grid = new THREE.GridHelper( 60, 60, 0x444444, 0x888888 );
				sceneHelpers.add( grid );
				break;
			case 'css/dark.css':
				sceneHelpers.remove( grid );
				grid = new THREE.GridHelper( 60, 60, 0xbbbbbb, 0x888888 );
				sceneHelpers.add( grid );
				break;

		}

		// render();

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.rendererChanged.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;

		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

	signals.sceneGraphChanged.add( function () {

		// render();

	} );

	signals.cameraChanged.add( function () {

		objectHelper.scaleObjectsRelatively( lineHelper.dotObjectsAll, camera, 1 );

		// render();

	} );

	signals.cameraLocated.add( function ( located, height, velocity ) {

		cameraLocated = located;
		cameraHeight = height;
		cameraVelocity = velocity;

		controls.enabled = !located;

	} );

	signals.cameraSetupLocated.add( function ( located ) {

		cameraLocated = located;
		controls.enabled = !located;

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();
		objectHelper.clearObjectHelper( sceneHelpers );

		if ( object !== null && object !== scene && object !== camera ) {

			box.setFromObject( object );

			if ( box.isEmpty() === false ) {

				selectionBox.setFromObject( object );
				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		// render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( object ) {

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );

		}

		// render();

	} );

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.push( child );

		} );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			if ( object.visible && ! object.userData.lock ) {

				selectionBox.setFromObject( object );
				transformControls.update();

			} else {

				editor.select( null );

			}

		}

		if ( object instanceof THREE.PerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		if ( editor.helpers[ object.id ] !== undefined ) {

			editor.helpers[ object.id ].update();

		}

		// render();

	} );

	signals.objectRemoved.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.splice( objects.indexOf( child ), 1 );

		} );

	} );

	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );

	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.lineHelperChanged.add( function ( opt ) {

		// opt = {
		// 	switch: 0,  // 0 关闭；1 开启；2 切换
		// 	axis: 'y',  // 默认 y 表示 XZ 平面
		// 	position: 0
		// }

		var type = 0;  // 0 关闭；1 开启，更新
		if ( opt.switch !== undefined ) {

			type = opt.switch;

			if ( type === 2 ) {  // 切换

				if ( lineHelper.plane ) {
					type = 0;
				} else {
					type = 1;
				}

			}

			if ( type === 0 ) {
				initLineHelper();
			}

		} else {

			if ( lineHelper.plane ) {
				type = 1;
			} else {
				type = 0;
			}

		}

		if ( opt.axis ) lineHelper.planeDirection = opt.axis;
		if ( opt.position !== undefined ) lineHelper.planePositionn = opt.position;

		if ( type === 0 ) {
			close();
		} else {
			close(); open();
		}

		function open() {

			lineHelper.plane = planeHelper.getPlane();

			if ( lineHelper.planeDirection === 'x' ) {
				lineHelper.plane.rotateY( Math.PI / 2 );
			} else if ( lineHelper.planeDirection === 'y' ) {
				lineHelper.plane.rotateX( - Math.PI / 2 );
			}

			lineHelper.plane.translateZ( lineHelper.planePositionn );
			lineHelper.plane.updateMatrixWorld();

			sceneHelpers.add( lineHelper.plane );

		}

		function close() {

			sceneHelpers.remove( lineHelper.plane );
			lineHelper.plane = null;

		}

	} );

	signals.lineHelperUndo.add( function ( step ) {

		lineHelper.dotIndex += step;
		if ( lineHelper.dotIndex < 0 ) {
			lineHelper.dotIndex = -1;
		} else if ( lineHelper.dotIndex > lineHelper.dots.length - 1 ) {
			lineHelper.dotIndex = lineHelper.dots.length - 1;
		}

		for ( var i = 0, l = lineHelper.dotObjects.length; i < l; i++ ) {

			if ( i > lineHelper.dotIndex ) {
				sceneHelpers.remove( lineHelper.dotObjects[ i ] );
			} else {
				sceneHelpers.add( lineHelper.dotObjects[ i ] );
			}

		}

		sceneHelpers.remove( lineHelper.line );
		if ( lineHelper.dotIndex > 0 ) {

			lineHelper.line = lineHelper.lineHelper.getLine( lineHelper.dots.slice( 0, lineHelper.dotIndex + 1 ), {} );
			sceneHelpers.add( lineHelper.line );

		} else {

			lineHelper.line = null;

		}

	} );

	signals.lineHelperRun.add( function ( name ) {

		if ( lineHelper.plane && lineHelper.dots.length > 2 ) {

			if ( name === 'shape2' ) {

				var mesh = planeHelper.getShape2( lineHelper.dots, {} );
				mesh.name = 'Shape2';
				editor.execute( new AddObjectCommand( mesh ) );

			} else if ( name === 'shape3' ) {

				var mesh = planeHelper.getShape3( lineHelper.dots, {}, {} );
				mesh.name = 'Shape3';
				editor.execute( new AddObjectCommand( mesh ) );

			}

			initLineHelper();
			return;

		}

	} );

	signals.materialChanged.add( function ( material ) {

		// render();

	} );

	// fog

	signals.sceneBackgroundChanged.add( function ( backgroundColor ) {

		scene.background.setHex( backgroundColor );

		// render();

	} );

	var currentFogType = null;

	signals.sceneFogChanged.add( function ( fogType, fogColor, fogNear, fogFar, fogDensity ) {

		if ( currentFogType !== fogType ) {

			switch ( fogType ) {

				case 'None':
					scene.fog = null;
					break;
				case 'Fog':
					scene.fog = new THREE.Fog();
					break;
				case 'FogExp2':
					scene.fog = new THREE.FogExp2();
					break;

			}

			currentFogType = fogType;

		}

		if ( scene.fog instanceof THREE.Fog ) {

			scene.fog.color.setHex( fogColor );
			scene.fog.near = fogNear;
			scene.fog.far = fogFar;

		} else if ( scene.fog instanceof THREE.FogExp2 ) {

			scene.fog.color.setHex( fogColor );
			scene.fog.density = fogDensity;

		}

		// render();

	} );

	//

	signals.windowResize.add( function () {

		// TODO: Move this out?

		editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		editor.DEFAULT_CAMERA.updateProjectionMatrix();

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		// render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		// render();

	} );

	//

	var lookRender = new THREE.Vector3();

	function render() {

		requestAnimationFrame( render );

		if ( pointerControls.isLocked === true ) {

			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;

			if ( delta > 0.01 ) {

				camera.getWorldDirection( lookRender );
				cameraRecord.looks.push( time );
				cameraRecord.looks.push( lookRender.x );
				cameraRecord.looks.push( lookRender.y );
				cameraRecord.looks.push( lookRender.z );
				cameraRecord.looksCount++;

				lookRender.copy( camera.position );
				cameraRecord.moves.push( lookRender.x );
				cameraRecord.moves.push( lookRender.y );
				cameraRecord.moves.push( lookRender.z );

			}

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

			pointerControls.getObject().translateX( velocity.x * delta );
			pointerControls.getObject().translateY( velocity.y * delta );
			pointerControls.getObject().translateZ( velocity.z * delta );

			prevTime = time;

		}

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.render( scene, camera );

		if ( renderer instanceof THREE.RaytracingRenderer === false ) {
            // bgMesh.position.copy(camera.position);
            // bgMesh.position.setY(0);
			renderer.render( sceneHelpers, camera );
			renderer.render( sceneSkyBox, camera );
		}


	}

	return container;

};
