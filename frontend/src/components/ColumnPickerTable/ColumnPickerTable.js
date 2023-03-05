import React from 'react';

import './ColumnPickerTable.css'

const columnPickerTable = (props) => {
    return (
        <div className="evaluate__settings-block table animated" style={props.style}>
            <div className="table__row table__row_header">
                <p className="table__cell">Столбец</p>
                <p className="table__cell">О</p>
                <p className="table__cell">ОМ</p>
                <p className="table__cell">ОММ</p>
            </div>
            <div className="table__row">
                <p className="table__cell">С кличкой предка</p>
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="nameOColumn" data-hint="Буква колонки в excel, в которой записаны клички отцов" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="nameOMColumn" data-hint="Буква колонки в excel, в которой записаны клички отцов матерей" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="nameOMMColumn"  data-hint="Буква колонки в excel, в которой записаны клички отцов матерей матерей" />
            </div>
            <div className="table__row">
                <p className="table__cell">С семенным кодом предка</p>
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="NAABOColumn" data-hint="Буква колонки в excel, в которой записаны семенные коды отцов" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="NAABOMColumn" data-hint="Буква колонки в excel, в которой записаны семенные коды отцов матерей" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="NAABOMMColumn" data-hint="Буква колонки в excel, в которой записаны семенные коды отцов матерей матерей" />
            </div>
            <div className="table__row">
                <p className="table__cell">С ID предка</p>
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="IDOColumn" data-hint="Буква колонки в excel, в которой записаны международные идентификаторы отцов" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="IDOMColumn" data-hint="Буква колонки в excel, в которой записаны международные идентификаторы отцов матерей" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="IDOMMColumn" data-hint="Буква колонки в excel, в которой записаны международные идентификаторы отцов матерей матерей" />
            </div>
            <div className="table__row">
                <p className="table__cell">С инвентарным номером предка</p>
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="InvOColumn" data-hint="Буква колонки в excel, в которой записаны инвентарные номера отцов" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="InvOMColumn" data-hint="Буква колонки в excel, в которой записаны инвентарные номера отцов матерей" />
                <input type="text" autoComplete="new-password" className="table__cell table__input" name="InvOMMColumn" data-hint="Буква колонки в excel, в которой записаны инвентарные номера отцов матерей матерей" />
            </div>
        </div>
    );
};

export default columnPickerTable;