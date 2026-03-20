import React from "react";

const Button = ({ compStyle, compContent }) => (
    <a href={compContent.link}>
        <button
            style={{
                backgroundColor: compStyle.backgroundColor,
                display: compStyle.display,
                padding: compStyle.padding,
                color: compStyle.color,
                borderRadius: compStyle.borderRadius,
                border: compStyle.border,
                cursor: compStyle.cursor
            }}
            >
                {compContent.text}
        </button>
    </a>
);

export default Button;