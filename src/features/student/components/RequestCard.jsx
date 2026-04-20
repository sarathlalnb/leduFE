import React from 'react';

export default function RequestCard({ title, status }) {
  return (
    <div className="request-card">
      <h4>{title}</h4>
      <span>{status}</span>
    </div>
  );
}
