import React from 'react';

export default function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h2>{title}</h2>}
      <div>{children}</div>
    </div>
  );
}
