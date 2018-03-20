// Copyright 2014-2018, University of Colorado Boulder

/**
 * A fraction and associated operations.
 *
 * NOTE: The common version of this class in the PhET Java code base has a number of additional methods.  These methods
 * should be ported into this file as needed.  Please see edu.colorado.phet.fractions.common.math.Fraction.java in the
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
  var phetcommon = require( 'PHETCOMMON/phetcommon' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {number} numerator must be an integer
   * @param {number} denominator must be an integer
   * @constructor
   */
  function Fraction( numerator, denominator ) {
    assert && assert( Util.isInteger( numerator ), 'numerator must be an integer: ' + numerator );
    assert && assert( Util.isInteger( denominator ), 'denominator must be an integer: ' + denominator );

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
    copy: function() {
      return new Fraction( this.numerator, this.denominator );
    },

    /**
     * Reduces this fraction, modifies the numerator and denominator.
     * @returns {Fraction} returns this, to support chaining of operations
     * @public
     */
    reduce: function() {
      var gcd = Util.gcd( this.numerator, this.denominator );
      this.numerator = ( gcd === 0 ) ? 0 : Util.roundSymmetric( this.numerator / gcd );
      this.denominator = ( gcd === 0 ) ? 0 : Util.roundSymmetric( this.denominator / gcd );
      return this;
    },

    /**
     * Creates a reduced instance of this fraction.
     * @returns {Fraction}
     * @public
     */
    reduced: function() {
      return this.copy().reduce();
    },

    /**
     * Is this fraction reduced?
     * @returns {boolean}
     */
    isReduced: function() {
      return Util.gcd( this.numerator, this.denominator ) === 1;
    },

    // @public
    equals: function( that ) {
      return this.numerator === that.numerator && this.denominator === that.denominator;
    },

    /**
     * Gets the sign of the value.
     * @returns {number} see Util.sign
     * @public
     */
    get sign() {
      return Util.sign( this.getValue() );
    },

    /**
     * Returns the absolute value of this fraction.
     * @returns {Fraction}
     * @public
     */
    abs: function() {
      return new Fraction( Math.abs( this.numerator ), Math.abs( this.denominator ) );
    },

    /**
     * Adds a fraction to this fraction to create a new fraction.
     * The result has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    plus: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );
      var lcm = Util.lcm( this.denominator, value.denominator );
      var numerator = Util.roundSymmetric( this.numerator * lcm / this.denominator ) +
                      Util.roundSymmetric( value.numerator * lcm / value.denominator );
      return new Fraction( numerator, lcm );
    },

    /**
     * Subtracts a fraction from this fraction to create a new fraction.
     * The result has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    minus: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );
      var lcm = Util.lcm( this.denominator, value.denominator );
      var numerator = Util.roundSymmetric( this.numerator * lcm / this.denominator ) -
                      Util.roundSymmetric( value.numerator * lcm / value.denominator );
      return new Fraction( numerator, lcm );
    },

    /**
     * Multiplies this fraction by another fraction to create a new fraction.
     * The result has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    times: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );
      return new Fraction( this.numerator * value.numerator, this.denominator * value.denominator );
    },

    /**
     * Divides this fraction by another fraction to create a new fraction.
     * The result has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    divided: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );
      return new Fraction( this.numerator * value.denominator, this.denominator * value.numerator );
    },

    /**
     * Convenience method.
     * Adds an integer value to this fraction to create a new fraction.
     * Denominator of the result is the same as the denominator of this fraction.
     * @param {number} value - integer
     * @returns {Fraction}
     * @public
     */
    plusInteger: function( value ) {
      assert && assert( Util.isInteger( value ), 'value is not an integer: ' + value );
      return new Fraction( this.numerator + ( value * this.denominator ), this.denominator );
    },

    /**
     * Convenience method.
     * Subtracts an integer value from this fraction to create a new fraction.
     * Denominator of the result is the same as the denominator of this fraction.
     * @param {number} value - integer
     * @returns {Fraction}
     * @public
     */
    minusInteger: function( value ) {
      assert && assert( Util.isInteger( value ), 'value is not an integer: ' + value );
      return new Fraction( this.numerator - ( value * this.denominator ), this.denominator );
    },

    /**
     * Convenience method.
     * Multiplies this fraction by an integer to create a new fraction.
     * Denominator of the result is the same as the denominator of this fraction.
     * @param {number} value
     * @returns {Fraction}
     * @public
     */
    timesInteger: function( value ) {
      assert && assert( Util.isInteger( value ), 'value is not an integer: ' + value );
      return new Fraction( this.numerator * value, this.denominator );
    },

    /**
     * Convenience method.
     * Divides this fraction by an integer to create a new fraction.
     * Affects the value and sign of the denominator only.
     * Careful! Division by zero is allowed here.
     * @param {number} value - integer
     * @returns {Fraction}
     * @public
     */
    dividedInteger: function( value ) {
      assert && assert( Util.isInteger( value ), 'value is not an integer: ' + value );
      return new Fraction( this.numerator, this.denominator * value );
    }
  }, {

    /**
     * Convenience method for constructing a fraction from an integer.
     * @param {number} value - must be an integer
     * @returns {Fraction}
     * @public
     * @static
     */
    withInteger: function( value ) {
      return new Fraction( value, 1 );
    }
  } );
} );