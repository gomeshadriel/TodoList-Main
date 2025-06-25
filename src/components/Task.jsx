// import React from "react";

// export const Task = ({ task, onDelete }) => {
//   return (
//     <li>
//       <span>{task.text}</span>
//       <button onClick={onDelete}>Remover</button>
//     </li>
//   );
// };
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Col, Row, Flex, Tooltip } from "antd"; // Adiciona Tooltip do Ant Design

export const Task = ({ task, onDelete, onToggle, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editFinishDate, setEditFinishDate] = useState(task.finish_date || "");
  const [editSituation, setEditSituation] = useState(task.situation ?? 0);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const { isAdmin, token } = useAuth();

  // Carrega comentários ao abrir o modal
  useEffect(() => {
    if (isModalOpen) {
      fetchComments();
    }
    // eslint-disable-next-line
  }, [isModalOpen]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/tasks/${task.id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.data) setComments(data.data);
    } catch (e) {
      setComments([]);
    }
    setLoadingComments(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/tasks/${task.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ texto: commentText }),
        }
      );
      const data = await res.json();
      if (res.ok && data.data) {
        setComments((prev) => [...prev, data.data]);
        setCommentText("");
      } else {
        // Mostra erro se houver
        alert(data.error || "Erro ao adicionar comentário");
        console.error("Erro ao adicionar comentário:", data);
      }
    } catch (e) {
      alert("Erro de rede ao adicionar comentário");
      console.error("Erro de rede ao adicionar comentário:", e);
    }
    setPostingComment(false);
  };

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
        onClick={handleOpenModal}
        style={{
          cursor: "pointer",
          maxWidth: "100%",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Row className="task-content">
          <Col xs={24} xxl={24} className="task-text">
            <Tooltip title={task.title} placement="topLeft">
              <h3
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                  marginBottom: 4,
                  cursor: "pointer",
                }}
              >
                {task.title}
              </h3>
            </Tooltip>
            {task.description && (
              <Tooltip title={task.description} placement="topLeft">
                <p
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    marginBottom: 0,
                    cursor: "pointer",
                  }}
                >
                  {task.description}
                </p>
              </Tooltip>
            )}
          </Col>
          <Col xs={24} xxl={24} className="task-footer">
            <Row>
              <Col xs={24} xxl={12}>
                <label>Finish Date</label>
                <p style={{ fontWeight: "bold" }}>{task.finish_date}</p>
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
                    return (
                      <p style={{ color: "#F03239", fontWeight: "bold" }}>
                        High
                      </p>
                    );
                  }
                  if (diffDays > 3 && diffDays <= 5) {
                    return (
                      <p style={{ color: "#D4CB4E", fontWeight: "bold" }}>
                        Medium
                      </p>
                    );
                  }
                  if (diffDays > 5) {
                    return (
                      <p style={{ color: "#00D223", fontWeight: "bold" }}>
                        Low
                      </p>
                    );
                  }
                  return null;
                })()}
              </Col>
            </Row>
          </Col>
        </Row>
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
          onClick={handleCloseModal} // fecha ao clicar fora do modal
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
              maxHeight: "90vh", // limita altura máxima
              overflowY: "auto", // permite rolagem
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro do modal
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
                    <p style={{ color: "#D4CB4E", fontWeight: "bold" }}>
                      Medium
                    </p>
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
            {/* Campo de comentários */}
            <div style={{ marginTop: 32 }}>
              <h3>Comentários</h3>
              <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva um comentário..."
                  style={{
                    width: "100%",
                    minHeight: 60,
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    marginBottom: 8,
                  }}
                  disabled={postingComment}
                />
                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 4,
                    border: "none",
                    background: "#1976d2",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {postingComment ? "Enviando..." : "Comentar"}
                </button>
              </form>
              {loadingComments ? (
                <div>Carregando comentários...</div>
              ) : comments.length === 0 ? (
                <div>Nenhum comentário ainda.</div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {comments.map((c, idx) => (
                    <li
                      key={idx}
                      style={{
                        borderBottom: "1px solid #eee",
                        marginBottom: 8,
                        paddingBottom: 8,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        background: "#fafbfc",
                        borderRadius: 4,
                        padding: "8px 12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 4,
                          gap: 8,
                        }}
                      >
                        <span style={{ fontWeight: "bold", flexShrink: 0 }}>
                          {c.nome_usuario}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#888",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {new Date(c.data_criacao).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          fontSize: 15,
                        }}
                      >
                        {c.texto}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
