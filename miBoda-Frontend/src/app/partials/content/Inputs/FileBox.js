import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import TextBox, { Button as TextBoxButton } from 'devextreme-react/text-box';

import {
    Validator,
    RequiredRule,
    PatternRule,
    EmailRule
} from 'devextreme-react/validator';

import './inputs.css';

const FileBox = ({
    label = "Ingrese Etiqueta",
    name = "Name",
    elements = {},
    //setArrayValue = () => { },
    isRequired = false,
    readOnly = false,
    disabled = false,
    disabledTextButton = false,
    ruleName = "",
    ruleMessage = "SIN MENSAJE",
    buttonClickEvent = () => { },
    colSpan = 6,
    maxLength = 1000,
    customStyle = {},
    mask = "",
    onEnterKey = null,
    isEmailRule = false,
}) => {
    console.log("Desde TextBoxItem", elements[name], name);
    const textRef = useRef(null);
    const flValue = elements.hasOwnProperty(name);
    const defaultValue = (flValue) ? elements[name] : "";
    const [textValue, setTextValue] = useState(defaultValue);
    const txtName = `ID_${name}_Component`;

    useEffect(() => {

        console.log("============================ USE STATE defaultValue");
        console.log("name", name);
        console.log("name", elements[name]);
        console.log("flValue", flValue);
        console.log("defaultValue", defaultValue);
        console.log("textValue", textValue);



        let valorActual = textRef.current.instance.option('value');

        if (valorActual != defaultValue && defaultValue !== "") {
            textRef.current.instance.option('value', defaultValue);
        }
        else {
            textRef.current.instance.option('value', defaultValue);
        }

        console.log("valorActual", valorActual);
        console.log("============================");

    }, [defaultValue]);


    const buscarArchivo = (e, item) => {
        let id = e.target.id.replace("btn_", "gb_");
        let files = e.target.files;

        let size = 1024 * 1024 * maxSizeFile;
        if (files.length > 0) {
            let archivoInfo = files[0].name.split(".");

            if (archivoInfo.length > 0) {
                let ext = archivoInfo.pop();
                if (ext.toUpperCase() !== "PDF") {
                    let type = "warning";
                    let text = intl.formatMessage({ id: "ACCREDITATION.PDF.VALIDATION" });
                    notify(text, type, 3000);
                    return;
                }
            }

            //console.log("Peso del archivo :::", files[0].size);
            if (files[0].size > size) {
                let type = "warning";
                let text = intl.formatMessage({ id: "ACCREDITATION.PDF.WEIGHT" });

                text.replace("|", maxSizeFile);
                notify(text, type, 3000);

                return;
            }

            document.getElementById(id).classList.remove("btn_upload_not_file");
            document.getElementById(id).classList.add("btn_upload_file");

            if (item.Tipo === "A") {
                console.log("Es de tipo archivo");
                dataRowEditRequisitos[item.Index] = files[0].name;

                console.log({
                    x: files,
                    y: files[0].name
                });
                for (let i = 0; i < optRequisito.length; i++) {
                    if (optRequisito[i].Index === item.Index) {
                        optRequisito[i].ViewAcreditacion = false;
                    }
                }
                console.log("=====================");
            }
        } else {
            document.getElementById(id).classList.remove("btn_upload_file");
            document.getElementById(id).classList.add("btn_upload_not_file");

            if (item.Tipo === "A") {
                dataRowEditRequisitos[item.Index] = "";
            }
        }
    };

    return (
        <div className={`col-${colSpan}`} style={{
            paddingTop: "5px",
            paddingBottom: "5px"
        }}>
            <div className="dx-field">
                <div className="dx-field-label">
                    <span className="dx-field-item-label-text">{label}:</span>
                    {isRequired ? (<span className="dx-field-item-required-mark">&nbsp;*</span>) : null}
                </div>
                <div className="dx-field-value">
                    <TextBox defaultValue={defaultValue}
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
                    >
                        <Validator>
                            {isRequired ? (<RequiredRule message={""} />) : null}
                            {ruleName !== "" ? (<PatternRule pattern={ruleName} message={ruleMessage} />) : null}
                            {isEmailRule ? (<EmailRule message={ruleMessage} />) : null}
                        </Validator>
                    </TextBox>

                    {/* Boton de Carga Oculto */}
                    <input
                        accept="image/*"
                        key={`btn_${item.Index}`}
                        id={`btn_${item.Index}`}
                        // accept={filtersFiles}
                        type="file"
                        onChange={e => buscarArchivo(e, item)}
                        style={{ display: "none" }}
                    />


                </div>
            </div>
        </div>
    );
};

export default FileBox;


