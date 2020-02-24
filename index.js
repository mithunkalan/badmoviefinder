var fs = require("fs");
let cheerio = require("cheerio");
var https = require("https");
const csv = require("csvtojson");
const fetch = require("node-fetch");

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

async function getMyFile(movie) {
  return new Promise((resolve, reject) => {
    https
      .get(
        "https://www.imdb.com/list/" + movie + "/export?ref_=ttls_exp",
        res => {
          var { statusCode } = res;
          var contentType = res.headers["content-type"];
          let error;
          if (error) {
            console.error(error.message);
            res.resume();
          }
          res.setEncoding("utf8");
          let rawData = "";
          res.on("data", chunk => {
            rawData += chunk;
          });
          res.on("end", () => {
            try {
              const parsedData = rawData;
              let s = csv({
                noheader: false,
                output: "json"
              })
                .fromString(parsedData)
                .then(csvRow => {
                  resolve(csvRow);
                });
            } catch (e) {
              reject(e.message);
            }
          });
        }
      )
      .on("error", e => {
        reject(`Got error: ${e.message}`);
      });
  });
}

async function getListFromMovie(moviett, page) {
  let f = await fetch(
    "https://www.imdb.com/lists/" + moviett + "?page=" + page
  );
  return await f.text();
}

async function scrapelistpage(page) {
  var html = cheerio.load(page);
  list = [];
  html(".list-preview").each(function(i, elem) {
    list.push(
      html(this)
        .find(".list_name")
        .find("a")
        .attr("href")
        .split("?")[0]
        .replace("/list/", "")
    );
  });
  return list;
}

async function getcleanlistfrommovie(movie) {
  var donelist = JSON.parse(fs.readFileSync("moviesalreadyscraped.json"));
  if (donelist.indexOf(movie) === -1) {
    var page = 1;
    let lists = await getListFromMovie(movie, page);
    var listoflists = [];
    var templist = await scrapelistpage(lists);
    while (templist.length === 100) {
      listoflists = listoflists.concat(templist);
      page += 1;
      lists = await getListFromMovie(movie, page);
      templist = await scrapelistpage(lists);
      if (templist.length === 0) {
        templist = await scrapelistpage(lists);
      }
    }
    listoflists = listoflists.concat(templist);
    lists = await getListFromMovie(movie, page);
    templist = await scrapelistpage(lists);
    listoflists = listoflists.concat(templist);
    var filelist = JSON.parse(fs.readFileSync("listoflists.json"));
    filelist = filelist.concat(listoflists);
    filelist = [...new Set(filelist)];
    var file = fs.writeFileSync(
      "listoflists.json",
      JSON.stringify(filelist, null, 4)
    );
    donelist.push(movie);
    var file2 = fs.writeFileSync(
      "moviesalreadyscraped.json",
      JSON.stringify(donelist, null, 4)
    );
    return listoflists;
  } else return [];
}

async function comparelists() {
  var commons = 80;
  var commonratio = 0.2;
  var populatedlist = JSON.parse(fs.readFileSync("populatedlists.json"));
  populatedlist = populatedlist.filter(z => z.listid !== "ls041148329");
  let osmc = await getosmc();
  var cleanosmc = [];
  osmc = osmc.filter(z => z.indexOf("/shit") > -1);
  osmc.forEach(z => {
    cleanosmc.push(z.split("|")[0]);
  });
  cleanosmc = cleanosmc.filter(z => z.indexOf("tt") > -1);
  console.log("tuning params>> common count:" + commons);
  console.log(
    "tuning params>> ratio of commons to their full list:" + commonratio
  );
  var towatch = [];
  populatedlist.forEach(a => {
    var sameasme = 0;
    a.movies.forEach(z => {
      if (cleanosmc.indexOf(z) > -1) sameasme += 1;
    });
    if ((sameasme > commons && sameasme / a.movies.length > commonratio) ||(sameasme / a.movies.length > .6 && sameasme / a.movies.length < 1)) {
      console.log("their list id " + a.listid +" with "+a.movies.length+" movies. "+sameasme+" movies in common");
      towatch = towatch.concat(a.movies);
    }
  });
  towatch = [...new Set(towatch)];
  var newwatch = [];
  towatch.forEach(z => {
    if (cleanosmc.indexOf(z) === -1) newwatch.push(z);
  });
   console.table(newwatch);
  console.log(newwatch.length+" movies in the list that i dont have");
}

async function populatelist() {
  var longlistoflists = JSON.parse(fs.readFileSync("listoflists.json"));
  for (var i = 0; i < longlistoflists.length; i++) {
    console.log(i);
    var populatedlist = JSON.parse(fs.readFileSync("populatedlists.json"));
    if (
      populatedlist.filter(z => z.listid === longlistoflists[i]).length === 0
    ) {
      let imdb = await getMyFile(longlistoflists[i]);
      var cleanimdb = [];
      imdb.forEach(z => cleanimdb.push(z.Const));
      populatedlist.push({ listid: longlistoflists[i], movies: cleanimdb });
      var file = fs.writeFileSync(
        "populatedlists.json",
        JSON.stringify(populatedlist, null, 4)
      );
    }
  }
}

async function main() {
  // let myimdb = await getMyFile("ls041148329");
  let osmc = await getosmc();
  var cleanosmc = [];
  osmc = osmc.filter(z => z.indexOf("/shit") > -1);
  // console.table(osmc)
  osmc.forEach(z => {
    cleanosmc.push(z.split("|")[0]);
  });
  cleanosmc = cleanosmc.filter(z => z.indexOf("tt") > -1);

  //this will get a list of lists for a movie on my shit list
  // for (var i = 0; i < cleanosmc.length; i++) {
  //   var listoflists = await getcleanlistfrommovie(cleanosmc[i]);
  //   console.log(cleanosmc[i]);
  //   console.log(listoflists.length);
  // }

  // this will get all the movies that are in some list
  // await populatelist()

  //this will compate my shit list with other lists. we need to have at least 50 movies in common and their list needs at least 20% shit in common
  await comparelists();
}

main();
