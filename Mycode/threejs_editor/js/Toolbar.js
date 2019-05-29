/**
 * @author mrdoob / http://mrdoob.com/
 */

var Toolbar = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'toolbar' );

	var buttons = new UI.Panel();
	container.add( buttons );

	// translate / rotate / scale

	var translate = new UI.Button( '平移' );
	translate.dom.title = 'W';
	translate.dom.className = 'Button selected';
	translate.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	buttons.add( translate );

	var rotate = new UI.Button( '旋转' );
	rotate.dom.title = 'E';
	rotate.onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	buttons.add( rotate );

	var scale = new UI.Button( '缩放' );
	scale.dom.title = 'R';
	scale.onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	buttons.add( scale );

	signals.transformModeChanged.add( function ( mode ) {

		translate.dom.classList.remove( 'selected' );
		rotate.dom.classList.remove( 'selected' );
		scale.dom.classList.remove( 'selected' );

		switch ( mode ) {

			case 'translate': translate.dom.classList.add( 'selected' ); break;
			case 'rotate': rotate.dom.classList.add( 'selected' ); break;
			case 'scale': scale.dom.classList.add( 'selected' ); break;

		}

	} );

	var lineHelper = new UI.THREE.Boolean( false, '辅助' ).onChange( function () {

		signals.lineHelperChanged.dispatch( {
			switch: lineHelper.getValue() ? 1 : 0,  // 0 关闭；1 开启；2 切换
			// axis: 'y',                       // 默认 y 表示 XZ 平面
			// position: helperPosition.getValue()
		} );

	} );
	buttons.add( lineHelper );

	var helperPosition = new UI.Number( 0 ).setWidth( '40px' ).onChange( function () {

		signals.lineHelperChanged.dispatch( {
			// switch: lineHelper.getValue() ? 1 : 0,  // 0 关闭；1 开启；2 切换
			// axis: 'y',                       // 默认 y 表示 XZ 平面
			position: helperPosition.getValue()
		} );

	} );
	buttons.add( new UI.Text( '移动: ' ) );
	buttons.add( helperPosition );

	signals.lineHelperChanged.add( function ( opt ) {

		if ( opt.switch === 0 ) {
			lineHelper.setValue( false );
		} else if ( opt.switch === 1 ) {
			lineHelper.setValue( true );
		} else if ( opt.switch === 2 ) {
			lineHelper.setValue( ! lineHelper.getValue() );
		}

		if ( opt.position !== undefined ) {
			helperPosition.setValue( opt.position );
		}

	} );

	// grid

	var snap = new UI.THREE.Boolean( false, '按步长' ).onChange( update );
	// buttons.add( snap );

	var grid = new UI.Number( 1 ).setWidth( '40px' ).onChange( update );
	// buttons.add( new UI.Text( '步长: ' ) );
	// buttons.add( grid );

	var local = new UI.THREE.Boolean( false, '本地坐标系' ).onChange( update );
	buttons.add( local );

	var showGrid = new UI.THREE.Boolean( true, '网格' ).onChange( update );
	buttons.add( showGrid );

	function update() {

		signals.snapChanged.dispatch( snap.getValue() === true ? grid.getValue() : null );
		signals.spaceChanged.dispatch( local.getValue() === true ? "local" : "world" );
		signals.showGridChanged.dispatch( showGrid.getValue() );

	}

	// 定位相机

	var locateCamera = new UI.THREE.Boolean( false, '定位相机' ).onChange( locate );
	buttons.add( locateCamera );

	var locateHeight = new UI.Number( 1.6 ).setWidth( '30px' ).onChange( locate );
	buttons.add( new UI.Text( '高度: ' ) );
	buttons.add( locateHeight );

	var locateVelocity = new UI.Number( 1 ).setWidth( '40px' ).onChange( locate );
	buttons.add( new UI.Text( '速度: ' ) );
	buttons.add( locateVelocity );

	function locate() {

		signals.cameraLocated.dispatch( locateCamera.getValue(), locateHeight.getValue(), locateVelocity.getValue() );

	}

	signals.cameraSetupLocated.add( function ( val ) {

		locateCamera.setValue( val );

	} )

	return container;

};
