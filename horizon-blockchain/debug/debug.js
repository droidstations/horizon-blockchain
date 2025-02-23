import { HorizonBlockchain } from "../horizon-blockchain/horizon-blockchain.js";

const horizoncoin = new HorizonBlockchain();

const bc1 = {
    chain: [
        {
            index: 1,
            timestamp: 1739879664307,
            transactions: [],
            nonce: 100,
            hash: "0",
            previousBlockHash: "0",
        },
        {
            index: 2,
            timestamp: 1739879681377,
            transactions: [],
            nonce: 18140,
            hash: "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
            previousBlockHash: "0",
        },
        {
            index: 3,
            timestamp: 1739879820099,
            transactions: [
                {
                    amount: 12.5,
                    sender: "00",
                    recipient: "2e14b374bb0d428a83c3b385436cfdee",
                    transactionId: "e17140000c45457482553bdbbcb259f3",
                },
                {
                    amount: 76.34,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "c8d16b2fd51f4d538de0165f542991ca",
                },
                {
                    amount: 24.33,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "fe90a694f33f41ada114b79d954b9f72",
                },
                {
                    amount: 45.76,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "dd721eff12d34eb1a968a2ad685a3563",
                },
            ],
            nonce: 18186,
            hash: "0000fbe6646f9e36791df85228ee927ed4caa28e22395cee750fa7beaeb6e139",
            previousBlockHash:
                "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
        },
        {
            index: 4,
            timestamp: 1739879870075,
            transactions: [
                {
                    amount: 12.5,
                    sender: "00",
                    recipient: "2e14b374bb0d428a83c3b385436cfdee",
                    transactionId: "7cb14927c0104891983122e1ed4f34e0",
                },
                {
                    amount: 10.11,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "e814db94c9cd4c8f938c647acb8c1690",
                },
                {
                    amount: 56.33,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "47a45358acd84b0cae2316a724907221",
                },
                {
                    amount: 23.33,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "6382ec54c10a48aeb123b7f1f872c2d2",
                },
                {
                    amount: 78.28,
                    sender: "43JO43J5OJ5I46OJ4J7O56J7IO5JJ67I",
                    recipient: "CDSFSD890GFD8G0FD0H70GFHFGH89GFHJ",
                    transactionId: "f9a1b3f39ea44e6b9c21867230fe27ce",
                },
            ],
            nonce: 37447,
            hash: "0000d9c22f30535f84911b8680dac736de3cfbdd86b73de33de20c3224a3a1a3",
            previousBlockHash:
                "0000fbe6646f9e36791df85228ee927ed4caa28e22395cee750fa7beaeb6e139",
        },
        {
            index: 5,
            timestamp: 1739879880895,
            transactions: [
                {
                    amount: 12.5,
                    sender: "00",
                    recipient: "2e14b374bb0d428a83c3b385436cfdee",
                    transactionId: "13ba9e46b592465f860d7bb141574cc9",
                },
            ],
            nonce: 38004,
            hash: "000065b2e005164973e7a7fe68543702cb994d65ee84000d63fd90769e68215a",
            previousBlockHash:
                "0000d9c22f30535f84911b8680dac736de3cfbdd86b73de33de20c3224a3a1a3",
        },
        {
            index: 6,
            timestamp: 1739879883389,
            transactions: [
                {
                    amount: 12.5,
                    sender: "00",
                    recipient: "2e14b374bb0d428a83c3b385436cfdee",
                    transactionId: "b11f1a68a8cd48f7a0369d12da23cd2e",
                },
            ],
            nonce: 3242,
            hash: "0000cae796ab9aacef3f8d8ec3463c5478878f58636d62053b28de8a75622bb8",
            previousBlockHash:
                "000065b2e005164973e7a7fe68543702cb994d65ee84000d63fd90769e68215a",
        },
    ],
    pendingTransactions: [
        {
            amount: 12.5,
            sender: "00",
            recipient: "2e14b374bb0d428a83c3b385436cfdee",
            transactionId: "cec1d6c218ee4068b7d357df19b5d0dc",
        },
    ],
    currentNodeUrl: "http://localhost:3001",
    networkNodes: [],
};

console.log("VALID: ", horizoncoin.chainIsValid(bc1.chain));
