/**
 * @author KongLing /
 */

Menubar.Tools = function ( editor ) {

    var strings = editor.strings;
    var signals = editor.signals;

    var container = new UI.Panel();
    container.setClass( 'menu' );

    var title = new UI.Panel();
    title.setClass( 'title' );
    title.setTextContent( strings.getKey( 'menubar/tools' ) );
    container.add( title );

    var options = new UI.Panel();
    options.setClass( 'options' );
    container.add( options );

    // Distance
    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( strings.getKey( 'menubar/tools/distance' ) );
    option.onClick( function () {
        signals.distanceMeasure.dispatch();
    });
    options.add( option );
    

    return container;

};
