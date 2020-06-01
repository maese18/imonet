// getting-started.js
var mongoose = require("mongoose");
mongoose.connect("mongodb://imonet:imonet@localhost:27017/imonet", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//mongoose.connect('mongodb://username:password@host:port/database?options...', {useNewUrlParser: true});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("we're connected!");

  var kittySchema = new mongoose.Schema({
    name: String,
    firstName: String,
    mediaFiles: Array,
  });
  // NOTE: methods must be added to the schema before compiling it with mongoose.model()
  kittySchema.methods.speak = function () {
    var greeting = this.name
      ? "Meow name is " + this.name
      : "I don't have a name";
    console.log(greeting);
  };
  var Kitten = mongoose.model("Kitten", kittySchema);

  var silence = new Kitten({ name: "Silence" });
  console.log(silence.name); // 'Silence'

  var Kitten = mongoose.model("Kitten", kittySchema);

  var fluffy = new Kitten({
    name: "fluffy",
    firstName: "Marcel",
    mediaFiles: [{ name: "aFile.jpg" }],
  });
  //fluffy.speak(); // "Meow name is fluffy"

  fluffy.save(function (err, fluffy) {
    if (err) return console.error(err);
    fluffy.speak();
  });
});
