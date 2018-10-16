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
   * @param {number} numerator - must be an integer
   * @param {number} denominator - must be an integer
   * @constructor
   */
  function Fraction( numerator, denominator ) {

    assert && assert( Util.isInteger( numerator ), 'numerator must be an integer: ' + numerator );
    assert && assert( Util.isInteger( denominator ), 'denominator must be an integer: ' + denominator );

    // @private use set/get so that values are verified to be integers
    this._numerator = numerator;
    this._denominator = denominator;
  }

  phetcommon.register( 'Fraction', Fraction );

  inherit( Object, Fraction, {

    /**
     * Sets the numerator, which must be an integer.
     * @param {number} value
     * @public
     */
    set numerator( value ) {
      assert && assert( Util.isInteger( value ), 'numerator must be an integer: ' + value );
      this._numerator = value;
    },

    /**
     * Gets the numerator.
     * @returns {number}
     * @public
     */
    get numerator() { return this._numerator; },

    /**
     * Sets the denominator, which must be an integer.
     * @param {number} value
     * @public
     */
    set denominator( value ) {
      assert && assert( Util.isInteger( value ), 'denominator must be an integer: ' + value );
      this._denominator = value;
    },

    /**
     * Gets the denominator.
     * @returns {number}
     * @public
     */
    get denominator() { return this._denominator; },

    // @public - Floating-point error is not an issue as long as numerator and denominator are integers < 2^53
    getValue: function() {
      return this.numerator / this.denominator;
    },
    get value() { return this.getValue(); },

    /**
     * Does this fraction reduce to an integer value?
     * @returns {boolean}
     * @public
     */
    isInteger: function() {
      return ( this.numerator % this.denominator === 0 );
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

    /**
     * Returns whether the two fractions are equal (not whether their reduced values are equal).
     * @public
     *
     * @param {Fraction} fraction
     * @returns {boolean}
     */
    equals: function( fraction ) {
      return ( this.numerator === fraction.numerator ) && ( this.denominator === fraction.denominator );
    },

    /**
     * Returns whether this fraction has a value that is less than the provided fraction.
     * @public
     *
     * @param {Fraction} fraction
     * @returns {boolean}
     */
    isLessThan: function( fraction ) {
      assert && assert( fraction instanceof Fraction, 'fraction is not a Fraction: ' + fraction );

      // The more straightforward approach would be: this.getValue() < fraction.getValue().
      // But that uses floating-point operations and comparisons, which could result in a loss of precision.
      // https://github.com/phetsims/phetcommon/issues/43
      return SCRATCH_FRACTION.set( this ).subtract( fraction ).sign === -1;
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
     * Sets the value of this fraction to the provided fraction.
     * @param {Fraction} value
     * @returns {Fraction} - Reference to this for chaining
     * @public
     */
    set: function( value ) {
      this.numerator = value.numerator;
      this.denominator = value.denominator;
      return this;
    },

    /**
     * Sets the value of this fraction to the sum of the two fractions:
     * numerator1 / denominator1 + numerator2 / denominator2
     * @param {number} numerator1
     * @param {number} denominator1
     * @param {number} numerator2
     * @param {number} denominator2
     * @returns {Fraction} - Reference to this
     * @public
     */
    setToSum: function( numerator1, denominator1, numerator2, denominator2 ) {
      assert && assert( Util.isInteger( numerator1 ), 'numerator1 must be an integer' );
      assert && assert( Util.isInteger( denominator1 ), 'denominator1 must be an integer' );
      assert && assert( Util.isInteger( numerator2 ), 'numerator2 must be an integer' );
      assert && assert( Util.isInteger( denominator2 ), 'denominator2 must be an integer' );

      var lcm = Util.lcm( denominator1, denominator2 );
      this.numerator = Util.roundSymmetric( numerator1 * lcm / denominator1 ) +
                       Util.roundSymmetric( numerator2 * lcm / denominator2 );
      this.denominator = lcm;
      return this;
    },

    /**
     * Adds the provided fraction into this fraction (mutates this fraction). The result is NOT reduced,
     * and has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction} - Reference to this (for chaining)
     * @public
     */
    add: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );

      return this.setToSum( this.numerator, this.denominator, value.numerator, value.denominator );
    },

    /**
     * Adds a fraction to this fraction to create a new fraction.
     * The result is not reduced, and has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    plus: function( value ) {
      return this.copy().add( value );
    },

    /**
     * Subtracts the provided fraction from this fraction (mutates this fraction). The result is NOT reduced,
     * and has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction} - Reference to this (for chaining)
     * @public
     */
    subtract: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );

      return this.setToSum( this.numerator, this.denominator, -value.numerator, value.denominator );
    },

    /**
     * Subtracts a fraction from this fraction to create a new fraction.
     * The result is not reduced, and has a denominator that is the least-common multiple of the 2 denominators.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    minus: function( value ) {
      return this.copy().subtract( value );
    },

    /**
     * Multiplies the provided fraction and this fraction, setting the result into this fraction (mutates).
     * The value is not reduced.
     * @param {Fraction} value
     * @returns {Fraction} - Reference to this (for chaining)
     * @public
     */
    multiply: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );

      this.numerator *= value.numerator;
      this.denominator *= value.denominator;
      return this;
    },

    /**
     * Multiplies this fraction by another fraction to create a new fraction.
     * The result is not reduced.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    times: function( value ) {
      return this.copy().multiply( value );
    },

    /**
     * Divides this fraction by the provided fraction, setting the result into this fraction (mutates).
     * The value is not reduced.
     * @param {Fraction} value
     * @returns {Fraction} - Reference to this (for chaining)
     * @public
     */
    divide: function( value ) {
      assert && assert( value instanceof Fraction, 'value is not a Fraction: ' + value );

      this.numerator *= value.denominator;
      this.denominator *= value.numerator;
      return this;
    },

    /**
     * Divides this fraction by another fraction to create a new fraction.
     * The result is not reduced.
     * @param {Fraction} value
     * @returns {Fraction}
     * @public
     */
    divided: function( value ) {
      return this.copy().divide( value );
    },

    /**
     * Convenience method.
     * Adds an integer value to this fraction to create a new fraction.
     * The result is not reduced, and the denominator is the same as the denominator of this fraction.
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
     * The result is not reduced, and the denominator is the same as the denominator of this fraction.
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
     * The result is not reduced, and the denominator is the same as the denominator of this fraction.
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
     * This operation affects the value and sign of the denominator only, and the result is not reduced.
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
    fromInteger: function( value ) {
      return new Fraction( value, 1 );
    }
  } );

  // Used to avoid GC - NOTE: Do NOT move in front of the constructor/inherit, as it is creating a copy of the type
  // defined.
  var SCRATCH_FRACTION = new Fraction( 1, 1 );

  // Useful constants
  Fraction.ZERO = new Fraction( 0, 1 );
  Fraction.ONE = new Fraction( 1, 1 );

  return Fraction;
} );