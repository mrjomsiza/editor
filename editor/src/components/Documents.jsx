// src/components/Documents.jsx
import React from "react";

export default function Documents() {
  const docs = [
    { title: "Getting Started", content: "Learn how to use the builder effectively." },
    { title: "Editing Sites", content: "Instructions on editing your sites." },
    { title: "Publishing Sites", content: "How to publish your site to the web." }
  ];

  return (
    <div>
      <h2>Documentation</h2>
      {docs.map(doc => (
        <div key={doc.title} style={{ marginBottom: "15px" }}>
          <h3>{doc.title}</h3>
          <p>{doc.content}</p>
        </div>
      ))}
    </div>
  );
}
