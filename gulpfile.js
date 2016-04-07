'use strict';

var pngquant = require('imagemin-pngquant');
var phplint = require('phplint').lint
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Object with directory paths
var dirs = {
  bower: './vendor/bower_components',
  css: './assets/css',
  fonts: './assets/fonts',
  images: './assets/images',
  icons: './assets/icons',
  js: './assets/js'
};

// Autoprefixer options
var autoprefixerOptions = {
  browsers: ['last 2 versions']
};

// Imagemin options
var imageminOptions = {
  progressive: true,
  svgoPlugins: [{removeViewBox: false}],
  use: [pngquant()]
};

// Compile sass for development (uncompressed)
gulp.task('styles:dev', function () {
  gulp.src(dirs.css + '/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerOptions))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(dirs.css))
    .pipe($.connect.reload());
});

// Compile sass for production (compressed)
gulp.task('styles', function () {
  gulp.src(dirs.css + '/**/*.scss')
    .pipe($.sass({outputStyle: 'compressed'}).on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(dirs.css));
});

// Copy fonts
gulp.task('fonts', function () {
  gulp.src([dirs.bower + '/bootstrap-sass/assets/fonts/bootstrap/*'])
    .pipe(gulp.dest(dirs.fonts + '/'));
});

// Copy JavaScript (like modernizr)
gulp.task('scripts:copy', function () {
  // Copy modernizr from bower_components
  gulp.src([dirs.bower + '/modernizr/modernizr.js'])
    .pipe(gulp.dest(dirs.js + '/'));
});

// Concat JavaScript
gulp.task('scripts', function (done) {
  // Process JavaScript files
  gulp.src([
    dirs.bower + '/jquery/dist/jquery.js',
    dirs.bower + '/bootstrap-sass/assets/javascripts/bootstrap.js',
    dirs.js + '/*.js',
    '!' + dirs.js + '/modernizr.js',
    '!' + dirs.js + '/build.js'
  ])
  .pipe($.concat('build.js'))
  .pipe($.uglify())
  .on('error', done)
  .pipe(gulp.dest(dirs.js + '/'))
  .pipe($.connect.reload());
  done();
});

// Optimize images
gulp.task('imagemin', function () {
  gulp.src(dirs.images + '/*')
    .pipe($.imagemin(imageminOptions))
    .pipe(gulp.dest(dirs.images));
});

// Watch task
gulp.task('watch', function () {
  gulp.watch(dirs.css + '/**/*.scss', ['styles:dev']);
  gulp.watch('**/*.php', ['phplint']);
  gulp.watch([
    dirs.js + '/*.js',
    '!' + dirs.js + '/build.js'
  ], ['scripts']);
});

// Clean task
gulp.task('clean', function () {
  gulp.src([
    dirs.css + '/style.css',
    dirs.fonts + '/*',
    dirs.images + '/*',
    dirs.js + '/build.js'
  ], {read: false})
    .pipe($.clean());
});

// Connect task to serve web and reload automatically
gulp.task('connect', function() {
  $.connect.server({
    root: '.',
    livereload: true
  });
});

// Lint PHP files
gulp.task('phplint', function (cb) {
  phplint(['*.php', 'api/*.php'], {limit: 10}, function (err, stdout, stderr) {
    if (err) {
      cb(err)
      process.exit(1)
    }
    cb()
  })
})

// Register default and dev task
gulp.task('default', ['styles', 'fonts', 'scripts:copy', 'scripts', 'imagemin'], function () {});
gulp.task('dev', ['default', 'connect', 'watch'], function () {});
