/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Bg = function ( editor ) {

    var strings = editor.strings;

    var container = new UI.Panel();
    container.setClass( 'menu' );

    var title = new UI.Panel();
    title.setClass( 'title' );
    title.setTextContent( strings.getKey( 'menubar/bg' ) );
    container.add( title );

    var options = new UI.Panel();
    options.setClass( 'options' );
    container.add( options );

    // // Box
    //
    // var option = new UI.Row();
    // option.setClass( 'option' );
    // option.setTextContent( strings.getKey( 'menubar/add/box' ) );
    // option.onClick( function () {
    //
    //     var geometry = new THREE.BoxBufferGeometry( 1, 1, 1, 1, 1, 1 );
    //     var mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    //     mesh.name = 'Box';
    //
    //     editor.execute( new AddObjectCommand( mesh ) );
    //
    // } );
    // options.add( option );
    //

    // Img Sky
    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( strings.getKey( 'menubar/bg/img1' ) );
    option.onClick( function () {

        // var bg = editor.sceneHelpers.background;
        var texture = new THREE.TextureLoader().load( "./images/img1.jpg" );
        texture.wrapS =  texture.wrapT = THREE.RepeatWrapping;
        editor.scene.background = texture;


    });
    options.add( option );

    // Img2 妖梦
    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( strings.getKey( 'menubar/bg/img2' ) );
    option.onClick( function () {
        // var texture = new  THREE.TextureLoader().load( './images/img2.jpg' );
        // texture.wrapS =  texture.wrapT = THREE.RepeatWrapping;
        // editor.scene.background = texture;

        var skyBoxGeometry = new THREE.BoxGeometry( 500, 500, 500 );

        var texture = new THREE.TextureLoader().load("./images/img2.jpg");

        var skyBoxMaterial = new THREE.MeshBasicMaterial( { map:texture, side: THREE.DoubleSide } );

        var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );

        skyBox.position.set(0,249,0);
        // console.log('sssssssss');
        // console.log(editor.camera.position);
        editor.scene.add(skyBox);
    });
    options.add( option );





    return container;

};
