import React, { useState, useEffect } from "react";
import { Task } from "./Task";
import { AddTask } from "./AddTask";
import { Header } from "./Header";
import { taskAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
  

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
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setError(null); 
  };

  const handleDeleteTask = async (id) => {
    if (!isAdmin()) {
      setError('Only administrators can delete tasks');
      return;
    }

    try {
      await taskAPI.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const updatedTask = await taskAPI.toggleTask(id);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === id ? updatedTask : task
      ));
      setError(null);
    } catch (err) {
      setError('Failed to toggle task');
      console.error('Error toggling task:', err);
    }
  };

  const handleUpdateTask = async (id, updatedTaskData) => {
    try {
      const updatedTask = await taskAPI.updateTask(id, updatedTaskData);
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === id ? updatedTask : task
      ));
      setError(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };
  
  const handleAddComment = async (taskId, content) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    const result = await response.json();
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, comments: [...(task.comments || []), result.data] }
          : task
      )
    );
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};


  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="app">
      <Header />
      
      <div className="task-list-container">
        {isAdmin() && (
        <AddTask onTaskAdded={handleTaskAdded} />
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="tasks-container">
          {tasks.length > 0 ? (
            <ul className="tasks-list">
              {tasks.map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  onDelete={() => handleDeleteTask(task.id)}
                  onToggle={() => handleToggleTask(task.id)}
                  onUpdate={(updatedTaskData) => handleUpdateTask(task.id, updatedTaskData)}
                  onAddComment={handleAddComment}
                />
              ))}
            </ul>
          ) : (
            <p className="no-tasks">No tasks yet. Add your first task above!</p>
          )}
        </div>
        
        
      </div>
    </div>
  );
};
