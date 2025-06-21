// import React from "react";

// export const Task = ({ task, onDelete }) => {
//   return (
//     <li>
//       <span>{task.text}</span>
//       <button onClick={onDelete}>Remover</button>
//     </li>
//   );
// };
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Col, Row, Flex } from "antd";

export const Task = ({ task, onDelete, onToggle, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editFinishDate, setEditFinishDate] = useState(task.finish_date || "");
  const [editSituation, setEditSituation] = useState(task.situation ?? 0);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );

  const { isAdmin } = useAuth();

  const handleOpenModal = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditFinishDate(task.finish_date || "");
    setEditSituation(task.situation ?? 0);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      finishDate: editFinishDate,
      situation: editSituation,
    });
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (isAdmin()) {
      onDelete();
      setIsModalOpen(false);
    }
  };

  // Data atual apenas com dia, mês e ano
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <li
        className="task-item"
        onClick={handleOpenModal}
        style={{ cursor: "pointer" }}
      >
        <Row className="task-content">
          <Col xs={24} xxl={24} className="task-text">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
          </Col>
          <Col xs={24} xxl={24} className="task-footer">
            <Row>
              <Col xs={24} xxl={12}>
                <label>Finish Date</label>
                <h3>{task.finish_date}</h3>
              </Col>
              <Col xs={24} xxl={12}>
                <label>Priority</label>
                {(() => {
                  if (!task.finish_date) return null;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const finishDate = new Date(task.finish_date);
                  finishDate.setHours(0, 0, 0, 0);
                  const diffTime = finishDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays <= 3) {
                    return <h3 style={{ color: "#F03239" }}>High</h3>;
                  }
                  if (diffDays > 3 && diffDays <= 5) {
                    return <h3 style={{ color: "#D4CB4E" }}>Medium</h3>;
                  }
                  if (diffDays > 5) {
                    return <h3 style={{ color: "#00D223" }}>Low</h3>;
                  }
                  return null;
                })()}
              </Col>
            </Row>
          </Col>
        </Row>
        {/* <div className="task-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleOpenModal} className="edit-btn">
            Edit
          </button>
          {isAdmin() && (
            <button onClick={onDelete} className="delete-btn">
              Delete
            </button>
          )}
        </div> */}
      </li>
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              maxWidth: 400,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h2>Editar Tarefa</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              style={{ width: "100%", marginBottom: 8 }}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task description (optional)"
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              type="date"
              value={editFinishDate}
              onChange={(e) => setEditFinishDate(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <label>Situation:</label>
            <select
              value={editSituation}
              onChange={(e) => setEditSituation(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 8 }}
            >
              <option value={0}>Backlog</option>
              <option value={1}>Em desenvolvimento</option>
              <option value={2}>Repasse</option>
              <option value={3}>Entregues</option>
            </select>
            <div
              className="task-actions"
              style={{
                marginTop: 16,
                display: "flex",
                gap: 8,
              }}
            >
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button onClick={handleCloseModal} className="cancel-btn">
                Cancel
              </button>
              {isAdmin() && (
                <button
                  onClick={handleDelete}
                  className="delete-btn"
                  style={{
                    marginLeft: "auto",
                    background: "#f44336",
                    color: "#fff",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
