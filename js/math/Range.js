// Copyright 2002-2012, University of Colorado

/**
 * Range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define(
  [],
  function () {

    function Range( min, max, defaultValue ) {
      this.min = min;
      this.max = max;
      this.defaultValue = defaultValue || min;
    }

    // @return {String}
    Range.prototype.toString = function () {
      return "[Range (min=" + this.min + " max=" + this.max + " defaultValue=" + this.defaultValue + ")]";
    };

    return Range;
  } );
