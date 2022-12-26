// Copyright 2020-2022, University of Colorado Boulder

/**
 * AssertUtils is a collection of utility functions for common assertions. Many of these assertions are related to
 * type-checking, useful in a weakly-typed language like JavaScript.
 *
 * To minimize performance impact, these methods should generally be called after testing for the presence of assert,
 * for example: assert && AssertUtils.assertPropertyOf( someProperty, 'number' );
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationDeprecatedProperty from '../../axon/js/EnumerationDeprecatedProperty.js';
import Property from '../../axon/js/Property.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import Range from '../../dot/js/Range.js';
import EnumerationDeprecated from '../../phet-core/js/EnumerationDeprecated.js';
import phetcommon from '../../phetcommon/js/phetcommon.js';

const AssertUtils = {

  /**
   * Asserts that a value is a Property, whose value satisfies an optional predicate.
   * @param {Property} property
   * @param {function(value:*):boolean} [predicate]
   * @public
   */
  assertProperty( property, predicate ) {
    assert && assert( property instanceof Property, 'property is not a Property' );
    if ( predicate ) {
      assert && assert( predicate( property.value ), 'Property.value failed predicate' );
    }
  },

  /**
   * Asserts that a value is a Property, whose value satisfies an optional predicate.
   * @param {Property} property
   * @param {function(value:*):boolean} [predicate]
   * @public
   */
  assertAbstractProperty( property, predicate ) {
    assert && assert( property instanceof ReadOnlyProperty, 'property is not an ReadOnlyProperty' );
    if ( predicate ) {
      assert && assert( predicate( property.value ), 'Property.value failed predicate' );
    }
  },

  /**
   * Asserts that a value is a Property, whose value is a specified type.
   * @param {Property} property
   * @param {string|EnumerationDeprecated|constructor} type - primitive type (string), EnumerationDeprecated type, or object type (constructor)
   * @public
   */
  assertPropertyOf( property, type ) {
    if ( typeof type === 'string' ) {
      assert && AssertUtils.assertProperty( property, value => typeof value === type );
    }
    else if ( type instanceof EnumerationDeprecated ) {
      assert && AssertUtils.assertProperty( property, value => type.includes( value ) );
    }
    else {
      assert && AssertUtils.assertProperty( property, value => value instanceof type );
    }
  },

  /**
   * Asserts that a value is a Property, whose value is a specified type.
   * @param {Property} property
   * @param {string|EnumerationDeprecated|constructor} type - primitive type (string), EnumerationDeprecated type, or object type (constructor)
   * @public
   */
  assertAbstractPropertyOf( property, type ) {
    if ( typeof type === 'string' ) {
      assert && AssertUtils.assertAbstractProperty( property, value => typeof value === type );
    }
    else if ( type instanceof EnumerationDeprecated ) {
      assert && AssertUtils.assertAbstractProperty( property, value => type.includes( value ) );
    }
    else {
      assert && AssertUtils.assertAbstractProperty( property, value => value instanceof type );
    }
  },

  /**
   * Asserts that a value is an integer that satisfies an optional predicate.
   * @param {number} value
   * @param {function(value:number):boolean} [predicate]
   * @returns {boolean}
   * @public
   */
  assertInteger( value, predicate ) {
    assert && assert( typeof value === 'number' && Number.isInteger( value ), `invalid value: ${value}` );
    if ( predicate ) {
      assert && assert( predicate( value ), `value does not satisfy predicate: ${value}` );
    }
  },

  /**
   * Asserts that a value is a positive integer, > 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  assertPositiveInteger( value ) {
    assert && AssertUtils.assertInteger( value, value => value > 0 );
  },

  /**
   * Asserts that a value is a non-negative integer, >= 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  assertNonNegativeInteger( value ) {
    assert && AssertUtils.assertInteger( value, value => value >= 0 );
  },

  /**
   * Asserts that a value is a positive number, > 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  assertPositiveNumber( value ) {
    assert && assert( typeof value === 'number' && value > 0 );
  },

  /**
   * Asserts that a value is a non-negative number, >= 0.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  assertNonNegativeNumber( value ) {
    assert && assert( typeof value === 'number' && value >= 0 );
  },

  /**
   * Asserts that a value is a Range, whose value is between min and max inclusive.
   * @param {Range} range
   * @param {number} min
   * @param {number} max
   * @public
   */
  assertRangeBetween( range, min, max ) {
    assert && assert( range instanceof Range, 'invalid range' );
    assert && assert( range.min >= min && range.max <= max, `range exceeds limits: ${range}` );
  },

  /**
   * Asserts that a value is an Array, whose elements satisfy an optional predicate.
   * @param {Array} array
   * @param {function(array:Array):boolean} [predicate]
   * @public
   */
  assertArray( array, predicate ) {
    assert && assert( Array.isArray( array ), 'array is not an Array' );
    if ( predicate ) {
      assert && assert( predicate( array ), 'array failed predicate' );
    }
  },

  /**
   * Asserts that a value is an Array, with elements of a specific type.
   * @param {Array} array
   * @param {string|constructor} type - primitive type (string) or object type (constructor)
   * @public
   */
  assertArrayOf( array, type ) {
    if ( typeof type === 'string' ) {
      assert && AssertUtils.assertArray( array, array => _.every( array, element => typeof element === type ) );
    }
    else {
      assert && AssertUtils.assertArray( array, array => _.every( array, element => element instanceof type ) );
    }
  },

  /**
   * Asserts that a value is an EnumerationDeprecatedProperty, whose values are a specific type of EnumerationDeprecated.
   * @param {EnumerationDeprecatedProperty} enumerationProperty
   * @param {EnumerationDeprecated} enumeration
   * @deprecated
   */
  assertEnumerationDeprecatedPropertyOf( enumerationProperty, enumeration ) {
    assert && assert( enumerationProperty instanceof EnumerationDeprecatedProperty, 'invalid enumerationProperty' );
    assert && assert( enumerationProperty.enumeration === enumeration, 'invalid enumeration' );
  }
};

phetcommon.register( 'AssertUtils', AssertUtils );
export default AssertUtils;