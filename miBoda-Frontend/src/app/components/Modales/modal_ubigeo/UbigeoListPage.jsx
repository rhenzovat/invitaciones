import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../utils/utils";
import {
  listar_departamentos,
  obtener_provicias,
  obtener_distritos,
} from "../../../api/ubigeo.api";
import FieldsetHeader from '../../../components/FieldsetHeader/FieldsetHeader';
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const UbigeoListPage = props => {
  const intl = useIntl();
  const [listarDepartamentos, setListarDepartamentos] = useState([]);
  const [listaProvincias, setListaProvincias] = useState([]);
  const [listaDistritos, setListaDistritos] = useState([]);
  const [idDepartamento, setIdDepartamento] = useState(null);
  const [idProvincia, setIdProvincia] = useState(null);
  const [codigoUbigeo, setCodigoUbigeo] = useState(null);
  const [departamentoName, setDepartamentoName] = useState(null);
  const [provinciaName, setProvinciaName] = useState(null);
  const [distritoName, setDistritoName] = useState(null);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [historyUbigeos, setHistoryUbigeos] = useState([]);

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('ubigeoHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistoryUbigeos(parsedHistory);
        }
      } catch (e) {
        console.error('Error parsing ubigeo history', e);
      }
    }
    cargarCombos();
  }, []);

  function aceptar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      const params = {
        id_departamento: dataRowEditNew.id_departamento,
        id_provincia: dataRowEditNew.id_provincia,
        id_distrito: dataRowEditNew.id_distrito,
        direccion: dataRowEditNew.direccion,
        departamento: departamentoName,
        provincia: provinciaName,
        distrito: distritoName,
      };

      // Guardar en el historial
      if (departamentoName && provinciaName && distritoName) {
        const newUbigeo = {
          departamento: departamentoName,
          provincia: provinciaName,
          distrito: distritoName,
          direccion: dataRowEditNew.direccion || `${departamentoName}, ${provinciaName}, ${distritoName}`
        };

        setHistoryUbigeos(prevHistory => {
          const newHistory = [
            newUbigeo,
            ...prevHistory.filter(item =>
              !(item.departamento === newUbigeo.departamento &&
                item.provincia === newUbigeo.provincia &&
                item.distrito === newUbigeo.distrito)
            )
          ].slice(0, 5); // Limitar a 5 registros

          localStorage.setItem('ubigeoHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      }

      props.obtenerDireccionDetalle(params);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    }
  }

  async function cargarCombos() {
    await listar_departamentos().then(response => {
      setListarDepartamentos(response);
    });
  }

  async function onValueChangedDepartamento(e) {
    const { value } = e;

    if (isNotEmpty(value)) {
      setIdDepartamento(value);
      setDepartamentoName(e.component.option('text'));
      setDataRowEditNew(prev => ({ ...prev, id_departamento: value }));

      let dataResult = await obtener_provicias({
        id_departamento: value,
      });
      setListaProvincias(dataResult);
      setListaDistritos([]);
    } else {

      setIdDepartamento(null);
      setDepartamentoName(null);
      setListaProvincias([]);
      setListaDistritos([]);
      setDataRowEditNew(prev => ({ ...prev, id_departamento: null }));
    }
  }
  async function onValueChangedProvincias(e) {
    const { value } = e;

    if (isNotEmpty(value)) {
      setProvinciaName(e.component.option('text'));
      setIdProvincia(value);
      setDataRowEditNew(prev => ({ ...prev, id_provincia: value }));

      // CORRECCIÓN: Usar id_provincia en lugar de id_distrito
      let dataResult = await obtener_distritos({
        id_departamento: idDepartamento,
        id_distrito: value,
      });
      setListaDistritos(dataResult);
    } else {
      setProvinciaName(null);
      setListaDistritos([]);
      setDataRowEditNew(prev => ({ ...prev, id_provincia: null }));
    }
  }
  async function onValueChangedDistrito(e) {
    const { value } = e;
    if (isNotEmpty(value)) {
      setDistritoName(e.component.option('text'));
      setCodigoUbigeo(value);
      setDataRowEditNew(prev => ({ ...prev, id_distrito: value }));
    } else {
      setDistritoName(null);
      setCodigoUbigeo(null);
      setDataRowEditNew(prev => ({ ...prev, id_distrito: null }));
    }
  }

  const handleChipClick = async (ubigeo) => {
    // Buscar el departamento correspondiente
    const departamento = listarDepartamentos.find(d => d.name === ubigeo.departamento);
    if (departamento) {
      setDataRowEditNew(prev => ({
        ...prev,
        id_departamento: departamento.id,
        direccion: ubigeo.direccion
      }));
      setDepartamentoName(ubigeo.departamento);
      setIdDepartamento(departamento.id); // Corregido: setIdDepartamento

      // Cargar provincias para este departamento
      const provincias = await obtener_provicias({ id_departamento: departamento.id });
      setListaProvincias(provincias);

      // Buscar y seleccionar provincia
      const provincia = provincias.find(p => p.name === ubigeo.provincia);
      if (provincia) {
        setDataRowEditNew(prev => ({
          ...prev,
          id_provincia: provincia.id
        }));
        setProvinciaName(ubigeo.provincia);
        setIdProvincia(provincia.id);

        // Cargar distritos para esta provincia (CORRECCIÓN)
        const distritos = await obtener_distritos({
          id_departamento: departamento.id,
          id_distrito: provincia.id // Aquí estaba el error principal
        });
        setListaDistritos(distritos);

        // Buscar y seleccionar distrito
        const distrito = distritos.find(d => d.name === ubigeo.distrito);
        if (distrito) {
          setDataRowEditNew(prev => ({
            ...prev,
            id_distrito: distrito.id
          }));
          setDistritoName(ubigeo.distrito);
          setCodigoUbigeo(distrito.id);
        }
      }
    }
  };
  return (
    <>
      <div className="container">
        {/* Sección de chips de historial */}
        {historyUbigeos.length > 0 && (
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecciones recientes:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {/* Reverse the array here before mapping */}
              {historyUbigeos.slice().reverse().map((ubigeo, index) => (
                <Chip
                  key={`${ubigeo.departamento}-${ubigeo.provincia}-${ubigeo.distrito}-${index}`}
                  label={`${ubigeo.departamento} / ${ubigeo.provincia} / ${ubigeo.distrito}`}
                  onClick={() => handleChipClick(ubigeo)}
                  sx={{ cursor: 'pointer', mb: 1 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        <div className="clsProgramacionAlinearBotonCrear" >
          <h2 className="clsProgramacionAlinearBotonCrear-relative"></h2>
          <Button
            icon="mdi mdi-check"
            className="clsBotonAceptar"
            type="default"
            hint={intl.formatMessage({ id: "SEGURIDAD.UBIGEO.SELECCIONAR" })}
            onClick={aceptar}
            useSubmitBehavior={true}
            validationGroup="FormEdicion_Ubigeo"
          />
        </div>

        <FieldsetHeader title={intl.formatMessage({ id: "SEGURIDAD.UBIGEO.DETALLE_MODAL" })}>
          <Form
            formData={dataRowEditNew}
            validationGroup="FormEdicion_Ubigeo">

            <GroupItem>
              <Item
                dataField="direccion"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.UBIGEO.DIRECCION" }), }}
                editorType="dxTextArea"
                // isRequired={true}
                editorOptions={{
                  maxLength: 500,
                  inputAttr: {
                    style: "text-transform: uppercase",
                    autoComplete: "nope"
                  },
                  width: "100%",
                  height: 70,
                  onValueChanged: (e) => {
                    setDataRowEditNew(prev => ({ ...prev, direccion: e.value }));
                  }
                }}
              />
            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item
                dataField="id_departamento"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.UBIGEO.DEPARTAMENTO", }), }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listarDepartamentos,
                  valueExpr: "id",
                  displayExpr: "name",
                  onValueChanged: (e) => onValueChangedDepartamento(e),
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: {
                    style: "text-transform: uppercase",
                    autoComplete: "nope"
                  },
                }}
              />

              <Item
                dataField="id_provincia"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.UBIGEO.PROVINCIA" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listaProvincias,
                  valueExpr: "id",
                  displayExpr: "name",
                  onValueChanged: (e) => onValueChangedProvincias(e),
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: {
                    style: "text-transform: uppercase",
                    autoComplete: "nope"
                  },
                }}
              />

              <Item
                dataField="id_distrito"
                label={{ text: intl.formatMessage({ id: "SEGURIDAD.UBIGEO.DISTRITO" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listaDistritos,
                  valueExpr: "id",
                  displayExpr: "name",
                  onValueChanged: (e) => onValueChangedDistrito(e),
                  searchEnabled: true,
                  showClearButton: true,
                  inputAttr: {
                    style: "text-transform: uppercase",
                    autoComplete: "nope"
                  },
                }}
              />
            </GroupItem>
          </Form>
        </FieldsetHeader>
      </div>
    </>
  );
}

export default UbigeoListPage;