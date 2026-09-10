
import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextBox, { Button as TextBoxButton } from 'devextreme-react/text-box';
import { NumberBox } from 'devextreme-react/number-box';

import {
  Validator,
  RequiredRule,
  PatternRule,
  EmailRule
} from 'devextreme-react/validator';

import './inputs.css';

const NumberBoxItem = ({
  label = "Ingrese Etiqueta",
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
  isTextButton = false,
  buttonClickEvent = () => { },
  colSpan = 6,
  maxLength = 1000,
  customStyle = {},
  mask = "",
  onEnterKey = null,
  isEmailRule = false,
  min = undefined,
  max = undefined,
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
        <NumberBox defaultValue={defaultValue}
          ref={textRef}
          onValueChanged={(e) => {
            elements[name] = e.value;
          }}
          readOnly={readOnly}
          hoverStateEnabled={!readOnly}
          disabled={disabled}
          inputAttr={{ 'style': 'text-transform: uppercase' }}
          maxLength={maxLength}
          style={customStyle}
          mask={mask}
          onEnterKey={onEnterKey}
          showSpinButtons={true}
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
          <div className="dx-field-value" style={labelTop ? {width: "100%"} : ''}>
            <NumberBox defaultValue={defaultValue}
              name={txtName}
              ref={textRef}
              onValueChanged={(e) => {
                elements[name] = e.value;
                setTextValue(e.value);
              }}
              readOnly={readOnly}
              hoverStateEnabled={!readOnly}
              disabled={disabled}
              inputAttr={{ 'style': 'text-transform: uppercase' }}
              maxLength={maxLength}
              style={customStyle}
              mask={mask}
              onEnterKey={onEnterKey}
              showSpinButtons={true}
              min={min}
              max={max}

            >
              {isTextButton ? (
                <TextBoxButton
                  name="search"
                  location="after"
                  hoverStateEnabled={false}
                  options={{
                    stylingMode: 'text',
                    icon: 'search',
                    onClick: buttonClickEvent,
                    disabled: disabled
                  }}

                />
              ) : null}




              <Validator>
                {isRequired ? (<RequiredRule message={""} />) : null}
                {ruleName !== "" ? (<PatternRule pattern={ruleName} message={ruleMessage} />) : null}
                {isEmailRule ? (<EmailRule message={ruleMessage} />) : null}
              </Validator>
            </NumberBox>
          </div>
        </div>
      )}
      {/* </div> */}
    </div>
  );
};

export default NumberBoxItem;

