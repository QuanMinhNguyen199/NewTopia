import React from 'react';

export function FollowUpForm({
  barHidden,
  askFollowUp,
  behind,
  setBarHidden,
  followField,
  followUp,
  setFollowUp,
  busy,
}) {
  return (
    <form
      className={`follow-up ${barHidden ? 'is-hidden' : ''}`}
      onSubmit={askFollowUp}
      inert={behind}
      onFocus={() => setBarHidden(false)}
    >
      <label className="sr-only" htmlFor="follow-up">
        Hỏi tiếp hoặc hỏi câu mới
      </label>
      <input
        id="follow-up"
        ref={followField}
        value={followUp}
        onChange={e => setFollowUp(e.target.value)}
        placeholder="Hỏi tiếp hoặc hỏi câu mới"
        enterKeyHint="send"
        autoComplete="off"
      />
      <button className="primary" disabled={busy}>
        {busy ? 'Đang tìm…' : 'Hỏi'}
      </button>
    </form>
  );
}
