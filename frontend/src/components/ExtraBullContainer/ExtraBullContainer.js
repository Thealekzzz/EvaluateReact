import React from 'react';

import "./ExtraBullContainer.css"

const ExtraBullContainer = ({bullData}) => {

    // let markerCaptions = ["семенной код", "идентификационный номер", "инвентарный номер"]

    return (
        <article className="bulls-list__bull-container">
            <p className="bulls-list__bull-container-title">
                <span className="bulls-list__bull-container-title_accent">{bullData.name}</span>
                {[bullData.NAAB, bullData.ID, bullData.inv].filter(el => Boolean(el)).join(", ")}
            </p>

            <div className="bulls-list__options-head">
                <p className="bulls-list__options-head-item">Полное имя</p>
                <p className="bulls-list__options-head-item">Семенной код</p>
                <p className="bulls-list__options-head-item">Идентификатор</p>
                <p className="bulls-list__options-head-item">TPI</p>
                <p className="bulls-list__options-head-item">Молоко</p>
            </div>

            <div className="bulls-list__bulls-options">
            {bullData.matches.map((option, index) => {
                return (
                    <label for={`${bullData.name}__${index}`} className="bulls-list__bulls-option" key={`${bullData.name}__${index}`}>
                        <input type="radio" name={bullData.name} id={`${bullData.name}__${index}`} value={`${bullData.name}__${index}`} />
                        <p className="bulls-list__bull-info">{option.Name}</p>
                        <p className="bulls-list__bull-info">{option["NAAB Code"]}</p>
                        <p className="bulls-list__bull-info">{option["InterRegNumber"]}</p>
                        <p className="bulls-list__bull-info">{option.TPI}</p>
                        <p className="bulls-list__bull-info">{option.Milk}</p>
                    </label>
                )
            })}

                    <label for={`${bullData.name}`} className="bulls-list__bulls-option">
                        <input type="radio" name={bullData.name} id={`${bullData.name}`} value={`${bullData.name}`} />
                        <p className="bulls-list__bull-info">Если ни один не подошел</p>
                    </label>
            </div>

        </article>
    );
};

export default ExtraBullContainer;