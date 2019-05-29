/**
 * @author codehuicn / https://github.com/codehuicn
 *
 * ### 模型辅助功能-文本模型辅助
 * * 1 实例化：
 * * `var textHelper = new ObjectHelper.Text();`
 * 默认加载一个字体文件 `this.helvetiker_regular` ，字体文件都是公用的
 *
 * #### 加载字体文件
 * * 1 使用方式：
 * * `textHelper.loadFont( data );`
 * 异步加载
 * * 2 参数：
 * * `data` 字体文件的路径和保存的值 `textHelper.helvetiker_regular`
 *    ```js
 *    this.helvetiker_regular = {
 *        path: 'common/fonts/helvetiker_regular.typeface.json',
 *        font: null
 *    };
 *    // 默认加载这个字体，其它字体可选项：
 *    // gentilis_bold gentilis_regular helvetiker_bold optimer_bold optimer_regular
 *    // 可以自定义其它字体
 *    ObjectHelper.Text.prototype.my_font_bold = { path: 'path/to/json', font: null };
 *    ```
 * * 3 返回：
 * * 异步加载完成后传给字体对象的字体文件属性 `{ path: 'path/to/json', font: font }`
 *
 * #### 创建字符模型
 * * 1 使用方式：
 * * `textHelper.getTextObject( text, opt );`
 * 不支持中文
 * * 2 参数：
 * * `text` 字符串；`opt` 配置
 *    ```js
 *   opt = {
 *        font: this.helvetiker_regular.font,
 *        size: 44,
 *        height: 6,
 *        curveSegments: 12,
 *        color: 0x666666,
 *        bevelEnabled: false,  // 禁用了斜面
 *  	  bevelThickness: 4,
 *  	  bevelSize: 4,
 *  	  bevelSegments: 8,
 *    };
 *    ```
 * * 3 返回：
 * * 字符模型
 *
 * #### 创建文字精灵
 * * 1 使用方式：
 * * `textHelper.getTextCanvas( text, opt );`
 * 支持中文，精灵模型始终面向用户
 * * 2 参数：
 * * `text` 字符串；`opt` 配置
 *    ```js
 *   opt = {
 *        fontFamily: 'Microsoft Yahei',
 *        fontSize: 40,
 *        fontWeight: 'normal',
 *        lineHeight: 1.4,  // g 字符的空间
 *        color: '#000000',
 *        borderWidth: 4,
 *        borderRadius: 6,
 *        borderColor: 'transparent',
 *        backgroundColor: 'transparent',
 *    };
 *    ```
 * * 3 返回：
 * * 文字精灵
 *
 * #### 获取距离标注
 * * 1 使用方式：
 * * `textHelper.getLineLengthObj( dots, opt, refer );`
 * 不支持中文
 * * 2 参数：
 * * `dots` 点实例2个；`opt` 配置；`refer` 函数引用（ `getLine` 获取实线；`getTextObject` 获取数字）
 *    ```js
 *    opt = {
 *        color: 0x999999,
 *        lineVLen: 3,
 *        lineVInterval: 1,
 *        unit: 'm',
 *        textSize: 2, textHeight: 0.1, textColor: 0x333333,
 *    };
 *    var refer = {};
 *    var lineHelper = new ObjectHelper.Line();
 *    refer.getLine = lineHelper.getLine.bind( lineHelper );
 *    refer.getTextObject = textHelper.getTextObject;
 *    ```
 * * 3 返回：
 * * 标注模型
 */

ObjectHelper.Text = function () {

    if ( !this.helvetiker_regular.font )
    this.loadFont( this.helvetiker_regular );

}

ObjectHelper.Text.prototype.gentilis_bold = {
    path: 'common/fonts/gentilis_bold.typeface.json',
    font: null
}

ObjectHelper.Text.prototype.gentilis_regular = {
    path: 'common/fonts/gentilis_regular.typeface.json',
    font: null
}

// 默认用这个
ObjectHelper.Text.prototype.helvetiker_regular = {
    path: 'common/fonts/helvetiker_regular.typeface.json',
    font: null
}

ObjectHelper.Text.prototype.helvetiker_bold = {
    path: 'common/fonts/helvetiker_bold.typeface.json',
    font: null
}

ObjectHelper.Text.prototype.optimer_bold = {
    path: 'common/fonts/optimer_bold.typeface.json',
    font: null
}

ObjectHelper.Text.prototype.optimer_regular = {
    path: 'common/fonts/optimer_regular.typeface.json',
    font: null
}

ObjectHelper.Text.prototype.loadFont = function ( data ) {

    var loader = new THREE.FontLoader();

    loader.load( data.path, function ( font ) {

        data.font = font;

    } );

}

ObjectHelper.Text.prototype.getTextObject = function ( text, opt ) {

    var option, geometry, material, obj;

    option = {
        font: this.helvetiker_regular.font,
        size: 44,
        height: 6,
        curveSegments: 12,
        color: 0x666666,

        bevelEnabled: false,  // 禁用了斜面
		bevelThickness: 4,
		bevelSize: 4,
		bevelSegments: 8,
    };

    $.extend( option, opt );

    geometry = new THREE.TextBufferGeometry( text, option );
    material = new THREE.MeshPhongMaterial( {color: option.color} );
    obj = new THREE.Mesh( geometry, material );

    return obj;

}

ObjectHelper.Text.prototype.getTextCanvas = function ( text, opt ) {

    var option = {
        fontFamily: 'Microsoft Yahei',
        fontSize: 40,
        fontWeight: 'normal',
        lineHeight: 1.4,  // g 字符的空间
        color: '#000000',

        borderWidth: 4,
        borderRadius: 6,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    }, canvas, context, textWidth, texture, materialObj, spriteObj;

    $.extend( option, opt );

    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    context.font = option.fontWeight + ' ' + option.fontSize + 'px ' + option.fontFamily;
    textWidth = context.measureText( text ).width;

    context.fillStyle  = option.backgroundColor;
    context.strokeStyle = option.borderColor;
    context.lineWidth = option.borderWidth;
    setBackground(context, option.borderWidth * 0.5, option.borderWidth * 0.5, textWidth + option.borderWidth,
        option.fontSize * option.lineHeight + option.borderWidth, option.borderRadius);

    context.fillStyle = option.color;
    context.fillText(text, option.borderWidth, option.fontSize + option.borderWidth);

    texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    materialObj = new THREE.SpriteMaterial({
        map: texture, color: 0xffffff
    });
    spriteObj = new THREE.Sprite( materialObj );
    spriteObj.scale.set(30, 20, 20);

    function setBackground(ctx, x, y, w, h, r) {

        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r);
        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h);
        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

    }

    return spriteObj;

}

ObjectHelper.Text.prototype.getLineLengthObj = function ( dots, opt, refer ) {

    if ( !dots || dots.length < 2 ) return null;

    var option = {

        color: 0x666666,
        lineVLen: 3,
        lineVInterval: 1,
        unit: 'm',
        textSize: 2, textHeight: 0.1, textColor: 0x333333,

    }, dot1, dot2, directionLine, directionLineV, group, lineV, lineV2,
    lineVDot1, lineVDot2, lineLen, lineLenStr, lineLenAngle, axisY, box, textLen;

    $.extend(option, opt);

    group = new THREE.Group();
    axisY = new THREE.Vector3(0, 1, 0);
    box = new THREE.Box3();
    dot1 = dots[0].clone();
    dot2 = dots[1].clone();
    lineLen = dot2.distanceTo(dot1);
    directionLine = dot2.clone();
    directionLine.sub(dot1);
    directionLineV = directionLine.clone();
    directionLineV.applyAxisAngle(axisY, Math.PI/2);
    directionLine.normalize();
    lineLenAngle = directionLine.dot( new THREE.Vector3(1, 0, 0) );
    lineLenAngle = (dot2.z > dot1.z ? -1 : 1) * Math.acos(lineLenAngle);

    lineVDot1 = dot1.clone();
    directionLineV.setLength( option.lineVInterval );
    lineVDot1.add(directionLineV);
    directionLineV.setLength( option.lineVLen );
    lineVDot2 = lineVDot1.clone();
    lineVDot2.add(directionLineV);
    lineV = refer.getLine( [lineVDot1, lineVDot2], {color: option.color} );  // 获取实线
    lineV2 = lineV.clone();
    directionLine.setLength( lineLen );
    lineV2.position.add(directionLine);
    group.add(lineV);
    group.add(lineV2);

    lineLen = lineLen.toFixed(4);

    switch ( option.unit ) {

        case 'cm': lineLenStr = (lineLen * 100).toFixed(2) + ' cm'; break;
        case 'mm': lineLenStr = (lineLen * 1000).toFixed(1) + ' mm'; break;
        default: lineLenStr = lineLen + ' m';

    }

    // 获取文字标注
    var obj = refer.getTextObject(
        lineLenStr,
        { size: option.textSize, height: option.textHeight, color: option.textColor }
    );

    box.setFromObject(obj);
    textLen = box.max.x - box.min.x;

    if (textLen + option.lineVInterval > lineLen) {

        textLen = box.max.y - box.min.y;
        directionLine.setLength( lineLen * 0.5 + textLen * 0.5 );
        obj.position.add( directionLine );
        obj.rotateY( Math.PI/2 );

    } else {

        directionLine.setLength( lineLen * 0.5 - textLen * 0.5 );
        obj.position.add( directionLine );

    }

    obj.rotateY( lineLenAngle );
    obj.rotateX( - Math.PI / 2 );
    obj.position.add( lineVDot1 );
    group.add( obj );

    return group;

}