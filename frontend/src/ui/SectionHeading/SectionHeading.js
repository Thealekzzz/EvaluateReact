import React from 'react';

import "./SectionHeading.css"

const SectionHeading = (props) => {
    return (
        <h2 className='section-heading' style={props.style}>
            {props.children}
        </h2>
    );
};

export default SectionHeading;