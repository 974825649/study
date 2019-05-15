
function NewFnc (){
    myPlane = [];      //平面初始化
    this.mouse = [];    //鼠标位置
    this.movePoint = {};  //鼠标与平面交点
    this.sphereVertices = [];   //所有点击的点
    extShapeArr = [];      //所有形成的挤压物体
    nowExtShape = {};       //当前选中的挤压物体
    openExtrude = false;         //开启拉伸
    new2DPointArr = [];          //平面的点
    firstY = 0;
}
NewFnc.prototype.creatPlane = function (n1,n2) {
    if (arguments.length === 0){
        this.n1 = this.n2 = 20;
        console.log(this.n2);
    }else if(arguments.length === 1){
        this.n1 = this.n2 = n1;
    }else if(arguments.length ===2){
        this.n1 = n1;
        this.n2 = n2;
    }else {
        return false;
    }
    if (!myPlane.length) {
        var planeGeo = new THREE.PlaneGeometry(this.n1, this.n2, 10, 10);//创建平面
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
};

NewFnc.prototype.onMouseMove = function (e) {
    deleteLine();
    //获取鼠标点
    this.mouse = getMouse2DPosition(e);
    if(!openExtrude){                   //挤压模式未开启
        //求鼠标与平面交点
        var interset = getInterset(this.mouse, myPlane);
        if (interset) {
            this.movePoint = interset[0].point;  //求交点
            deletePoint();
            addPoint(this.movePoint);                         //添加鼠标点
            //顶点吸引交点
            if (this.sphereVertices.length > 0) {            //判断物体顶点是否存在
                searchVertices(this.movePoint, this.sphereVertices);
            }
            //创建线
            if (this.sphereVertices.length > 0) {
                drawLine(this.sphereVertices[this.sphereVertices.length - 1], this.movePoint, true);
            }
        } else {
            this.movePoint = {};
            deletePoint();
        }
    }else{                                 
        // 挤压模式已开启
        controls.enabled = false;   //关闭控制
        var depth = (this.mouse.y - firstY) * 50;                //根据当前屏幕坐标变化
        var shape = nowExtShape.geometry.parameters.shapes;     //获取目前几何体二维形状
        var extrudeSettings = {                                 //自定义拉伸
            steps: 2,
            depth: -1 * depth,
            bevelEnabled: true,
            bevelThickness: 0.001,
            bevelSize: 0.001,
            bevelSegments: 1
        };
        var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        nowExtShape.geometry = geometry;                         //替换新几何体
        console.log(nowExtShape);
    }
  
};

NewFnc.prototype.onMouseDown = function (e) {
    e.preventDefault();
    if (e.which === 1) {                //鼠标左键
        var interset = getInterset(this.mouse, extShapeArr);
        if (interset) {
            openExtrude = true;                  //开启挤压模式
            firstY = this.mouse.y;
            nowExtShape = interset[0].object;
            deleteLine();
            deleteSphere();
        }

        if(!openExtrude){              //不开启挤压模式
            if(JSON.stringify(this.movePoint) !== '{}'){  //判断是否有移动点
                addSphere(this.movePoint);                //添加小球
                this.sphereVertices.push(this.movePoint);
                var sv = this.sphereVertices;
                var svl = this.sphereVertices.length;
                if(svl > 1){
                    drawLine(sv[svl-2],sv[svl-1]);
                }
                if(this.sphereVertices.length > 1){
                    //生成自定义面
                    var startPoint = this.sphereVertices[0];
                    var endPoint = this.sphereVertices[this.sphereVertices.length -1];
                    if(startPoint.equals(endPoint)){       //判断起点终点相同
                        var sv = this.sphereVertices;
                        var svl = this.sphereVertices.length;
                        new2DPointArr = [];
                        for(var i = 0;i < svl;i ++){
                            var new2DPoint = new THREE.Vector2(sv[i].x,sv[i].z);
                            new2DPointArr.push(new2DPoint);
                        }
                        var extShape = creatExtrudeShape(new2DPointArr);         //创建挤压平面
                        extShapeArr.push(extShape);                         //获取所有挤压平面
                        this.sphereVertices = [];   //清空数组
                    }
                }
            }
        }
    }else if(e.which === 3){          //鼠标右键
        deleteSphere();
        this.sphereVertices = [];
        deleteLine(true);
    }else {
        return false;
    }
};

NewFnc.prototype.onMouseUp = function (e) {
    openExtrude = false;
    controls.enabled = true;         //开启控制
};






