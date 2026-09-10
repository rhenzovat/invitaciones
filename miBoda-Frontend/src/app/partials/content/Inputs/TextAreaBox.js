import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextArea from 'devextreme-react/text-area';

import {
  Validator,
  RequiredRule,
  PatternRule
} from 'devextreme-react/validator';

import './inputs.css';
import Label from './Label';

const TextAreaItem = ({
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
  colSpan = 6,
  maxLength = 2000,
  customStyle = {},
  onEnterKey = null,
  boldFont = false
}) => {
  // console.log("Desde TextBoxItem", elements[name], name);
  const textRef = useRef(null);
  const flValue = elements.hasOwnProperty(name);
  const defaultValue = (flValue) ? elements[name] : "";
  const [textValue, setTextValue] = useState(defaultValue);
  const txtName = `ID_${name}_Component`;

  useEffect(() => {

    // console.log("============================ USE STATE defaultValue");
    // console.log("name", name);
    // console.log("name", elements[name]);
    // console.log("flValue", flValue);
    // console.log("defaultValue", defaultValue);
    // console.log("textValue", textValue);



    let valorActual = textRef.current.instance.option('value');

    if (valorActual != defaultValue && defaultValue !== "") {
      textRef.current.instance.option('value', defaultValue);
    }
    else {
      textRef.current.instance.option('value', defaultValue);
    }

    // console.log("valorActual", valorActual);
    // console.log("============================");

  }, [defaultValue]);


  return (
    <div className={`col-${colSpan}`} style={{
      paddingTop: "5px",
      paddingBottom: "5px"
    }}>
      {/* <div className="dx-fieldset"> */}

      {textOnly ? (
        <TextArea
          defaultValue={defaultValue}
          ref={textRef}
          onValueChanged={(e) => {
            elements[name]= e.value;
          }}
          readOnly={readOnly}
          hoverStateEnabled={!readOnly}
          disabled={disabled}
          inputAttr={{'style': 'text-transform: uppercase'}}
          maxLength={maxLength}
          onEnterKey={onEnterKey}
        />
      ) : (
        <div className="dx-field">

          <Label labelTop={labelTop} isRequired={isRequired} boldFont={boldFont} >
            {label}
          </Label>
          <div className="dx-field-value"
            style={labelTop ? { display: "flex", width: "100%" } : { display: "flex" }}
          >
            <TextArea
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
              onEnterKey={onEnterKey}

              style={{
                ...customStyle,
                flex: "0 0 100%"
              }}

            >
              <Validator>
                {isRequired ? (<RequiredRule message={""} />) : null}
                {ruleName !== "" ? (<PatternRule pattern={ruleName} message={ruleMessage} />) : null}
              </Validator>
            </TextArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAreaItem;
