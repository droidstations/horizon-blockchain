import React, { useState, useEffect } from "react";
import axios from "axios";

const Block = ({ match }) => {
    const [block, setBlock] = useState(null);

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/block/${match.params.id}`
                );
                setBlock(response.data);
            } catch (error) {
                console.error("Error fetching block", error);
            }
        };

        fetchBlock();
    }, [match.params.id]);

    return block ? (
        <div>
            <h1>Block Details</h1>
            <p>ID: {block.id}</p>
            <p>Timestamp: {block.timestamp}</p>
            <p>Transactions: {block.transactions.length}</p>
            {/* Add more block details as needed */}
        </div>
    ) : (
        <p>Loading...</p>
    );
};

export default Block;
