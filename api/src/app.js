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
import userController from './controllers/user/userController';
import individualController from './controllers/user/individualController';
import domainController from './controllers/domain/domainController';
import mediaFileController from './controllers/mediaFile/mediaFileController';
import mediaFileController_ from './controllers/mediaFile/mediaFileController_';
import realEstateController from './controllers/realEstate/realEstateController';
import webpushSubscriptionHandler from './config/webPushConfig';
import authenticationService from './services/authenticationService';
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
const auth = authenticationService.checkAuth;
const optionalAuth = authenticationService.checkOptionalAuth;
/* Routes */
app.post('/api/subscribe', webpushSubscriptionHandler);
app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use('/api/lifeSign', lifeSign);

app.post('/api/users/signup', userController.signup);
app.post('/api/users/login', userController.login);

app.post('/api/individuals/signup', individualController.signup);
app.post('/api/individuals/login', individualController.login);

//app.use('/api/realEstates', realEstateController.getRouter());
app.get('/api/realEstates', auth, realEstateController.findAll);
app.get('/api/realEstates/:realEstateId', auth, realEstateController.findOne);
app.post('/api/realEstates', auth, realEstateController.create);
//app.use('/api/realEstates/:realEstateId/mediaFiles', mediaFileController.getRouter());
//app.use('/api/mediaFiles', mediaFileController.getRouter());

app.get('/api/mediaFiles', auth, mediaFileController.listMediaFiles);
app.get('/api/mediaFiles/:mediaFileId', optionalAuth, mediaFileController.downloadMediaFile);
app.post('/api/mediaFiles', auth, mediaFileController.uploadFile, mediaFileController.uploadFiles);
//app.get('/api/mediaFiles/:realEstateId', auth, mediaFileController.listMediaFiles);

app.get('/api/realEstates/:realEstateId', mediaFileController_.listMediaFiles);
app.post('/api/realEstates/:realEstateId', mediaFileController_.upload);
app.get('/api/realEstates/:realEstateId/:fileName', mediaFileController_.downloadMediaFile);
app.post('/api/realEstates/:realEstateId/files', mediaFileController_.uploadFiles);

app.use('/api', auth, domainController.getRouter());

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
