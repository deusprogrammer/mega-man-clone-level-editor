import React from 'react';

export default ({tile: {name, bounceAmount, solid, lethal, imageUrl}, onDelete, onEdit}) => {
    return (
        <div className="tilesetInterface tile">
            <div>
                <img style={{width: "64px", height: "64px"}} src={imageUrl} />
            </div>
            <div>
                <table className="tilesetForm">
                    <tbody>
                        <tr>
                            <td>Name: </td>
                            <td>{name}</td>
                        </tr>
                        <tr>
                            <td>Bounciness: </td>
                            <td>{bounceAmount}</td>
                        </tr>
                        <tr>
                            <td>Solid: </td>
                            <td>{solid ? "Yes" : "No"}</td>
                        </tr>
                        <tr>
                            <td>Lethal: </td>
                            <td>{lethal ? "Yes" : "No"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <button style={{width: "50px"}} onClick={() => {onDelete && onDelete()}}>Delete</button><br />
                <button style={{width: "50px"}} onClick={() => {onEdit && onEdit()}}>Edit</button>
            </div>
        </div>
    )
}