// Copyright 2002-2012, University of Colorado

/**
 * Transform between model and view coordinate frames.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define(
  [ 'DOT/Vector2' ],
  function ( Vector2 ) {
    "use strict";

    /**
     * @constructor
     * @param {Number} scale when going from model to view coordinates. 1 unit in the model is this many view units.
     * @param {Vector2} offset when going from model to view coordinates
     */
    function ModelViewTransform2D( scale, offset ) {

      /*
       * Transformation a value from model to view coordinates.
       * @param {Number|Vector2} value
       * @return {Number|Vector2}
       */
      this.modelToView = function ( value ) {
        if ( typeof( value ) === 'number' ) {
          return value * scale;
        }
        else if ( value instanceof Vector2 ) {
          return new Vector2( ( value.x + offset.x ) * scale, ( value.y + offset.y ) * scale );
        }
        else {
          throw new Error( "value has unsupported type: " + typeof( value ) );
        }
      };

      /*
       * Transformation a value from view to model coordinates.
       * @param {Number|Vector2} value
       * @return {Number|Vector2}
       */
      this.viewToModel = function ( value ) {
        if ( typeof( value ) === 'number' ) {
          return value / scale;
        }
        else if ( value instanceof Vector2 ) {
          return new Vector2( ( value.x / scale ) - offset.x, ( value.y / scale ) - offset.y );
        }
        else {
          throw new Error( "value has unsupported type: " + typeof( value ) );
        }
      };
    }

    return ModelViewTransform2D;
  } );
