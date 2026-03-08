import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function TopicNotes({ topicKey }) {
  const { state, updateTopicNotes } = useApp();
  const savedNotes = state.topicNotes[topicKey] || '';
  const [notes, setNotes] = useState(savedNotes);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setNotes(state.topicNotes[topicKey] || '');
  }, [topicKey, state.topicNotes]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    // Debounced save
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateTopicNotes(topicKey, val), 500);
  };

  const handleBlur = () => {
    clearTimeout(debounceRef.current);
    updateTopicNotes(topicKey, notes);
    if (!notes.trim()) setIsEditing(false);
  };

  if (!isEditing && !notes.trim()) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
        className="text-xs px-2 py-1 rounded-md cursor-pointer transition-colors"
        style={{
          background: 'transparent',
          border: '1px dashed var(--border-default)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        + Add notes
      </button>
    );
  }

  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Write your notes here..."
          className="w-full text-sm rounded-lg px-3 py-2 resize-none"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            minHeight: 60,
            outline: 'none',
          }}
          rows={3}
        />
      ) : (
        <div
          className="text-sm px-3 py-2 rounded-lg cursor-pointer whitespace-pre-wrap"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
          onClick={() => setIsEditing(true)}
        >
          {notes}
        </div>
      )}
    </div>
  );
}
