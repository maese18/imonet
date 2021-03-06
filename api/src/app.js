//import 'dotenv/config';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import path from 'path';

import authenticationService from './services/authenticationService';
import compressionConfig from './config/compressionConfig';
import configs from './config/configs';
import configsController from './controllers/config/configsController';
import configureErrorHandler from './errors/errorHandler';
import domainController from './controllers/domain/domainController';
import individualController from './controllers/user/individualController';
import lifeSign from './controllers/lifeSign';
import logger from './utils/logger/logger';
import mediaFileController from './controllers/mediaFile/mediaFileController';
import mongoDomainController from './controllers/mongo-domain/mongoDomainController';
import mongoUserController from './controllers/user/userControllerMongoDb';
import morganRequestLogger from './utils/logger/morganRequestLogger';
import realEstateController from './controllers/realEstate/realEstateController';
import mongoRestDomainController from './mcontrollers/domainController';
import mongoRealEstateController from './mcontrollers/realEstateController';
import UrlNotDefinedException from './errors/UrlNotDefinedException';
import userController from './controllers/user/userController';
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
const auth = authenticationService.checkAuth;
const optionalAuth = authenticationService.checkOptionalAuth;
/* Routes */

app.get('/m-api/configs', configsController.getConfigs);
//app.post('/m-api/:collection', mongoDomainController.dispatchPostRequests);
app.post('/m-api/:collection', auth, mongoRestDomainController.insert);
app.put('/m-api/:collection/:id', auth, mongoRestDomainController.updateOne);
app.get('/m-api/:collection', mongoRestDomainController.findAll);
app.get('/m-api/:collection/:id', mongoRestDomainController.findByPk);
//app.post('/m-api/:collection', mongoDomainController.findAllAsPost);
app.put('/m-api/:collection/:id', mongoDomainController.updateOne);
//app.post('/m-api/:collection/:id', mongoDomainController.findByPk);
app.post('/m-api/users/signup', mongoUserController.signup);
app.post('/m-api/users/login', mongoUserController.login);

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
app.put('/api/realEstates', auth, realEstateController.save);

app.post('/m-api/realEstates/:id', auth, mongoRealEstateController.uploadFiles);
app.delete('/m-api/realEstates/:id/files/:fileId', auth, mongoRealEstateController.deleteFile);
//app.use('/api/realEstates/:realEstateId/mediaFiles', mediaFileController.getRouter());
//app.use('/api/mediaFiles', mediaFileController.getRouter());

app.get('/api/mediaFiles', auth, mediaFileController.listMediaFiles);
app.post('/api/mediaFiles', auth, mediaFileController.uploadFile, mediaFileController.uploadFiles);
app.get('/api/mediaFiles/:mediaFileId', optionalAuth, mediaFileController.downloadMediaFile);
app.put('/api/mediaFiles/:mediaFileId/action/giveAccess/:individualId', auth, mediaFileController.allowAccess);
app.delete('/api/mediaFiles/:mediaFileId/action/revokeAccess/:individualId', auth, mediaFileController.revokeAccess);
/*
app.get('/api/realEstates/:realEstateId', mediaFileController_.listMediaFiles);
app.post('/api/realEstates/:realEstateId', mediaFileController_.upload);
app.get('/api/realEstates/:realEstateId/:fileName', mediaFileController_.downloadMediaFile);
app.post('/api/realEstates/:realEstateId/files', mediaFileController_.uploadFiles);
*/
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
