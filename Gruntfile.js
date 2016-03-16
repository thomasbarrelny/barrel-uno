var glob = require( "glob" );
var fs = require( "fs" );
var path = require( "path" );

function getThemeModules() {
    var moduleFiles = glob.sync( "./src/js/modules/**/*.js" );
    var modules = [];

    for ( var i = 0; i < moduleFiles.length; i++ ) {
        var name = path.basename( moduleFiles[ i ], ".js" );

        modules.push({
            file: "./" + moduleFiles[ i ],
            expose: "modules/" + name
        });
    }

    return modules;
}

module.exports = function( grunt ) {
    grunt.initConfig({

    	// Store project settings from 'package.json' file into the 'pkg' property.
		pkg: grunt.file.readJSON( "package.json" ),

        assemble: {
            options: {
                layout: "./src/layout/default.hbs",
                partials: "./src/partials/**/*.hbs",
                data: [ "./src/data/**/*.{json,yml}", "./src/assets/**/*.{json,yml}" ],
                assets: "./dist/assets"
            },
            pages: {
                files: [ {
                    cwd: "./src/pages/",
                    dest: "./dist/",
                    expand: true,
                    src: [ "**/*.hbs" ]
                } ]
            },
            updates: {
                files: [ {
                    cwd: "./src/pages/updates",
                    dest: "./dist/updates",
                    expand: true,
                    src: [ "**/*.hbs" ]
                } ]
            }
        },

        // Parse CSS files and add vendor-prefixed CSS properties using the "Can I Use" database.
        autoprefixer: {
            dist: {
                options: {
                    browsers: [ "last 2 versions", "> 1%" ]
                },
                files: {
                    "./dist/styles/main.css": "./dist/styles/main.css"
                }
            }
        },

        browserify: {
            options: {
                browserifyOptions:{
                    debug:true
                },
                preBundleCB: function( b ) {
                    // Bundle all scripts from the modules folder.
                    b.require( getThemeModules() );

                    // Add minify plugin w/ source map options.
                    b.plugin( "minifyify", {
                        map: "./src/js/main.js.map",
                        output: "./dist/js/main.min.js.map",
                        compressPath: function( p ) {
                            // Start relative paths from root.
                            return path.join( "../../", p );
                        }
                    });
                }
            },
            client: {
                src: [ "src/js/main.js" ],
                dest: "dist/js/main.min.js"
            }
        },

        // Clean files and folders.
        clean: {
            all: [ "./dist/**" ]
        },

        // Start a connect web server.
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: "./dist/"
                }
            }
        },

        // Copy files and folder.
        copy: {
            options: {
                // Exclude binary format from the processContent function.
                processContentExclude: [
                    "**/*.{png,gif,jpg,ico,psd,ttf,otf,woff,svg}"
                ]
            },
            all: {
                files: [
                    { expand: true, cwd: "src/", src: [ "assets/**" ], dest: "dist/" }
                ]
            }
        },

        // Minify CSS files.
        cssmin: {
            add_banner: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                    report: "gzip"
                },
                files: {
                    "./dist/styles/main.min.css": "./dist/styles/main.css"
                }
            }
        },

        // Check JS code style.
        jscs: {
            src: [ "src/js/**/*.js" ],
            options: {
                config: ".jscsrc",
                // If you use ES6 http://jscs.info/overview.html#esnext.
                esnext: false,
                // If you need output with rule names http://jscs.info/overview.html#verbose.
                verbose: true,
                // Autofix code style violations when possible.
                fix: true,
                maximumLineLength: {
                    value: 100,
                    allExcept: [ "regex", "comments", "urlComments" ]
                },
                validateQuoteMarks: { "mark": "\"", "escape": true }
            }
        },

        // Validate JS files.
        jshint: {
            // Define the files to lint.
            files: [ "Gruntfile.js", "src/js/**/*.js", "test/**/*.js" ],
            // Configure JSHint (documented at http://www.jshint.com/docs/).
            options: {
                // More options here if you want to override JSHint defaults.
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },

        // Compile sass files to css.
        sass: {
            dist: {
                files: {
                    "./dist/styles/main.css": "./src/sass/main.scss"
                }
            }
        },

        // Minify JS files.
        uglify: {
            compress: {
                files: {
                    "assets/js/vendor.min.js": [ "src/js/vendors/**/*.js" ]
                },
                options: {
                    mangle: true
                }
            }
        },

        // Generate custom icon webfonts from SVG files.
        webfont: {
            icons: {
                src: "src/icons/*.svg",
                dest: "src/assets/fonts",
                destCss: "src/sass/fonts",
                options: {
                    stylesheet: "scss",
                    relativeFontPath: "../assets/fonts",
                    types: "eot,woff,ttf,svg",
                    templateOptions: {
                        baseClass: "icon",
                        classPrefix: "icon-"
                    }
                }
            }
        },

        // Run the following tasks whenever watched file patterns are added, changed or deleted.
        watch: {
            html: {
                files: [ "./src/pages/**/*", "./src/partials/**/*", "./src/layout/**/*", "./src/data/**" ],
                tasks: [ "html" ]
            },
            sass: {
                files: [ "./src/sass/**/*.scss" ],
                tasks: [ "style" ]
            },
            css: {
                files: [ "./dist/styles/*.css" ]
            },
            livereload: {
                files: [ "./dist/**/*" ],
                options: { livereload: true }
            },
            browserify: {
                options: {
                    livereload:true,
                    spawn: false
                },
                files: [ "<%= jshint.files %>" ],
                tasks: [ "js" ]
            }
        }

    });

	// Load plugins.
    grunt.loadNpmTasks( "grunt-assemble" );
    grunt.loadNpmTasks( "grunt-autoprefixer" );
    grunt.loadNpmTasks( "grunt-browserify" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-connect" );
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    grunt.loadNpmTasks( "grunt-contrib-cssmin" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-jscs" );
    grunt.loadNpmTasks( "grunt-sass" );
    grunt.loadNpmTasks( "grunt-webfont" );

	// Group tasks declaration.
    grunt.registerTask( "html", [ "assemble", "copy" ]);
    grunt.registerTask( "js", [ "jshint", "jscs", "browserify", "uglify" ]);
    grunt.registerTask( "style", [ "sass", "autoprefixer", "cssmin" ]);
    grunt.registerTask( "serve", [ "default", "connect", "watch" ]);
    grunt.registerTask( "default", [ "clean", "js", "webfont", "style", "html" ]);
};