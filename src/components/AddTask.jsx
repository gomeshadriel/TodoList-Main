import React, { useState } from 'react';
import { taskAPI } from '../services/api';


export const AddTask = ({ onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      console.log('Submitting task:', { title: title.trim(), description: description.trim() });
      
      const newTask = await taskAPI.createTask({
        title: title.trim(),
        description: description.trim(),
        completed: false
      });
      
      console.log('Task created:', newTask); 
      
      if (onTaskAdded && typeof onTaskAdded === 'function') {
        onTaskAdded(newTask);
      }
      
      setTitle('');
      setDescription('');
      
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.message || 'Failed to add task. Please try again.');
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
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? 'Adding Task...' : 'Add Task'}
        </button>
      </form>
    </div>

  );
};
