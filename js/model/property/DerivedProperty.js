// Copyright 2002-2013, University of Colorado
/**
 * A CompositeProperty is computed based on other properties.  It is also known as a derived/computed property.
 *
 * TODO: Inherit from ObservableProperty?
 * @author Sam Reid
 */

define( function( require ) {
  "use strict";

  var Property = require( 'PHETCOMMON/model/property/Property' );

  /**
   * Create a DerivedProperty.  Arguments are: property1,...,propertyN,derivationFunction
   * Example: new DerivedProperty(name,age,function(name,age){return name+' is '+age+' yrs old'});
   * TODO: I prefer to omit the [] at the call site, but this could be rewritten with named parameters like this if needs be
   * function DerivedProperty(properties,derivationFunction)
   * @constructor
   */
  function DerivedProperty( /*arguments are property1,property2,...propertyN, derivationFunction*/ ) {
    var args = Array.prototype.slice.call( arguments );
    this.derivation = args.pop();//Remove last item and use it as the derivation function
    this.dependencies = args;
    this.observers = [];

    var derivedProperty = this;

    //When any of the dependencies change, see if the value has changed
    //If the value has changed, send out notification.
    function update() {

      //TODO: Could just re-evaluate the changed property instead of recomputing all of them, right?
      var args = derivedProperty.dependencies.map( function( property ) { return property.get(); } );
      var newValue = derivedProperty.derivation.apply( null, args );

      //Send out notifications if the value has truly changed
      if ( newValue !== derivedProperty._value ) {
        var oldValue = derivedProperty._value;
        derivedProperty._value = newValue; //Store the value so it can be compared against next time, and for the value getter
        derivedProperty.observers.forEach( function( observer ) { observer( newValue, oldValue ); } );
      }
    }

    this.dependencies.forEach( function( property ) {
      property.link( update );//todo: no need to call these all back right away.  Perhaps we should have a way to add observers that doesn't call back right away?
    } );
  }

  //TODO: _value could be made private if we moved these functions to the constructor, but I don't think it is necessary
  DerivedProperty.prototype = {

    /**
     * Get the current value of this DerivedProperty.
     * @returns {*}
     */
    get value() {
      return this._value;
    },

    /**
     * Add an observer to this DerivedProperty
     * @param observer
     */
    link: function( observer ) {
      this.observers.push( observer );
      observer( this._value );
    }
  };

  return DerivedProperty;
} );