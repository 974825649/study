/**
 * @author codehuicn / https://github.com/codehuicn
 *
 * ### 模型辅助功能-点模型辅助
 * * 1 实例化：
 * * `var dotHelper = new ObjectHelper.Dot();`
 *
 * #### 计算点集的距离
 * * 1 使用方式：
 * * `dotHelper.getDotsDistance( dots1, dots2 );`
 * * 2 参数：
 * * `dots1` 点集；`dots2` 点集；需要调用到 `getCloseDot`
 * * 3 返回：
 * * `{index1: data.from, index2: data.to, distance: data.distance}` 点集中的索引，点集的最小距离
 * * `null`
 *
 * #### 获取最近的点
 * * 1 使用方式：
 * * `dotHelper.getCloseDot( dot, dots );`
 * * 2 参数：
 * * `dot` 点；`dots` 点集
 * * 3 返回：
 * * `{dotMin: dotMin, index: index, distance: distance}` 最近的点，点索引，距离
 * * `null`
 *
 * #### 两点距离延长功能
 * * 1 使用方式：
 * * `dotHelper.getLongerDots( dot1, dot2, len1, len2 );`
 * * 2 参数：
 * * `dot1` 点；`dot2` 点；`len1` 新的点1距离点2；`len2` 距离
 * * 3 返回：
 * * `{dot1: dot11, dot2: dot22}` 新点1，新点2
 *
 * #### 获取临近的点
 * * 1 使用方式：
 * * `dotHelper.getNearDot( dots, index2, near );`
 * * 2 参数：
 * * `dots` 点集；`index2` 点索引，查找前后两点；`near` 点距离控制
 * * 3 返回：
 * * `[index1, index2, index3]` 点的索引，按照顺序的三个点，起点和终点可能重合，中点是传入的点
 */

ObjectHelper.Dot = function () {

}

ObjectHelper.Dot.prototype.getDotsDistance = function ( dots1, dots2 ) {

    var distances = [], data;
    for (var i = 0, il = dots1.length; i < il; i++) {

        data = this.getCloseDot( dots1[i], dots2 );
        if ( data ) {
            data.from = i;
            data.to = data.index;
            distances.push( data );
        }

    }
    for (var i = 0, il = distances.length; i < il; i++) {

        if ( i === 0 ) {
            data = distances[i];
        } else if ( data.distance > distances[i].distance ) {
            data = distances[i];
        }

    }

    if ( data ) {
        return {index1: data.from, index2: data.to, distance: data.distance};
    } else {
        return null;
    }

}

ObjectHelper.Dot.prototype.getCloseDot = function ( dot, dots ) {

    if (dots.length > 0) {

        var dotMin = dots[0].clone(), index = 0, distance = dotMin.distanceTo(dot), tempDistance;

        for (var i = 1, il = dots.length; i < il; i++) {

            tempDistance = dots[i].distanceTo(dot);
            if ( tempDistance < distance ) {
                dotMin = dots[i].clone();
                index = i;
                distance = tempDistance;
            }

        }

        return {dotMin: dotMin, index: index, distance: distance};

    }

    return null;

}

ObjectHelper.Dot.prototype.getLongerDots = function ( dot1, dot2, len1, len2 ) {

    var dir, dot11, dot22;
    dot11 = dot1.clone();
    dot22 = dot2.clone();

    if ( len1 > 0 ) {

        dir = dot1.clone();
        dir.sub( dot2 );
        dir.setLength( len1 );
        dot11 = dot2.clone();
        dot11.add( dir );

    }

    if ( len2 > 0 ) {

        dir = dot2.clone();
        dir.sub( dot1 );
        dir.setLength( len2 );
        dot22 = dot1.clone();
        dot22.add( dir );

    }

    return {dot1: dot11, dot2: dot22};

}

ObjectHelper.Dot.prototype.getNearDot = function ( dots, index2, near ) {

    var index1, index3, length2;

    index1 = index2 - 1;
    index3 = index2 + 1;
    length2 = dots.length;

    if ( length2 < 3 || index2 < 0 || index2 > length2 - 1 ) return null;
    if (index1 < 0) index1 = length2 - 1;
    if (index3 > length2 - 1) index3 = 0;

    while (index1 !== index2 && dots[index2].distanceTo( dots[index1] ) < near) {
        index1 = index1 - 1;
        if (index1 < 0) index1 = length2 - 1;
    }

    while (index3 !== index2 && dots[index2].distanceTo( dots[index3] ) < near) {
        index3 = index3 + 1;
        if (index3 > length2 - 1) index3 = 0;
    }

    return [index1, index2, index3];

}