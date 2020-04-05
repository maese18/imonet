import request from 'supertest';
import app from '../app';

// Tests whether the lifeSign endpoint works
// Works without running server.
test('whether the lifeSign endpoint works', async done => {
	const res = await request(app).get('/api/lifeSign');

	expect(res.statusCode).toBe(200);
	expect(res.body.data.message).toBe('api is alive');
	setTimeout(() => {
		done();
	}, 1000);
});
