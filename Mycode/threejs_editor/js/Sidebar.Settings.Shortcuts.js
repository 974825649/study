/**
 * @author TyLindberg / https://github.com/TyLindberg
 */

Sidebar.Settings.Shortcuts = function ( editor ) {

	const IS_MAC = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;

	function isValidKeyBinding( key ) {

		return key.match( /^[A-Za-z0-9]$/i ); // Can't use z currently due to undo/redo

	}

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Div();
	container.add( new UI.Break() );

	var shortcuts = [ 'translate', 'rotate', 'scale', 'lineHelper', 'lineHelperX', 'lineHelperY', 'lineHelperZ', 'lineHelperShape2', 'lineHelperShape3', 'lock', 'visible', 'focus', 'undo' ],
		shortcutsCN = [ '平移', '旋转', '缩放', '辅助', '辅助YZ', '辅助XZ', '辅助XY', '辅助面', '辅助体', '锁定（解锁）', '显示（隐藏）', '居中', '撤销（重做） Ctrl(+Shift)+' ];

	for ( var i = 0; i < shortcuts.length; i ++ ) {

		let name = shortcuts[ i ];

		let configName = 'settings/shortcuts/' + name;
		let shortcutRow = new UI.Row();

		let shortcutInput = new UI.Input().setWidth( '150px' ).setFontSize( '12px' );
		shortcutInput.setTextTransform( 'lowercase' );
		shortcutInput.onChange( function () {

			var value = shortcutInput.getValue().toLowerCase();

			if ( isValidKeyBinding( value ) ) {

				config.setKey( configName, value );

			}

		} );

		// Automatically highlight when selecting an input field
		shortcutInput.dom.addEventListener( 'click', function () {

			shortcutInput.dom.select();

		} );

		// If the value of the input field is invalid, revert the input field
		// to contain the key binding stored in config
		shortcutInput.dom.addEventListener( 'blur', function () {

			if ( ! isValidKeyBinding( shortcutInput.getValue() ) ) {

				shortcutInput.setValue( config.getKey( configName ) );

			}

		} );

		// If a valid key binding character is entered, blur the input field
		shortcutInput.dom.addEventListener( 'keyup', function ( event ) {

			if ( isValidKeyBinding( event.key ) ) {

				shortcutInput.dom.blur();

			}

		} );

		if ( config.getKey( configName ) !== undefined ) {

			shortcutInput.setValue( config.getKey( configName ) );

		}

		shortcutInput.dom.maxLength = 1;
		shortcutRow.add( new UI.Text( shortcutsCN[i] ).setTextTransform( 'capitalize' ).setWidth( '90px' ) );
		shortcutRow.add( shortcutInput );

		container.add( shortcutRow );

	}

	document.addEventListener( 'keydown', function ( event ) {

		switch ( event.key.toLowerCase() ) {

			case 'backspace':

				event.preventDefault(); // prevent browser back

				break;

			case 'delete':

				var object = editor.selected;

				if ( object === null ) return;
				if ( confirm( '是否删除 ' + object.name + '？' ) === false ) return;

				var parent = object.parent;
				if ( parent !== null ) editor.execute( new RemoveObjectCommand( object ) );

				break;

			case config.getKey( 'settings/shortcuts/translate' ):

				signals.transformModeChanged.dispatch( 'translate' );

				break;

			case config.getKey( 'settings/shortcuts/rotate' ):

				signals.transformModeChanged.dispatch( 'rotate' );

				break;

			case config.getKey( 'settings/shortcuts/scale' ):

				signals.transformModeChanged.dispatch( 'scale' );

				break;

			case config.getKey( 'settings/shortcuts/lineHelper' ):

				signals.lineHelperChanged.dispatch( {
					switch: 2
				} );

				break;

			case config.getKey( 'settings/shortcuts/lineHelperX' ):

				signals.lineHelperChanged.dispatch( {
					axis: 'x',
				} );

				break;

			case config.getKey( 'settings/shortcuts/lineHelperY' ):

				signals.lineHelperChanged.dispatch( {
					axis: 'y',
				} );

				break;

			case config.getKey( 'settings/shortcuts/lineHelperZ' ):

				signals.lineHelperChanged.dispatch( {
					axis: 'z',
				} );

				break;

			case config.getKey( 'settings/shortcuts/lineHelperShape2' ):

				signals.lineHelperRun.dispatch( 'shape2' );

				break;

			case config.getKey( 'settings/shortcuts/lineHelperShape3' ):

				signals.lineHelperRun.dispatch( 'shape3' );

				break;

			case config.getKey( 'settings/shortcuts/lock' ):

				if ( editor.selected ) {

					var userData = {};
					$.extend( userData, editor.selected.userData );

					if ( editor.selected.userData.lock ) {

						userData.lock = false;

					} else {

						userData.lock = true;

					}

					editor.execute( new SetValueCommand( editor.selected, 'userData', userData ) );

				}

				break;

			case config.getKey( 'settings/shortcuts/visible' ):

				if ( editor.selected ) {

					if ( editor.selected.visible ) {

						editor.execute( new SetValueCommand( editor.selected, 'visible', false) );

					} else {

						editor.execute( new SetValueCommand( editor.selected, 'visible', true ) );

					}

				}

				break;

			case config.getKey( 'settings/shortcuts/undo' ):

				if ( IS_MAC ? event.metaKey : event.ctrlKey ) {

					event.preventDefault(); // Prevent browser specific hotkeys

					if ( event.shiftKey ) {

						editor.redo();

					} else {

						editor.undo();

					}

				}

				break;

			case config.getKey( 'settings/shortcuts/focus' ):

				if ( editor.selected !== null ) {

					editor.focus( editor.selected );

				}

				break;

		}

	}, false );

	return container;

};
