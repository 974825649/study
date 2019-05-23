/**
 * @author KongLing
 */

Menubar.Bg = function ( editor ) {

    var strings = editor.strings;
    var signals = editor.signals;


    var container = new UI.Panel();
    container.setClass( 'menu' );

    var title = new UI.Panel();
    title.setClass( 'title' );
    title.setTextContent( strings.getKey( 'menubar/bg' ) );
    container.add( title );

    var options = new UI.Panel();
    options.setClass( 'options' );
    container.add( options );

    // Img Sky
    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( strings.getKey( 'menubar/bg/img1' ) );
    option.onClick( function () {
        var texture = new THREE.TextureLoader().load( "./images/img1.jpg" );
        texture.wrapS =  texture.wrapT = THREE.RepeatWrapping;
        texture.name = 'Sky';
        signals.sceneSkyChanged.dispatch(texture);
    });
    options.add( option );

    //Img YaoMeng
    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( strings.getKey( 'menubar/bg/img2' ) );
    option.onClick( function () {
        var texture = new THREE.TextureLoader().load( "./images/img2.jpg" );
        texture.wrapS =  texture.wrapT = THREE.RepeatWrapping;
        texture.name = 'YaoMeng';
        signals.sceneSkyChanged.dispatch(texture);
    });
    options.add( option );

    return container;

};
