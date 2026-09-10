import React, { useRef, useEffect, useState } from "react";
import { Button as ButtonDev } from "devextreme-react";
import HtmlEditorComponent from "../../../components/HtmlEditorComponent";
import { TextBox } from 'devextreme-react/text-box';
import { FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import ModalFichaTecnica01 from "./ModalFichaTecnica01";

const ModalFichaTecnicaListPage = ({ idProducto, dataRowEditNew, agregarFichaTecnica }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [datosFicha, setDatosFicha] = useState(null);
  const [fichaPrincipalOrden, setFichaPrincipalOrden] = useState(1);
  const modalFichaRef = useRef(); // Referencia para el componente ModalFichaTecnica01

  const formData = useRef({
    titulos: ['', '', ''],
    contenidos: ['', '', '']
  });

  const editorMethodsRef = useRef([null, null, null]);
  const textRef1 = useRef(null);
  const textRef2 = useRef(null);

  const handleTabChange = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleTitleChange = (index, value) => {
    formData.current.titulos[index] = value;
  };

  const handleContentChange = (index, value) => {
    formData.current.contenidos[index] = value;
  };

  const registerEditorMethods = (index, methods) => {
    editorMethodsRef.current[index] = methods;
  };

  // Función que recibe los datos del componente hijo
  const handleGenerarFicha = (fichaTecnica) => {
    setDatosFicha(fichaTecnica);
  };

  const handleSave = () => {

    const params = {
      id_producto: idProducto,
      titulo1: formData.current.titulos[0],
      titulo2: formData.current.titulos[1],
      editorValue1: editorMethodsRef.current[0]?.getEditorContent() || '',
      editorValue2: modalFichaRef.current.generarFichaTecnica(),
      ficha_principal_orden: fichaPrincipalOrden
    };

    agregarFichaTecnica(params);

  };

  useEffect(() => {
    if (dataRowEditNew && Object.keys(dataRowEditNew).length !== 0) {
      formData.current = {
        titulos: [
          dataRowEditNew[0]?.titulo || '',
          dataRowEditNew[1]?.titulo || '',
        ],
        contenidos: [
          dataRowEditNew[0]?.descripcion || '',
          dataRowEditNew[1]?.descripcion || '',
        ]
      };
      const principal = (dataRowEditNew[1]?.es_principal === 'S') ? 2 : 1;
      setFichaPrincipalOrden(principal);

      if (textRef1.current) {
        textRef1.current.instance.option('value', formData.current.titulos[0]);
      }
      if (textRef2.current) {
        textRef2.current.instance.option('value', formData.current.titulos[1]);
      }
    }
  }, [dataRowEditNew]);

  return (
    <div style={{ margin: "2rem" }} className="mt-1">
      <div className="clsAlinearFichaTecnica">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <button
              type="button"
              role="tab"
              className={`nav-link ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => handleTabChange(0)}
            >
              Ficha General
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              role="tab"
              className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => handleTabChange(1)}
            >
              Ficha Personalizada
            </button>
          </li>
        </ul>

        <ButtonDev
          icon="save"
          type="default"
          hint="Grabar"
          onClick={handleSave}
          useSubmitBehavior
        />
      </div>

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }} color="text.secondary">
        Activado como Principal (solo esta ficha se mostrará en la web del producto)
      </Typography>
      <RadioGroup
        row
        value={fichaPrincipalOrden}
        onChange={(e) => setFichaPrincipalOrden(Number(e.target.value))}
      >
        <FormControlLabel value={1} control={<Radio size="small" />} label="Ficha General" />
        <FormControlLabel value={2} control={<Radio size="small" />} label="Ficha Personalizada" />
      </RadioGroup>

      <div className="tab-content">
        {/* Tab 1 - Componente independiente */}
        <div
          className={`tab-pane ${activeTab === 0 ? 'active' : ''}`}
          style={{ display: activeTab === 0 ? 'block' : 'none' }}
          role="tabpanel"
        >
          <h6 className="mt-4">
            <TextBox
              ref={textRef1}
              defaultValue={formData.current.titulos[0]}
              placeholder="Título"
              label="Título"
              stylingMode="filled"
              labelMode="floating"
              showClearButton
              onValueChanged={(e) => handleTitleChange(0, e.value)}
            />
          </h6>
          <HtmlEditorComponent
            registerEditorMethods={(methods) => registerEditorMethods(0, methods)}
            onValueChanged={(value) => handleContentChange(0, value)}
            dataRowEditNew={dataRowEditNew?.[0]}
            editorIndex={0}
          />
        </div>

        {/* Tab 2 - Segundo componente independiente */}
        <div
          className={`tab-pane ${activeTab === 1 ? 'active' : ''}`}
          style={{ display: activeTab === 1 ? 'block' : 'none' }}
          role="tabpanel"
        >
          <h6 className="mt-4">
            <TextBox
              ref={textRef2}
              defaultValue={formData.current.titulos[1]}
              placeholder="Título"
              label="Título"
              stylingMode="filled"
              labelMode="floating"
              showClearButton
              onValueChanged={(e) => handleTitleChange(1, e.value)}
            />
          </h6>

          {/* Componente ModalFichaTecnica01 con referencia y callback */}
          <ModalFichaTecnica01
            ref={modalFichaRef}
            onGenerarFicha={handleGenerarFicha}
            dataRowEditNew={dataRowEditNew?.[1]}

          />
        </div>
      </div>
    </div>
  );
};

export default ModalFichaTecnicaListPage;