// Copyright 2002-2013, University of Colorado Boulder

/**
 * Google analytics collection for HTML5 sims.
 * Code provided by Google and Hewlett, possibly doctored by PhET.
 * Include this script as the last thing in your DOM's head, like this:
 * <script src='common/phetcommon/js/analytics/google-analytics.js'></script>
 *
 * NOTE: Please be careful about modifications, as it relies on external scripts.
 *
 * @author Sam Reid
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
  if ( phet.chipper ) {
    assert && assert( !phet.chipper.buildTimestamp ||
                      ( !!phet.chipper.project && !!phet.chipper.version && !!phet.chipper.locale ),
                      'Missing Google Analytics variable in' );

    if ( phet.chipper.project ) {
      phetPageviewOptions.dimension1 = phet.chipper.project; // simName custom dimension
    }
    if ( phet.chipper.version ) {
      phetPageviewOptions.dimension2 = phet.chipper.version; // simVersion custom dimension
    }
    if ( phet.chipper.locale ) {
      phetPageviewOptions.dimension3 = phet.chipper.locale; // simLocale custom dimension
    }
    if ( phet.chipper.buildTimestamp ) {
      phetPageviewOptions.dimension4 = phet.chipper.buildTimestamp; // simBuildTimestamp custom dimension
    }
  }

  // Main PhET tracker
  window.googleAnalytics( 'create', {
    trackingId: 'UA-5033201-1',
    cookieDomain: 'none'
  } );
  window.googleAnalytics( 'send', 'pageview', phetPageviewOptions );

  // Third-party PhET tracker (excludes non-third-party usage, see https://github.com/phetsims/yotta/issues/12)
  if ( window.location.protocol !== 'file:' &&
       !document.domain.match( /(.*\.colorado\.edu\.?$)|(^localhost$)|(^127\.0\.0\.1$)/ ) ) {
    window.googleAnalytics( 'create', {
      trackingId: 'UA-37615182-2',
      cookieDomain: 'none',
      name: 'thirdParty'
    } );
    window.googleAnalytics( 'thirdParty.send', 'pageview', phetPageviewOptions );
  }

  // Hewlett tracker
  window.googleAnalytics( 'create', {
    trackingId: 'UA-5033010-1',
    cookieDomain: 'phet.colorado.edu',
    name: 'hewlett'
  } );
  window.googleAnalytics( 'hewlett.send', 'pageview' );

} )();
