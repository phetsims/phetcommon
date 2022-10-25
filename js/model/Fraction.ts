// Copyright 2014-2022, University of Colorado Boulder

/**
 * A fraction and associated operations.
 *
 * NOTE: The common version of this class in the PhET Java code base has a number of additional methods.  These methods
 * should be ported into this file as needed.  Please see edu.colorado.phet.fractions.common.math.Fraction.java in the
 * PhET Java code base.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../dot/js/Utils.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import phetcommon from '../phetcommon.js';

export type FractionStateObject = {
  numerator: number;
  denominator: number;
};

export default class Fraction {

  private _numerator: number;
  private _denominator: number;

  public static readonly ZERO = new Fraction( 0, 1 );
  public static readonly ONE = new Fraction( 1, 1 );

  public constructor( numerator: number, denominator: number ) {

    assert && assert( Number.isInteger( numerator ), `numerator must be an integer: ${numerator}` );
    assert && assert( Number.isInteger( denominator ), `denominator must be an integer: ${denominator}` );

    this._numerator = numerator;
    this._denominator = denominator;
  }

  /**
   * Sets the numerator, which must be an integer.
   */
  public set numerator( value: number ) {
    assert && assert( Number.isInteger( value ), `numerator must be an integer: ${value}` );
    this._numerator = value;
  }

  /**
   * Gets the numerator.
   */
  public get numerator(): number { return this._numerator; }

  /**
   * Sets the denominator, which must be an integer.
   */
  public set denominator( value: number ) {
    assert && assert( Number.isInteger( value ), `denominator must be an integer: ${value}` );
    this._denominator = value;
  }

  /**
   * Gets the denominator.
   */
  public get denominator(): number { return this._denominator; }

  /**
   * Computes the numeric value of the fraction.
   * Floating-point error is not an issue as long as numerator and denominator are integers < 2^53.
   */
  public getValue(): number {
    return this.numerator / this.denominator;
  }

  public get value(): number { return this.getValue(); }

  /**
   * Does this fraction reduce to an integer value?
   */
  public isInteger(): boolean {
    return ( this.numerator % this.denominator === 0 );
  }

  public toString(): string {
    return `${this.numerator}/${this.denominator}`;
  }

  public copy(): Fraction {
    return new Fraction( this.numerator, this.denominator );
  }

  /**
   * Reduces this fraction, modifies the numerator and denominator.
   */
  public reduce(): Fraction {
    const gcd = Utils.gcd( this.numerator, this.denominator );
    this.numerator = ( gcd === 0 ) ? 0 : Utils.roundSymmetric( this.numerator / gcd );
    this.denominator = ( gcd === 0 ) ? 0 : Utils.roundSymmetric( this.denominator / gcd );
    return this;
  }

  /**
   * Creates a reduced instance of this fraction.
   */
  public reduced(): Fraction {
    return this.copy().reduce();
  }

  /**
   * Is this fraction reduced?
   */
  public isReduced(): boolean {
    return Utils.gcd( this.numerator, this.denominator ) === 1;
  }

  /**
   * Returns whether the two fractions are equal (not whether their reduced values are equal).
   */
  public equals( fraction: Fraction ): boolean {
    return ( this.numerator === fraction.numerator ) && ( this.denominator === fraction.denominator );
  }

  /**
   * Returns whether this fraction has a value that is less than the provided fraction.
   */
  public isLessThan( fraction: Fraction ): boolean {

    // The more straightforward approach would be: this.getValue() < fraction.getValue().
    // But that uses floating-point operations and comparisons, which could result in a loss of precision.
    // https://github.com/phetsims/phetcommon/issues/43
    return SCRATCH_FRACTION.set( this ).subtract( fraction ).sign === -1;
  }

  /**
   * Gets the sign of the value, as defined by Math.sign
   */
  public get sign(): number {
    return Math.sign( this.getValue() );
  }

  /**
   * Returns the absolute value of this fraction.
   */
  public abs(): Fraction {
    return new Fraction( Math.abs( this.numerator ), Math.abs( this.denominator ) );
  }

  /**
   * Sets the value of this fraction to the provided fraction.
   */
  public set( value: Fraction ): Fraction {
    this.numerator = value.numerator;
    this.denominator = value.denominator;
    return this;
  }

  /**
   * Sets the value of this fraction to the sum of the two fractions:
   * numerator1 / denominator1 + numerator2 / denominator2
   */
  public setToSum( numerator1: number, denominator1: number, numerator2: number, denominator2: number ): Fraction {
    assert && assert( Number.isInteger( numerator1 ), 'numerator1 must be an integer' );
    assert && assert( Number.isInteger( denominator1 ), 'denominator1 must be an integer' );
    assert && assert( Number.isInteger( numerator2 ), 'numerator2 must be an integer' );
    assert && assert( Number.isInteger( denominator2 ), 'denominator2 must be an integer' );

    const lcm = Utils.lcm( denominator1, denominator2 );
    this.numerator = Utils.roundSymmetric( numerator1 * lcm / denominator1 ) +
                     Utils.roundSymmetric( numerator2 * lcm / denominator2 );
    this.denominator = lcm;
    return this;
  }

  /**
   * Adds the provided fraction into this fraction (mutates this fraction). The result is NOT reduced,
   * and has a denominator that is the least-common multiple of the 2 denominators.
   */
  public add( value: Fraction ): Fraction {
    return this.setToSum( this.numerator, this.denominator, value.numerator, value.denominator );
  }

  /**
   * Adds a fraction to this fraction to create a new fraction.
   * The result is not reduced, and has a denominator that is the least-common multiple of the 2 denominators.
   */
  public plus( value: Fraction ): Fraction {
    return this.copy().add( value );
  }

  /**
   * Subtracts the provided fraction from this fraction (mutates this fraction). The result is NOT reduced,
   * and has a denominator that is the least-common multiple of the 2 denominators.
   */
  public subtract( value: Fraction ): Fraction {
    return this.setToSum( this.numerator, this.denominator, -value.numerator, value.denominator );
  }

  /**
   * Subtracts a fraction from this fraction to create a new fraction.
   * The result is not reduced, and has a denominator that is the least-common multiple of the 2 denominators.
   */
  public minus( value: Fraction ): Fraction {
    return this.copy().subtract( value );
  }

  /**
   * Multiplies the provided fraction and this fraction, setting the result into this fraction (mutates).
   * The value is not reduced.
   */
  public multiply( value: Fraction ): Fraction {
    this.numerator *= value.numerator;
    this.denominator *= value.denominator;
    return this;
  }

  /**
   * Multiplies this fraction by another fraction to create a new fraction.
   * The result is not reduced.
   */
  public times( value: Fraction ): Fraction {
    return this.copy().multiply( value );
  }

  /**
   * Divides this fraction by the provided fraction, setting the result into this fraction (mutates).
   * The value is not reduced.
   */
  public divide( value: Fraction ): Fraction {
    this.numerator *= value.denominator;
    this.denominator *= value.numerator;
    return this;
  }

  /**
   * Divides this fraction by another fraction to create a new fraction.
   * The result is not reduced.
   */
  public divided( value: Fraction ): Fraction {
    return this.copy().divide( value );
  }

  /**
   * Convenience method.
   * Adds an integer value to this fraction to create a new fraction.
   * The result is not reduced, and the denominator is the same as the denominator of this fraction.
   */
  public plusInteger( value: number ): Fraction {
    assert && assert( Number.isInteger( value ), `value is not an integer: ${value}` );
    return new Fraction( this.numerator + ( value * this.denominator ), this.denominator );
  }

  /**
   * Convenience method.
   * Subtracts an integer value from this fraction to create a new fraction.
   * The result is not reduced, and the denominator is the same as the denominator of this fraction.
   */
  public minusInteger( value: number ): Fraction {
    assert && assert( Number.isInteger( value ), `value is not an integer: ${value}` );
    return new Fraction( this.numerator - ( value * this.denominator ), this.denominator );
  }

  /**
   * Convenience method.
   * Multiplies this fraction by an integer to create a new fraction.
   * The result is not reduced, and the denominator is the same as the denominator of this fraction.
   */
  public timesInteger( value: number ): Fraction {
    assert && assert( Number.isInteger( value ), `value is not an integer: ${value}` );
    return new Fraction( this.numerator * value, this.denominator );
  }

  /**
   * Convenience method.
   * Divides this fraction by an integer to create a new fraction.
   * This operation affects the value and sign of the denominator only, and the result is not reduced.
   * Careful! Division by zero is allowed here.
   */
  public dividedInteger( value: number ): Fraction {
    assert && assert( Number.isInteger( value ), `value is not an integer: ${value}` );
    return new Fraction( this.numerator, this.denominator * value );
  }

  /**
   * Convenience method for constructing a fraction from an integer.
   */
  public static fromInteger( value: number ): Fraction {
    assert && assert( Number.isInteger( value ), `value is not an integer: ${value}` );
    return new Fraction( value, 1 );
  }

  /**
   * Convert a number into a Fraction
   */
  public static fromDecimal( value: number ): Fraction {

    if ( Number.isInteger( value ) ) {
      return Fraction.fromInteger( value );
    }
    else {

      // Get the decimal part of the number.
      const decimal = value - Utils.toFixedNumber( value, 0 );
      assert && assert( decimal !== 0, 'expected decimal to be non-zero' );

      // Convert the decimal part into an integer. This becomes the denominator.
      const denominator = Math.pow( 10, Utils.numberOfDecimalPlaces( decimal ) );

      // Compute numerator
      const numerator = Utils.toFixedNumber( value * denominator, 0 );

      return new Fraction( numerator, denominator ).reduce();
    }
  }

  /**
   * Serializes this Fraction instance.
   */
  public toStateObject(): FractionStateObject {
    return {
      numerator: this._numerator,
      denominator: this._denominator
    };
  }

  /**
   * Deserializes a Fraction from PhET-iO state.
   */
  public static fromStateObject( stateObject: FractionStateObject ): Fraction {
    return new Fraction( stateObject.numerator, stateObject.denominator );
  }

  /**
   * IOType for Fraction.
   */
  public static readonly FractionIO = new IOType<Fraction, FractionStateObject>( 'FractionIO', {
    valueType: Fraction,
    stateSchema: {
      numerator: NumberIO,
      denominator: NumberIO
    },
    toStateObject: ( fraction: Fraction ) => fraction.toStateObject(),
    fromStateObject: ( stateObject: FractionStateObject ) => Fraction.fromStateObject( stateObject )
  } );
}

// Used to avoid GC. NOTE: Do NOT move in front of the constructor, as it is creating a copy of the type defined.
const SCRATCH_FRACTION = new Fraction( 1, 1 );

phetcommon.register( 'Fraction', Fraction );