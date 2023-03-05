import React from 'react';

import "./PreviewTable.css"

const PreviewTable = (props) => {

    return (
        <div className="preview-table__wrapper" style={props.style}>
            <table className='preview-table'>
                <tbody>
                    <tr className='preview-table__letters'>
                        {props.tableData[0]?.map((cellData, index) => {
                            return (
                                <td key={index} className='preview-table__cell'>{String.fromCharCode(65 + index)}</td>
                            )
                        })}
                    </tr>

                    {props.tableData.map((row, i) => {
                        return (
                            <tr key={i} className='preview-table__row'>
                                {row.map((cellData, index) => {
                                    return (
                                        <td key={index} className='preview-table__cell'>{cellData}</td>
                                    )
                                })}
                            </tr>

                        )
                    })}

                </tbody>
            </table>

        </div>
    );
};

export default PreviewTable;