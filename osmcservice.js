const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const port = 6969;

var https = require("https");
var querystring = require("querystring");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

async function getosmc() {
  return new Promise((resolve, reject) => {
    var getrecords =
      "ssh osmc@osmc '/usr/osmc/bin/sqlite3 /home/osmc/.kodi/userdata/Database/MyVideos116.db \"select uniqueid_value,c22 from movie_view\"'";
    const exec = require("child_process").exec;
    const child = exec(getrecords, (error, stdout, stderr) => {
      if (stdout) {
        resolve(stdout.split("\n"));
      } else if (stderr) {
        reject(stderr);
      }
    });
  });
}

app.get("/", async (req, res) => {
  if (req.query.getdb)
  {var getrecords =
    "ssh osmc@osmc '/usr/osmc/bin/sqlite3 /home/osmc/.kodi/userdata/Database/MyVideos116.db \"select uniqueid_value,c22 from movie_view\"'";
  const exec = require("child_process").exec;
  const child = exec(getrecords, (error, stdout, stderr) => {
    if (stdout) {
      res.send(stdout.split("\n"));
    } else if (stderr) {
      // reject(stderr);
    }
  });}
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
