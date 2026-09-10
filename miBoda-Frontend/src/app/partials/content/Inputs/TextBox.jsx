import React, { useState, useEffect, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import TextBox, { Button as TextBoxButton } from 'devextreme-react/text-box';
import {
  Validator,
  RequiredRule,
  PatternRule,
  EmailRule
} from 'devextreme-react/validator';

// import './inputs.css';
import Label from './Label';

const TextBoxItem = ({
  // label = "Ingrese Etiqueta",
  label = "",
  labelTop = false,
  name = "Name",
  elements = {},
  //setArrayValue = () => { },
  isRequired = false,
  textOnly = false,
  readOnly = false,
  disabled = false,
  disabledTextButton = false,
  ruleName = "",
  ruleMessage = "SIN MENSAJE",
  isTextButton = false,
  buttonClickEvent = () => { },
  colSpan = 6,
  maxLength = 1000,
  customStyle = {},
  mask = "",
  onEnterKey = null,
  showClearButton = false,
  isEmailRule = false,
  boldFont = false,
  detailButton = {
    visible: false,
    text: "...",
    disabled: false,
    event: () => { console.log("Event click") }
  }
}) => {

  const textRef = useRef(null);
  const flValue = elements.hasOwnProperty(name);
  const defaultValue = (flValue) ? elements[name] : "";
  const txtName = `ID_${name}_Component`;

  const [textValue, setTextValue] = useState(defaultValue);
  useEffect(() => {
    let valorActual = textRef.current.instance.option('value');
    if (valorActual != defaultValue && defaultValue !== "") {
      textRef.current.instance.option('value', defaultValue);
    }
    else {
      textRef.current.instance.option('value', defaultValue);
    }
  }, [defaultValue]);

  return (
    <div className={`col-${colSpan}`} style={{
      paddingTop: "5px",
      paddingBottom: "5px"
    }}>
      {textOnly ? (
        <TextBox
          defaultValue={defaultValue ? defaultValue : textValue}
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
          mask={mask}
          onEnterKey={onEnterKey}
          //add
          // valueChangeEvent="keyup"
          showClearButton={showClearButton}

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
                disabled: disabledTextButton
              }}

            />
          ) : null}
        </TextBox>
      ) : (
        <div className="dx-field">

          <Label labelTop={labelTop} isRequired={isRequired} boldFont={boldFont} >
            {label}
          </Label>
          <div className="dx-field-value"
            style={labelTop ? { display: "flex", width: "100%" } : { display: "flex" }}
          >
            <TextBox
              defaultValue={defaultValue}
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
              // style={customStyle}
              mask={mask}
              onEnterKey={onEnterKey}
              //add
              // valueChangeEvent="keyup"
              showClearButton={showClearButton}

              style={{
                ...customStyle,
                flex: ((detailButton.visible) ? `0 0 90%` : "0 0 100%")
              }}

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
                    disabled: disabledTextButton
                  }}

                />
              ) : null}
              <Validator>
                {isRequired ? (<RequiredRule message={""} />) : null}
                {ruleName !== "" ? (<PatternRule pattern={ruleName} message={ruleMessage} />) : null}
                {isEmailRule ? (<EmailRule message={ruleMessage} />) : null}
              </Validator>
            </TextBox>
            {detailButton.visible && (
              <button className='btn-primary'
                disabled={detailButton.disabled}
                onClick={detailButton.event}
                style={{
                  flex: "0 0 10%",
                  borderRadius: "5px"
                }}
              >
                {detailButton.text}
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default TextBoxItem;
