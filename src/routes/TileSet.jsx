import React, {useState} from 'react';
import {connect} from 'react-redux';
import ImageSelector from '../components/ImageSelector';
import Tile from '../components/Tile';

const Tileset = (props) => {
    const emptyTile = {
        name: "",
        imageUrl: "",
        bounceAmount: 0,
        solid: true,
        lethal: false
    }

    const [newTile, setNewTile] = useState(emptyTile);

    const updateTile = (field, value) => {
        let temp = {...newTile};
        temp[field] = value;
        setNewTile(temp);
    }

    const saveTile = () => {
        props.addTile(newTile);
        setNewTile(emptyTile);
    }

    return (
        <div>
            <h1>Tile Set Editor</h1>
            <div className="tilesetInterface">
                <div>
                    <ImageSelector className="imageSelector" src={newTile.imageUrl} onChange={(dataUri, ext) => {updateTile("imageUrl", dataUri)}} />
                </div>
                <div>
                    <table className="tilesetForm">
                        <tbody>
                            <tr>
                                <td>Name: </td>
                                <td><input type="text" value={newTile.name} onChange={(event) => {updateTile("name", event.target.value)}} /></td>
                            </tr>
                            <tr>
                                <td>Bounciness: </td>
                                <td><input type="number" value={newTile.bounceAmount} onChange={(event) => {updateTile("bounceAmount", event.target.value)}} /></td>
                            </tr>
                            <tr>
                                <td>Solid: </td>
                                <td><input type="checkbox" checked={newTile.solid} onChange={(event) => {updateTile("solid", event.target.checked)}} /></td>
                            </tr>
                            <tr>
                                <td>Lethal: </td>
                                <td><input type="checkbox" checked={newTile.lethal} onChange={(event) => {updateTile("lethal", event.target.checked)}} /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <button onClick={() => {saveTile()}}>Add Tile</button>
            {props.tileSet.map((tile, index) => {
                return (
                    <Tile key={`tile-${index}`} tile={tile} onDelete={() => {props.deleteTile(index)}} />
                )
            })}
        </div>
    );
}

let mapStateToProps = (state) => {
    return {
        tileSet: state.tileSet
    }
}

let mapDispatchToProps = (dispatch) => {
    return {
        addTile: (tile) => {dispatch({type: "ADD_TILE", tile})},
        deleteTile: (index) => {dispatch({type: "DELETE_TILE", index})}
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tileset);
