import { fork } from "child_process"; // No destructuring needed
import rp from "request-promise";
import http from "http";

let args = ["3001", "http://localhost:3001"];
const node_1 = fork("horizon-node/horizon-node.js", args, {
    detached: true,
    stdio: "ignore",
});

node_1.unref();

args = ["3002", "http://localhost:3002"];
const node_2 = fork("horizon-node/horizon-node.js", args, {
    detached: true,
    stdio: "ignore",
});

node_2.unref();

console.log("Starting wait of nodes.");

await checkIfNodeIsReady(3001);
console.log("Node 1 ready");
await checkIfNodeIsReady(3002);
console.log("Node 2 ready");

console.log("Starting connection of nodes.");

const requestPromises = [];

let requestOptions = {
    uri: "http://localhost:3001/register-and-broadcast-node",
    method: "POST",
    body: {
        newNodeUrl: "http://localhost:3002",
    },
    json: true,
};

requestPromises.push(rp(requestOptions));

requestOptions = {
    uri: "http://localhost:3002/register-and-broadcast-node",
    method: "POST",
    body: {
        newNodeUrl: "http://localhost:3001",
    },
    json: true,
};

requestPromises.push(rp(requestOptions));

Promise.all(requestPromises).then((data) => {
    console.log("Nodes connected.");
});

async function checkIfNodeIsReady(port) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            http.get(`http://localhost:${port}/horizon-blockchain`, (res) => {
                if (res.statusCode === 200) {
                    clearInterval(interval);
                    resolve();
                }
            }).on("error", () => {});
        }, 1000);
    });
}
