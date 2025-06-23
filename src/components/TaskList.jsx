import React, { useState, useEffect } from "react";
import { Task } from "./Task";
import { AddTask } from "./AddTask";
import { Header } from "./Header";
import { taskAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Col, Flex, Row } from "antd";
import { Filter } from "./Filter";

export const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

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

  // Função para calcular prioridade
  const getPriority = (task) => {
    if (!task.finish_date) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const finishDate = new Date(task.finish_date);
    finishDate.setHours(0, 0, 0, 0);
    const diffTime = finishDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return "high";
    if (diffDays > 3 && diffDays <= 5) return "medium";
    if (diffDays > 5) return "low";
    return "";
  };

  // Função para filtrar tasks
  const filterTasks = (tasks, situation) =>
    tasks
      .filter((task) => task.situation === situation)
      .filter((task) =>
        task.title.toLowerCase().includes(filterTitle.toLowerCase())
      )
      .filter((task) =>
        filterPriority ? getPriority(task) === filterPriority : true
      );

  if (loading) return <div className="loading">Loading tasks...</div>;
  console.log("Tasks loaded:", tasks);
  return (
    <div className="app">
      <Header />

      <div className="task-list-container">
        <AddTask onTaskAdded={handleTaskAdded} />
        <Filter
          filterTitle={filterTitle}
          setFilterTitle={setFilterTitle}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
        />

        {error && <div className="error-message">{error}</div>}

        <Row
          style={{
            borderRadius: "8px",
            display: "flex",
            width: "100%",
            overflowX: "auto",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          <Col
            md={24}
            xxl={6}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#CDCDCD",
              borderRadius: "6px",
              margin: 0,
              padding: "12px",
              boxSizing: "border-box",
              maxWidth: "25%",
              gap: "8px",
            }}
          >
            <h3>Backlog</h3>
            <Flex>
              {tasks.length > 0 ? (
                <ul className="tasks-list">
                  {filterTasks(tasks, 0).map((task) => (
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
          <Col
            md={24}
            xxl={6}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#CDCDCD",
              borderRadius: "6px",
              margin: 0,
              padding: "12px",
              boxSizing: "border-box",
              maxWidth: "25%",
              gap: "8px",
            }}
          >
            <h3>In development</h3>
            <Flex>
              {tasks.length > 0 ? (
                <ul className="tasks-list">
                  {filterTasks(tasks, 1).map((task) => (
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
          <Col
            md={24}
            xxl={6}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#CDCDCD",
              borderRadius: "6px",
              margin: 0,
              padding: "12px",
              boxSizing: "border-box",
              maxWidth: "25%",
              gap: "8px",
            }}
          >
            <h3>Review</h3>
            <Flex>
              {tasks.length > 0 ? (
                <ul className="tasks-list">
                  {filterTasks(tasks, 2).map((task) => (
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
          <Col
            md={24}
            xxl={6}
            style={{
              flex: "1 1 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#CDCDCD",
              borderRadius: "6px",
              margin: 0,
              padding: "12px",
              boxSizing: "border-box",
              maxWidth: "25%",
              gap: "8px",
            }}
          >
            <h3>Delivered</h3>
            <Flex>
              {tasks.length > 0 ? (
                <ul className="tasks-list">
                  {filterTasks(tasks, 3).map((task) => (
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
        </Row>

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
