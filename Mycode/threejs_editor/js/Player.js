/**
 * @author mrdoob / http://mrdoob.com/
 */

var Player = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'player' );
	container.setPosition( 'absolute' );
	container.setDisplay( 'none' );

	var buttons = new UI.Panel();
	container.add( buttons );
	buttons.setPosition( 'absolute' );
	buttons.setBottom( '4px' );
	buttons.setRight( '4px' );

	var cameraControl = new UI.Button( '切换' );
	cameraControl.dom.title = 'w a s d c x';
	cameraControl.dom.className = 'Button';
	cameraControl.setMarginRight( '4px' );
	cameraControl.onClick( function () {

		if ( player.getCameraPlaying() ) return;
		player.changeControls();

	} );
	buttons.add( cameraControl );

	var cameraPlayer = new UI.Button( '播放' );
	cameraPlayer.dom.className = 'Button';
	cameraPlayer.onClick( function () {

		if ( player.getCameraPlaying() ) {

			player.stopCamera( cameraPlayer.dom );

		} else {

			player.playCamera( cameraPlayer.dom );

		}

	} );

	//

	var player = new APP.Player();
	container.dom.appendChild( player.dom );

	window.addEventListener( 'resize', function () {

		player.setSize( container.dom.clientWidth, container.dom.clientHeight );

	} );

	signals.startPlayer.add( function () {

		container.setDisplay( '' );

		if ( editor.cameraRecord && editor.cameraRecord.looksCount > 0 ) {

			buttons.add( cameraPlayer );

		}

		player.load( editor.toJSON() );
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

	} );

	signals.stopPlayer.add( function () {

		container.setDisplay( 'none' );

		player.stop();
		player.dispose();

	} );

	return container;

};
