    //坐标
    // 获取鼠标屏幕坐标
    function getMouse2DPosition(event) {
       var  mouse = new THREE.Vector2();
        // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        return mouse;
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
                newarr.push(pointArrI);
                nowPoint.set(newarr[0].x, newarr[0].y, newarr[0].z);
            }
        }
    }

    //获取动态变化大小
    function getChangeSize(sphereSize) {
        if(!sphereSize){
            sphereSize = 40;
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

    //球相关
    //添加球
    function addSphere(poi,color) {
        if(!color){
            color = 0x00ff00;
        }
        var newSize = getChangeSize();
        var geometry = new THREE.SphereGeometry(newSize / 5, 32, 32);
        var material = new THREE.MeshBasicMaterial({color: color});
        var sphere = new THREE.Mesh(geometry, material);
        sphere.userData = {'my': 'sphere'};
        sphere.position.set(poi.x, poi.y, poi.z);
        scene.add(sphere);
        return sphere;
    }

    //删除球
    function deleteSphere() {
        for (var i = 0; i < scene.children.length; i++) {
            if (scene.children[i].userData.my === 'sphere') {
                scene.remove(scene.children[i]);
                i--;
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
        var linegeometry = new THREE.Geometry(); //创建一个几何体
        var linematerial = new THREE.LineBasicMaterial({color: '#ff4545'});//定义线条的材质
        var color1 = new THREE.Color(0x444444), color2 = new THREE.Color(0xFF0000);//定义点颜色
        linegeometry.vertices.push(start);
        linegeometry.vertices.push(end);
        linegeometry.colors.push(color1, color2);  // 线的材质可以由2点的颜色决定
        var line = new THREE.Line(linegeometry, linematerial, THREE.LineSegments);//创建出一条线
        if(saveLine === true){                    //不保存
            line.userData = {'mySaveLine': '0'};
        }else{
            line.userData = {'mySaveLine': '1' };
        }
        scene.add(line);
    }
    //删除线
    function deleteLine(all) {
        if(!all){
            for (var i = 0; i < scene.children.length; i++) {
                if (scene.children[i].userData.mySaveLine === '0') {
                    // scene.children[i].remove(scene.children[i].children[0]);
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

    //创造挤压物体
    function creatExtrudeShape(new2DPointArr,depth){
        if(!depth){
            depth = 0.0001;
        }
        var shape = new THREE.Shape(new2DPointArr);     //自定义二维形状
        var extrudeSettings = {                         //自定义拉伸
            steps: 2,
            depth: -1 * depth,
            bevelEnabled: true,
            bevelThickness: 0.001,
            bevelSize: 0.001,
            bevelSegments: 1
        };
        var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        var material = new THREE.MeshPhongMaterial({ color:0xFF0000 });
        var mesh = new THREE.Mesh( geometry, material ) ;
        mesh.userData = {'my': 'extrudeShape'};
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.x = 0.5 * Math.PI;
        scene.add( mesh );
        return mesh;
    }






