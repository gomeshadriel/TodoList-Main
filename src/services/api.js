const API_BASE_URL = 'http://localhost:3001/api';

class TaskAPI {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || result;
  }

  async getAllTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async createTask(task) {
    try {
      console.log('Creating task:', task); 
      console.log('Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(task),
      });
      
      console.log('Response status:', response.status); 
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id, task) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(task),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async toggleTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  async deleteTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}

export const taskAPI = new TaskAPI();
