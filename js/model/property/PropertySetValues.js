// Copyright 2002-2013, University of Colorado
/**
 * This is an experimental interface for setting and getting values in a PropertySet. Please do not use it.
 *
 * For example:
 * var model = new PropertySet({name:'larry',age:100});
 * var v = model.values;
 * v.age = v.age + 1;//Happy birthday!
 *
 * compare to:
 * model.age.value = model.age.value + 1;
 *
 * In one sense, it is a way to factor out the '.value' call for getters and setters of Property instances.
 * In GoPauseButton, this pattern is used 8 times over 64 lines of code, so I guess it could be a convenient feature in some cases.
 * However, I do have serious concerns about confusing a PropertySet with a PropertySetValues and how to name vars for them.
 *
 * TODO: Support new properties added to PropertySet (when PropertySet supports it)
 *
 * @author Sam Reid
 */

define( function( require ) {
  "use strict";

  var Property = require( 'PHETCOMMON/model/property/Property' );

  /**
   * @class PropertySetValues
   * @constructor
   * @param propertySet the propertySet to use to get/set values
   */
  function PropertySetValues( propertySet ) {
    var propertySetValues = this;
    this.propertySet = propertySet;

    propertySet.keys.forEach( function( key ) {
      propertySetValues.createProperty( key );
    } );
  }

  PropertySetValues.prototype = {
    //Taken from https://gist.github.com/dandean/1292057, same as in github/Atlas
    createProperty: function( name ) {
      var p = this.propertySet[name];
      Object.defineProperty( this, name, {
        get: function() { return p.value; },
        set: function( value ) { p.value = value;},

        // Make it configurable and enumerable so it's easy to override...
        configurable: true,
        enumerable: true
      } );
    }
  };

  return PropertySetValues;
} );