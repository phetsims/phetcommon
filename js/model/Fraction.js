// Copyright 2014-2015, University of Colorado Boulder

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
  var phetcommon = require( 'PHETCOMMON/phetcommon' );

  /**
   * @param {number} numerator must be an integer
   * @param {number} denominator must be an integer
   * @constructor
   */
  function Fraction( numerator, denominator ) {
    assert && assert( Util.isInteger( numerator ) ) && assert( Util.isInteger( denominator ) );

    this.numerator = numerator;     // @public (read-only)
    this.denominator = denominator; // @public (read-only)
  }

  phetcommon.register( 'Fraction', Fraction );

  return inherit( Object, Fraction, {

    // @public - Floating-point error is not an issue as long as numerator and denominator are integers < 2^53
    getValue: function() {
      return this.numerator / this.denominator;
    },

    // @public
    isInteger: function() {
      return Util.isInteger( this.getValue() );
    },

    // @public
    toString: function() {
      return this.numerator + '/' + this.denominator;
    },

    // @public
    reduce: function() {
      var gcd = Util.gcd( this.numerator, this.denominator );
      this.numerator = ( gcd === 0 ) ? 0 : Util.roundSymmetric( this.numerator / gcd );
      this.denominator = ( gcd === 0 ) ? 0 : Util.roundSymmetric( this.denominator / gcd );
    },

    // @public
    equals: function( that ) {
      return this.numerator === that.numerator && this.denominator === that.denominator;
    }
  } );
} );