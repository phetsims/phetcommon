// Copyright 2002-2012, University of Colorado

/**
 * Code for handling the "this is a prototype" dialog for the Dec 2012 newsletter.
 * NOTE: path PHETCOMMON_HTML must be defined in the client's config.js file.
 *
 * @author Sam Reid
 */
define( ['tpl!PHETCOMMON_HTML/prototype-dialog.html'], function ( template ) {
    return {init: function ( simName ) {
        $( template( {simName: simName} ) ).appendTo( $( "body" ) );
        $( '.dialog-overlay' ).click( function () {
            $( this ).fadeOut( 200 );
        } );
    }};
} );