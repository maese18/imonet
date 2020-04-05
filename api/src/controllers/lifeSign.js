import os from 'os';

import osUtils from 'os-utils';
import { stringify } from '../utils/utils';
import logger from '../utils/logger/logger';

const bytesToMb = bytes => {
	return Math.round((bytes / 1024 / 1024) * 100) / 100;
};
export default (req, res) => {
	const arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
	arr.reverse();
	const used = process.memoryUsage();
	let metrics = {};
	metrics.totalMem = `${bytesToMb(os.totalmem())} MB`;
	metrics.freemem = `${bytesToMb(os.freemem())} MB`;
	metrics.hostname = os.hostname();
	metrics.loadavg = {
		desc: '1, 5, and 15 min. load avg',
		metrics: os.loadavg(),
	};

	osUtils.cpuUsage(function(v) {
		metrics.cpuUsage = 'CPU Usage (%): ' + v;
	});
	for (let key in used) {
		metrics[key] = `${key} ${bytesToMb(used[key])} MB`;
	}
	metrics.cpus = os.cpus();
	let TAG = 'lifeSign';
	logger.info(TAG, metrics);
	res.status(200)
		.contentType('json')
		.send(
			stringify({
				status: 'success',
				data: { message: 'api is alive', metrics },
			})
		);
};
