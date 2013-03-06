// Copyright 2002-2013, University of Colorado

/**
 * Encapsulation of the imagesloaded jquery plugin. Assumes that your <img> tags are
 * enclosed in <body>, and the images are stored in the images/ directory at the
 * top-level of the repository.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define(
  [
    'imagesloaded'
  ],
  function ( imagesloaded ) {

    /**
     * @param callback called after the images have been loaded, has one {ImageLoader} arg
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
        var selector = 'img[src^="images/' + basename + '"]';
        return imagesLoader.images.parent().find( selector )[0];
      };
    }

    return ImagesLoader;
  } );