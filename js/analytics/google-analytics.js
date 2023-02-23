// Copyright 2012-2023, University of Colorado Boulder

/**
 * Google analytics collection for HTML5 sims.
 * Code provided by Google and Hewlett, possibly doctored by PhET.
 *
 * NOTE: Please be careful about modifications, as it relies on external scripts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
               `gaLoaded=${encodeURIComponent( false )}` );
    }, false );

    // External UA (Google Analytics) tracker
    if ( phet.chipper.queryParameters.ga ) {
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

      window.googleAnalytics( 'create', {
        trackingId: phet.chipper.queryParameters.ga,
        storage: 'none',
        cookieDomain: 'none', // don't require the tracking from our site
        name: 'external'
      } );
      window.googleAnalytics( 'external.set', 'anonymizeIp', true );
      window.googleAnalytics( 'external.send', 'pageview', phet.chipper.queryParameters.gaPage || undefined );
    }

    // External GA4 tracker
    if ( phet.chipper.queryParameters.ga4 ) {
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
      gtag( 'config', phet.chipper.queryParameters.ga4 );

      // Dynamically load the script
      const firstScript = document.getElementsByTagName( 'script' )[ 0 ];
      const script = document.createElement( 'script' );
      script.async = true;

      // `l` query parameter allows a different data layer name
      script.src = `https://www.googletagmanager.com/gtag/js?id=${phet.chipper.queryParameters.ga4}&l=ga4DataLayer`;
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
    window.addEventListener( 'load', () => {
      setTimeout( sendMessages, 0 ); // eslint-disable-line bad-sim-text
    }, false );
  }
  else {
    sendMessages();
  }
} )();
