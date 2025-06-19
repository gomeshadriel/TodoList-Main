import React, { useState } from "react";
import { taskAPI } from "../services/api";
import { DatePicker } from "antd";

export const AddTask = ({ onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(Number);
  const [finishDate, setFinishDate] = useState(Date);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      console.log("Submitting task:", {
        title: title.trim(),
        description: description.trim(),
      });

      const newTask = await taskAPI.createTask({
        title: title.trim(),
        description: description.trim(),
        finishDate: false,
        status: status,
      });

      console.log("Task created:", newTask);

      if (onTaskAdded && typeof onTaskAdded === "function") {
        onTaskAdded(newTask);
      }

      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err.message || "Failed to add task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-task-form">
      <h2>Add New Task</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)..."
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <input
            type="date"
            value={finishDate}
            onChange={(e) => setFinishDate(e.target.value)}
            placeholder="Enter Finish Date (optional)..."
            disabled={isSubmitting}
          />
          <label>Prioridade</label>

          {(() => {
            if (!finishDate) return null;

            const currentDate = new Date();
            const selectedDate = new Date(finishDate);

            currentDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            const diffTime = selectedDate.getTime() - currentDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 3) {
              return (
                <h3
                  style={{
                    gap: 12,
                    backgroundColor: "#E0310A",
                    color: "#ffffff",
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  Alta
                </h3>
              );
            }

            if (diffDays > 3 && diffDays <= 5) {
              return (
                <h3
                  style={{
                    gap: 12,
                    backgroundColor: "#E5C50B",
                    color: "#ffffff",
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  Média
                </h3>
              );
            }

            if (diffDays >= 6) {
              return (
                <h3
                  style={{
                    gap: 12,
                    backgroundColor: "#41E500",
                    color: "#ffffff",
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  Baixa
                </h3>
              );
            }

            return null;
          })()}
        </div>
        <div className="form-group">
          <label>Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            disabled={isSubmitting}
          >
            <option value={0}>Backlog</option>
            <option value={1}>Em desenvolvimento</option>
            <option value={2}>Repasse</option>
            <option value={3}>Entregues</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Adding Task..." : "Add Task"}
        </button>
      </form>
    </div>
  );
};
