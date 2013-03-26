// Copyright 2013, University of Colorado

/**
 * Utility functions for implementing inheritance.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define(
  [],
  function () {
    "use strict";

    function Inheritance() {
    }

    /**
     * Use this function to do prototype chaining using Parasitic Combination Inheritance.
     * Instead of calling the supertype's constructor to assign a prototype (as is done
     * in Combination Inheritance), you create a copy of the supertype's prototype.
     * <br>
     * Here's the basic pattern:
     * <br>
     * <code>
     * function Supertype(...) {...}
     *
     * function Subtype(...) {
     *     Supertype.call(this, ...); // constructor stealing, called second
     *     ...
     * }
     *
     * inheritPrototype( Subtype, Supertype ); // prototype chaining, called first
     * </code>
     * <br>
     * (source: JavaScript for Web Developers, N. Zakas, Wrox Press, p. 212-215)
     */
    Inheritance.inheritPrototype = function ( subtype, supertype ) {
      var prototype = Object( supertype.prototype ); // create a clone of the supertype's prototype
      prototype.constructor = subtype; // account for losing the default constructor when prototype is overwritten
      subtype.prototype = prototype; // assign cloned prototype to subtype
    };


    /**
     * A somewhat ugly method of calling an overridden super-type method.
     * <p>
     * Example:
     * <code>
     * function SuperType() {
     * }
     *
     * SuperType.prototype.reset = function() {...}
     *
     * function SubType() {
     *    SuperType.call( this ); // constructor stealing
     * }
     *
     * SubType.prototype = new SuperType(); // prototype chaining
     *
     * SubType.prototype.reset = function() {
     *     Inheritance.callSuper( SuperType, "reset", this ); // call overridden super method
     *     // do subtype-specific stuff
     * }
     * </code>
     *
     * @param supertype
     * @param {String} name
     * @param context typically this
     * @return {Function}
     */
    Inheritance.callSuper = function ( supertype, name, context ) {
      (function () {
        var fn = supertype.prototype[name];
        Function.call.apply( fn, arguments );
      })( context );
    };

    return Inheritance;
  }
);
