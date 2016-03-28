var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var obfuscate = require('gulp-obfuscate');

gulp.task('default', function() {

});


gulp.task('test', function() {
	return gulp.src(['test/**'], { read: false, nodir: true })
		.pipe(mocha({
			reporter: 'spec'
		}));
});

gulp.task('lint', function() {
	return gulp.src(['./application/**/*.js', './lib/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default', { verbose: true }));
});


gulp.task('compress', function() {
	var folders = [
			['./application/**/*.js', './dist/application'], 
			['./lib/**/*.js', './dist/lib'],
			['./index.js', './dist'],
			['./config.js', './dist']
		];

	var tasks = folders.map(function(folder) {
		return gulp.src(folder[0])
			.pipe(uglify())
			.pipe(gulp.dest(folder[1]));
	});

	return merge(tasks);
});

gulp.task('obfuscate', function() {
	return gulp.src('./dist/**/*.js')
	    .pipe(obfuscate({ replaceMethod: obfuscate.ZALGO }));
});

//测试

//jshint代码校验

//压缩混淆

//打包zip文件

//分析Extjs的命令行工具能否集成使用