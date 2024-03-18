// Copyright 2002-2013, University of Colorado Boulder

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

  // If yotta has been turned off by query parameter, don't send any messages.
  if ( phet.chipper.getQueryParameter( 'yotta' ) === 'false' ) {
    return;
  }

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
  if ( phet.chipper.getQueryParameter( 'phet-app' ) ) {
    loadType = 'phet-app';
  }
  // For the Android app, see https://github.com/phetsims/phet-android-app/issues/16
  else if ( phet.chipper.getQueryParameter( 'phet-android-app' ) ) {
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


  function sendMessages() {

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

    // Forward yotta-specific query parameters, see https://github.com/phetsims/phetcommon/issues/66
    ( new URLSearchParams( window.location.search ) ).forEach( function( value, key ) {
      if ( key.startsWith( 'yotta' ) ) {
        pingParams += `&${encodeURIComponent( key )}=${encodeURIComponent( value )}`;
      }
    } );

    function pingURL( url ) {
      var img = document.createElement( 'img' );
      img.src = url;
    }

    pingURL( 'https://phet.colorado.edu/yotta/immediate.gif?' + pingParams );

    window.addEventListener( 'load', function( event ) {
      pingURL( 'https://phet.colorado.edu/yotta/sanity.gif?' + pingParams + '&' +
               'gaError=' + encodeURIComponent( googleAnalyticsErrored ) + '&' +
               'gaLoaded=' + encodeURIComponent( false ) );
    }, false );

    // External GA4 tracker
    if ( phet.chipper.getQueryParameter( 'ga4' ) ) {
      // Use a custom data layer to both (a) get gtag.js and gtm to work at the same time, and (b) don't provide the
      // extra data to third parties by default
      window.ga4DataLayer = window.ga4DataLayer || [];

      // NOTE: Using the GA-provided function here, to be extra cautious.
      function gtag() { ga4DataLayer.push( arguments ); } // eslint-disable-line no-inner-declarations,no-undef,prefer-rest-params

      gtag( 'js', new Date() );
      gtag( 'consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'granted'
      } );
      // EEA analytics storage denied for cookies, see https://github.com/phetsims/website/issues/1190
      gtag( 'consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        region: [ 'BE', 'BG', 'CZ', 'DK', 'CY', 'LV', 'LT', 'LU', 'ES', 'FR', 'HR', 'IT', 'PL', 'PT', 'RO', 'SI', 'HU', 'MT', 'NL', 'AT', 'IS', 'LI', 'NO', 'SK', 'FI', 'SE', 'DE', 'EE', 'IE', 'EL' ]
      } );
      gtag( 'config', phet.chipper.getQueryParameter( 'ga4' ) );

      // Dynamically load the script
      var firstScript = document.getElementsByTagName( 'script' )[ 0 ];
      var script = document.createElement( 'script' );
      script.async = true;

      // `l` query parameter allows a different data layer name
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + phet.chipper.getQueryParameter( 'ga4' ) + '&l=ga4DataLayer';
      firstScript.parentNode.insertBefore( script, firstScript );
    }

    // For some reason, having dataLayer declaration here might have fixed the ability to use gtag.js and gtm.js at the
    // same time. Don't move without testing.
    window.dataLayer = window.dataLayer || [];
    function gtmTag() {
      window.dataLayer.push( arguments ); // eslint-disable-line prefer-rest-params
    }
    gtmTag( 'consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'granted'
    } );
    // EEA analytics storage denied for cookies, see https://github.com/phetsims/website/issues/1190
    gtmTag( 'consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      region: [ 'BE', 'BG', 'CZ', 'DK', 'CY', 'LV', 'LT', 'LU', 'ES', 'FR', 'HR', 'IT', 'PL', 'PT', 'RO', 'SI', 'HU', 'MT', 'NL', 'AT', 'IS', 'LI', 'NO', 'SK', 'FI', 'SE', 'DE', 'EE', 'IE', 'EL' ]
    } );
    window.dataLayer.push( {
      simBrand: phet.chipper.brand,
      simName: phet.chipper.project,
      simVersion: phet.chipper.version,
      simLocale: phet.chipper.locale,
      simBuildTimestamp: phet.chipper.buildTimestamp,
      simLoadType: loadType,
      documentReferrer: document.referrer
    } );

    // Google Tag Manager (gtm.js) - Identical to recommended snippet with eslint disables to keep it this way.
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WLNGBXD'); // eslint-disable-line space-infix-ops,space-in-parens,comma-spacing,key-spacing,one-var,semi-spacing,eqeqeq,computed-property-spacing,no-var,one-var-declaration-per-line,object-curly-spacing,space-before-blocks
  }

  if ( loadType === 'phet-app' ) {
    window.addEventListener( 'load', function() {
      setTimeout( sendMessages, 0 );
    }, false );
  }
  else {
    sendMessages();
  }
} )();
