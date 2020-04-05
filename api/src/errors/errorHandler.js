import logger from '../utils/logger/logger';

export function logErrors(err, req, res, next) {
	if (err.log) {
		err.log(logger);
	} /* istanbul ignore next */ else {
		logger.error('location not defined', err.stack, err);
	}
	next(err);
}

export function sendExceptionToClient(err, req, res, next) {
	/* istanbul ignore next */
	if (res.headersSent) {
		return next(err);
	}

	if (err.toHttpException) {
		err.toHttpException(res);
	} else {
		res.status(500).json({
			status: 500,
			error: err.name,
			message: err.message,
		});
	}
}

/* istanbul ignore next */
const configureErrorHandler = app => {
	app.use(logErrors);
	app.use(sendExceptionToClient);
};
export default configureErrorHandler;
