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
        placeholder="Pesquisar por título"
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
        <option value="">Todas Prioridades</option>
        <option value="high">Alta</option>
        <option value="medium">Média</option>
        <option value="low">Baixa</option>
      </select>
    </div>
  );
};
