
    // 获取鼠标屏幕坐标
    function getMouse2DPosition(event) {
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //通过摄像机和鼠标位置更新射线
        raycaster.setFromCamera(mouse, camera);
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
        var pointColor = 0xff0000;
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

    //获取动态变化大小
    function getChangeSize() {
        var sphereSize = 40;
        var d = camera.position.distanceTo( new THREE.Vector3( 0,0,0) );
        sphereSize =  d / sphereSize ;
        return sphereSize;
    }

    //求交点
    function getIntersetPoint(mouse,obj) {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(obj,true);
        if(intersects.length>0){
            return intersects[0].point;
        }
    }

    //添加球
    function addSphere(event, newFnc) {
        event.preventDefault();
        //console.log(newFnc);  会输出undefined
        var movePoint = newFnc.movePoint;
        if(movePoint){
            // 判断是否测量
            if (event.which === 1) {
                // 添加球
                var newSize = getChangeSize();
                var geometry = new THREE.SphereGeometry(newSize / 5, 32, 32);
                var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
                var sphere = new THREE.Mesh(geometry, material);
                sphere.userData = {'my': 'sphere'};
                sphere.position.set(movePoint.x, movePoint.y, movePoint.z);
                scene.add(sphere);
                sphereVertices.push(sphere.position);
            } else if (event.which === 3) {
                deletSphere();
            }
        }
    }

    //删除球
    function deletSphere() {
        for (var i = 0; i < scene.children.length; i++) {
            if (scene.children[i].userData.my === 'sphere') {
                scene.remove(scene.children[i]);
                i--;
            }
        }
        sphereVertices = [];
    }

    //小球寻找最近顶点
    function serchVertices(nowPoint, pointArr) {
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
                newarr.push(pointArrI);
                nowPoint.set(newarr[0].x, newarr[0].y, newarr[0].z);
            }
        }
    }



