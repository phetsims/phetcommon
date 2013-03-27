// Copyright 2002-2013, University of Colorado

/**
 * A numeric range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define(
  [],
  function () {
    "use strict";

    function Range( min, max, defaultValue ) {
      this.min = min;
      this.max = max;
      this.defaultValue = defaultValue || min;
    }

    Range.prototype = {

      constructor: Range,

      getLength: function () {
        return this.max - this.min;
      },

      contains: function ( value ) {
        return ( value >= this.min ) && ( value <= this.max );
      },

      intersects: function ( range ) {
        return ( this.max >= range.min ) && ( range.max >= this.min );
      },

      toString: function () {
        return "[Range (min:" + this.min + " max:" + this.max + " defaultValue:" + this.defaultValue + ")]";
      }
    };

    return Range;
  } );
