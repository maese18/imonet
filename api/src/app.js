//import 'dotenv/config';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';

import compressionConfig from './config/compressionConfig';
import morganRequestLogger from './utils/logger/morganRequestLogger';
import logger from './utils/logger/logger';
import configs from './config/configs';
import lifeSign from './controllers/lifeSign';
import configureErrorHandler from './errors/errorHandler';
import UrlNotDefinedException from './errors/UrlNotDefinedException';
import domainController from './controllers/domain/domainController';
const app = express();
const TAG = 'app';
logger.info(TAG, `Configure app for env=${configs.env}`);

// Multiple protection mechanismens
app.use(helmet());

// compress all responses
app.use(compressionConfig());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

morganRequestLogger(app, configs);

//app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(cors());
logger.info(TAG, 'Configure to allow CORS');
// more fine-grain configuration can be found on expressjs.com/en/resources/middleware/cors.html

/* Routes */
app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use('/api/lifeSign', lifeSign);
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
