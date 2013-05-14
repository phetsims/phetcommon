// Copyright 2002-2013, University of Colorado

/**
 * Encapsulation of the imagesloaded jquery plugin. Assumes that your <img> tags are
 * enclosed in <body>, and the images are stored in the images/ directory at the
 * top-level of the repository.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

    var imagesloaded = require( 'imagesloaded' );
    var assert = require( 'ASSERT/assert' )( 'phetcommon' );
    "use strict";
    
    /**
     * @param callback called after the images have been loaded, has one {ImagesLoader} arg
     * @constructor
     */
    function ImagesLoader( callback ) {

      var imagesLoader = this;

      $( 'body' ).imagesLoaded( function ( $images, $proper, $broken ) {
        imagesLoader.images = $images;
        imagesLoader.proper = $proper;
        imagesLoader.broken = $broken;
        callback( imagesLoader );
      } );

      /**
       * Gets an image.
       * @param {String} basename
       * @return HTMLImageElement
       */
      imagesLoader.getImage = function( basename ) {
        var selector = 'img[src$="images/' + basename + '"]';
        
        //Make sure there is exactly one match by name
        var selected = imagesLoader.images.parent().find( selector );
        assert && assert( selected.length === 1, "Should have found one match for " + basename + ", but instead found " + selected.length + " matches." );
        
        //Return the match
        return selected[0];
      };
    }

    return ImagesLoader;
  } );