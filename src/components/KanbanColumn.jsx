```javascript
import React from "react";
import TaskCard from "./TaskCard";

const KanbanColumn = ({ tasks }) => {
  return (
    <div className="kanban-column">
      <h2>Backlog</h2>
      {tasks
        .filter((task) => task.status === "Backlog")
        .map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
    </div>
  );
};

export default KanbanColumn;
```;
