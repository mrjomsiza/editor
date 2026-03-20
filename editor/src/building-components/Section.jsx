import React from "react";

const DEFAULT_SECTION_NODE = {
    id: "auto-generated",     // runtime UUID
    pageId: "auto-set",
    type: "section",

    props: {
    // CONTENT RELATED
        label: "Section",
        visible: true
    },

    style: {
        padding: "20px 20px 20px 20px",
        backgroundColor: "#ffffff",
        width: "100%",
    },

    children: [],  // other components go here

    meta: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: "userId",
        locked: false // prevents editing
    }
};

const Section = ({ id, pageId, children, style = {} }) => {
    return (
        <section
            data-id={id}
            data-page={pageId}
            style={{
                ...DEFAULT_SECTION_NODE,
                ...style, // page JSON overrides
            }}
            >
                {children}
        </section>
    );
};

export default Section;