import React, { useState, useEffect } from "react";
import axios from "axios";

const Blocks = () => {
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/blocks"
                );
                console.log("Response data: ", response.data.chain);
                setBlocks(response.data.chain);
            } catch (error) {
                console.error("Error fetching blocks", error);
            }
        };

        fetchBlocks();
    }, []);

    return (
        <div>
            <h1>Blocks</h1>
            <ul>
                {blocks.map((block, index) => (
                    <>
                        <li key={index}>
                            <a href={`/block/${block.index}`}>{block.index}</a>
                            <p>{block.nonce}</p>
                        </li>
                    </>
                ))}
            </ul>
        </div>
    );
};

export default Blocks;
