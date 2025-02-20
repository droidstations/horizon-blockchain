import express from "express";
const app = express();

import rp from "request-promise";

import { DashBlockchain } from "../dashblockchain/dashblockchain.js";

import { v4 as uuidv4 } from "uuid";

const port = process.argv[2];

const nodeAddress = uuidv4().split("-").join("");

const dashcoin = new DashBlockchain();

import bodyParser from "body-parser"; // No destructuring needed

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/dashblockchain", function (req, res) {
    res.send(dashcoin);
});

app.post("/broadcasttransaction", function (req, res) {
    const newTransaction = dashcoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient
    );
    dashcoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    dashcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
            uri: networkNodeUrl + "/transaction",
            method: "POST",
            body: newTransaction,
            json: true,
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then((data) => {
        res.json({ note: "Transaction created and broadcast successfully." });
    });
});

app.get("/mine", function (req, res) {
    const lastBlock = dashcoin.getLastBlock();
    const previousBlockHash = lastBlock["hash"];
    const currentBlockData = {
        transactions: dashcoin.pendingTransactions,
        index: lastBlock["index"] + 1,
    };

    const nonce = dashcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = dashcoin.hashBlock(
        previousBlockHash,
        currentBlockData,
        nonce
    );

    const newBlock = dashcoin.createNewBlock(
        nonce,
        previousBlockHash,
        blockHash
    );

    const requestPromises = [];
    dashcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
            uri: networkNodeUrl + "/receive-new-block",
            method: "POST",
            body: { newBlock: newBlock },
            json: true,
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then((data) => {
            const requestOptions = {
                uri: dashcoin.currentNodeUrl + "/broadcasttransaction",
                method: "POST",
                body: {
                    amount: 12.5,
                    sender: "00",
                    recipient: nodeAddress,
                },
                json: true,
            };

            return rp(requestOptions);
        })
        .then((data) => {
            res.json({
                note: "New block mined and broadcast successfuly",
                block: newBlock,
            });
        });
});

app.post("/receive-new-block", function (req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = dashcoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

    if (correctHash && correctIndex) {
        dashcoin.chain.push(newBlock);
        dashcoin.pendingTransactions = [];
        res.json({
            note: "New block received and accepted",
            newBlock: newBlock,
        });
    } else {
        res.json({
            note: "New block rejected.",
            newBlock: newBlock,
        });
    }
});

app.post("/register-and-broadcast-node", function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (dashcoin.networkNodes.indexOf(newNodeUrl) == -1)
        dashcoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    dashcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
            uri: networkNodeUrl + "/register-node",
            method: "POST",
            body: { newNodeUrl: newNodeUrl },
            json: true,
        };

        regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
        .then((data) => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + "/register-nodes-bulk",
                method: "POST",
                body: {
                    allNetworkNodes: [
                        ...dashcoin.networkNodes,
                        dashcoin.currentNodeUrl,
                    ],
                },
                json: true,
            };

            return rp(bulkRegisterOptions);
        })
        .then((data) => {
            res.json({
                note: "New node registered with network successfully.",
            });
        });
});

app.post("/register-node", function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent =
        dashcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = dashcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
        dashcoin.networkNodes.push(newNodeUrl);
    res.json({ note: "New node registered successfully." });
});

app.post("/register-nodes-bulk", function (req, res) {
    try {
        const allNetworkNodes = req.body.allNetworkNodes;
        allNetworkNodes.forEach((networkNodeUrl) => {
            const nodeNotAlreadyPresent =
                dashcoin.networkNodes.indexOf(networkNodeUrl) == -1;
            const notCurrentNode = dashcoin.currentNodeUrl !== networkNodeUrl;
            if (nodeNotAlreadyPresent && notCurrentNode)
                dashcoin.networkNodes.push(networkNodeUrl);
        });

        res.json({ note: "Bulk registration successful" });
    } catch (error) {
        console.error(
            "Api point: register-nodes-bulk : Error : ",
            error.message
        );
        throw new Error("Api point: register-nodes-bulk : Error :");
    }
});

app.get("/consensus", function (req, res) {
    const requestPromises = [];
    dashcoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
            uri: networkNodeUrl + "/dashblockchain",
            method: "GET",
            json: true,
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then((blockchains) => {
        const currentChainLength = dashcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;
        blockchains.forEach((blockchain) => {
            if (blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            }
        });

        if (
            !newLongestChain ||
            (newLongestChain && !dashcoin.chainIsValid(newLongestChain))
        ) {
            res.json({
                note: "Current chain has not been replaced.",
                chain: dashcoin.chain,
            });
        } else {
            dashcoin.chain = newLongestChain;
            dashcoin.pendingTransactions = newPendingTransactions;
            res.json({
                note: "This chain has been replaced",
                chain: dashcoin.chain,
            });
        }
    });
});

app.get("/block/:blockHash", function (req, res) {
    const blockHash = req.params.blockHash;
    const correctBlock = dashcoin.getBlock(blockHash);
    res.json({
        block: correctBlock,
    });
});

app.get("/transaction/:transactionId", function (req, res) {
    const transactionId = req.params.transactionId;
    const transactionData = dashcoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block,
    });
});

app.get("/address/:address", function (req, res) {
    const address = req.params.address;
    const addressData = dashcoin.getAddressData(address);
    res.json({
        addressData: addressData,
    });
});

app.get("/block-explorer", function (req, res) {
    res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.listen(port, function () {
    console.log(`Node address: ${nodeAddress} `);
    console.log(`Listening on port ${port}...`);
});
