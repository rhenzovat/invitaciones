import React, { useState, useEffect, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import DateBox from 'devextreme-react/date-box';
import TextBox from 'devextreme-react/text-box';
import {
  Validator,
  RequiredRule,
  PatternRule
} from 'devextreme-react/validator';

// import './inputs.css';


const DateBoxItem = ({
  label = "",
  labelTop = false,
  name = "Name",
  elements = {},
  //setArrayValue = () => { },
  isRequired = false,
  textOnly = false,
  readOnly = false,
  disabled = false,
  ruleName = "",
  ruleMessage = "SIN MENSAJE",
  type = "date",
  min = new Date(new Date().toDateString()),
  max = new Date(2050, 1, 1),
  colSpan = 6,
  onChange = () => { console.log("EVENTO CHANGE"); },
}) => {

  const textRef = useRef(null);
  const flValue = elements.hasOwnProperty(name);
  const defaultValue = (flValue) ? elements[name] : "";
  const [textValue, setTextValue] = useState(defaultValue);
  const txtName = `ID_${name}_Component`;

  useEffect(() => {
    let valorActual = textRef.current.instance.option('value');
    if (valorActual != defaultValue && defaultValue !== "") {
      textRef.current.instance.option('value', defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className={`col-${colSpan}`} style={{
      paddingTop: "5px",
      paddingBottom: "5px"
    }}>
      {/* <div className="dx-fieldset"> */}

      {textOnly ? (
        <TextBox defaultValue={defaultValue}
          ref={textRef}
          onValueChanged={(e) => {
            elements[name] = e.value;
          }}
          readOnly={readOnly}
          hoverStateEnabled={!readOnly}
          disabled={disabled}
          inputAttr={{ 'style': 'text-transform: uppercase; padding-inline-end: unset' }}

        />
      ) : (
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
              {isRequired ? (<span className="dx-field-item-required-mark">&nbsp;*</span>) : null}
            </div>
          )}
          <div className="dx-field-value"
          // style={labelTop ? { width: "100%" } : ''}
          >

            <DateBox
              type={type}
              min={min}
              max={max}
              displayFormat={"dd/MM/yyyy"}
              inputAttr={{ 'style': 'text-transform: uppercase; padding-inline-end: unset' }}

              defaultValue={defaultValue}
              name={txtName}
              ref={textRef}
              onValueChanged={(e) => {
                //console.log("onValueChanged", { e, elements });
                elements[name] = e.value;
                setTextValue(e.value);
                onChange(e);
              }}
              readOnly={readOnly}
              hoverStateEnabled={!readOnly}
              disabled={disabled}
            >
              <Validator>
                {isRequired ? (<RequiredRule message={""} />) : null}
                {ruleName !== "" ? (<PatternRule pattern={ruleName} message={ruleMessage} />) : null}
              </Validator>
            </DateBox>

          </div>
        </div>
      )}
      {/* </div> */}
    </div>
  );
};

export default DateBoxItem;
