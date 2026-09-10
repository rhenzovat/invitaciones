import React from 'react';
// import './inputs.css';

const Label = ({
    labelTop = false,
    isRequired = false,
    boldFont = false,
    children
}) => {
    return (
        <>
            {labelTop ? (
                <label className="dx-field-item-label dx-field-item-label-location-top" >
                    <span className="dx-field-item-label-content">
                        <span className={`dx-field-item-label-text ${boldFont ? "fontBold" : ""}`} >{children}</span>
                    </span>
                </label>
            ) : (
                <div className="dx-field-label">
                    <span className={`dx-field-item-label-text ${boldFont ? "fontBold" : ""}`}>{children}:</span>
                    {isRequired ? (<span className="dx-field-item-required-mark">&nbsp;*</span>) : null}
                </div>
            )}
        </>
    );
};

export default Label;
