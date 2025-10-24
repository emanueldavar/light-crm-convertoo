import React from 'react';

export default function CommentTimeline({ comments = [] }) {
  if (!comments || !comments.length) {
    return <div className="text-sm text-gray-500">Nenhum comentário ainda</div>;
  }
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="p-2 border rounded bg-white">
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.text}</div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(c.createdAt).toLocaleString()} — {c.author}
          </div>
        </div>
      ))}
    </div>
  );
}