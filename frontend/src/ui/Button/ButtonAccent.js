import React from 'react';

import './Button.css'
import './Button_accent.css'

const ButtonAccent = React.forwardRef((props, ref) => {
    return (
        <button type={props.type || "button"} className='button button_accent' onClick={props.onClick} ref={ref} style={props.style}>
            {props.children}
        </button>
    );
});

export default ButtonAccent;