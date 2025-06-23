import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const TaskEditModal = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editFinishDate, setEditFinishDate] = useState(task.finish_date || "");
  const [editSituation, setEditSituation] = useState(task.situation ?? 0);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditFinishDate(task.finish_date || "");
      setEditSituation(task.situation ?? 0);
    }
  }, [isOpen, task]);

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      finishDate: editFinishDate,
      situation: editSituation,
    });
    onClose();
  };

  const handleDelete = () => {
    if (isAdmin()) {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
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
          maxWidth: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <h2>Edit Task</h2>
        <label>Title:</label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        />
        <label>Description:</label>
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Task description (optional)"
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
            height: 80,
          }}
        />
        <div style={{ flexDirection: "row" }}>
          <label>Finish Date:</label>
          <input
            type="date"
            value={editFinishDate}
            onChange={(e) => setEditFinishDate(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
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
              return (
                <p style={{ color: "#F03239", fontWeight: "bold" }}>High</p>
              );
            }
            if (diffDays > 3 && diffDays <= 5) {
              return (
                <p style={{ color: "#D4CB4E", fontWeight: "bold" }}>Medium</p>
              );
            }
            if (diffDays > 5) {
              return (
                <p style={{ color: "#00D223", fontWeight: "bold" }}>Low</p>
              );
            }
            return null;
          })()}
        </div>
        <label>Situation:</label>
        <select
          value={editSituation}
          onChange={(e) => setEditSituation(Number(e.target.value))}
          style={{
            width: "100%",
            marginBottom: 8,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
          }}
        >
          <option value={0}>Backlog</option>
          <option value={1}>In development</option>
          <option value={2}>Review</option>
          <option value={3}>Delivered</option>
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
          <button onClick={onClose} className="cancel-btn">
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
  );
};
