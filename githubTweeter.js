'use strict';

const PORT = process.env.port || 8080;
const SECRET = "sec_key";
const REPOSITORY_NAME = "repo_name";

const Http = require("http");
const Twitter = require("twitter");
const CreateHandler = require("github-webhook-handler");

const handler = CreateHandler({
    path: "/",
    secret: SECRET
});

Http.createServer((request, response) => {
    handler(request, response, (error) => {
        response.writeHead(404, {"Content-Type": "text/html"});
        response.end("No such location");
    });
}).listen(PORT);


handler.on("release", (event) => {
    const payload = event.payload;
    const repoName = payload.repository.name;

    if (repoName === REPOSITORY_NAME) {
        
    }
});

handler.on("error", (error) => {
    console.log(error);
});
