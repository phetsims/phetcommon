// Copyright 2012-2015, University of Colorado Boulder

/**
 * Google analytics collection for HTML5 sims.
 * Code provided by Google and Hewlett, possibly doctored by PhET.
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

  var loadType;
  // This is the iOS app
  if ( phet.chipper.queryParameters[ 'phet-app' ] ) {
    loadType = 'phet-app';
  }
  // For the Android app, see https://github.com/phetsims/phet-android-app/issues/16
  else if ( phet.chipper.queryParameters[ 'phet-android-app' ] ) {
    loadType = 'phet-android-app';
  }
  else if ( top !== self ) {
    // Checks to see if this sim is embedded - phetsims/chipper#50
    loadType = 'embedded';
  }
  // TODO Add additional conditions for tracking hits from the installer, etc.
  else {
    loadType = 'default';
  }

  // {boolean} - Whether an error was detected with anything relating to google analytics.
  // See https://github.com/phetsims/yotta/issues/30
  var googleAnalyticsErrored = false;
  window.addEventListener( 'error', function( event ) {
    if ( event &&
         event.target &&
         event.target.src &&
         event.target.src.indexOf &&
         event.target.src.indexOf( 'google-analytics' ) >= 0 ) {
      googleAnalyticsErrored = true;
    }
  }, true );

  // {boolean} - Whether analytics.js successfully loaded, see https://github.com/phetsims/yotta/issues/30
  var googleAnalyticsLoaded = false;
  function onGoogleAnalyticsLoad() {
    googleAnalyticsLoaded = true;
  }

  var pingParams = 'pingver=3&' +
                   'project=' + encodeURIComponent( phet.chipper.project ) + '&' +
                   'brand=' + encodeURIComponent( phet.chipper.brand ) + '&' +
                   'version=' + encodeURIComponent( phet.chipper.version ) + '&' +
                   'locale=' + encodeURIComponent( phet.chipper.locale ) + '&' +
                   'buildTimestamp=' + encodeURIComponent( phet.chipper.buildTimestamp ) + '&' +
                   'domain=' + encodeURIComponent( document.domain ) + '&' +
                   'href=' + encodeURIComponent( window.location.href ) + '&' +
                   'type=html&' +
                   'timestamp=' + encodeURIComponent( Date.now() ) + '&' +
                   'loadType=' + encodeURIComponent( loadType ) + '&' +
                   'ref=' + encodeURIComponent( document.referrer );

  function pingURL( url ) {
    var img = document.createElement( 'img' );
    img.src = url;
  }

  pingURL( 'https://phet.colorado.edu/yotta/immediate.gif?' + pingParams );

  window.addEventListener( 'load', function( event ) {
    pingURL( 'https://phet.colorado.edu/yotta/sanity.gif?' + pingParams + '&' +
             'gaError=' + encodeURIComponent( googleAnalyticsErrored ) + '&' +
             'gaLoaded=' + encodeURIComponent( googleAnalyticsLoaded ) );
  }, false );

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

  // Applies custom dimensions that are common for our main, third-party, and phet-io tracker
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
    phetPageviewOptions.dimension5 = loadType;
    phetPageviewOptions.dimension6 = document.referrer;
  }

  var offlineSimLocation = 'offline/html/' + phet.chipper.project + '_' + phet.chipper.locale;

  // Put our function in the queue, to be invoked when the analytics.js has fully loaded.
  // See https://github.com/phetsims/yotta/issues/30
  window.googleAnalytics( onGoogleAnalyticsLoad );

  // Main PhET tracker
  window.googleAnalytics( 'create', {
    trackingId: 'UA-5033201-1',
    cookieDomain: 'none'
  } );
  if ( window.location.protocol === 'file:' ) {
    window.googleAnalytics( 'set', 'checkProtocolTask', null );
    window.googleAnalytics( 'set', 'checkStorageTask', null );
    window.googleAnalytics( 'set', 'location', offlineSimLocation );
  }
  window.googleAnalytics( 'send', 'pageview', phetPageviewOptions );

  // PhET iO tracker (see https://github.com/phetsims/phetcommon/issues/26)
  if ( phet.chipper.brand === 'phet-io' ) {
    window.googleAnalytics( 'create', {
      trackingId: 'UA-37615182-3',
      cookieDomain: 'none',
      name: 'io'
    } );
    if ( window.location.protocol === 'file:' ) {
      window.googleAnalytics( 'io.set', 'checkProtocolTask', null );
      window.googleAnalytics( 'io.set', 'checkStorageTask', null );
      window.googleAnalytics( 'io.set', 'location', offlineSimLocation );
    }
    window.googleAnalytics( 'io.send', 'pageview', phetPageviewOptions );
  }

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
    trackingId: 'UA-5033010-35',
    cookieDomain: 'phet.colorado.edu',
    name: 'hewlett'
  } );
  window.googleAnalytics( 'hewlett.send', 'pageview' );

  // External tracker
  if ( phet.chipper.queryParameters.ga ) {
    window.googleAnalytics( 'create', {
      trackingId: phet.chipper.queryParameters.ga,
      cookieDomain: 'none', // don't require the tracking from our site
      name: 'external'
    } );
    window.googleAnalytics( 'external.send', 'pageview', phet.chipper.queryParameters.gaPage || undefined );
  }
} )();
