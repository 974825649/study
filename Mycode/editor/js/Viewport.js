/**
 * @author mrdoob / http://mrdoob.com/
 */

var Viewport = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new Viewport.Camera( editor ) );
	container.add( new Viewport.Info( editor ) );

	//

	var renderer = null;

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var objects = [];

	// helpers

	var grid = new THREE.GridHelper( 30, 30, 0x444444, 0x888888 );
	sceneHelpers.add( grid );

	var array = grid.geometry.attributes.color.array;

	for ( var i = 0; i < array.length; i += 60 ) {

		for ( var j = 0; j < 12; j ++ ) {

			array[ i + j ] = 0.26;

		}

	}

	//

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var objectPositionOnDown = null;
	var objectRotationOnDown = null;
	var objectScaleOnDown = null;

	//控制变化
	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}

			signals.refreshSidebarObject3D.dispatch( object );

		}

		render();

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

	// events

	//myFun
	//获取相交物体
	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return raycaster.intersectObjects( objects );

	}

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {
		//原地点击
		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {    //点击的是辅助线

					// helper

					editor.select( object.userData.object );

				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );

			}

			render();

		}

	}

	function onMouseDown( event ) {

		// event.preventDefault();

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

	//相机控制器
	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		signals.cameraChanged.dispatch( camera );

	} );

	//
	// signals

    //清除editor
	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		render();

	} );
    //mesh变化

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

    //改变渲染器
	signals.rendererChanged.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;
		renderer.autoClear = false;
		renderer.autoUpdateScene = true;
		renderer.gammaOutput = true;
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );

		render();

	} );

    // 改变场景
	signals.sceneGraphChanged.add( function () {

		render();

	} );

	//自定义改变背景
	signals.sceneSkyChanged.add( function (object) {
		if(object){
			if(scene.background && scene.background.name === object.name){
				scene.background = null;
			}else {
				scene.background = object;
			}
		}
		render();
	} );

	//自定义检测FPS
	var stats = new Stats();
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "10px";
	stats.domElement.style.left = "10px";
	stats.domElement.style.display = 'none';
	container.dom.appendChild( stats.domElement );
	signals.statsShow.add(function () {
		 if(stats.domElement.style.display === 'none'){
			 stats.domElement.style.display = 'block';
		 }else {
			 stats.domElement.style.display = 'none';
		 }
	});














	//鼠标屏幕坐标归一化
	var onMovePosition = new THREE.Vector2();
	function onMouseMove( event ) {
		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onMovePosition.fromArray( array );
		onMovePosition.x = onMovePosition.x * 2 - 1;
		onMovePosition.y = onMovePosition.y * 2 - 1;
		return onMovePosition;
	}

	function exitDistance(event){
		if(event.keyCode === 27){
			console.log('exit');
			transformControls.enabled = true;
			window.removeEventListener( 'keydown', exitDistance, false );
			container.dom.removeEventListener("mousemove",onMouseMove, false);
			container.dom.removeEventListener('mousemove',showDistance,false);
		}
	}

	//工具 测量距离
	signals.distanceMeasure.add(function () {
		console.log('start');
		window.addEventListener( 'keydown', exitDistance, false );
		container.dom.addEventListener( "mousemove", onMouseMove, false);

		transformControls.enabled = false;

		//显示移动点
		container.dom.addEventListener('mousemove',showDistance,false);
		//添加球
		container.dom.addEventListener('mousedown', addSphere,false);

	});

	var pointVec = [],                                      //鼠标滑过的点
		firstVec = [], firstPoint = [], poiNum = 0,         //起始点位置 点模型 点个数
		lineTag = 0, lineTotal = [],                        //保存的线标识，线的数组
		pointExist = false, key;                           //判断点是否存在 只计算第一个物体
	//测距离
	function showDistance(event) {
		var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( onMovePosition, camera);
		// sizeChangeSphere();//小球动态变化
		// 计算物体和射线的焦点
		var intersects = raycaster.intersectObjects(scene.children, true);
		key = 0; //每次只需要一个点;
		if (intersects !== null && intersects.length > 0) {
			for (var i = 0; i < intersects.length; i++) {
				if (key) {
					key = 0;
					break;
				}
				console.log(intersects);
			}
			// 	//获取点击的对象
			// 	var object = intersects[i].object;
			// 	var point = intersects[i].point;
			// 	var face = intersects[i].face;
			// 	var facePoint = getFacePoint(object,face);  //获取相交面的数组
			// 	if(facePoint){                              //根据是否有相交面判断小球是否添加
			// 		pointExist = true;
			// 	}
			// 	// 显示移动点的交点
			// 	pointVec = new THREE.Vector3(point.x, point.y, point.z);
			// 	pointVec.set(pointVec.x.toFixed(2), pointVec.y.toFixed(2), pointVec.z.toFixed(2));
			//
			// 	//寻找新点，找到替换
			// 	serchVertices(pointVec, facePoint);  //寻找最近点
			// 	deletPoint();
			// 	addPoint(pointVec);
			//
			// 	//绘制物体内直线
			// 	if (firstVec.length && pointVec.length) {
			// 		deletLine();                  //删除旧线
			// 		drawLine(firstVec, pointVec,false);
			// 	}
			// }
		} 
		// else if(firstVec.length){     //有起点绘制物体外直线
		// 	pointExist = false;
		// 	deletLine();
		// 	drawLine(firstVec, mouse3D,false);
		// }else {
		// 	pointExist = false;       //无起点
		// }
	}
	//获取鼠标2d坐标
	function getMouse2DPosition(event) {
		mouse = new THREE.Vector2();
		// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		//通过摄像机和鼠标位置更新射线
		return mouse;
	}

	//获取鼠标3d坐标
	function getMouse3DPosition(mouse){
		var vector = new THREE.Vector3(mouse.x,mouse.y,0);
		vector.unproject(camera);
		return vector;
	}

	// 添加移动点
	function addPoint(poi) {
		var pointColor = 0x00ff00;
		if (colorChange){
			pointColor = 0x0000ff;
		}
		var newSize = getChangeSize();
		var starsGeometry = new THREE.Geometry();
		starsGeometry.vertices.push(poi);
		var starsMaterial = new THREE.PointsMaterial({size: newSize, color: pointColor});
		var starField = new THREE.Points(starsGeometry, starsMaterial);
		scene.add(starField);
	}

	// 删除移动点
	function deletPoint() {
		for(var i = 0;i < scene.children.length; i ++){
			// 删除鼠标移动点
			if(scene.children[i].type === "Points"){   //
				scene.remove(scene.children[i]);
			}
		}
	}

	//添加小球
	function addSphere(event) {
		event.preventDefault();
		// 判断是否测量
		if(event.which === 1){
			if(pointExist){
				poiNum++;
				// 添加球
				var newSize = getChangeSize();
				var geometry = new THREE.SphereGeometry(newSize/5, 32, 32);
				var material = new THREE.MeshBasicMaterial({color: 0xffff00});
				var sphere = new THREE.Mesh(geometry, material);
				sphere.userData = {'my': 'sphere'};
				sphere.position.set(pointVec.x, pointVec.y, pointVec.z);
				scene.add(sphere);
				if (poiNum === 1) {
					//设置原点
					firstVec = new THREE.Vector3(pointVec.x, pointVec.y, pointVec.z);
					firstPoint.push(sphere);
				} else if (poiNum === 2) {
					//保存新线
					drawLine(firstVec, pointVec,true);
					//保存小球
					firstPoint[0].userData.my = 'sphere'+ lineTag;    //给两个小球增加自己的标签
					sphere.userData = {'my':'sphere'+ lineTag};
					// 删除线和小球
					deletLine();
					deletSphere();
				}
			}else {
				// 删除线和小球
				deletLine();
				deletSphere();
			}
		}else if(event.which ===3){
			deletLine();
			deletSphere();
		}
	}

	//获取动态变化大小
	function getChangeSize() {
		var sphereSize = 40;
		var d = camera.position.distanceTo( new THREE.Vector3( 0,0,0) );
		sphereSize =  d / sphereSize ;
		return sphereSize;
	}

	// 小球大小动态变化
	function sizeChangeSphere() {
		var newSize = getChangeSize();
		var geometry = new THREE.SphereGeometry( newSize/5, 32, 32 );
		for(var i = 0;i < scene.children.length; i++){
			var sphere = scene.children[i];
			if(sphere.type === 'Mesh'){
				sphere.geometry = geometry;
			}
		}
	}

	//删除小球
	function deletSphere() {
		for (var i = 0; i < scene.children.length; i++) {
			if (scene.children[i].userData.my === 'sphere') {
				scene.remove(scene.children[i]);
				i--;
			}
		}
		poiNum = 0;  //球数归零
		firstVec = []; //起点归零
		firstPoint = [];
	}

	//画线测距
	function drawLine(start, end ,saveLine) {
		var linegeometry = new THREE.Geometry(); //创建一个几何体
		var linematerial = new THREE.LineBasicMaterial({color: '#ff4545'});//定义线条的材质
		var color1 = new THREE.Color(0x444444), color2 = new THREE.Color(0xFF0000);//定义点颜色
		// 线的材质可以由2点的颜色决定
		linegeometry.vertices.push(start);
		linegeometry.vertices.push(end);
		linegeometry.colors.push(color1, color2);

		var line = new THREE.Line(linegeometry, linematerial, THREE.LineSegments);//创建出一条线
		var lineDis = new THREE.Line3(start, end);
		var lineDistance = (lineDis.distance().toFixed(2));
		//添加文字
		makeText(line,lineDistance,end);

		if(saveLine === true){
			line.userData = {'my': 'line' + lineTag };
			lineTag++;
			lineTotal.push(line);
		}else{
			line.userData = {'my': 'line'};
		}
		scene.add(line);
	}

	//删除线
	function deletLine() {
		for (var i = 0; i < scene.children.length; i++) {
			if (scene.children[i].userData.my === 'line') {
				scene.children[i].remove(scene.children[i].children[0]);
				scene.remove(scene.children[i]);
				i--;
			}
		}
	}

	//获取相交面数组
	function getFacePoint(object,face){
		this.face = face;
		if (object instanceof THREE.Mesh) {
			key++;
			var geo = object.geometry;
			var facePoint = [];
			if (geo instanceof THREE.BufferGeometry) {
				var geometry = new THREE.Geometry().fromBufferGeometry(geo);
				var vertices = geometry.vertices;
				var a = face.a;
				var b = face.b;
				var c = face.c;
				// //计算面积是先取出三角形角a，角b,角c所对应的三维坐标点   并转化成现实的坐标点
				var newVec1 = new THREE.Vector3(vertices[a].x, vertices[a].y, vertices[a].z);
				newVec1.applyMatrix4(object.matrixWorld);
				newVec1.set(newVec1.x.toFixed(2), newVec1.y.toFixed(2), newVec1.z.toFixed(2));
				var newVec2 = new THREE.Vector3(vertices[b].x, vertices[b].y, vertices[b].z);
				newVec2.applyMatrix4(object.matrixWorld);
				newVec2.set(newVec2.x.toFixed(2), newVec2.y.toFixed(2), newVec2.z.toFixed(2));
				var newVec3 = new THREE.Vector3(vertices[c].x, vertices[c].y, vertices[c].z);
				newVec3.applyMatrix4(object.matrixWorld);
				newVec3.set(newVec3.x.toFixed(2), newVec3.y.toFixed(2), newVec3.z.toFixed(2));
				facePoint.push(newVec1,newVec2,newVec3);
				return facePoint;
			}
		}

	}

	//小球寻找最近顶点
	function serchVertices(po, facePoint) {
		colorChange = false;
		var newarr = [];
		var n = 0.5;
		var x = parseFloat(po.x);
		var y = parseFloat(po.y);
		var z = parseFloat(po.z);
		for (var i = 0; i < 3; i++) {
			var facePointI = facePoint[i];
			var facePointX = parseFloat(facePointI.x);
			var facePointY = parseFloat(facePointI.y);
			var facePointZ = parseFloat(facePointI.z);
			if (x + n > facePointX && x - n < facePointX &&
				y + n > facePointY && y - n < facePointY &&
				z + n > facePointZ && z - n < facePointZ) {
				newarr.push(facePointI);
				pointVec.set(newarr[0].x, newarr[0].y, newarr[0].z);
				console.log(pointVec);
				colorChange = true;
				break;
			}
		}
	}

	//添加文字
	function makeText(line,lineDistance,textPoint) {
		this.line = line;
		this.lineDistances = lineDistance;
		var lineDiv = document.createElement( 'div' );
		lineDiv.className = 'label';
		lineDiv.textContent = lineDistance;
		lineDiv.style.marginTop = '-1em';

		var lineLabel = new THREE.CSS2DObject( lineDiv );
		lineLabel.position.set( textPoint.x,textPoint.y,textPoint.z );
		line.add( lineLabel );

	}
















    // 改变相机
	signals.cameraChanged.add( function () {

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null && object !== scene && object !== camera ) {

			box.setFromObject( object );

			if ( box.isEmpty() === false ) {

				selectionBox.setFromObject( object );
				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		render();

	} );

	// 聚焦物体
	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	// 更改材质
	signals.geometryChanged.add( function ( object ) {

		if ( object !== undefined ) {

			selectionBox.setFromObject( object );

		}

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.push( child );

		} );

	} );

	// 改变物体
	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			selectionBox.setFromObject( object );

		}

		if ( object.isPerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		if ( editor.helpers[ object.id ] !== undefined ) {

			editor.helpers[ object.id ].update();

		}

		render();

	} );

	// 删除物体
	signals.objectRemoved.add( function ( object ) {

		if ( object === transformControls.object ) {

			transformControls.detach();

		}

		object.traverse( function ( child ) {

			objects.splice( objects.indexOf( child ), 1 );

		} );

	} );

	// 增加辅助线
	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );

	// 删除辅助线
	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	// fog

    // 改变背景色
	signals.sceneBackgroundChanged.add( function ( backgroundColor ) {

		scene.background.setHex( backgroundColor );

		render();

	} );

	var currentFogType = null;

    //改变雾化
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

		if ( scene.fog ) {

			if ( scene.fog.isFog ) {

				scene.fog.color.setHex( fogColor );
				scene.fog.near = fogNear;
				scene.fog.far = fogFar;

			} else if ( scene.fog.isFogExp2 ) {

				scene.fog.color.setHex( fogColor );
				scene.fog.density = fogDensity;

			}

		}

		render();

	} );

    // 视图的摄像机变化
	signals.viewportCameraChanged.add( function ( viewportCamera ) {

		camera = viewportCamera;

		camera.aspect = editor.camera.aspect;
		camera.projectionMatrix.copy( editor.camera.projectionMatrix );

		render();

	} );

	//

    // 窗口自适应宽高
	signals.windowResize.add( function () {

		// TODO: Move this out?

		editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		editor.DEFAULT_CAMERA.updateProjectionMatrix();

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

	// animations
    // 动画循环
	var prevTime = performance.now();

	function animate( time ) {

		requestAnimationFrame( animate );
		stats.update();
		var mixer = editor.mixer;

		if ( mixer.stats.actions.inUse > 0 ) {

			mixer.update( ( time - prevTime ) / 1000 );
			render();

		}

		prevTime = time;

	}

	requestAnimationFrame( animate );

	//

	function render() {

		scene.updateMatrixWorld();
		renderer.antialias = true;
		renderer.render( scene, camera );

		if ( renderer instanceof THREE.RaytracingRenderer === false ) {

			if ( camera === editor.camera ) {

				sceneHelpers.updateMatrixWorld();
				renderer.render( sceneHelpers, camera );

			}

		}

	}

	return container;

};
