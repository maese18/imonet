//import 'dotenv/config';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import compressionConfig from './config/compressionConfig';
import morganRequestLogger from './utils/logger/morganRequestLogger';
import logger from './utils/logger/logger';
import configs from './config/configs';
import lifeSign from './controllers/lifeSign';
import configureErrorHandler from './errors/errorHandler';
import UrlNotDefinedException from './errors/UrlNotDefinedException';
import domainController from './controllers/domain/domainController';
import mediaFileController from './controllers/mediaFile/mediaFileController';
import realEstateController from './controllers/realEstate/realEstateController';
import webpushSubscriptionHandler from './config/webPushConfig';
const app = express();
const TAG = 'app';
logger.info(TAG, `Configure app for env=${configs.env}`);

app.use(cors());
logger.info(TAG, 'Configure to allow CORS');

// Multiple protection mechanismens
app.use(helmet());

// more fine-grain configuration can be found on expressjs.com/en/resources/middleware/cors.html

// compress all responses
app.use(compressionConfig());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

morganRequestLogger(app, configs);

// enable files upload
app.use(
	fileUpload({
		createParentPath: true,
	})
);

/* Routes */
app.post('/api/subscribe', webpushSubscriptionHandler);
app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use('/api/lifeSign', lifeSign);
app.use('/api/mediaFiles', mediaFileController.getRouter());
app.use('/api/realEstates', realEstateController.getRouter());
app.use('/api', domainController.getRouter());

logger.info(TAG, '/api/lifeSign,/api/:domainPlural, /api/users endpoints registered');
app.get('/', /* istanbul ignore next */ (req, res, next) => res.redirect('static/index.html'));

app.use('', express.static(path.join(__dirname, '..', 'public/home.html')));
app.use('/*', express.static(path.join(__dirname, '..', 'public/home.html')));
/* istanbul ignore next */
app.use(
	/* istanbul ignore next */ (req, res, next) => {
		const error = new UrlNotDefinedException('app.js', `No handler defined for url '${req.url}' `);
		next(error);
	}
);

configureErrorHandler(app);

export default app;
