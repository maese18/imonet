//import 'dotenv/config';
import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import {
  findOneByQuery,
  findOne,
  findAllByQuery,
  insertDocuments,
  listDocuments,
  updateDocument,
} from "./mongoAdapter";
const app = express();

app.use(cors());

// Multiple protection mechanismens
app.use(helmet());
// more fine-grain configuration can be found on expressjs.com/en/resources/middleware/cors.html

// compress all responses
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.get("/:collection", findAllByQuery);

app.get("/documents/:id", findOne);
app.get("/documents", listDocuments);
app.post("/documents/:id", updateDocument);
app.get("/insert", insertDocuments);
app.get(
  "/",
  /* istanbul ignore next */ (req, res, next) =>
    res.redirect("static/index.html")
);

app.use("", express.static(path.join(__dirname, "..", "public/home.html")));
app.use("/*", express.static(path.join(__dirname, "..", "public/home.html")));
/* istanbul ignore next */
app.use(
  /* istanbul ignore next */ (req, res, next) => {
    const error = new Error(`No handler defined for url '${req.url}' `);
    next(error);
  }
);

export default app;
