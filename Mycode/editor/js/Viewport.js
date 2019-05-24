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
		onMovePosition.y = -(onMovePosition.y * 2 - 1);
		return onMovePosition;
	}

	//退出测量
	function exitDistance(event){
		if(event.keyCode === 27){
			console.log('exit');
			transformControls.enabled = true;
			controls.enabled = true;

			deleteLine(true);
			deleteSphere(true);
			deletePoint();
            render();

			window.removeEventListener( 'keydown', exitDistance, false );
			container.dom.removeEventListener("mousemove",onMouseMove, false);
			container.dom.removeEventListener('mousemove',showDistance,false);
			container.dom.removeEventListener('mousedown',controlsSphere,false);
		}
	}
    
	var movePoint = {},
        startPoint = {};

	//工具 测量距离
	signals.distanceMeasure.add(function () {
		console.log('start');
		window.addEventListener( 'keydown', exitDistance, false );
		container.dom.addEventListener( "mousemove", onMouseMove, false);

		transformControls.enabled = false;
		controls.enabled = false;

		//显示移动点
		container.dom.addEventListener('mousemove',showDistance,false);
		//添加球
        container.dom.addEventListener('mousedown',controlsSphere,false);

        createSpriteText();
        console.log('11');

	});
	

	//测距离
	function showDistance(event) {
	    deletePoint();
	    deleteLine();
		var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( onMovePosition, camera);
		// 计算物体和射线的焦点
		var intersects = raycaster.intersectObjects(scene.children, true);
		var key = 0; //每次只需要一个点;
		if ( intersects.length > 0) {
			for (var i = 0; i < intersects.length; i++) {
                //获取点击的对象
                var point = intersects[i].point;
                var face = intersects[i].face;
                var object = intersects[i].object;

                //只添加第一个点
                if (key) { break; }
                if (object instanceof THREE.Mesh && JSON.stringify(object.userData) === '{}') {
                    key++;

                    var facePoint = getFacePoint(object, face);  //获取相交面的数组
                    // 显示移动点
                    movePoint = new THREE.Vector3(point.x, point.y, point.z);
                    movePoint.set(movePoint.x.toFixed(2), movePoint.y.toFixed(2), movePoint.z.toFixed(2));

                    var nearPoint = searchVertices(movePoint, facePoint);  //寻找最近点
                    if(nearPoint){ movePoint = nearPoint; }
                    addPoint(movePoint);
                    render();

                    if (startPoint.length  && movePoint.length) {
                        drawLine(startPoint, movePoint);

                        // render();
                    }
                }
			}
		} else {          //没有交点
		    movePoint = {};
		    deletePoint();
		    deleteLine();
		}
		render();
	}

	//控制小球
    function controlsSphere(event) {
        event.preventDefault();
        if (event.which === 1 && movePoint.length) {      //判断是否能添加球
            if (!startPoint.length) {
                //设置原点
                startPoint = movePoint;
                addSphere(movePoint);
            } else {
                //保存线和球
                drawLine(startPoint, movePoint, true);
                addSphere(startPoint, true);
                addSphere(movePoint, true);  //保存2个端点的球
                startPoint = {};             //起点置空
            }
        } else {
            deleteLine();
            deleteSphere();
            startPoint = {};
        }
    }

    //获取鼠标3d坐标
    function getMouse3DPosition(mouse){
        var vector = new THREE.Vector3(mouse.x,mouse.y,0);
        vector.unproject(camera);
        return vector;
    }

    //移动点
    // 添加移动点
    function addPoint(poi,pointColor) {
        if(!pointColor){
            pointColor = 0xff0000;
        }
        var newSize = getChangeSize();
        var starsGeometry = new THREE.Geometry();
        starsGeometry.vertices.push(poi);
        var starsMaterial = new THREE.PointsMaterial({size: newSize, color: pointColor});
        var starField = new THREE.Points(starsGeometry, starsMaterial);
        starField.userData = {'my': 'point'};
        scene.add(starField);
        return starField;
    }

    // 删除移动点
    function deletePoint() {
        for(var i = 0;i < scene.children.length; i ++){
            // 删除鼠标移动点
            if(scene.children[i].userData.my === 'point'){   //
                // scene.children[i].remove(scene.children[i].geometry);
                scene.remove(scene.children[i]);
            }
        }
    }

    //寻找最近顶点
    function searchVertices(nowPoint, pointArr) {
        var newarr = [];
        var n = 0.5;
        var x = parseFloat(nowPoint.x);
        var y = parseFloat(nowPoint.y);
        var z = parseFloat(nowPoint.z);
        var pointArrLen = pointArr.length;

        for (var i = 0; i <pointArrLen; i++) {
            var pointArrI = pointArr[i];
            var pointArrX = parseFloat(pointArrI.x);
            var pointArrY = parseFloat(pointArrI.y);
            var pointArrZ = parseFloat(pointArrI.z);
            if (x + n > pointArrX && x - n < pointArrX &&
                y + n > pointArrY && y - n < pointArrY &&
                z + n > pointArrZ && z - n < pointArrZ) {
                newarr = pointArrI;
                return newarr;
            }
        }
    }

    //获取动态变化大小
    function getChangeSize(sphereSize) {
        if(!sphereSize){
            sphereSize = 20;
        }
        var d = camera.position.distanceTo( new THREE.Vector3( 0,0,0) );
        sphereSize =  d / sphereSize ;
        return sphereSize;
    }

    //求相交物
    function getInterset(mouse,obj,recursive) {
        if(!recursive){     //是否遍历后代
            recursive = false;
        }
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(obj,recursive);
        if(intersects.length>0){
            return intersects;
        }
    }

    //求相交面的点
    function getFacePoint(object, face) {
        this.face = face;
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
            facePoint.push(newVec1, newVec2, newVec3);
            return facePoint;
        }
    }

    //球相关
    //添加球
    function addSphere(point,saveSphere,color) {
        if(!color){
            color = 0x00ff00;
        }
        // var newSize = getChangeSize();
        var geometry = new THREE.SphereGeometry( 0.1, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: color});
        var sphere = new THREE.Mesh(geometry, material);
        if(saveSphere === true){                    //保存
            sphere.userData = {'mySaveSphere': '1'};
        }else{                                    //不保存
            sphere.userData = {'mySaveSphere': '0' };
        }
        sphere.position.set(point.x, point.y, point.z);
        scene.add(sphere);
        return sphere;
    }

    //删除球
    function deleteSphere(all) {
        if(!all){
            for (var i = 0; i < scene.children.length; i++) {
                if (scene.children[i].userData.mySaveSphere === '0') {
                    scene.remove(scene.children[i]);
                    i--;
                }
            }
        }else {
            for (var j = 0; j < scene.children.length; j++) {
                if (scene.children[j].userData.mySaveSphere === '1' ||
                    scene.children[j].userData.mySaveSphere === '0') {
                    scene.remove(scene.children[j]);
                    j--;
                }
            }
        }
    }

    //获取所有添加球信息
    function getMySphere() {
        var mySphere = [];
        for(var i = 0; i < scene.children.length; i++){
            if (scene.children[i].userData.my === 'sphere') {
                mySphere.push(scene.children[i]);
                scene.remove(scene.children[i]);
                i--;
            }
        }
        return mySphere;
    }

    //线相关
    //增加线
    function drawLine(start, end, saveLine) {
        var lineGeometry = new THREE.Geometry(); //创建一个几何体
        var lineMaterial = new THREE.LineBasicMaterial({linewidth: 2,vertexColors: true});//定义线条的材质
        var color1 = new THREE.Color(0x0000FF), color2 = new THREE.Color(0xFF0000);//定义点颜色
        lineGeometry.vertices.push(start);
        lineGeometry.vertices.push(end);
        lineGeometry.colors.push(color1, color2);  // 线的材质可以由2点的颜色决定
        var line = new THREE.Line(lineGeometry, lineMaterial);//创建出一条线
        if(saveLine === true){                    //保存
            line.userData = {'mySaveLine': '1'};
        }else{                                    //不保存
            line.userData = {'mySaveLine': '0' };
        }
        scene.add(line);
    }
    //删除线
    function deleteLine(all) {
        if(!all){
            for (var i = 0; i < scene.children.length; i++) {
                if (scene.children[i].userData.mySaveLine === '0') {
                    scene.remove(scene.children[i]);
                    i--;
                }
            }
        }else {
            for (var j = 0; j < scene.children.length; j++) {
                if (scene.children[j].userData.mySaveLine === '1' ||
                    scene.children[j].userData.mySaveLine === '0') {
                    scene.remove(scene.children[j]);
                    j--;
                }
            }
        }
    }

    //添加精灵
    function addSp(point,size){
        if(!size){
            size = 0.5;
        }
        var spriteMaterial = new THREE.SpriteMaterial( {  color: 0xf00fff } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(size,size,size);
        sprite.position.set(point.x, point.y, point.z);
        scene.add( sprite );
    }
    function createSpriteText(){
        //先用画布将文字画出
        var str = "0.00";
        var strSize = 10;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffff00";
        ctx.font = "Bold 100px Arial";
        ctx.lineWidth = 4;
        ctx.fillText(str,4,104);
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        //使用Sprite显示文字
        var material = new THREE.SpriteMaterial({map:texture,transparent:true});
        let textObj = new THREE.Sprite(material);
        textObj.scale.set(strSize);
        textObj.position.set(0,0,0);
        scene.add(textObj);
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
