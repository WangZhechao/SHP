var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('default', function() {
	return gulp.src(['test/**'], { read: false, nodir: true })
	  .pipe(mocha({
	    reporter: 'spec',
	    globals: {
	      should: require('should')
	    }
	  }));
});


//测试

//jshint代码校验

//压缩混淆

//打包zip文件

//分析Extjs的命令行工具能否集成使用