import React from 'react';

export default function ClassCard({ title, description }) {
  return (
    <article className="class-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
