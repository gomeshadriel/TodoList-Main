import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const Task = ({
  task,
  onDelete,
  onToggle,
  onUpdate,
  onAddComment,
  onRemoveComment,
  onEditComment,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

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

  const handleRemoveComment = async (commentId) => {
    if (onRemoveComment) {
      try {
        await onRemoveComment(task.id, commentId);
      } catch (error) {
        console.error("Error removing comment:", error);
      }
    }
  };

  const handleEditComment = async (commentId) => {
    if (onEditComment && editingCommentText.trim()) {
      try {
        await onEditComment(task.id, commentId, editingCommentText.trim());
        setEditingCommentId(null);
        setEditingCommentText("");
      } catch (error) {
        console.error("Error editing comment:", error);
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
                        <div className="comment-header">
                          <strong className="comment-author">
                            {commentItem.author}
                          </strong>
                          <span className="comment-date">
                            {formatDate(commentItem.created_at)}
                          </span>
                          {editingCommentId === commentItem.id ? (
                            <>
                              <button
                                className="save-edit-comment-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditComment(commentItem.id);
                                }}
                              >
                                Salvar
                              </button>
                              <button
                                className="cancel-edit-comment-btn"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingCommentText("");
                                }}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="edit-comment-btn"
                                onClick={() => {
                                  setEditingCommentId(commentItem.id);
                                  setEditingCommentText(commentItem.text);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                className="remove-comment-btn"
                                onClick={() => handleRemoveComment(commentItem.id)}
                              >
                                Remover
                              </button>
                            </>
                          )}
                        </div>
                        {editingCommentId === commentItem.id ? (
                          <textarea
                            className="edit-comment-textarea"
                            value={editingCommentText}
                            onChange={(e) =>
                              setEditingCommentText(e.target.value)
                            }
                            rows="2"
                          />
                        ) : (
                          <p className="comment-text">{commentItem.text}</p>
                        )}
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
