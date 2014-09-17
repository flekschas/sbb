(function () {
"use strict";

module.exports = function ( grunt ) {

  /*
   * Load grunt tasks automatically
   */
  require('load-grunt-tasks')(grunt);

  /*
   * Time how long tasks take. Can help when optimizing build times
   */
  require('time-grunt')(grunt);

  /*
   * Load in our build configuration file.
   */
  var config = grunt.file.readJSON('./build.config.json');


  /*
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  grunt.initConfig({

    /*
     * Add vendor prefixed styles
     */
    autoprefixer: {
      options: {
        browsers: [
          '> 5%',
          'last 2 versions',
          'Firefox ESR',
          'Firefox >= 4',
          'Explorer >= 9',
          'Safari >= 4',
          'Opera 12.1'
        ]
      },
      styles: {
        src: '<%= cfg.build_dir %>/styles/<%= pkg.name %>-<%= pkg.version %>.css'
      }
    },

    /*
     * Make config accessible for Grunt tasks
     */
    cfg: config,

    /*
     * The directories to delete when `grunt clean` is executed.
     */
    clean: {
      build: [
        '<%= cfg.build_dir %>',
      ],
      compile: [
        '<%= cfg.compile_dir %>'
      ],
      compile_src: [
        '<%= cfg.compile_dir %>/src/'
      ],
      tmp_js: [
        '<%= cfg.build_dir %>/**/*.tmp.js',
        '<%= cfg.compile_dir %>/**/*.tmp.js'
      ]
    },

    /*
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /*
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compile_js: {
        src: [
          '<%= cfg.vendor_files.js %>',
          'module.prefix',
          '<%= cfg.compile_dir %>/assets/src.tmp.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'module.suffix'
        ],
        dest: '<%= cfg.compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    /*
     * `concat_src` is a custom task to concat all source file with respect to
     * their order of importance.
     */
    concat_src: {
      source: {
        src: ['<%= cfg.compile_dir %>/src/**/*.js'],
        dest: '<%= cfg.compile_dir %>/assets/src.tmp.js'
      }
    },

    /*
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      build_apache_config: {
        src: 'src/.htaccess',
        dest: '<%= cfg.build_dir %>/.htaccess',
        options: {
          process: function (content, srcpath) {
            var cfg = grunt.config( 'cfg' );
            if (__dirname.indexOf(cfg.apache_root) !== 0) {
              /*
               * The specified Apache http server root directory is no prefix
               * of the current directory.
               */
            } else {
              var base = __dirname.substr(cfg.apache_root.length) + "/" +
                         cfg.build_dir;
              content = content.replace(/RewriteBase.*/, "RewriteBase " + base);
              content = content.replace(/Header set Content-Security-Policy.*/, '');
            }
            return content;
          }
        }
      },
      compile_apache_config: {
        src: 'src/.htaccess',
        dest: '<%= cfg.compile_dir %>/.htaccess',
        options: {
          process: function (content, srcpath) {
            var cfg = grunt.config( 'cfg' );
            if (__dirname.indexOf(cfg.apache_root) !== 0) {
              /*
               * The specified Apache http server root directory is no prefix
               * of the current directory.
               */
            } else {
              var base = __dirname.substr(cfg.apache_root.length) + "/" +
                         cfg.compile_dir;
              content = content.replace(/RewriteBase.*/, "RewriteBase " + base);
              content = content.replace(/RewriteCond.*/, "RewriteCond $1 !^(index\\.html|assets|sitemap\\.xml)");
              content = content.replace(/Header set Content-Security-Policy.*/, '');
            }
            return content;
          }
        }
      },
      build_app_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= cfg.build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          }
       ]
      },
      build_vendor_assets: {
        files: [
          {
            src: [ '<%= cfg.vendor_files.assets %>' ],
            dest: '<%= cfg.build_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
       ]
      },
      build_app_js: {
        files: [
          {
            src: [ '<%= cfg.app_files.js %>' ],
            dest: '<%= cfg.build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendor_js_css: {
        files: [
          {
            src: [
              '<%= cfg.vendor_files.js %>',
              '<%= cfg.vendor_files.css %>'
            ],
            dest: '<%= cfg.build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compile_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= cfg.compile_dir %>/assets',
            cwd: '<%= cfg.build_dir %>/assets',
            expand: true
          }
        ]
      },
    },

    cssmin: {
      add_banner: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= cfg.vendor_files.css %>',
          '<%= cfg.build_dir %>/styles/<%= pkg.name %>-<%= pkg.version %>.css'
        ],
        dest: '<%= cfg.compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      }
    },

    /*
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     */
    delta: {
      /*
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /*
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /*
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [
          '<%= cfg.app_files.js %>'
        ],
        tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_app_js' ]
      },

      /*
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: {
        files: [
          'src/assets/**/*'
        ],
        tasks: [ 'copy:build_app_assets', 'copy:build_vendor_assets' ]
      },

      /*
       * When index.html changes, we need to compile it.
       */
      html: {
        files: [ '<%= cfg.app_files.html %>' ],
        tasks: [ 'index:build' ]
      },

      /*
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= cfg.app_files.atpl %>',
          '<%= cfg.app_files.ctpl %>'
        ],
        tasks: [ 'html2js' ]
      },

      /*
       * When the CSS files change, we need to compile and minify them.
       */
      sass: {
        files: [ 'src/**/*.scss' ],
        tasks: [ 'sass:build' ]
      },

      /*
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          '<%= cfg.app_files.jsunit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    },


    /*
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /*
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ '<%= cfg.app_files.atpl %>' ],
        dest: '<%= cfg.build_dir %>/templates-app.js'
      },

      /*
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ '<%= cfg.app_files.ctpl %>' ],
        dest: '<%= cfg.build_dir %>/templates-common.js'
      }
    },

    /*
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /*
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= cfg.build_dir %>',
        src: [
          '<%= cfg.vendor_files.js %>',
          '<%= cfg.build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= cfg.vendor_files.css %>',
          '<%= cfg.build_dir %>/styles/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      },

      /*
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= cfg.compile_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= cfg.compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ]
      }
    },

    /*
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [
        '<%= cfg.app_files.js %>'
      ],
      test: [
        '<%= cfg.app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    /*
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: '<%= cfg.build_dir %>/karma-unit.js'
      },
      unit: {
        port: 9019,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /*
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      unit: {
        dir: '<%= cfg.build_dir %>',
        src: [
          '<%= cfg.test_files.js %>',
          '<%= cfg.vendor_files.js %>',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'src/**/*.js',
        ]
      }
    },

    /*
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/*\n' +
        ' * <%= pkg.fullName %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },

    /*
     * `ng-annotate` annotates the sources before minifying. That is, it
     * provides a back up solution if we forgot about the array syntax. Still
     * we should not trust the plugin to cover all cases.
     */
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      compile: {
        files: [
          {
            src: [ '<%= cfg.app_files.js %>' ],
            cwd: '<%= cfg.build_dir %>',
            dest: '<%= cfg.compile_dir %>',
            expand: true
          }
        ]
      },
    },

    /*
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON("package.json"),


    /*
     * `grunt-contrib-sass` handles our SASS compilation and uglification
     * automatically. Only our `main.scss` file is included in compilation;
     * all other files must be imported from this file.
     */
    sass: {
      build: {
        options: {
          style: 'expanded'
        },
        files: {
          '<%= cfg.build_dir %>/styles/<%= pkg.name %>-<%= pkg.version %>.css': '<%= cfg.app_files.sass %>'
        }
      },
      compile: {
        options: {
          style: 'compressed',
          sourcemap: true
        },
        files: {
          '<%= cfg.compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css': '<%= cfg.app_files.sass %>'
        }
      }
    },

    /*
     * Set the current date as lastmod in sitemap
     */
    template: {
      sitemap: {
        files: {
          '<%= cfg.compile_dir %>/sitemap.xml': ['src/sitemap.tpl']
        }
      }
    },

    /*
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
        }
      }
    }
  });

  /*
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask( 'watch', [ 'build', 'karma:unit', 'delta' ] );

  /*
   * The default task is to build and compile.
   */
  grunt.registerTask( 'default', [ 'build', 'compile' ] );

  /*
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask( 'build', [
    'clean:build', 'html2js', 'jshint', 'sass:build',
    'copy:build_app_assets', 'copy:build_vendor_assets', 'copy:build_app_js',
    'copy:build_vendor_js_css', 'index:build', 'copy:build_apache_config',
    'karmaconfig', 'karma:continuous'
  ]);

  /*
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask( 'compile', [
    'clean:compile', 'autoprefixer', 'cssmin', 'copy:compile_assets',
    'ngAnnotate', 'concat_src', 'concat:compile_js', 'uglify', 'index:compile',
    'copy:compile_apache_config', 'template:sitemap', 'clean:compile_src',
    'clean:tmp_js'
  ]);


  /*
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /*
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /*
   * A utility function for sorting JavaScript sources.
   */
  function importanceSortJS ( a, b ) {
    /*
     * Give each type of JavaScript file a category according to then they
     * should be loaded. The lower the number the earlier the files should
     * be loaded.
     */
    var objs = [a, b];
    for (var i = objs.length - 1; i >= 0; i--) {
      switch (true) {
        case objs[i].indexOf('vendor') >= 0:
          objs[i] = 0;
          break;
        case objs[i].indexOf('module') >= 0:
          objs[i] = 1;
          break;
        case objs[i].indexOf('settings') >= 0:
          objs[i] = 2;
          break;
        case objs[i].indexOf('config') >= 0:
          objs[i] = 3;
          break;
        case objs[i].indexOf('route') >= 0:
          objs[i] = 4;
          break;
        case objs[i].indexOf('controller') >= 0:
          objs[i] = 5;
          break;
        case objs[i].indexOf('directives') >= 0:
          objs[i] = 6;
          break;
        case objs[i].indexOf('services') >= 0:
          objs[i] = 7;
          break;
        case objs[i].indexOf('filters') >= 0:
          objs[i] = 8;
          break;
        case objs[i].indexOf('libraries') >= 0:
          objs[i] = 9;
          break;
        default:
          objs[i] = 10;
          break;
      }
    }
    /*
     * All *.spec.js files are put at the end.
     */
    if (a.indexOf('spec') >= 0) {
      objs[0] = 12;
    }
    if (b.indexOf('spec') >= 0) {
      objs[1] = 12;
    }
    return objs[0] - objs[1];
  }

  /*
    * We only want to sort the source files as the order of the vendor files is
    * crutial and should not be changed.
    *
    * We know that all vendor JavaScript files are before other source files
    * so we just need to see when we find the first non-vendor file.
    */
  function sortJsFiles ( jsFiles ) {

    var isVendorFile = true,
        numVendorFiles = 0,
        mocks = -1,
        mocksFile;

    for (var i = 0; i < jsFiles.length; i++) {
      if (jsFiles[i].indexOf('vendor') === -1) {
        numVendorFiles = i;
        break;
      }
      if (jsFiles[i].indexOf('mocks') >= 0) {
        mocks = i;
        mocksFile = jsFiles[i];
      }
    }

    var jsVendorFiles = jsFiles.slice(0, numVendorFiles);

    var jsSourceFiles = jsFiles.slice(numVendorFiles);

    jsSourceFiles.sort(importanceSortJS);

    if (mocks >= 0) {
      /*
       * Cut out the mocks file as we have to insert it after sorting after the
       * source files but before the unit test files. Because mocks can only be
       * within the vendor files we don't need to consider source files.
       */
      var tmp = jsVendorFiles.slice(0, mocks);
      jsVendorFiles = tmp.concat(jsVendorFiles.slice(mocks + 1));

      /*
       * Insert the mock file write before the test files.
       */
      var insertionSite = jsSourceFiles.length - 1;
      for (i = jsSourceFiles.length - 1; i >= 0; i--) {
        if (jsSourceFiles[i].indexOf('spec') === -1) {
          insertionSite = i;
          break;
        }
      }
      tmp = jsSourceFiles.slice(0, insertionSite);
      tmp.push(mocksFile);
      jsSourceFiles = tmp.concat(jsSourceFiles.slice(insertionSite));
    }

    return jsVendorFiles.concat(jsSourceFiles);
  }

  function orderSource (files) {
    grunt.log.writeln(files);
    return files;
  }

  /*
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    /*
     * Get the config (e.g. content in build.config.json)
     */
    var cfg = grunt.config( 'cfg' ),
        base = __dirname.substr(cfg.apache_root.length) + "/" +
                                cfg[this.target + '_dir'];

    var dirRE = new RegExp( '^('+cfg.build_dir+'|'+cfg.compile_dir+')\/', 'g' );

    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    jsFiles = sortJsFiles(jsFiles);

    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            base: base + "/"
          }
        });
      }
    });
  });

  /*
   * When concating our JavaScript files we need to make sure that the order is
   * correct.
   */
  grunt.registerMultiTask( 'concat_src', 'Concat source files by order', function () {
    this.files.forEach(function(file) {
      var files = file.src.filter(function(filepath) {
        // Remove nonexistent files (it's up to you to filter or warn here).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read and return the file's source.
        return filepath;
      });
      // Sort files
      files = sortJsFiles(files);
      // Concat files
      var contents = files.map(function(filepath) {
        return grunt.file.read(filepath);
      }).join('\n');
      // Write joined contents to destination filepath.
      grunt.file.write(file.dest, contents);
      // Print a success message.
      grunt.log.writeln('File "' + file.dest + '" created.');
    });
  });

  /*
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates',
    function () {
      /*
       * Get the config (e.g. content in build.config.json)
       */
      var cfg = grunt.config( 'cfg' );
      var jsFiles = filterForJS( this.filesSrc );

      jsFiles = sortJsFiles(jsFiles);

      grunt.file.copy(
        'karma/karma-unit.tpl.js',
        cfg.build_dir + '/karma-unit.js',
        {
          process: function ( contents, path ) {
            return grunt.template.process( contents, {
              data: {
                scripts: jsFiles
              }
            });
          }
        }
      );
    }
  );
};
})();
