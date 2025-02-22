import express from "express";
const app = express();

import rp from "request-promise";

import { HorizonBlockchain } from "../horizon-blockchain/horizon-blockchain.js";

import { v4 as uuidv4 } from "uuid";

const port = process.argv[2];

const nodeAddress = uuidv4().split("-").join("");

const horizoncoin = new HorizonBlockchain();

import bodyParser from "body-parser"; // No destructuring needed

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/horizonblockchain", function (req, res) {
    res.send(horizoncoin);
});

app.post("/broadcast-transaction", function (req, res) {
    const newTransaction = horizoncoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient
    );
    horizoncoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    horizoncoin.networkNodes.forEach((networkNodeUrl) => {
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
    const lastBlock = horizoncoin.getLastBlock();
    const previousBlockHash = lastBlock["hash"];
    const currentBlockData = {
        transactions: horizoncoin.pendingTransactions,
        index: lastBlock["index"] + 1,
    };

    const nonce = horizoncoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = horizoncoin.hashBlock(
        previousBlockHash,
        currentBlockData,
        nonce
    );

    const newBlock = horizoncoin.createNewBlock(
        nonce,
        previousBlockHash,
        blockHash
    );

    const requestPromises = [];
    horizoncoin.networkNodes.forEach((networkNodeUrl) => {
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
                uri: horizoncoin.currentNodeUrl + "/broadcast-transaction",
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
    const lastBlock = horizoncoin.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

    if (correctHash && correctIndex) {
        horizoncoin.chain.push(newBlock);
        horizoncoin.pendingTransactions = [];
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
    if (horizoncoin.networkNodes.indexOf(newNodeUrl) == -1)
        horizoncoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    horizoncoin.networkNodes.forEach((networkNodeUrl) => {
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
                        ...horizoncoin.networkNodes,
                        horizoncoin.currentNodeUrl,
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
        horizoncoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = horizoncoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
        horizoncoin.networkNodes.push(newNodeUrl);
    res.json({ note: "New node registered successfully." });
});

app.post("/register-nodes-bulk", function (req, res) {
    try {
        const allNetworkNodes = req.body.allNetworkNodes;
        allNetworkNodes.forEach((networkNodeUrl) => {
            const nodeNotAlreadyPresent =
                horizoncoin.networkNodes.indexOf(networkNodeUrl) == -1;
            const notCurrentNode =
                horizoncoin.currentNodeUrl !== networkNodeUrl;
            if (nodeNotAlreadyPresent && notCurrentNode)
                horizoncoin.networkNodes.push(networkNodeUrl);
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
    horizoncoin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions = {
            uri: networkNodeUrl + "/horizonblockchain",
            method: "GET",
            json: true,
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises).then((blockchains) => {
        const currentChainLength = horizoncoin.chain.length;
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
            (newLongestChain && !horizoncoin.chainIsValid(newLongestChain))
        ) {
            res.json({
                note: "Current chain has not been replaced.",
                chain: horizoncoin.chain,
            });
        } else {
            horizoncoin.chain = newLongestChain;
            horizoncoin.pendingTransactions = newPendingTransactions;
            res.json({
                note: "This chain has been replaced",
                chain: horizoncoin.chain,
            });
        }
    });
});

app.get("/block/:blockHash", function (req, res) {
    const blockHash = req.params.blockHash;
    const correctBlock = horizoncoin.getBlock(blockHash);
    res.json({
        block: correctBlock,
    });
});

app.get("/transaction/:transactionId", function (req, res) {
    const transactionId = req.params.transactionId;
    const transactionData = horizoncoin.getTransaction(transactionId);
    res.json({
        transaction: transactionData.transaction,
        block: transactionData.block,
    });
});

app.get("/address/:address", function (req, res) {
    const address = req.params.address;
    const addressData = horizoncoin.getAddressData(address);
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
