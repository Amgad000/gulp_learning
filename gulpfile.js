const { src, dest, watch, series } = require("gulp");

const pug = require("gulp-pug"),
  connect = require("gulp-connect"),
  concat = require("gulp-concat"),
  sass = require("gulp-sass")(require("sass")),
  autoprefixer = require("gulp-autoprefixer"),
  uglify = require("gulp-uglify"),
  sourceMaps = require("gulp-sourcemaps"),
  zip = require("gulp-zip");

/* the server and live reload using connect
  [1] async and await to establish aserver
  [2] exports.default takes server 1st */
async function connectserver() {
  await connect.server({
    root: "./dist",
    livereload: true,
    port: 8000,
  });
}

// Dealing with images
/* gulp-imagemin the version 8 require import 
  >>> the code made by search for issues in github
  >>> the options  */
function imagemin() {
  return import("gulp-imagemin").then((gulpImgMin) => {
    src("./dev/images/*.{png,jpg,svg}")
      .pipe(
        gulpImgMin.default([
          gulpImgMin.optipng({ optimizationLevel: 5 }),
          gulpImgMin.mozjpeg({ quality: 75, progressive: true }),
          gulpImgMin.gifsicle(),
          gulpImgMin.svgo(),
        ])
      )
      .pipe(dest("./dist/images"))
      .pipe(connect.reload());
  });
}

/* Dealing with pug  */
function pugjs() {
  return src("./dev/index.pug")
    .pipe(pug({ pretty: true }))
    .pipe(dest("./dist"))
    .pipe(connect.reload());
}

/* Dealing with sass */
function sassandprefix() {
  return src("./dev/css/main.scss")
    .pipe(sourceMaps.init())
    .pipe(sass({ outputStyle: "compressed" }))
    .pipe(autoprefixer("last 2 versions"))
    .pipe(concat("main.css"))
    .pipe(sourceMaps.write("./maps")) //path realtive to dest
    .pipe(dest("./dist/css"))
    .pipe(connect.reload());
}

/* Dealing with js */
function js() {
  return src("./dev/scripts/*.js")
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(dest("./dist/scripts"))
    .pipe(connect.reload());
}

/* the compressed project */
function zipfile() {
  return src("./dist/**/*.*").pipe(zip("project.zip")).pipe(dest("."));
}

// watching files
exports.default = series(connectserver, imagemin, function () {
  watch("./dev/index.pug", pugjs);
  watch("./dev/css/**/*.scss", sassandprefix);
  watch("./dev/images", imagemin);
  watch("./dev/scripts/**/*.js", js);
  watch("./dev/*", zipfile);
});
