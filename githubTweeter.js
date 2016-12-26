'use strict';

const Fs = require("fs");
const Http = require("http");
const Twitter = require("twitter");
const CreateHandler = require("github-webhook-handler");

const SETTINGS_FILENAME = ".settings";

const settings = JSON.parse(Fs.readFileSync(SETTINGS_FILENAME, "utf-8"));

const port = settings.port || process.env.port || 8080;
const repositoryOwner = settings.github.owner;

const autoTweeter = new Twitter(settings.twitter.keys);
const handler = CreateHandler({
    path: "/",
    secret: settings.github.secret
});

const getTweetText = (hookEventName) => {
    switch(hookEventName){
        case "release":
            return settings.twitter.releaseTweet || null;
        default:
            return null;
    }
}

Http.createServer((request, response) => {
    handler(request, response, (error) => {
        response.writeHead(404, {"Content-Type": "text/html"});
        response.end("No such location");
    });
}).listen(port);

handler.on("release", (event) => {
    const payload = event.payload;
    const ownerName = payload.repository.owner.login;

    if (ownerName !== repositoryOwner) {
        console.log("received invalid release data!");
        return;
    }

    const tweetText = getTweetText("release", payload);

    if (tweetText !== null || tweetText === "") {
        console.log("Tweet string is empty!");
        return;
    }

    autoTweeter.updateStatus(
        tweetText.replace(/{{(.*?)}}/g, (all, group) => {
            return payload[group] || "null";
        }),
        (data) => {
            console.log(data);
        }
    );
});

handler.on("error", (error) => {
    console.log(error.toString());
});
