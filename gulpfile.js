var gulp = require('gulp'),
	mocha = require('gulp-mocha'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	merge = require('merge-stream'),
	obfuscate = require('gulp-obfuscate'),
	zip = require('gulp-zip'),
	gulpSequence = require('gulp-sequence');

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


gulp.task('copy', function() {
	return gulp.src(['./lib/**/*', './application/**/*', './index.js', './config.js', './package.json'], {base: '.'})
		.pipe(gulp.dest('dist'));
});


gulp.task('copy_npm', function() {
	return gulp.src(['./node_modules/**/*'], {base: '.'})
		.pipe(gulp.dest('dist'));
});


gulp.task('zip', function() {
	return gulp.src('./dist/**/*')
		.pipe(zip('archive.zip'))
		.pipe(gulp.dest('build'));
});


gulp.task('default', gulpSequence('test', 'lint', 'copy', 'compress', 'obfuscate', 'copy_npm', 'zip'));
 

//测试

//jshint代码校验

//压缩混淆

//打包zip文件

//分析Extjs的命令行工具能否集成使用