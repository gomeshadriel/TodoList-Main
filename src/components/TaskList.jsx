import React, { useState, useEffect } from "react";
import { Task } from "./Task";
import { AddTask } from "./AddTask";
import { Header } from "./Header";
import { taskAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Col, Flex, Row } from "antd";

export const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAdmin, user } = useAuth();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await taskAPI.getAllTasks();
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setError(null);
  };

  const handleDeleteTask = async (id) => {
    if (!isAdmin()) {
      setError("Only administrators can delete tasks");
      return;
    }

    try {
      await taskAPI.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete task");
      console.error("Error deleting task:", err);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updatedTask = await taskAPI.toggleTask(id);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
      setError(null);
    } catch (err) {
      setError("Failed to toggle task");
      console.error("Error toggling task:", err);
    }
  };

  const handleUpdateTask = async (id, updatedTaskData) => {
    try {
      const updatedTask = await taskAPI.updateTask(id, updatedTaskData);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
      setError(null);
    } catch (err) {
      setError("Failed to update task");
      console.error("Error updating task:", err);
    }
  };

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="app">
      <Header />

      <div className="task-list-container">
        <AddTask onTaskAdded={handleTaskAdded} />

        {error && <div className="error-message">{error}</div>}

        <Row
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Col>
            <h2>Backlog</h2>
            <Flex>
              {tasks.length > 0 ? (
                <ul className="tasks-list">
                  {tasks
                    .filter((task) => task.status === 0)
                    .map((task) => (
                      <Task
                        key={task.id}
                        task={task}
                        onDelete={() => handleDeleteTask(task.id)}
                        onToggle={() => handleToggleTask(task.id)}
                        onUpdate={(updatedTaskData) =>
                          handleUpdateTask(task.id, updatedTaskData)
                        }
                      />
                    ))}
                </ul>
              ) : (
                <p className="no-tasks">
                  No tasks yet. Add your first task above!
                </p>
              )}
            </Flex>
          </Col>
          <Col>
            <h2>Em desenvolvimento</h2>
          </Col>
          <Col>
            <h2>Repasse</h2>
          </Col>
          <Col>
            <h2>Entregues</h2>
          </Col>
        </Row>

        {/* <div className="tasks-container">
          {tasks.length > 0 ? (
            <ul className="tasks-list">
              {tasks.map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  onDelete={() => handleDeleteTask(task.id)}
                  onToggle={() => handleToggleTask(task.id)}
                  onUpdate={(updatedTaskData) =>
                    handleUpdateTask(task.id, updatedTaskData)
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="no-tasks">No tasks yet. Add your first task above!</p>
          )}
        </div> */}

        <div className="user-permissions">
          <h3>Your Permissions:</h3>
          <ul>
            <li>✅ View tasks</li>
            <li>✅ Create tasks</li>
            <li>✅ Edit tasks</li>
            <li>✅ Toggle task status</li>
            <li>
              {isAdmin() ? "✅" : "❌"} Delete tasks{" "}
              {!isAdmin() && "(Admin only)"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
