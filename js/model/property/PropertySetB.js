// Copyright 2002-2013, University of Colorado
/**
 * Experimental implementation of PropertySet that makes it easy to access values and still use properties.  Copied from PropertySet.
 * Do not use until this has been cleaned up.
 *
 * A PropertySet is a set of Property instances that provides support for:
 * -Easily creating several properties using an object literal (hash)
 * -Resetting them as a group
 * -Set multiple values at once, using propertySet.set({x:100,y:200,name:'alice'});
 * -TODO: Convenient toString that prints e.g., PropertySet{name:'larry',age:101,kids:['alice','bob']}
 * -TODO: Wiring up to listen to multiple properties simultaneously?
 * -TODO: function to add properties after the PropertySet is created?  Don't forget to add to the key list as well.  Should also link to PropertySetValues if we continue development on that.
 * -TODO: Make it easy to mix-in with model classes?  Subclassing PropertySet already works fairly well, so this may good enough already.
 * -TODO: Type checking, so that a boolean input will be automatically generated as BooleanProperty, etc.
 * -TODO: Should this be called Model or perhaps something even better?
 *
 * These properties are meant to be stored base properties, not derived (computed/composite) properties.
 *
 * Sample usage:
 * var p = new PropertySet( {name: 'larry', age: 100, kids: ['alice', 'bob']} );
 * p.nameProperty.link( function( n ) {console.log( 'hello ' + n );} );
 * p.name = 'jensen';
 * p.age = 101;//Happy Birthday!
 * console.log( p );
 * p.reset();
 * console.log( p );
 * p.set({name:'clark',age:102,kids:['alice','bob','charlie']});
 * p.values = {name:'clark',age:102,kids:['alice','bob','charlie']}; //TODO: should we support this es5 way of doing it?  I kind of like it better than set
 *                                                                   //But it could be overloaded/confused with get values()
 *
 * How would this be done without PropertySet (for comparison)?
 * //Normally would be created in a class but that is omitted here for brevity.
 * var p ={name: new Property('larry'), age: new Property('age'), kids: new Property(['alice','bob'])}
 * p.reset = function(){
 *   this.name.reset(); 
 *   this.age.reset();
 *   this.kids.reset();
 * }
 * p.name.set('clark');
 * p.age.set('102');
 * p.kids.set(['alice','bob','charlie']);
 *
 * @author Sam Reid
 */

define( function( require ) {
  "use strict";

  var Property = require( 'PHETCOMMON/model/property/Property' );
  var DerivedProperty = require( 'PHETCOMMON/model/property/DerivedProperty' );

  //See http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
  function construct( constructor, args ) {
    function F() {
      return constructor.apply( this, args );
    }

    F.prototype = constructor.prototype;
    return new F();
  }

  /**
   * @class PropertySet
   * @constructor
   * @param values an object hash with the initial values for the properties
   */
  function PropertySet( values ) {
    var propertySet = this;

    //Keep track of the keys so we know which to reset
    this.keys = [];

    Object.getOwnPropertyNames( values ).forEach( function( value ) {
      propertySet.addGetterAndSetter( value );
      propertySet[value + 'Property'] = new Property( values[value] );
      propertySet.keys.push( value );
    } );
  }

  PropertySet.prototype = {

    //Taken from https://gist.github.com/dandean/1292057, same as in github/Atlas
    addGetterAndSetter: function( name ) {
      var propertyName = name + 'Property';
      Object.defineProperty( this, name, {

        // Getter proxies to Model#get()...
        get: function() { return this[propertyName].get()},

        // Setter proxies to Model#set(attributes)
        set: function( value ) { this[propertyName].set( value );},

        // Make it configurable and enumerable so it's easy to override...
        configurable: true,
        enumerable: true
      } );
    },

    addGetter: function( name ) {
      var propertyName = name + 'Property';
      Object.defineProperty( this, name, {

        get: function() { return this[propertyName].value},//TODO: rewrite with get() for performance?

        // Make it configurable and enumerable so it's easy to override...
        configurable: true,
        enumerable: true
      } );
    },

    //Resets all of the properties associated with this PropertySet 
    reset: function() {
      var propertySet = this;
      this.keys.forEach( function( key ) {
        propertySet[key + 'Property'].reset();
      } );
    },

    addDerivedProperty: function( name, properties_, derivationFunction ) {
      var args = Array.prototype.slice.call( arguments, 0 );
      args.splice( 0, 1 );//Remove the name
      this[name + 'Property'] = construct( DerivedProperty, args );//TODO: different naming convention since it is a derived property and cannot have its value set?  I would recommend same naming convention since it has observableProperty interface and using different words would be confusing
      this.addGetter( name );
    },

    /**
     * Set all of the values specified in the object hash
     * Allows you to use this form:
     * puller.set( {x: knot.x, y: knot.y, knot: knot} );
     *
     * instead of this:
     * puller.x.value = knot.x;
     * puller.y.value = knot.y;
     * puller.knot.value = knot;
     *
     * Throws an error if you try to set a value for which there is no property.
     */
    set: function( values ) {
      var propertySet = this;
      Object.getOwnPropertyNames( values ).forEach( function( val ) {
        if ( typeof(propertySet[val + 'Property'] === 'Property') ) {
          propertySet[val + 'Property'].set( values[val] );
        }
        else {
          throw new Error( 'property not found: ' + val );
        }
      } );
    }
  };

  return PropertySet;
} );