import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import SelectBox from "devextreme-react/select-box";

import {
  Validator,
  RequiredRule,
  PatternRule
} from "devextreme-react/validator";

import "./inputs.css";
import { isNotEmpty } from "../../../../../_metronic";

const ListBoxItem = ({
  label = "Etiqueta",
  labelTop = false,
  displayValue = "",
  dataName = "",
  displayText = "",
  elements = {},
  //setArrayValue,
  dataSource = [],
  isRequired = false,
  readOnly = false,
  onChange = () => {
    console.log("EVENTO CHANGE");
  },
  ruleName = "",
  ruleMessage = "SIN MENSAJE",
  colSpan = 6,
  customLabelItem = () => { return null; },
  searchEnabled = false,
  searchMode = 'contains',
  placeholder = "Seleccione...",
  disabled = false
}) => {
  const textRef = useRef(null);

  const nameElement = dataName == "" ? displayValue : dataName;
  const flValue = elements.hasOwnProperty(nameElement);
  const defaultValue = flValue ? elements[nameElement] : "";
  const [textValue, setTextValue] = useState(defaultValue);

  useEffect(() => {
    let valorActual = textRef.current.instance.option("value");
    if (valorActual != defaultValue && defaultValue !== "") {
      textRef.current.instance.option("value", defaultValue);
    }
    else {
      if (valorActual && defaultValue != null && defaultValue !== undefined) {
        textRef.current.instance.option("value", defaultValue);
      }
    }
  }, [defaultValue]);

  return (
    <div
      className={`col-${colSpan}`}
      style={{
        paddingTop: "5px",
        paddingBottom: "5px"
      }}
    >
      <div className="dx-field">
        {labelTop ? (
          <label class="dx-field-item-label dx-field-item-label-location-top" >
            <span class="dx-field-item-label-content">
              <span class="dx-field-item-label-text">{label}</span>
            </span>
          </label>
        ) : (
          <div className="dx-field-label">
            <span className="dx-field-item-label-text">{label}:</span>
            {/* {customLabelItem()} */}
            {isRequired ? (
              <span className="dx-field-item-required-mark">&nbsp;*</span>
            ) : null}
          </div>
        )}

        <div className="dx-field-value" style={labelTop ? { width: "100%" } : ''}>

          {/* <div className="dx-field-value"> */}
          <SelectBox
            id={displayValue}
            ref={textRef}
            dataSource={dataSource}
            displayExpr={displayText}
            placeholder={placeholder}
            valueExpr={displayValue}
            valuedefault={isNotEmpty(textValue) ? textValue : ""}
            showClearButton={true}
            readOnly={readOnly}
            inputAttr={{ style: "text-transform: uppercase" }}
            onValueChanged={e => {
              let valor =
                e !== null && e.value !== "" && e.value !== null ? e.value : "";
              elements[nameElement] = valor;
              onChange(valor);
            }}
            searchEnabled={searchEnabled}
            searchMode={searchMode}
            disabled={disabled}
          >
            <Validator>
              {isRequired ? <RequiredRule message={""} /> : null}
              {ruleName !== "" ? (
                <PatternRule pattern={ruleName} message={ruleMessage} />
              ) : null}
            </Validator>
          </SelectBox>
        </div>
      </div>

    </div>
  );
};

export default ListBoxItem;
