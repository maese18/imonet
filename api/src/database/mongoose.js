import mongoose from 'mongoose';

const MONGO_USERNAME = 'root',
	MONGO_PASSWORD = 'pw',
	MONGO_HOSTNAME = '127.0.0.1',
	MONGO_PORT = '27017',
	MONGO_DB = 'test';

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`;

mongoose
	.connect(url, { useNewUrlParser: true })
	.then(() => {
		console.log('successfully connected to the database');
	})
	.catch(err => {
		console.log('error connecting to the database', err);
		process.exit();
	});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're connected!");
});

var kittySchema = new mongoose.Schema({
	name: String,
});

var Kitten = mongoose.model('Kitten', kittySchema);

var silence = new Kitten({ name: 'Silence' });
console.log(silence.name); // 'Silence'

// NOTE: methods must be added to the schema before compiling it with mongoose.model()
kittySchema.methods.speak = function() {
	var greeting = this.name ? 'Meow name is ' + this.name : "I don't have a name";
	console.log(greeting);
};

var Kitten = mongoose.model('Kitten', kittySchema);

var fluffy = new Kitten({ name: 'fluffy' });
//fluffy.speak(); // "Meow name is fluffy"

fluffy.save(function(err, fluffy) {
	if (err) return console.error(err);
	//fluffy.speak();
});

Kitten.find(function(err, kittens) {
	if (err) return console.error(err);
	console.log(kittens);
});

Kitten.find({ name: /^fluff/ }, result => {
	console.log('received Kitten ', result);
});

export default mongoose;
