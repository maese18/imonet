/* var db = connect("mongodb://localhost/admin");

db.createUser({
  user: "imonet",
  pwd: "imonet",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }],
});
 */
var db = connect("mongodb://imonet:imonet@localhost:27017/admin");

db = db.getSiblingDB("imonet"); // we can not use "use" statement here to switch db

db.createUser({
  user: "imonet",
  pwd: "imonet",
  roles: [{ role: "readWrite", db: "imonet" }],
  passwordDigestor: "server",
});
