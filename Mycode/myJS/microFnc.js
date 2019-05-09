
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

    function a() {
        console.log(123);
    }
    
    function b() {
        console.log(456);
    }




