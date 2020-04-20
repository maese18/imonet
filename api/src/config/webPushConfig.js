import webpush from 'web-push';
import configs from './configs';

webpush.setVapidDetails(configs.webpush.vapidEmail, configs.webpush.publicVapidKey, configs.webpush.privateVapidKey);

const webpushSubscriptionHandler = (req, res) => {
	const subscription = req.body;
	res.status(201).json({});
	const payload = JSON.stringify({ title: 'test' });

	console.log(subscription);

	webpush.sendNotification(subscription, payload).catch(error => {
		console.error(error.stack);
	});
};

const triggerPushMsg = function(subscription, dataToSend) {
	return webpush.sendNotification(subscription, dataToSend).catch(err => {
		if (err.statusCode === 404 || err.statusCode === 410) {
			console.log('Subscription has expired or is no longer valid: ', err);
			return deleteSubscriptionFromDatabase(subscription._id);
		} else {
			throw err;
		}
	});
};
export default webpushSubscriptionHandler;
