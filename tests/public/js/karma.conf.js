// Karma configuration
// Generated on Mon Apr 07 2014 10:34:11 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '/var/p4/p4/depot/srv/console/catalystservice/2014.3/src/main/php/',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
//      'tests/public/js/jasmine-2.0.0/jasmine.js',
      'public/js/jquery/*.js',
      'public/js/colorbox/*.js',
      'public/js/tinymce/*.js',
      'public/js/tinymce/themes/modern/theme.min.js',
      'public/js/tinymce/plugins/paste/plugin.min.js',
      'public/js/tinymce/plugins/link/plugin.min.js',
      'public/js/tinymce/plugins/maxchars/plugin.min.js',
      'public/js/Util.js',
      'public/js/Application.js',
      'public/js/Widget.js',
      'public/js/widgets/*.js',
      'public/js/widgets/fileUpload/jquery.fileupload.js',
      'public/js/apps/Legacy.js',
      'public/js/apps/Admin.js',
      'tests/public/js/fixtures/*.js',
      'tests/public/js/apps/Application.js',
      'tests/public/js/apps/Admin.js'
    ],


    // list of files to exclude
    exclude: [
       'public/js/widgets/adapt.min.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    
    browserNoActivityTimeout: 10000
  });
};
