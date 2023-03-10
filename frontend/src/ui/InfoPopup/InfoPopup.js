import React from 'react';

import "./InfoPopup.css"

const InfoPopup = React.forwardRef((props, ref) =>{

    

    return (
        <div ref={ref} className={['info-popup', props.visible ? "" : "info-popup_invisible"].join(" ")} style={props.style}>
            {props.children}
        </div>
    );
});

export default InfoPopup;