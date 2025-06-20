import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const Task = ({ task, onDelete, onToggle, onUpdate, onAddComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );
  const [showComments, setShowComments] = useState(false);

  const { isAdmin } = useAuth();

  const [comment, setComment] = useState("");
  const comments = task.comments || []; 

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription,
      completed: task.completed,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (comment.trim() && onAddComment) {
      try {
        await onAddComment(task.id, comment.trim());
        setComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleComments = () => {
    setShowComments(!showComments);
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
            <button onClick={handleSave} className="save-btn">
              Save
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-head">
        <div className="task-content">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          />
          <div className="task-text">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
          </div>
        </div>
        <div className="task-actions">
          {isAdmin() && (
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Edit
          </button>
          )}
          {isAdmin() && (
            <button onClick={() => onDelete(task.id)} className="delete-btn">
              Delete
            </button>
            )}
        </div>
      </div>

      <div className="task-bottom">
        <div className="comments-toggle">
          <button onClick={toggleComments} className="toggle-comments-btn">
            {showComments
              ? "Hide Comments"
              : `Show Comments ${
                  comments.length > 0 ? `(${comments.length})` : ""
                }`}
          </button>
        </div>

        {showComments && (
          <div className="task-comments-section">
            <form onSubmit={handleAddComment} className="comment-form">
              <div className="comment-input-group">
                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="2"
                />
                <button type="submit" className="add-comment-btn">
                  Add Comment
                </button>
              </div>
            </form>

            {comments.length > 0 && (
              <div className="comments-list">
                <h4>Comments:</h4>
                <ul className="comments">
                  {comments.map((commentItem) => (
                    <li key={commentItem.id} className="comment-item">
                      <div className="comment-content">
                        <strong className="comment-author">
                          {commentItem.author}
                        </strong>
                        <span className="comment-date">
                          {formatDate(commentItem.created_at)}
                        </span>
                        <p className="comment-text">{commentItem.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
};
