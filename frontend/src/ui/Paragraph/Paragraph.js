import React from 'react';

import "./Paragraph.css"

const Paragraph = (props) => {
    return (
        <p className='paragraph' style={props.style}>
            {props.children}
        </p>
    );
};

export default Paragraph;