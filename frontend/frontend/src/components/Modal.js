    import React from "react";

    const Modal = ({ isOpen, onClose, cell }) => {
    if (!isOpen || !cell) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={onClose}>
            &times;
            </button>
            <div className="modal-content">
            <h1>Información del espacio</h1>
            <div className="input-group">
                <label>ID:</label>
                <p>{cell.id}</p>
            </div>
            <div className="input-group">
                <label>Piso:</label>
                <p>{cell.piso}</p>
            </div>
            <div className="input-group">
                <label>Nombre:</label>
                <p>{cell.nombre}</p>
            </div>
            <div className="input-group">
                <label>Descripción:</label>
                <p>{cell.descripcion}</p>
            </div>
            <div className="input-group">
                <label>Estado:</label>
                <p>{cell.status}</p>
            </div>
            <div className="input-group">
                <label>Color:</label>
                <p>{cell.color}</p>
            </div>
            <button className="create-button" onClick={onClose}>
                Cerrar
            </button>
            </div>
        </div>
        </div>
    );
    };

    export default Modal;