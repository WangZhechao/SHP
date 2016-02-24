var _ = require('lodash'),
	chalk = require('chalk'),
	Promise = require('bluebird'),
	ValidationError = require('./validation-error'),
	errors;

errors = {
	throwError: function (err) {
	    if (!err) {
	        err = new Error('一个致命错误');
	    }

	    if (_.isString(err)) {
	        throw new Error(err);
	    }

	    throw err;
	},

	rejectError: function (err) {
	    return Promise.reject(err);
	},

	logInfo: function (component, info) {
	    if ((process.env.NODE_ENV === 'development' ||
	        process.env.NODE_ENV === 'staging' ||
	        process.env.NODE_ENV === 'production')) {
	        console.info(chalk.cyan(component + ':', info));
	    }
	},



	logWarn: function (warn, context, help) {
	    if ((process.env.NODE_ENV === 'development' ||
	        process.env.NODE_ENV === 'staging' ||
	        process.env.NODE_ENV === 'production')) {
	        warn = warn || '未知';
	        var msgs = [chalk.yellow('\nWarning:', warn), '\n'];

	        if (context) {
	            msgs.push(chalk.white(context), '\n');
	        }

	        if (help) {
	            msgs.push(chalk.green(help));
	        }

	        // add a new line
	        msgs.push('\n');

	        console.log.apply(console, msgs);
	    }
	},


	logError: function (err, context, help) {
	    var self = this,
	        origArgs = _.toArray(arguments).slice(1),
	        stack,
	        msgs;

	    if (_.isArray(err)) {
	        _.each(err, function (e) {
	            var newArgs = [e].concat(origArgs);
	            errors.logError.apply(self, newArgs);
	        });
	        return;
	    }

	    stack = err ? err.stack : null;

	    if (!_.isString(err)) {
	        if (_.isObject(err) && _.isString(err.message)) {
	            err = err.message;
	        } else {
	            err = '一个未知的致命错误.';
	        }
	    }

	    // Overwrite error to provide information that this is probably a permission problem
	    // TODO: https://github.com/TryGhost/Ghost/issues/3687
	    if (err.indexOf('SQLITE_READONLY') !== -1) {
	        context = 'Your database is in read only mode. Visitors can read your blog, but you can\'t log in or add posts.';
	        help = 'Check your database file and make sure that file owner and permissions are correct.';
	    }
	    // TODO: Logging framework hookup
	    // Eventually we'll have better logging which will know about envs
	    if ((process.env.NODE_ENV === 'development' ||
	        process.env.NODE_ENV === 'staging' ||
	        process.env.NODE_ENV === 'production')) {
	        msgs = [chalk.red('\nERROR:', err), '\n'];

	        if (context) {
	            msgs.push(chalk.white(context), '\n');
	        }

	        if (help) {
	            msgs.push(chalk.green(help));
	        }

	        // add a new line
	        msgs.push('\n');

	        if (stack) {
	            msgs.push(stack, '\n');
	        }

	        console.error.apply(console, msgs);
	    }
	},

	logErrorAndExit: function (err, context, help) {
	    this.logError(err, context, help);
	    // Exit with 0 to prevent npm errors as we have our own
	    process.exit(0);
	},

	logAndThrowError: function (err, context, help) {
	    this.logError(err, context, help);

	    this.throwError(err, context, help);
	},

	logAndRejectError: function (err, context, help) {
	    this.logError(err, context, help);

	    return this.rejectError(err, context, help);
	},

	logErrorWithRedirect: function (msg, context, help, redirectTo, req, res) {
	    /*jshint unused:false*/
	    var self = this;

	    return function () {
	        self.logError(msg, context, help);

	        if (_.isFunction(res.redirect)) {
	            res.redirect(redirectTo);
	        }
	    };
	}
};


module.exports = errors;
module.exports.ValidationError = ValidationError;