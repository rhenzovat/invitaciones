import React from "react";
import "./FieldsetHeader.css";
const FieldsetHeader = ({ title = "", children = undefined, style = {} }) => {
  return (
    <fieldset className="acreditacion-fieldset" style={style}>
      <legend className="acreditacion-legend" style={{ background: '#7f7f7f' }}>
        <h6 className="fondoGrissPanel clsLabelLowerCase idRef845151">
          <label>{title} </label>
        </h6>
      </legend>

      {!!children &&
        Array.isArray(children) &&
        children.map((child, index) => (
          <div key={`fs_item_${index}`}>{child}</div>
        ))}

      {!!children && !Array.isArray(children) && <div>{children}</div>}
    </fieldset>
  );
};

export default FieldsetHeader;
