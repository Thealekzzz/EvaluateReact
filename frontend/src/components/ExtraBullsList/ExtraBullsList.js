import React from 'react';

import ExtraBullContainer from '../ExtraBullContainer/ExtraBullContainer';

import "./ExtraBullsList.css"

const ExtraBullsList = React.forwardRef((props, ref) => {
    return (
        <form action="/evaluate2" className="bulls-list animated" ref={ref}>

            {props.extraMatchesBullsMarkers.sort((a, b) => a.name - b.name).map(el => {
                return <ExtraBullContainer bullData={el} key={el.name}/>
            })}
        
        
        </form>
    );
});

export default ExtraBullsList;