import configs from '../config/configs';
import request from 'supertest';
import app from '../app';

// Tests whether the response got the correct content-encoding header set.
// Works without running server.
test('should add content-encoding header with value gzip', async done => {
	const res = await request(app).get('/api/lifeSign');

	expect(res.statusCode).toBe(200);
	expect(res.header['content-encoding']).toBe('gzip');
	done();
});

test("if content-encoding header is unset when header 'x-no-compression' is not set", async done => {
	const res = await request(app)
		.get(`/${configs.api.basePath}/lifeSign`)
		.set('x-no-compression', true);

	expect(res.statusCode).toBe(200);
	// console.log('headers', JSON.stringify(res.headers));
	expect(res.header['content-encoding']).toBe(undefined);
	done();
});
