
function NewFnc (){
    myPlane = [];      //平面初始化
    this.mouse = [];    //鼠标位置
    this.movePoint = {};  //鼠标与平面交点
    this.sphereVertices = [];   //所有点击的点
}
NewFnc.prototype.creatPlane = function () {
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
};

NewFnc.prototype.onMouseMove = function (e) {
    deleteLine();
    //获取鼠标点
    this.mouse = getMouse2DPosition(e);
    //求鼠标与平面交点
    var interset = getInterset(this.mouse,myPlane);
    if( interset){
        this.movePoint = interset[0].point;  //求交点
        deletePoint();
        addPoint(this.movePoint);                         //添加鼠标点
        //顶点吸引交点
        if (this.sphereVertices.length > 0){            //判断物体顶点是否存在
            searchVertices( this.movePoint,this.sphereVertices);
        }
        //创建线
        if(this.sphereVertices.length > 0){
            drawLine(this.sphereVertices[this.sphereVertices.length - 1],this.movePoint,true);
        }
    }else{
        this.movePoint = {};
        deletePoint();
    }
};

NewFnc.prototype.onMouseDown = function (e) {
    e.preventDefault();
    if(e.which === 1){                //鼠标左键
        if(JSON.stringify(this.movePoint) !== '{}'){  //判断是否有移动点
            addSphere(this.movePoint);
            this.sphereVertices.push(this.movePoint);
            console.log(this.sphereVertices);
            var sv = this.sphereVertices;
            var svl = this.sphereVertices.length;
            if(svl > 1){
                drawLine(sv[svl-2],sv[svl-1]);
            }
            if(this.sphereVertices.length > 1){
                //生成自定义面
                var startPoint = this.sphereVertices[0];
                var endPoint = this.sphereVertices[this.sphereVertices.length -1];
                if(startPoint.equals(endPoint)){
                    var sv = this.sphereVertices;
                    var svl = this.sphereVertices.length;
                    var new2DPointArr = [];
                    for(var i = 0;i < svl;i ++){
                        var new2DPoint = new THREE.Vector2(sv[i].x,sv[i].z);
                        new2DPointArr.push(new2DPoint);
                    }
                    var n = 8;
                    extrudeShape(new2DPointArr,n);    //拉伸图形
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





