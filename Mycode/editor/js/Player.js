/**
 * @author mrdoob / http://mrdoob.com/
 */

var Player = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'player' );
	container.setPosition( 'absolute' );
	container.setDisplay( 'none' );

	var stats = new Stats();
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "10px";
	stats.domElement.style.left = "10px";
	stats.domElement.style.display = 'none';
	container.dom.appendChild( stats.domElement );
	signals.statsShow.add(function () {
		if(stats.domElement.style.display === 'none'){
			stats.domElement.style.display = 'block';
		}else {
			stats.domElement.style.display = 'none';
		}
	});

	//

	var player = new APP.Player();
	container.dom.appendChild( player.dom );

	window.addEventListener( 'resize', function () {

		player.setSize( container.dom.clientWidth, container.dom.clientHeight );

	} );

	signals.startPlayer.add( function () {

		container.setDisplay( '' );

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
