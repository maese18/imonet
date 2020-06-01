import path from 'path';
import logger from '../../utils/logger/logger';
const CONFIGS_PATH = path.join(process.env.PWD, 'configs');
const TAG = 'ConfigsController';
class ConfigsController {
	constructor() {}
	getConfigs = async (req, res, next) => {
		try {
			let filePath = path.join(CONFIGS_PATH, `configs.json`);
			logger.info(TAG, `Download config file. Path=${filePath}`);
			res.download(filePath); // Set disposition and send it.
		} catch (err) {
			next(err);
		}
	};
}
export default new ConfigsController();
