const Q = require('q')
const fs = require('fs')
const del = require('del')
const gulp = require('gulp')
const util = require('gulp-template-util')
const gcPub = require('gulp-gcloud-publish')

const bucketNameForTest = 'tutor-apps-test'
const bucketNameForProd = 'tutor-apps'
const projectId = 'tutor-204108'
const keyFileName = 'tutor.json'
const projectName = 'app/make-qrcode/'

let libTask = dest => {
  return function () {
    var packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8').toString())
    if (!packageJson.dependencies) {
      packageJson.dependencies = {}
    }
    var webLibModules = []
    for (var module in packageJson.dependencies) {
      webLibModules.push('node_modules/' + module + '/**/*')
    }
    return gulp.src(webLibModules, {
      base: 'node_modules/'
    })
      .pipe(gulp.dest(dest))
  }
}

let copyStaticTask = dest => {
  return function () {
    return gulp.src([
      'src/*.html',
      'src/img/**',
      'src/css/*.css',
      'src/js/**/*.js',
      'src/lib/*.js',
      'src/js/module-utils/*.js'
    ], {
      base: 'src'
    })
      .pipe(gulp.dest(dest))
  }
}

let cleanTask = () => {
  return del(['dist', ''])
}

let uploadGCS = bucketName => {
  return gulp
    .src([
      './dist/*.html',
      './dist/js/*.js',
      './dist/lib/*.js'
    ], {
      base: `${__dirname}/dist/`
    })
    .pipe(gcPub({
      bucket: bucketName,
      keyFilename: keyFileName,
      base: projectName,
      projectId: projectId,
      public: true,
      metadata: {
        cacheControl: 'private, no-transform'
      }
    }))
}

gulp.task('uploadGcpTest', uploadGCS.bind(uploadGCS, bucketNameForTest))
gulp.task('uploadGcpProd', uploadGCS.bind(uploadGCS, bucketNameForProd))
gulp.task('clean', cleanTask)
gulp.task('lib', libTask('src/lib'))

gulp.task('package', () => {
  let deferred = Q.defer()
  Q.fcall(() => {
    return util.logPromise(cleanTask)
  }).then(() => {
    return Q.all([
      util.logStream(copyStaticTask('dist'))
    ])
  })

  return deferred.promise
})
