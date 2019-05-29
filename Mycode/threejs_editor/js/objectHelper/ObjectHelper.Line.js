/**
 * @author codehuicn / https://github.com/codehuicn
 *
 * ### 模型辅助功能-线模型辅助
 * * 1 实例化：
 * * `var lineHelper = new ObjectHelper.Line();`
 *
 * #### 获取实线
 * * 1 使用方式：
 * * `lineHelper.getLine( points, opt );`
 * * 2 参数：
 * * `points` 点集；`opt` 配置
 *    ```js
 *    opt = {
 *        color: 0xffffff,
 *        linewidth: 1,
 *        linecap: 'round',
 *        linejoin: 'round'
 *    };
 *    ```
 * * 3 返回：
 * * 线模型
 *
 * #### 获取虚线
 * * 1 使用方式：
 * * `lineHelper.getDashedLine( points, opt );`
 * * 2 参数：
 * * `points` 点集；`opt` 配置
 *    ```js
 *    opt = {
 *        color: 0xffffff,
 *        linewidth: 1,
 *        scale: 1,
 *        dashSize: 1,
 *        gapSize: 1,
 *    };
 *    ```
 * * 3 返回：
 * * 线模型
 *
 * #### 获取两条线的交点
 * * 1 使用方式：
 * * `lineHelper.getPublicDot( line1Dot, line1Direction, line2Dot, line2Direction );`
 * * 2 参数：
 * * `line1Dot` 线段1的点；`line1Direction` 线段1的方向；`line2Dot` 线段2的点；`line2Direction` 线段2的方向
 * * 3 返回：
 * * 点模型、 `null`
 *
 * #### 获取最近的线段
 * * 1 使用方式：
 * * `lineHelper.getCloseLine( dot, lines, refer );`
 * * 2 参数：
 * * `dot` 点；`lines` 线段数组；`refer` 要调用的函数 `getObjDots` `getPublicDot`
 *    ```js
 *    var refer = {};
 *    var objectHelper = new ObjectHelper();
 *    refer.getObjDots = objectHelper.getObjDots.bind( objectHelper );
 *    refer.getPublicDot = lineHelper.getPublicDot;
 *    ```
 * * 3 返回：
 * * `{ dot: dotMin, line: lineMin }` 投影到线段上的点，最近的线段
 * * `null`
 */

ObjectHelper.Line = function () {

}

ObjectHelper.Line.prototype.getLine = function ( points, opt ) {

    if ( !points || points.length < 2 ) return null;

    var lineOpt = {
        color: 0xffffff,
        linewidth: 1,
        linecap: 'round',
        linejoin: 'round'
    };
    if ( opt ) $.extend( lineOpt, opt );

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial( lineOpt );

    geometry.setFromPoints( points );

    var line = new THREE.Line(geometry, material);
    return line;

}

ObjectHelper.Line.prototype.getDashedLine = function ( points, opt ) {

    if ( !points || points.length < 2 ) return null;

    var lineOpt = {
        color: 0xffffff,
        linewidth: 1,
        scale: 1,
        dashSize: 1,
        gapSize: 1,
    };
    if ( opt ) $.extend( lineOpt, opt );

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineDashedMaterial( lineOpt );

    var dots = [];
    for (var i = 0, il = points.length; i < il; i++) {

        dots.push( points[i] );
        if ( i > 0 && i < il-1) dots.push( points[i] );

    }
    geometry.setFromPoints( dots );

    var line = new THREE.LineSegments(geometry, material);
    line.computeLineDistances();

    return line;

}

ObjectHelper.Line.prototype.getPublicDot = function ( line1Dot, line1Direction, line2Dot, line2Direction ) {

    var dotPublic = new THREE.Vector3('x', 'y', 'z');

    function run () {
        var ray = new THREE.Ray( line1Dot, line1Direction );
        var line2DotPro = line2Dot.clone();
        var line2Vertical = line2Direction.clone();
        line2Vertical.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2);
        line2DotPro.projectOnVector(line2Vertical);
        var line2Pos = (line2DotPro.x * line2Vertical.x > 0 ? -1 : 1) * line2DotPro.distanceTo(new THREE.Vector3(0, 0, 0));
        var plane2 = new THREE.Plane( line2Vertical, line2Pos );
        ray.intersectPlane( plane2, dotPublic );
    }
    run();

    if ( dotPublic.x !== 'x' ) {
        return dotPublic;
    } else {

        line1Direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        run();
        line1Direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

        if ( dotPublic.x !== 'x' ) {
            return dotPublic;
        } else {
            console.log('无法获取交点：', dotPublic);
            return null;
        }

    }

}

ObjectHelper.Line.prototype.getCloseLine = function ( dot, lines, refer ) {

    var lineDirection, lineVertical, lenMin, lineMin, dotPro, dotMin,
        dotProDir1, dotProDir2, check = false, dots, axisY = new THREE.Vector3(0, 1, 0);

    for (var i = 0, il = lines.length; i < il; i++) {

        dots = refer.getObjDots( lines[i] );

        for (var j = 0, jl = dots.length; j < jl-1; j++) {

            lineDirection = dots[j+1].clone();
            lineDirection = lineDirection.sub(dots[j]);
            lineVertical = lineDirection.clone();
            lineVertical.applyAxisAngle(axisY, Math.PI/2);
            lineDirection.normalize();
            lineVertical.normalize();

            dotPro = dot.clone();
            dotPro.projectOnPlane(lineVertical);
            dotPro.sub(dot);
            dotPro = refer.getPublicDot(dot, dotPro, dots[j], lineDirection);
            if (!dotPro) return null;

            dotProDir1 = dotPro.clone();
            dotProDir2 = dotPro.clone();
            dotProDir1.sub(dots[j]);
            dotProDir2.sub(dots[j+1]);
            dotProDir1.normalize();
            dotProDir2.normalize();
            check = dotProDir1.dot(dotProDir2);

            if ( ( !lenMin || lenMin > dotPro.distanceTo(dot) ) && (check.toFixed(4) === '-1.0000') ) {
                lenMin = dotPro.distanceTo(dot);
                lineMin = lines[i];
                dotMin = dotPro.clone();
            }

        }

    }

    if (lenMin) {
        return {
            dot: dotMin,
            line: lineMin
        };
    } else {
        return null;
    }

}