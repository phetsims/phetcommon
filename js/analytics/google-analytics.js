// Copyright 2012-2021, University of Colorado Boulder

/**
 * Google analytics collection for HTML5 sims.
 * Code provided by Google and Hewlett, possibly doctored by PhET.
 *
 * NOTE: Please be careful about modifications, as it relies on external scripts.
 *
 * @author Sam Reid
 */

( function() {
  

  assert && assert( window.phet && phet.chipper, 'We will require multiple things from the chipper preload namespace' );
  assert && assert( !!phet.chipper.brand, 'A brand is required, since some messages depend on the brand' );
  assert && assert( !!phet.chipper.queryParameters, 'We will need query parameters to be parsed for multiple purposes' );
  assert && assert( !!phet.chipper.buildTimestamp, 'buildTimestamp is required for GA messages' );
  assert && assert( !!phet.chipper.project, 'project is required for GA messages' );
  assert && assert( !!phet.chipper.version, 'version is required for GA messages' );
  assert && assert( !!phet.chipper.locale, 'locale is required for GA messages' );

  const ua = navigator.userAgent;
  const hasIESecurityRestrictions = !!( ua.match( /MSIE/ ) || ua.match( /Trident\// ) || ua.match( /Edge\// ) );

  // If we're in some form of IE running offline, don't attempt to make a cross-origin request.
  // See https://github.com/phetsims/joist/issues/164
  if ( window.location.protocol === 'file:' && hasIESecurityRestrictions ) {
    return;
  }

  // Don't track sims that we didn't develop
  if ( phet.chipper.brand !== 'phet' && phet.chipper.brand !== 'phet-io' ) {
    return;
  }

  let loadType;
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
  // TODO Add additional conditions for tracking hits from the installer, etc. See https://github.com/phetsims/phetcommon/issues/49
  else {
    loadType = 'default';
  }

  function sendMessages() {
    // {boolean} - Whether an error was detected with anything relating to google analytics.
    // See https://github.com/phetsims/yotta/issues/30
    let googleAnalyticsErrored = false;
    window.addEventListener( 'error', event => {
      if ( event &&
           event.target &&
           event.target.src &&
           event.target.src.indexOf &&
           event.target.src.indexOf( 'google-analytics' ) >= 0 ) {
        googleAnalyticsErrored = true;
      }
    }, true );

    // {boolean} - Whether analytics.js successfully loaded, see https://github.com/phetsims/yotta/issues/30
    let googleAnalyticsLoaded = false;

    function onGoogleAnalyticsLoad() {
      googleAnalyticsLoaded = true;
    }

    const pingParams = `${'pingver=3&' +
                       'project='}${encodeURIComponent( phet.chipper.project )}&` +
                       `brand=${encodeURIComponent( phet.chipper.brand )}&` +
                       `version=${encodeURIComponent( phet.chipper.version )}&` +
                       `locale=${encodeURIComponent( phet.chipper.locale )}&` +
                       `buildTimestamp=${encodeURIComponent( phet.chipper.buildTimestamp )}&` +
                       `domain=${encodeURIComponent( document.domain )}&` +
                       `href=${encodeURIComponent( window.location.href )}&` +
                       'type=html&' +
                       `timestamp=${encodeURIComponent( Date.now() )}&` +
                       `loadType=${encodeURIComponent( loadType )}&` +
                       `ref=${encodeURIComponent( document.referrer )}`;

    function pingURL( url ) {
      const img = document.createElement( 'img' );
      img.src = url;
    }

    pingURL( `https://phet.colorado.edu/yotta/immediate.gif?${pingParams}` );

    window.addEventListener( 'load', event => {
      pingURL( `https://phet.colorado.edu/yotta/sanity.gif?${pingParams}&` +
               `gaError=${encodeURIComponent( googleAnalyticsErrored )}&` +
               `gaLoaded=${encodeURIComponent( googleAnalyticsLoaded )}` );
    }, false );

    // Google Analytics snippet for loading the API
    ( function( i, s, o, g, r, a, m ) {
      i.GoogleAnalyticsObject = r;
      i[ r ] = i[ r ] || function() {
        // eslint-disable-next-line prefer-rest-params
        ( i[ r ].q = i[ r ].q || [] ).push( arguments );
      }, i[ r ].l = 1 * new Date(); // eslint-disable-line no-sequences
      a = s.createElement( o ), m = s.getElementsByTagName( o )[ 0 ]; // eslint-disable-line no-sequences
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore( a, m );
    } )( window, document, 'script', `${document.location.protocol === 'https:' ? 'https:' : 'http:'}//www.google-analytics.com/analytics.js`, 'googleAnalytics' );

    // Applies custom dimensions that are common for our main, third-party, and phet-io tracker
    const phetPageviewOptions = {};

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

    const offlineSimLocation = `offline/html/${phet.chipper.project}_${phet.chipper.locale}`;

    // Put our function in the queue, to be invoked when the analytics.js has fully loaded.
    // See https://github.com/phetsims/yotta/issues/30
    window.googleAnalytics( onGoogleAnalyticsLoad );

    // Main PhET tracker
    window.googleAnalytics( 'create', {
      trackingId: 'UA-5033201-1',
      storage: 'none',
      cookieDomain: 'none'
    } );
    if ( window.location.protocol === 'file:' ) {
      window.googleAnalytics( 'set', 'checkProtocolTask', null );
      window.googleAnalytics( 'set', 'checkStorageTask', null );
      window.googleAnalytics( 'set', 'location', offlineSimLocation );
    }
    window.googleAnalytics( 'set', 'anonymizeIp', true );
    window.googleAnalytics( 'send', 'pageview', phetPageviewOptions );

    // PhET iO tracker (see https://github.com/phetsims/phetcommon/issues/26)
    if ( phet.chipper.brand === 'phet-io' ) {
      window.googleAnalytics( 'create', {
        trackingId: 'UA-37615182-3',
        storage: 'none',
        cookieDomain: 'none',
        name: 'io'
      } );
      if ( window.location.protocol === 'file:' ) {
        window.googleAnalytics( 'io.set', 'checkProtocolTask', null );
        window.googleAnalytics( 'io.set', 'checkStorageTask', null );
        window.googleAnalytics( 'io.set', 'location', offlineSimLocation );
      }
      window.googleAnalytics( 'io.set', 'anonymizeIp', true );
      window.googleAnalytics( 'io.send', 'pageview', phetPageviewOptions );
    }

    // Third-party PhET tracker (excludes non-third-party usage, see https://github.com/phetsims/yotta/issues/12)
    if ( window.location.protocol !== 'file:' &&
         !document.domain.match( /(.*\.colorado\.edu\.?$)|(^localhost$)|(^127\.0\.0\.1$)/ ) ) {
      window.googleAnalytics( 'create', {
        trackingId: 'UA-37615182-2',
        storage: 'none',
        cookieDomain: 'none',
        name: 'thirdParty'
      } );
      window.googleAnalytics( 'thirdParty.set', 'anonymizeIp', true );
      window.googleAnalytics( 'thirdParty.send', 'pageview', phetPageviewOptions );
    }

    // Hewlett tracker
    window.googleAnalytics( 'create', {
      trackingId: 'UA-5033010-35',
      storage: 'none',
      cookieDomain: 'phet.colorado.edu',
      name: 'hewlett'
    } );
    window.googleAnalytics( 'hewlett.set', 'anonymizeIp', true );
    window.googleAnalytics( 'hewlett.send', 'pageview' );

    // External tracker
    if ( phet.chipper.queryParameters.ga ) {
      window.googleAnalytics( 'create', {
        trackingId: phet.chipper.queryParameters.ga,
        storage: 'none',
        cookieDomain: 'none', // don't require the tracking from our site
        name: 'external'
      } );
      window.googleAnalytics( 'external.set', 'anonymizeIp', true );
      window.googleAnalytics( 'external.send', 'pageview', phet.chipper.queryParameters.gaPage || undefined );
    }
  }

  if ( loadType === 'phet-app' ) {
    window.addEventListener( 'load', () => {
      setTimeout( sendMessages, 0 ); // eslint-disable-line bad-sim-text
    }, false );
  }
  else {
    sendMessages();
  }
} )();
