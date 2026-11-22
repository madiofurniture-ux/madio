import React from "react";

/**
 * A field people never see or reach. Spam bots fill every input; /api/lead quietly drops any enquiry where this
 * has a value.
 */
export const HoneypotField: React.FC<{ id: string; value: string; onChange: (v: string) => void }> = ({ id, value, onChange }) => (
  <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
    <label htmlFor={id}>Leave this empty</label>
    <input
      id={id}
      name="company_website"
      type="text"
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
