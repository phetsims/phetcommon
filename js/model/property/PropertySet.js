// Copyright 2002-2013, University of Colorado
/**
 * A PropertySet is a set of Property instances that provides support for:
 * -Easily creating several properties using an object literal (hash)
 * -Resetting them as a group
 * -TODO: Convenient toString that prints e.g., PropertySet{name:'larry',age:101,kids:['alice','bob']}
 * -TODO: Wiring up to listen to multiple properties simultaneously?
 * -TODO: function to add properties after the PropertySet is created?  Don't forget to add to the key list as well.
 * -TODO: Make it easy to mix-in with model classes?
 *
 * These properties are meant to be stored base properties, not derived (computed/composite) properties.
 *
 * Sample usage:
 * var p = new PropertySet( {name: 'larry', age: 100, kids: ['alice', 'bob']} );
 * p.name.link( function( n ) {console.log( 'hello ' + n );} );
 * p.name.value = 'jensen';
 * p.age.value = 101;//Happy Birthday!
 * console.log( p );
 * p.reset();
 * console.log( p );
 *
 * @author Sam Reid
 */

define( function( require ) {
  "use strict";

  var Property = require( 'PHETCOMMON/model/property/Property' );

  /**
   * @class PropertySet
   * @constructor
   * @param values an object hash with the initial values for the properties
   */
  function PropertySet( values ) {
    var propertySet = this;

    //Keep track of the keys so we know which to reset
    this.keys = [];

    Object.getOwnPropertyNames( values ).forEach( function( val ) {
      propertySet[val] = new Property( values[val] );
      propertySet.keys.push( val );
    } );
  }

  PropertySet.prototype = {

    //Resets all of the properties associated with this PropertySet 
    reset: function() {
      var propertySet = this;
      this.keys.forEach( function( key ) {
        propertySet[key].reset();
      } );
    }
  };

  return PropertySet;
} );