const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();

function styles() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/css/'))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        proxy: 'http://localhost:37777', // Asegúrate de que este es el puerto correcto
        open: true
    });
    gulp.watch('src/scss/**/*.scss', styles);
    gulp.watch(['src/pug/**/*.pug']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watch = watch;
exports.default = gulp.series(styles, watch);
