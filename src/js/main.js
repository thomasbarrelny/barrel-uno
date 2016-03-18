var initializeModules = require( "modules/init-modules" );
if ( document.readyState !== "loading" ) {
    initializeModules();
} else {
    document.addEventListener( "DOMContentLoaded", initializeModules );
}