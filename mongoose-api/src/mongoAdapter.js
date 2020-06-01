const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
var ObjectID = require("mongodb").ObjectID;
// Connection URL
const url = "mongodb://imonet:imonet@localhost:27017/imonet";

// Database Name
const dbName = "imonet";

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
let db;
client.connect(function (err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db = client.db(dbName);

  //client.close();
});
const listDocuments = (req, res, next) => {
  // Get the documents collection
  db.collection("realEstates")
    .find()
    .toArray(function (err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      res.json(docs);
    });
};
const updateDocument = (req, res, next) => {
  console.log("updateDocument with id=", req.params.id);
  console.log(req.body);
  db.collection("realEstates")
    .updateOne({ _id: ObjectID(req.params.id) }, { $set: req.body })
    .then((result) => {
      console.log("Updated the document with the field a equal to 2");
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
};

const findOneByQuery = (req, res, next) => {
  let collection = req.params.collection;
  let query = JSON.parse(req.query.query);
  console.log(
    `findOneOf collection ${collection}, query=${JSON.stringify(query)}`
  );
  db.collection(collection)
    .findOne(query)
    .then((result) => {
      console.log(`Found ${result}`);
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
};
const findAllByQuery = (req, res, next) => {
  let collection = req.params.collection;
  let query = JSON.parse(req.query.query);
  console.log(
    `findAllByQuery collection ${collection}, query=${JSON.stringify(query)}`
  );
  db.collection(collection)
    .find(query)
    .toArray((err, result) => {
      if (err) {
        console.log(err);
        res.json(err);
      } else {
        console.log(`Found ${result}`);
        res.json(result);
      }
    });
};
const findOne = (req, res, next) => {
  console.log("updateDocument with id=", req.params.id);
  db.collection("realEstates")
    .findOne({ _id: ObjectID(req.params.id) })
    .then((result) => {
      console.log("Updated the document with the field a equal to 2");
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
};
const insertDocuments = (req, resp, next) => {
  // Get the documents collection
  const collection = db.collection("realEstates");
  // Insert some documents
  collection.insertMany(
    [
      { type: "EFH", mediaFiles: [{ fileName: "file.jpg" }] },
      { a: 2 },
      { a: 3 },
    ],
    function (err, result) {
      /*  assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length); */
      console.log("Inserted 3 documents into the collection");
      resp.json(result);
    }
  );
};
export {
  findOne,
  findAllByQuery,
  findOneByQuery,
  insertDocuments,
  listDocuments,
  updateDocument,
};
