// Copyright 2020, University of Colorado Boulder

/**
 * AssertUtils is a collection of utility functions for common assertions. Many of these assertions are related to
 * type-checking, useful in a weakly-typed language like JavaScript.
 *
 * To minimize performance impact, these methods should generally be called after testing for the presence of assert,
 * for example: assert && AssertUtils.assertPropertyOf( someProperty, 'number' );
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ObservableArray from '../../axon/js/ObservableArray.js';
import Property from '../../axon/js/Property.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
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
   * Asserts that a value is a Property, whose value is a specified type.
   * @param {Property} property
   * @param {string|constructor} type - primitive type (string) or object type (constructor)
   * @public
   */
  assertPropertyOf( property, type ) {
    if ( typeof type === 'string' ) {
      assert && AssertUtils.assertProperty( property, value => typeof value === type );
    }
    else {
      assert && AssertUtils.assertProperty( property, value => value instanceof type );
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
    assert && assert( typeof value === 'number' && Utils.isInteger( value ), 'invalid value' );
    if ( predicate ) {
      assert && assert( predicate( value ), `value does not satisfy predicate: ${value}` );
    }
  },

  /**
   * Asserts that a value is a positive integer.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  assertPositiveInteger( value ) {
    assert && AssertUtils.assertInteger( value, value => value > 0 );
  },

  /**
   * Asserts that a value is a Range, whose value is between min and max, inclusive.
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
   * Asserts that a value is an ObservableArray, with elements of a specific type.
   * @param {ObservableArray} observableArray
   * @param {string|constructor} type - primitive type (string) or object type (constructor)
   * @public
   */
  assertObservableArrayOf( observableArray, type ) {
    assert && assert( observableArray instanceof ObservableArray, 'array is not an ObservableArray' );
    assert && AssertUtils.assertArrayOf( observableArray.getArray(), type );
  }
};

phetcommon.register( 'AssertUtils', AssertUtils );
export default AssertUtils;