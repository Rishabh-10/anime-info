// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");


const liveReload = require("livereload");
const path = require("path");
const liveReloadServer = liveReload.createServer();
liveReloadServer.watch(path.join(__dirname));

// connecting livereload
const connectLiveReload = require("connect-livereload");


const app = express();

app.use(connectLiveReload());

// for templates
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

// NOTE:
// we should not use public in the href source for css or images inside public it is added automatically.
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {

    res.render("index");
})

app.post("/", function (req, res) {
    const anime = req.body.animeName;
    const url = `https://kitsu.io/api/edge/anime?filter[text]=${anime}`;

    // let options = {
    //     url: url,
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': "application/vnd.api+json",
    //         'Accept': "application/vnd.api+json",
    //     },
    //     json: true
    // }

    // const request = https.request(options, function (response) {
        
    // });

    https.get(url, (response) => {
        let result = "";
        response.on("data", (data) => {
            result += data;
        });

        response.on('end', function () {
            result = JSON.parse(result);

            const animeAttributes =  result.data[0].attributes;

            const title = animeAttributes.titles.ja_jp;

            const desp = animeAttributes.description ? animeAttributes.description.slice(0, (animeAttributes.description.length - 25)) : "N/A";
            const startDate = animeAttributes.startDate ? animeAttributes.startDate : "N/A";
            const endDate = animeAttributes.endDate ? animeAttributes.endDate : "N/A";
            const rating = animeAttributes.averageRating ? animeAttributes.averageRating : "N/A";
            const imgSrc = animeAttributes.coverImage.tiny ? animeAttributes.coverImage.large : "N/A";
            const epCount = animeAttributes.episodeCount ? animeAttributes.episodeCount : "N/A";
            
            let status = animeAttributes.status ? animeAttributes.status : "N/A";

            status = status[0].toUpperCase() + status.slice(1, status.length);
            res.render("result.ejs", {
                animeName: anime,
                title: title,
                startDate: startDate,
                endDate: endDate,
                rating: rating,
                imgSrc: imgSrc,
                epCount: epCount,
                status: status,
                desp: desp
            });
        });
    }).on('error', (e) => {
        console.error(e);
    });
});

app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("Server starting at port 3000");
});

// requesting reload
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
});