// import React from "react";

// export const Task = ({ task, onDelete }) => {
//   return (
//     <li>
//       <span>{task.text}</span>
//       <button onClick={onDelete}>Remover</button>
//     </li>
//   );
// };
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Task = ({ task, onDelete, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  
  const { isAdmin } = useAuth();

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      completed: task.completed
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="task-item editing">
        <div className="task-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description (optional)"
          />
          <div className="task-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
        />
        <div className="task-text">
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} className="edit-btn">
          Edit
        </button>
        {isAdmin() && (
          <button onClick={onDelete} className="delete-btn">
            Delete
          </button>
        )}
      </div>
    </li>
  );
};
