// Copyright 2002-2014, University of Colorado Boulder

/**
 * Data structure for a fraction (possibly improper).
 *
 * NOTE: The common version of this class in the PhET Java code base has a number of additional methods.  These methods
 * should be ported into this file as needed.  Please see edu.colorado.phet.fractions.common.math.Fractions.java in the
 * PhET Java code base.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Number} numerator must be an integer
   * @param {Number} denominator must be an integer
   * @constructor
   */
  function Fraction( numerator, denominator ) {
    assert && assert( Util.isInteger( numerator ) ) && assert( Util.isInteger( denominator ) );
    this.numerator = numerator;
    this.denominator = denominator;
  }

  return inherit( Object, Fraction, {

      // Floating-point error is not an issue as long as numerator and denominator are integers < 2^53
      getValue: function() {
        return this.numerator / this.denominator;
      },

      isInteger: function() {
        return Util.isInteger( this.getValue() );
      },

      toString: function() {
        return this.numerator + '/' + this.denominator;
      },

      reduce: function() {
        var gcd = Util.gcd( this.numerator, this.denominator );
        this.numerator = gcd === 0 ? 0 : Math.round( this.numerator / gcd );
        this.denominator = gcd === 0 ? 0 : Math.round( this.denominator / gcd );
      },

      equals: function( that ) {
        return this.numerator === that.numerator && this.denominator === that.denominator;
      }
    },

    // Static values and methods
    {
      fraction: function( numerator, denominator ) {
        return new Fraction( numerator, denominator );
      }
    } );
} );