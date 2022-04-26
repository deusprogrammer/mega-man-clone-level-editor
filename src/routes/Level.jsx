import React, { createRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';

const BLOCK_SIZE = 64;

let tileImage = null;
let tileName = null;
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
        document.onkeydown = (event) => {
            if (event.key === " " ||
                event.code === "Space"      
            ) {
                setEditorMode("pan");
            }
        }

        document.onkeyup = (event) => {
            setEditorMode("edit");
        }

        canvas.current.onwheel = (event) => {
            if (event.deltaY > 0) {
                setEditorZoom(1);
            } else {
                setEditorZoom(-1);
            }
            event.preventDefault();
        }

        canvas.current.onmousemove = (event) => {
            trackMouse(event);
        }

        canvas.current.onmousedown = (event) => {
            if (uiMode === "edit" && tileImage) {
                setTile(event);
            } else if (uiMode === "pan") {
                startDrag = {x: event.clientX, y: event.clientY};
            }
        }

        canvas.current.onmouseup = (event) => {
            if (uiMode === "pan") {
                setEditorOffset(offset.x + tempOffset.x, offset.y + tempOffset.y);
                tempOffset = {x: 0, y: 0};
            }
        }

        let tileLocationsJson = localStorage.getItem("levelEditorTileLocations");
        let tileMapJson = localStorage.getItem("levelEditorTileMap");
        let offsetJson = localStorage.getItem("levelEditorOffset");
        let uiScaleJson = localStorage.getItem("levelEditorZoom");

        tileLocations = tileLocationsJson ? JSON.parse(tileLocationsJson) : [];
        tileMap = tileMapJson ? JSON.parse(tileMapJson) : {};
        offset = offsetJson ? JSON.parse(offsetJson) : {x: 0, y: 0};
        uiScale = uiScaleJson ? parseFloat(uiScaleJson) : 1.0;

        setScale(uiScale);

        console.log("ZOOM: " + uiScale);

        redrawPreview(offset.x, offset.y, BLOCK_SIZE * uiScale);
    }, []);

    const alignGrid = () => {
        let size = BLOCK_SIZE * uiScale;
        offset.x = Math.floor(offset.x/size) * size;
        offset.y = Math.floor(offset.y/size) * size
    }

    const redrawPreview = (offsetX, offsetY, size, ctx) => {  
        let canvas = document.getElementById("le-canvas");
        if (!ctx) {
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
            let position = {x: (tileLocation.x * size) - tempOffset.x - offset.x, y: (tileLocation.y * size) - tempOffset.y - offset.y};
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
            let gridX = Math.floor(offsetX/size) * size;
            let gridY = Math.floor(offsetY/size) * size;
            ctx.drawImage(image, gridX, gridY, size, size);
        }
    }

    const selectTile = (tile, id) => {
        setSelectedTile(tile);
        setEditorMode("edit");
        console.log("SELECTED: " + JSON.stringify(tile, null, 5));
        tileImage = id;
        tileName = tile.name;
    }

    const setTile = ({offsetX, offsetY}) => {
        let size = BLOCK_SIZE * uiScale;

        let gridX = Math.floor((offsetX + offset.x)/size);
        let gridY = Math.floor((offsetY + offset.y)/size);
        
        let existingIndex = tileMap[`${gridX},${gridY}`];
        if (existingIndex) {
            tileLocations[existingIndex] = {x: gridX, y: gridY, selectedTile, id: tileImage, name: tileName};
        } else {
            tileLocations.push({x: gridX, y: gridY, selectedTile, id: tileImage, name: tileName});
            tileMap[`${gridX},${gridY}`] = tileLocations.length - 1;
        }

        localStorage.setItem("levelEditorTileLocations", JSON.stringify(tileLocations));
        localStorage.setItem("levelEditorTileMap", JSON.stringify(tileMap));
    }

    const setEditorOffset = (offsetX, offsetY) => {
        offset.x = offsetX;
        offset.y = offsetY;
        alignGrid();

        localStorage.setItem("levelEditorOffset", JSON.stringify(offset));
    }

    const setEditorZoom = (delta) => {
        // let factor = 1;
        // if (delta === 1) {
        //     factor = 2;
        // } else if (delta === -1) {
        //     factor = 0.5
        // }

        setScale((oldScale) => {return oldScale + delta/100}); 
        uiScale += delta/100;

        redrawPreview(offset.x, offset.y, uiScale * BLOCK_SIZE);
        alignGrid();

        localStorage.setItem("levelEditorZoom", uiScale);
    }

    const setEditorMode = (mode) => {
        setMode(mode); 
        uiMode = mode;
    }

    const download = () => {
        let [minX, minY, maxX, maxY] = [null, null, null, null];

        tileLocations.forEach((tileLocation) => {
            if (minX === null || tileLocation.x < minX) {
                minX = parseInt(tileLocation.x);
            }
            if (minY === null || tileLocation.y < minY) {
                minY = parseInt(tileLocation.y);
            }
            if (maxX === null || tileLocation.x > maxX) {
                maxX = parseInt(tileLocation.x);
            }
            if (maxY === null || tileLocation.y > maxY) {
                maxY = parseInt(tileLocation.y);
            }
        });

        const matrix = new Array(maxY - minY + 1).fill("").map(() => new Array(maxX - minX + 1).fill(""));
        tileLocations.forEach((tileLocation) => {
            console.log("TILE: " + JSON.stringify(tileLocation, null, 5));
            matrix[parseInt(tileLocation.y) - minY][parseInt(tileLocation.x) - minX] = tileLocation.name; 
        });

        console.log(JSON.stringify(matrix, null, 5));
    }

    return (
        <div>
            <div className="levelEditor">
                <div className="header">
                    <h1>Level Editor</h1>
                </div>
                <div className="tiles">
                    <button onClick={() => {download()}}>Download Level</button>
                    {/* <button style={{color: "white", backgroundColor: mode === "edit" ? "blue" : "grey"}} onClick={() => {setEditorMode("edit")}}>Edit</button>
                    <button style={{color: "white", backgroundColor: mode === "pan" ? "blue" : "grey"}} onClick={() => {setEditorMode("pan")}}>Pan</button>
                    <button onClick={() => {setEditorZoom(1)}}>Zoom In</button> */}
                    <span>Zoom: {Math.trunc(scale * 100)}%</span>
                    {/* <button onClick={() => {setEditorZoom(-1)}}>Zoom Out</button> */}
                </div>
                <div className="tiles">
                    {tileSet.map((tile, index) => {
                        return (
                            <img id={`tileImage-${index}`} key={`tile-${index}`} onClick={() => {selectTile(tile, `tileImage-${index}`)}} className={selectedTile.name === tile.name ? "selected" : null} src={tile.imageUrl} />
                        );
                    })}
                </div>
                <div className="level">
                    <canvas id="le-canvas" style={{cursor: mode === "pan" ? "grab" : "default"}} width={window.innerWidth * 0.95} height={window.innerHeight * 0.80} ref={canvas} />
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
