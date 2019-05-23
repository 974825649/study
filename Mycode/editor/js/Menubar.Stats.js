/**
 * @author soul
 */

Menubar.Stats = function ( editor ) {

    var strings = editor.strings;
    var signals = editor.signals;

    var container = new UI.Panel();
    container.setClass( 'menu' );

    var title = new UI.Panel();
    title.setClass( 'title' );
    title.setTextContent( strings.getKey( 'menubar/stats' ) );
    container.add( title );

    var options = new UI.Panel();
    options.setClass( 'options' );
    container.add( options );

    // 开启关闭FPS
    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( strings.getKey( 'menubar/stats/showFPS' ) );
    option.onClick( function () {
        signals.statsShow.dispatch();
    });
    options.add( option );


    return container;

};
