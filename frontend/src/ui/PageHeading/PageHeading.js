import React from 'react';

import "./PageHeading.css"

const PageHeading = (props) => {
    return (
        <h1 className='page-heading' style={props.style}>
            {props.children}
        </h1>
    );
};

export default PageHeading;