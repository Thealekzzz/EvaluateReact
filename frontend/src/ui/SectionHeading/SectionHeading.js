import React from 'react';

import "./SectionHeading.css"

const SectionHeading = (props) => {
    return (
        <h2 className='section-heading'>
            {props.children}
        </h2>
    );
};

export default SectionHeading;