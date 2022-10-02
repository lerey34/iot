var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var reko = new AWS.Rekognition({ region: "us-east-1" });
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
});

class Resize {
  constructor(folder) {
    this.folder = folder;
  }
  save(buffer, name) {
    const filename = Resize.filename(name);
    const filepath = this.filepath(filename);

    sharp(buffer).toFile(filepath);

    return filename;
  }
  static filename(name) {
    return name;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }
}

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("image"), async (req, res, next) => {
  console.log(req.file);
  const imagePath = path.join(__dirname, "/");
  const fileUpload = new Resize(imagePath);
  const filename = fileUpload.save(req.file.buffer, req.file.originalname);
  var paramsUpload = {
    Bucket: "picturejs",
    Key: filename,
    Body: req.file.buffer,
  };

  s3.upload(paramsUpload, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log("success upload bucket");
  });

  var paramsReko = {
    Image: {
      S3Object: {
        Bucket: "picturejs",
        Name: filename,
      },
    },
    MinConfidence: 50,
  };

  reko.detectLabels(paramsReko, (err, data) => {
    if (err) console.log(err, err.stack);
    else res.status(200).send(data.Labels);
  });
});

function readFile() {
  var paramsRead = {
    Bucket: "picturejs",
    Key: "pic.jpeg",
  };

  s3.getObject(paramsRead, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log("success read picture");
  });
}

function detecLabels() {
  var paramsReko = {
    Image: {
      S3Object: {
        Bucket: "picturejs",
        Name: "pic.jpeg",
      },
    },
    MinConfidence: 50,
  };

  reko.detectLabels(paramsReko, (err, data) => {
    if (err) console.log(err, err.stack);
    else {
      data.Labels.forEach((element) => {
        console.log(element.Name);
        console.log(element.Instances);
      });
    }
  });
}

app.listen(3000, () => console.log("API Server is running..."));
