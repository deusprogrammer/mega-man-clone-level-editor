import React, { createRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';

let tileImage = null;
let tileLocations = [];
let tileMap = {};

const Level = ({tileSet}) => {
    let canvas = createRef();
    const [selectedTile, setSelectedTile] = useState({name: ""});

    useEffect(() => {
        canvas.current.onmousemove = (event) => {
            trackMouse(event);
        }

        canvas.current.onmousedown = (event) => {
            setTile(event);
        }
    }, []);

    const trackMouse = ({offsetX, offsetY}) => {
        let canvas = document.getElementById("le-canvas");
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        
        tileLocations.forEach((tileLocation) => {
            console.log("ID: " + tileLocation.id);
            let image = document.getElementById(tileLocation.id);
            ctx.drawImage(image, tileLocation.x, tileLocation.y, 64, 64);
        });

        if (tileImage) {
            let image = document.getElementById(tileImage);
            let gridX = Math.floor(offsetX/64) * 64;
            let gridY = Math.floor(offsetY/64) * 64;
            ctx.drawImage(image, gridX, gridY, 64, 64);
        }
    }

    const setTile = ({offsetX, offsetY}) => {
        let gridX = Math.floor(offsetX/64) * 64;
        let gridY = Math.floor(offsetY/64) * 64;
        
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

    return (
        <div>
            <div className="levelEditor">
                <div className="header">
                    <h1>Level Editor</h1>
                </div>
                <div className="tiles">
                    {tileSet.map((tile, index) => {
                        return (
                            <img id={`tileImage-${index}`} key={`tile-${index}`} onClick={() => {selectTile(tile, `tileImage-${index}`)}} className={selectedTile.name === tile.name ? "selected" : null} src={tile.imageUrl} />
                        );
                    })}
                </div>
                <div className="level">
                    <canvas id="le-canvas" width={10000} height={10000} ref={canvas} />
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
