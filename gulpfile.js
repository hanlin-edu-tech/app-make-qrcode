const Q = require("q");
const fs = require("fs");
const del = require("del");
const gulp = require("gulp");
const util = require("gulp-template-util");
const gcPub = require("gulp-gcloud-publish");

const bucketNameForTest = "tutor-test-apps";
const projectIdTest = "tutor-test-238709";
const keyFileNameTest = "tutor-test.json";
const projectName = "app/make-qrcode/";

let libTask = dest => {
    return function() {
        var packageJson = JSON.parse(fs.readFileSync("package.json", "utf8").toString());
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        var webLibModules = [];
        for (var module in packageJson.dependencies) {
            webLibModules.push("node_modules/" + module + "/**/*");
        }
        return gulp
            .src(webLibModules, {
                base: "node_modules/"
            })
            .pipe(gulp.dest(dest));
    };
};

let copyStaticTask = dest => {
    return function() {
        return gulp
            .src(["src/*.html", "src/img/**", "src/css/*.css", "src/js/**/*.js", "src/lib/*.js", "src/js/module-utils/*.js"], {
                base: "src"
            })
            .pipe(gulp.dest(dest));
    };
};

let cleanTask = () => {
    return del(["dist", ""]);
};

let uploadGCSTest = bucketName => {
    return gulp
        .src(["dist/*.html", "dist/js/**", "dist/lib/**"], {
            base: `${__dirname}/dist/`
        })
        .pipe(
            gcPub({
                bucket: bucketName,
                keyFilename: keyFileNameTest,
                base: projectName,
                projectId: projectIdTest,
                public: true,
                metadata: {
                    cacheControl: "no-store"
                }
            })
        );
};

gulp.task("uploadGcsTest", uploadGCSTest.bind(uploadGCSTest, bucketNameForTest));
gulp.task("clean", cleanTask);
gulp.task("lib", libTask("src/lib"));

gulp.task("package", () => {
    let deferred = Q.defer();
    Q.fcall(() => {
        return util.logPromise(cleanTask);
    }).then(() => {
        return Q.all([util.logStream(copyStaticTask("dist"))]);
    });

    return deferred.promise;
});
