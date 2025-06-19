// import { useState } from "react";
// import { TaskInput } from "./components/TaskInput";
// import { TaskList } from "./components/TaskList";

// function App() {
//   const [tasks, setTasks] = useState([]);

//   const addTask = (task) => {
//     setTasks([...tasks, { id: Date.now(), text: task, done: false }]);
//   };
//   const deleteTask = (taskId) => {
//     setTasks(tasks.filter((task) => task.id !== taskId));
//   };

//   return (
//     <div>
//       <h1>Lista de Tarefas</h1>
//       <TaskInput onAddTask={addTask} />
//       <TaskList tasks={tasks} onDeleteTask={deleteTask} />
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskList } from './components/TaskList';
import { Auth } from './components/Auth';
import './styles/App.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated() ? <TaskList /> : <Auth />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
