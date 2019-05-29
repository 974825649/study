/**
 * @author codehuicn / https://github.com/codehuicn
 *
 * ### 模型辅助功能
 * * 1 实例化：
 * * `var objectHelper = new ObjectHelper();`
 *
 * #### 查找最近的模型
 * * 1 使用方式：
 * * `objectHelper.getMinObject( objNow, objAll, check );`
 * * 2 参数：
 * * `objNow` 模型；`objAll` 模型数组；`check` 检测函数，排除不需要判断的模型（传入移动模型和数组元素）
 * * `check` 函数：
 * * `function( objNow, objAll[i] ) { return true; }`
 * * 3 返回：
 * * `{objNow: objNow, objMin: objMin, distance: len, objNowDot: objNowDot, objMinDot: objMinDot}`
 *
 * #### 查找模型的端点
 * * 1 使用方式：
 * * `objectHelper.getObjDots( obj, refer );`
 * * 2 参数：
 * * `obj` 模型；`refer` 参考值 `{ axis: 'x', max: 3, min: 2 }` ，不传默认模型所有的点
 * * 3 返回：
 * * 空数组、包含 `Vector3` 点的数组
 *
 * #### 获取盒模型的端点
 * * 1 使用方式：
 * * `objectHelper.getBoxDots( obj );`
 * * 2 参数：
 * * `obj` 模型
 * * 3 返回：
 * * 数组（点 `min` 、底面三个点、上面三个点、点 `max` ）
 *
 * #### 创建一个小模型
 * * 1 使用方式：
 * * `objectHelper.getDotObj( opt );`
 * * 2 参数：
 * * `opt` 小模型的配置 `{color: 0xff0000, type: 'sphere'}`
 * * `type` 可选：
 * * `sphere box circle semicircle triangle square pentagon triangle2 pentagon2 circle2 triangle1 square1 pentagon1 circle1 triangle3 square3 pentagon3 circle3`
 * * 3 返回：
 * * 模型对象
 *
 * #### 缩放模型到合适的大小
 * * 1 使用方式：
 * * `objectHelper.scaleObjectsRelatively( objs, camera, scale );`
 * * 2 参数：
 * * `objs` 模型数组；`camera` 相机；`scale` 缩放数值
 * * 3 返回：
 * * 无
 *
 * #### 刷新模型的辅助线
 * * 1 使用方式：
 * * `objectHelper.refreshObjectHelper( obj, scene, sceneHelpers, textHelper );`
 * * 2 参数：
 * * `obj` 模型；`scene` 模型的场景；`sceneHelpers` 辅助模型的场景；`textHelper` 文本辅助功能
 * * `var textHelper = new ObjectHelper.Text();` 初始化的时候实例化，先加载字体文件
 * * 3 返回：
 * * 无
 *
 * #### 删除模型的辅助线
 * * 1 使用方式：
 * * `objectHelper.deleteObjectHelper( obj, sceneHelpers );`
 * * 2 参数：
 * * `obj` 模型；`sceneHelpers` 辅助模型的场景
 * * 3 返回：
 * * 无
 *
 * #### 清空模型的辅助线
 * * 1 使用方式：
 * * `objectHelper.clearObjectHelper( sceneHelpers );`
 * * 2 参数：
 * * `sceneHelpers` 辅助模型的场景
 * * 3 返回：
 * * 无
 */

var ObjectHelper = function () {

    this.objectIdTag = 'objectHelperOid';

}

ObjectHelper.prototype.getMinObject = function ( objNow, objAll, check ) {

    var box = new THREE.Box3(), objMin, objNowDot4 = [], objMinDot4 = [], objNowDot, objMinDot, len, len0;

    box.setFromObject( objNow );
    objNowDot4.push( box.min.clone() );
    objNowDot4.push( box.min.clone() );
    objNowDot4.push( box.min.clone() );
    objNowDot4.push( box.max.clone() );
    objNowDot4[1].setX( box.max.x );
    objNowDot4[2].setZ( box.max.z );
    objNowDot4[3].setY( box.min.y );

    for (var i = 0, il = objAll.length; i < il; i++) {

        if ( check(objNow, objAll[i]) ) {

            box.setFromObject( objAll[i] );
            objMinDot4 = [];
            objMinDot4.push( box.min.clone() );
            objMinDot4.push( box.min.clone() );
            objMinDot4.push( box.min.clone() );
            objMinDot4.push( box.max.clone() );
            objMinDot4[1].setX( box.max.x );
            objMinDot4[2].setZ( box.max.z );
            objMinDot4[3].setY( box.min.y );

            for (var j = 0; j < 4; j++) {
                for (var k = 0; k < 4; k++) {

                    len0 = objNowDot4[j].distanceTo( objMinDot4[k] );
                    if ( !len || len0 < len ) {

                        len = len0;
                        objNowDot = objNowDot4[j].clone();
                        objMinDot = objMinDot4[k].clone();
                        objMin = objAll[i];

                    }

                }
            }
        }

    }

    return {objNow: objNow, objMin: objMin, distance: len, objNowDot: objNowDot, objMinDot: objMinDot};

}

ObjectHelper.prototype.getObjDots = function ( obj, refer ) {

    var dots = [], dotAll, dotTemp;

    if ( obj.geometry.type === 'Geometry' ) {
        dotAll = obj.geometry.vertices;
        for (var i = 0, il = dotAll.length; i < il; i++) {
            dotTemp = dotAll[i].clone();
            obj.localToWorld( dotTemp );

            if ( !refer ) {
                dots.push( dotTemp );
            } else if ( dotTemp[refer.axis] <= refer.max && dotTemp[refer.axis] >= refer.min ) {
                dots.push( dotTemp );
            }
        }
    } else if ( obj.geometry.type === 'BufferGeometry' ) {
        dotAll = obj.geometry.attributes.position;
        dotTemp = new THREE.Vector3();
        for (var i = 0, il = dotAll.count * 3; i < il; i+=3) {
            dotTemp.set(dotAll.array[i], dotAll.array[i+1], dotAll.array[i+2]);
            obj.localToWorld( dotTemp );

            if ( !refer ) {
                dots.push( dotTemp.clone() );
            } else if ( dotTemp[refer.axis] <= refer.max && dotTemp[refer.axis] >= refer.min ) {
                dots.push( dotTemp.clone() );
            }
        }
    }

    return dots;

}

ObjectHelper.prototype.getBoxDots = function ( obj ) {

    var box = THREE.Box3();
    box.setFromObject( obj );

    var arr = [], min = box.min.clone(), max = box.max.clone();
    arr.push( min );
    arr.push( min.clone().setX( max.x ) );
    arr.push( min.clone().setZ( max.z ) );
    arr.push( max.clone().setY( min.y ) );

    arr.push( min.clone().setY( max.y ) );
    arr.push( max.clone().setZ( min.z ) );
    arr.push( max.clone().setX( min.x ) );
    arr.push( max );

    return arr;

}

ObjectHelper.prototype.getDotObj = function ( opt ) {

    var option = {color: 0xff0000, type: 'sphere'};
    $.extend(option, opt);

    var geometry, material, obj;

    if ( option.type === 'sphere' || option.type === 1 ) {                 // 球体
        geometry = new THREE.SphereBufferGeometry( 1, 10, 10 );
    } else if ( option.type === 'box' || option.type === 2 ) {             // 正方体
        geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );

    } else if ( option.type === 'circle' || option.type === 3 ) {          // 圆形
        geometry = new THREE.CircleBufferGeometry( 1, 16, 0, Math.PI * 2 );
    } else if ( option.type === 'semicircle' || option.type === 4) {       // 半圆
        geometry = new THREE.CircleBufferGeometry( 1, 8, 0, Math.PI );
    } else if ( option.type === 'triangle' || option.type === 5 ) {        // 三角形
        geometry = new THREE.CircleBufferGeometry( 1, 3, 0, Math.PI * 2 );
    } else if ( option.type === 'square' || option.type === 6 ) {          // 正方形
        geometry = new THREE.CircleBufferGeometry( 1, 4, 0, Math.PI * 2 );
    } else if ( option.type === 'pentagon' || option.type === 7 ) {        // 五边形
        geometry = new THREE.CircleBufferGeometry( 1, 5, 0, Math.PI * 2 );

    } else if ( option.type === 'triangle2' || option.type === 8 ) {       // 拉伸的三角形
        geometry = new THREE.CylinderBufferGeometry( 1, 1, 1, 3 );
    } else if ( option.type === 'pentagon2' || option.type === 9 ) {       // 拉伸的五边形
        geometry = new THREE.CylinderBufferGeometry( 1, 1, 1, 5 );
    } else if ( option.type === 'circle2' || option.type === 10 ) {        // 拉伸的圆形
        geometry = new THREE.CylinderBufferGeometry( 1, 1, 1, 16 );

    } else if ( option.type === 'triangle1' || option.type === 11 ) {      // 空心的三角形
        geometry = new THREE.RingBufferGeometry( 1, 1.3, 3, 1 );
    } else if ( option.type === 'square1' || option.type === 12 ) {        // 空心的四边形
        geometry = new THREE.RingBufferGeometry( 1, 1.3, 4, 1 );
    } else if ( option.type === 'pentagon1' || option.type === 13 ) {      // 空心的五边形
        geometry = new THREE.RingBufferGeometry( 1, 1.3, 5, 1 );
    } else if ( option.type === 'circle1' || option.type === 14 ) {        // 空心的圆
        geometry = new THREE.RingBufferGeometry( 1, 1.3, 16, 1 );

    } else if ( option.type === 'triangle3' || option.type === 15 ) {      // 管状三角形
        geometry = new THREE.TorusBufferGeometry( 1, 0.3, 8, 3 );
    } else if ( option.type === 'square3' || option.type === 16 ) {        // 管状四边形
        geometry = new THREE.TorusBufferGeometry( 1, 0.3, 8, 4 );
    } else if ( option.type === 'pentagon3' || option.type === 17 ) {      // 管状五边形
        geometry = new THREE.TorusBufferGeometry( 1, 0.3, 8, 5 );
    } else if ( option.type === 'circle3' || option.type === 18 ) {        // 管状圆
        geometry = new THREE.TorusBufferGeometry( 1, 0.3, 8, 16 );
    }

    material = new THREE.MeshBasicMaterial( {color: option.color} );
    obj = new THREE.Mesh( geometry, material );

    return obj;

}

ObjectHelper.prototype.scaleObjectsRelatively = function ( objs, camera, scale ) {

    var distance, scaleNew;
    for ( var i = 0, il = objs.length; i < il; i++ ) {

        distance = objs[ i ].position.distanceTo( camera.position );
        scaleNew = distance / 200 * scale;
        objs[ i ].scale.set( scaleNew, scaleNew, scaleNew );

    }

}

ObjectHelper.prototype.refreshObjectHelper = function ( obj, scene, sceneHelpers, textHelper ) {

    var minObjData = this.getMinObject( obj, scene.children, function ( obj1, obj2 ) {

        return obj1.id !== obj2.id && obj2.visible;

    } );

    this.deleteObjectHelper( obj, sceneHelpers );

    if ( minObjData.objMin ) {

        var lineHelper = new ObjectHelper.Line();
        var dashedLine = lineHelper.getDashedLine( [ minObjData.objNowDot, minObjData.objMinDot ], { color: 0xff0000 } );
        dashedLine.userData[ this.objectIdTag ] = obj.id;

        var refer = {
            getLine: lineHelper.getLine.bind( lineHelper ),
            getTextObject: textHelper.getTextObject.bind( textHelper )
        };

        var textObj = textHelper.getLineLengthObj(
            [ minObjData.objNowDot, minObjData.objMinDot ],
            {},
            refer
        );
        textObj.userData[ this.objectIdTag ] = obj.id;
        sceneHelpers.add( textObj );

        sceneHelpers.add( dashedLine );

    }

}

ObjectHelper.prototype.deleteObjectHelper = function ( obj, sceneHelpers ) {

    var objHelper;
    for ( var i = 0, l = sceneHelpers.children.length; i < l; i++ ) {

        objHelper = sceneHelpers.children[i];

        if (
            objHelper.userData[ this.objectIdTag ] &&
            ( objHelper.userData[ this.objectIdTag ] === obj.id )
        ) {
            sceneHelpers.remove( objHelper );
            i--;
            l--;
        }

    }

}

ObjectHelper.prototype.clearObjectHelper = function ( sceneHelpers ) {

    var objHelper;
    for ( var i = 0, l = sceneHelpers.children.length; i < l; i++ ) {

        objHelper = sceneHelpers.children[i];

        if ( objHelper.userData[ this.objectIdTag ] ) {
            sceneHelpers.remove( objHelper );
            i--;
            l--;
        }

    }

}