// Copyright 2012-2015, University of Colorado Boulder

/**
 * Google analytics collection for HTML5 sims.
 * Code provided by Google and Hewlett, possibly doctored by PhET.
 * Include this script as the last thing in your DOM's head, like this:
 * <script src='common/phetcommon/js/analytics/google-analytics.js'></script>
 *
 * NOTE: Please be careful about modifications, as it relies on external scripts.
 *
 * @author Sam Reid
 * @author Matt Pennington
 */

( function() {
  'use strict';

  var ua = navigator.userAgent;
  var hasIESecurityRestrictions = !!( ua.match( /MSIE/ ) || ua.match( /Trident\// ) || ua.match( /Edge\// ) );

  // If we're in some form of IE running offline, don't attempt to make a cross-origin request.
  // See https://github.com/phetsims/joist/issues/164
  if ( window.location.protocol === 'file:' && hasIESecurityRestrictions ) {
    return;
  }

  // Don't track sims that we didn't develop
  if ( phet.chipper.brand !== 'phet' && phet.chipper.brand !== 'phet-io' ) {
    return;
  }

  // Google Analytics snippet for loading the API
  (function( i, s, o, g, r, a, m ) {
    i.GoogleAnalyticsObject = r;
    i[ r ] = i[ r ] || function() {
      (i[ r ].q = i[ r ].q || []).push( arguments );
    }, i[ r ].l = 1 * new Date();
    a = s.createElement( o ), m = s.getElementsByTagName( o )[ 0 ];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore( a, m );
  })( window, document, 'script', ( 'https:' === document.location.protocol ? 'https:' : 'http:' ) + '//www.google-analytics.com/analytics.js', 'googleAnalytics' );

  // Applies custom dimensions that are common for our main and third-party tracker
  var phetPageviewOptions = {};
  var phetEventOptions = {}
  if ( phet.chipper ) {
    assert && assert( !phet.chipper.buildTimestamp ||
                      ( !!phet.chipper.project && !!phet.chipper.version && !!phet.chipper.locale ),
                      'Missing Google Analytics variable in' );
                      
	phetEventOptions.eventCategory = 'Simulation Run';
    if ( phet.chipper.project ) {
      phetPageviewOptions.dimension1 = phet.chipper.project; // simName custom dimension
      phetEventOptions.eventAction = phet.chipper.project; 
    }
    if ( phet.chipper.version ) {
	    phetEventOptions.dimension2 = phet.chipper.version;
      phetPageviewOptions.dimension2 = phet.chipper.version; // simVersion custom dimension
    }
    if ( phet.chipper.locale ) {
      phetEventOptions.eventLabel = phet.chipper.locale + "from" + window.location.href
      phetPageviewOptions.dimension3 = phet.chipper.locale; // simLocale custom dimension
    }
    if ( phet.chipper.buildTimestamp ) {
      phetPageviewOptions.dimension4 = phet.chipper.buildTimestamp; // simBuildTimestamp custom dimension
      phetEventOptions.dimension4 = phet.chipper.buildTimestamp; 
    }
  }

  
  var mainId = 'UA-5033201-1';
  var ioId = 'UA-37615182-3';
  var thirdPartyId = 'UA-37615182-2';
  var hewlettId = 'UA-5033010-35';
  
  if ( window.location.protocol !== "chrome-extension:" ) {
    // Main PhET tracker
    window.googleAnalytics( 'create', {
      trackingId: mainId,
      cookieDomain: 'none'
    } );
    window.googleAnalytics( 'send', 'pageview', phetPageviewOptions );

    // PhET iO tracker (see https://github.com/phetsims/phetcommon/issues/26)
    if ( phet.chipper.brand === 'phet-io' ) {
      window.googleAnalytics( 'create', {
        trackingId: ioId,
        cookieDomain: 'none',
        name: 'io'
      } );
      window.googleAnalytics( 'io.send', 'pageview', phetPageviewOptions );
    }

    // Third-party PhET tracker (excludes non-third-party usage, see https://github.com/phetsims/yotta/issues/12)
    if ( window.location.protocol !== 'file:' &&
         !document.domain.match( /(.*\.colorado\.edu\.?$)|(^localhost$)|(^127\.0\.0\.1$)/ ) ) {
    window.googleAnalytics( 'create', {
        trackingId: thirdPartyId,
        cookieDomain: 'none',
        name: 'thirdParty'
      } );
      window.googleAnalytics( 'thirdParty.send', 'pageview', phetPageviewOptions );
    }

    // Hewlett tracker
    window.googleAnalytics( 'create', {
      trackingId: hewlettId,
      cookieDomain: 'phet.colorado.edu',
      name: 'hewlett'
    } );
    window.googleAnalytics( 'hewlett.send', 'pageview' );
  }
  // If we are in a chrome app, send GA metrics to a non-sandboxed script
  else {
    var message = {};
    message.brand = phet.chipper.brand
      message.trackers = [];
      message.trackers.push( mainId );
    if ( phet.chipper.brand === 'phet-io' ) {
      message.trackers.push( ioId );
    }
    if ( window.location.protocol !== 'file:' &&
         !document.domain.match( /(.*\.colorado\.edu\.?$)|(^localhost$)|(^127\.0\.0\.1$)/ ) ) {
      message.trackers.push( thirdPartyId );
    }
      message.trackers.push( hewlettId );
    message.phetEventOptions = phetEventOptions;
    parent.postMessage( message, window.location.href );
  }
	
} )();
