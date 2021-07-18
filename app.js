import express, { response } from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";
import multer from 'multer';

const app = express();
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets/serverImages')
  },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    }
  }
);

const upload = multer({storage: fileStorageEngine});
const port = 3000;
const hostname = "127.0.0.1";
const hostname2 = "http://127.0.0.1:3000";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.set("view engine", "pug");

app.use("/assets", express.static("assets"));
app.use("/generate", express.static("generate"));

app.get("/", (req, res) => {
    res.render(__dirname + "/snippet/create-post")
});

app.post("/post", [urlencodedParser, upload.single("image")], (req, res) => {
  res.render(__dirname + "/snippet/post-success", {
    data: req.body, 
    image: `./assets/serverImages/${req.file.originalname}`
  });
});


app.listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);
