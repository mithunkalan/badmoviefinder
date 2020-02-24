var fs = require("fs");
let cheerio = require("cheerio");
var https = require("https");
const csv = require("csvtojson");
const fetch = require("node-fetch");
xml2js = require("xml2js");
var parser = new xml2js.Parser();

async function getosmc() {
  return new Promise((resolve, reject) => {
    var getrecords =
      "ssh osmc@osmc '/usr/osmc/bin/sqlite3 /home/osmc/.kodi/userdata/Database/MyVideos116.db \"select uniqueid_value, lastPlayed, strPath, idFile from movie_view\"'";
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

async function makecsv(input) {
  return new Promise((resolve, reject) => {
    try {
      let s = csv({
        noheader: true,
        output: "json"
      })
        .fromString(input)
        .then(csvRow => {
          resolve(csvRow);
        });
    } catch (e) {
      reject(e.message);
    }
  });
}

async function getnfofile(dir) {
  let s = await fs.readdirSync(
    dir.replace("sftp://192.168.0.112:22", "/media/rpi")
  );
  s = s.filter(z => z !== "INFO.nfo");
  let nfo =
    dir.replace("sftp://192.168.0.112:22", "/media/rpi") +
    s.filter(z => z.indexOf(".nfo") > -1)[0];
  return nfo;
}

async function readxml(file) {
  try {

    let s = await fs.readFileSync(file);
    let t = await parser.parseStringPromise(s);
    return t.movie.watched;
  } catch (err) {
    console.log(err)
    console.log("probably an extra nfo file somewhere")
  }

}

async function settowatched(id) {
  try{

    return new Promise((resolve, reject) => {
      var getrecords = "ssh osmc@osmc \"./updatemovie.sh " + id + "\"";
      console.log(getrecords);
      const exec = require("child_process").exec;

      const child = exec(getrecords, (error, stdout, stderr) => {
        if (stdout) {
          console.log("good")
          resolve(stdout.split("\n"));
        } else if (stderr) {
          console.log("faile")
          reject(stderr);
        }
      });
    });
  } catch (err){
    console.log(err)
  }

}

async function main() {
  let s = await getosmc();
  // console.log(s)
  var p = [];
  s.forEach(z => {
    p.push(z.split("|"));
  });
  p = p.filter(z => z[1] === "");
  var watched = [];
  for (var i = 0; i < p.length; i++) {
     // console.log(p[i][2])
    let nfo = await getnfofile(p[i][2]);
      // console.log(nfo)
    let r = await readxml(nfo);
      // console.log(r)
    if (r[0] === "true") watched.push(p[i]);
  }
  var ids = []
  watched.forEach(z=>{
    ids.push(z[3])
  })
  console.log(ids)
  if (ids.length >0) {
    await settowatched(ids[0])
      }
  // for (var h = 0; h < watched.length; h++) {
  //   console.log(watched[h]);
  //   let y = await settowatched(watched[h][3]);
  //   console.log(y);
  // }
}

main();
