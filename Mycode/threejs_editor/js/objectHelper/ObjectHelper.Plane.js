/**
 * @author codehuicn / https://github.com/codehuicn
 *
 * ### 模型辅助功能-平面模型辅助
 * * 1 实例化：
 * * `var planeHelper = new ObjectHelper.Plane();`
 *
 * #### 获取平面
 * 指定宽度和高度的平面
 * * 1 使用方式：
 * * `planeHelper.getPlane( optG, optM );`
 * * 2 参数：
 * * `optG` 几何体配置；`optM` 材质配置
 *    ```js
 *    optG = {
 *        width: 60,
 *        height: 60,
 *        widthSeg: 1,
 *        heightSeg: 1
 *    };
 *    optM = {
 *        color: 0x666666,
 *        transparent: true,
 *        opacity: .5,
 *        side: THREE.DoubleSide
 *    };
 *    ```
 * * 3 返回：
 * * 平面模型
 *
 * #### 获取形状的二维平面
 * 在 XZ 平面的三维点创建一个形状，生成平面，无法设置高度
 * * 1 使用方式：
 * * `planeHelper.getShape2( dots, optM );`
 * * 2 参数：
 * * `dots` 三维点数组；`optM` 材质配置
 *    ```js
 *    optM = {
 *        color: 0xffffff,
 *        side: THREE.DoubleSide
 *    };
 *    ```
 * * 3 返回：
 * * 平面模型
 *
 * #### 获取形状的三维平面
 * 在 XZ 平面的三维点创建一个形状，生成平面，可以设置高度
 * * 1 使用方式：
 * * `planeHelper.getShape3( dots, optG, optM );`
 * * 2 参数：
 * * `dots` 三维点数组；`optG` 几何体 `ExtrudeBufferGeometry` 的配置；`optM` 材质配置
 *    ```js
 *    optG = {
 *        steps: 1,
 *        depth: 1,
 *        bevelEnabled: false
 *    };
 *    optM = {
 *        color: 0xffffff,
 *        side: THREE.DoubleSide
 *    };
 *    ```
 * * 3 返回：
 * * 平面模型
 */

ObjectHelper.Plane = function () {

}

ObjectHelper.Plane.prototype.getPlane = function ( optG, optM ) {

    var optGeometry = {
        width: 60,
        height: 60,
        widthSeg: 1,
        heightSeg: 1
    },
    optMaterial = {
        color: 0x666666,
        transparent: true,
        opacity: .5,
        side: THREE.DoubleSide
    };
    if ( optG ) $.extend( optGeometry, optG );
    if ( optM ) $.extend( optMaterial, optM );

    var geometry = new THREE.PlaneBufferGeometry( optGeometry.width, optGeometry.height, optGeometry.widthSeg, optGeometry.heightSeg );
    var material = new THREE.MeshBasicMaterial( optMaterial );
    var mesh = new THREE.Mesh( geometry, material );

    return mesh;

}

ObjectHelper.Plane.prototype.getShape2 = function ( dots, optM ) {

    if ( dots.length < 3 ) return null;

    var opt = {
        color: 0xffffff,
        side: THREE.DoubleSide
    }
    if ( optM ) $.extend( opt, optM );

    var shape = new THREE.Shape();
    shape.moveTo( dots[ 0 ].x, dots[ 0 ].z );

    for ( var i = 1, l = dots.length; i < l; i++ ) {
        shape.lineTo( dots[ i ].x, dots[ i ].z );
    }

    var geometry = new THREE.ShapeBufferGeometry( shape );
    var material = new THREE.MeshBasicMaterial( opt );
    var mesh = new THREE.Mesh( geometry, material );

    var pos = mesh.position.clone();
    mesh.position.set( 0, 0, 0 );
    mesh.rotateX( Math.PI / 2 );
    mesh.position.set( pos.x, dots[ 0 ].y, pos.z );

    return mesh;

}

ObjectHelper.Plane.prototype.getShape3 = function ( dots, optG, optM ) {

    if ( dots.length < 3 ) return null;

    var opt1 = {
        steps: 1,
        depth: 1,
        bevelEnabled: false
    };
    if ( optG ) $.extend( opt1, optG );

    var opt2 = {
        color: 0xffffff,
        side: THREE.DoubleSide
    }
    if ( optM ) $.extend( opt2, optM );

    var shape = new THREE.Shape();
    shape.moveTo( dots[ 0 ].x, dots[ 0 ].z );

    for ( var i = 1, l = dots.length; i < l; i++ ) {
        shape.lineTo( dots[ i ].x, dots[ i ].z );
    }

    var geometry = new THREE.ExtrudeBufferGeometry( shape, opt1 );
    var material = new THREE.MeshBasicMaterial( opt2 );
    var mesh = new THREE.Mesh( geometry, material );

    var pos = mesh.position.clone();
    mesh.position.set( 0, 0, 0 );
    mesh.rotateX( Math.PI / 2 );
    mesh.position.set( pos.x, dots[ 0 ].y, pos.z );

    return mesh;

}
