import React from "react";

export const Filter = ({
  filterTitle,
  setFilterTitle,
  filterPriority,
  setFilterPriority,
}) => {
  return (
    <div style={{ margin: "16px 0", display: "flex", gap: 16 }}>
      <input
        type="text"
        placeholder="Search by title"
        value={filterTitle}
        onChange={(e) => setFilterTitle(e.target.value)}
        style={{
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
          flex: 1,
          height: 40,
        }}
      />
      <select
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value)}
        style={{
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
          height: 40,
        }}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
};
