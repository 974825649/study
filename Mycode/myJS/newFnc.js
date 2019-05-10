
function NewFnc (){
    myPlane = [];      //平面初始化
    this.mouse = [];    //鼠标位置
    this.movePoint = [];  //鼠标与平面交点
}
NewFnc.prototype.createBox = function (e) {
    //获取鼠标点
    var mouse = this.mouse;
    mouse = getMouse2DPosition(e);
    //创建平面
    creatPlane();
    //求鼠标与平面交点
    this.movePoint = getIntersetPoint(mouse,myPlane);   //求交点
    if( this.movePoint){
        deletPoint();
        addPoint(this.movePoint);                         //添加鼠标点
        
        //单击时添加球
        //顶点吸引交点
        if (sphereVertices.length > 0){            //判断物体顶点是否存在
            serchVertices( this.movePoint,sphereVertices);
        }
        
        //生成自定义面
        var startPoint = sphereVertices[0];
        var endPoint = sphereVertices[sphereVertices.length -1];
        if(sphereVertices.length > 1){
            if(startPoint.equals(endPoint)){
                var sv = sphereVertices;
                var svl = sphereVertices.length;
                console.log(sv);
                //
                var sv2 = sv.slice(0);
                //
                sv[2] =1;
                console.log(sv2);

            }
        }

    }else{
        deletPoint();
    }
    


}

//创建平面
function creatPlane() {
    if (!myPlane.length) {
        var planeGeo = new THREE.PlaneGeometry(20, 20, 10, 10);//创建平面
        var planeMat = new THREE.MeshLambertMaterial({  //创建材料
            color: 0xFFFFFF,
            wireframe: false
        });
        var planeMesh = new THREE.Mesh(planeGeo, planeMat);//创建网格模型
        planeMesh.position.set(0, 0, 0);//设置平面的坐标
        planeMesh.rotation.x = -0.5 * Math.PI;//将平面绕X轴逆时针旋转90度
        planeMesh.castShadow = true;
        planeMesh.receiveShadow = true;//允许接收阴影
        // planeMesh.visible = false;
        scene.add(planeMesh);//将平面添加到场景中
        myPlane.push(planeMesh);
    }
}


