import React, { createRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';

const BLOCK_SIZE = 64;

let tileImage = null;
let tileLocations = [];
let tileMap = {};
let startDrag = {};
let offset = {x: 0, y: 0};
let tempOffset = {x: 0, y: 0};
let uiScale = 1.0;
let uiMode = "edit";

const Level = ({tileSet}) => {
    let canvas = createRef();
    const [selectedTile, setSelectedTile] = useState({name: ""});
    const [mode, setMode] = useState("edit");
    const [scale, setScale] = useState(1.0);

    useEffect(() => {
        canvas.current.onmousemove = (event) => {
            trackMouse(event);
        }

        canvas.current.onmousedown = (event) => {
            if (uiMode === "edit") {
                setTile(event);
            } else if (uiMode === "pan") {
                startDrag = {x: event.clientX, y: event.clientY};
            }
        }

        canvas.current.onmouseup = (event) => {
            if (uiMode === "pan") {
                offset.x += tempOffset.x;
                offset.y += tempOffset.y;
                tempOffset = {x: 0, y: 0};
            }
        }
    }, []);

    const redrawPreview = (offsetX, offsetY, size, ctx) => {  
        if (!ctx) {
            let canvas = document.getElementById("le-canvas");
            ctx = canvas.getContext('2d');
        }

        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        tileLocations.forEach((tileLocation) => {
            let position = {x: (tileLocation.x * size) - offsetX, y: (tileLocation.y * size) - offsetY};
            if (position.x + size < 0 ||
                position.x - size >= canvas.clientWidth ||
                position.y + size < 0 ||
                position.y - size >= canvas.clientHeight) {
                return;
            }
            let image = document.getElementById(tileLocation.id);
            ctx.drawImage(image, position.x, position.y, size, size);
        });
    }

    const trackMouse = ({offsetX, offsetY, clientX, clientY, buttons}) => {
        let canvas = document.getElementById("le-canvas");
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        let size = BLOCK_SIZE * uiScale;

        if (buttons === 1 && uiMode === "pan") {
            let delta = {x: startDrag.x - clientX, y: startDrag.y - clientY};
            tempOffset.x = delta.x;
            tempOffset.y = delta.y;
        }

        tileLocations.forEach((tileLocation) => {
            let position = {x: (tileLocation.x * size)- tempOffset.x - offset.x, y: (tileLocation.y * size) - tempOffset.y - offset.y};
            if (position.x + size < 0 ||
                position.x - size >= canvas.clientWidth ||
                position.y + size < 0 ||
                position.y - size >= canvas.clientHeight) {
                return;
            }
            let image = document.getElementById(tileLocation.id);
            ctx.drawImage(image, position.x, position.y, size, size);
        });

        // Preview the new tile
        if (tileImage && uiMode === "edit") {
            let image = document.getElementById(tileImage);
            let gridX = Math.floor(offsetX/size) * size - ((offset.x % size) * Math.sign(offset.x));
            let gridY = Math.floor(offsetY/size) * size - ((offset.y % size) * Math.sign(offset.y));
            ctx.drawImage(image, gridX, gridY, size, size);
        }
    }

    const setTile = ({offsetX, offsetY}) => {
        let size = BLOCK_SIZE;

        let gridX = Math.floor((offsetX + offset.x)/size);
        let gridY = Math.floor((offsetY + offset.y)/size);
        
        let existingIndex = tileMap[`${gridX},${gridY}`];
        if (existingIndex) {
            tileLocations[existingIndex] = {x: gridX, y: gridY, selectedTile, id: tileImage};
        } else {
            tileLocations.push({x: gridX, y: gridY, selectedTile, id: tileImage});
            tileMap[`${gridX},${gridY}`] = tileLocations.length - 1;
        }
    }

    const selectTile = (tile, id) => {
        setSelectedTile(tile);
        tileImage = id;
    }

    const setEditorZoom = (delta) => {
        let factor = 1;
        if (delta === 1) {
            factor = 2;
        } else if (delta === -1) {
            factor = 0.5
        }
        setScale((oldScale) => {return oldScale * factor}); 
        uiScale *= factor;

        redrawPreview(offset.x, offset.y, uiScale * BLOCK_SIZE);
    }

    const setEditorMode = (mode) => {
        setMode(mode); 
        uiMode = mode;
    }

    return (
        <div>
            <div className="levelEditor">
                <div className="header">
                    <h1>Level Editor</h1>
                </div>
                <div className="tiles">
                    <button style={{color: "white", backgroundColor: mode === "edit" ? "blue" : "grey"}} onClick={() => {setEditorMode("edit")}}>Edit</button>
                    <button style={{color: "white", backgroundColor: mode === "pan" ? "blue" : "grey"}} onClick={() => {setEditorMode("pan")}}>Pan</button>
                    {/* <button onClick={() => {setEditorZoom(1)}}>Zoom In</button>
                    <span>{scale * 100}%</span>
                    <button onClick={() => {setEditorZoom(-1)}}>Zoom Out</button> */}
                </div>
                <div className="tiles">
                    {tileSet.map((tile, index) => {
                        return (
                            <img id={`tileImage-${index}`} key={`tile-${index}`} onClick={() => {selectTile(tile, `tileImage-${index}`)}} className={selectedTile.name === tile.name ? "selected" : null} src={tile.imageUrl} />
                        );
                    })}
                </div>
                <div className="level">
                    <canvas id="le-canvas" width={1000} height={600} ref={canvas} />
                </div>
            </div>
        </div>
    );
}

let mapStateToProps = (state) => {
    return {
        tileSet: state.tileSet
    }
}

let mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Level);
