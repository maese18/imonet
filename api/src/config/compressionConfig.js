/* istanbul ignore file */
import compression from 'compression';
import logger from '../utils/logger/logger';

const shouldCompress = (req, res) => {
	if (req.headers['x-no-compression']) {
		// don't compress responses if this request header is present
		return false;
	}
	// console.log("use standard gzip compression");
	return compression.filter(req, res);
};

const compressionConfig = () => {
	logger.info('compressionConfig', 'Configure communication to be gzipped');

	return compression({
		// filter decides if the response should be compressed or not,
		// based on the `shouldCompress` function above
		filter: shouldCompress,
		// threshold is the byte threshold for the response body size
		// before compression is considered, the default is 1kb
		threshold: 0,
	});
};

export default compressionConfig;
