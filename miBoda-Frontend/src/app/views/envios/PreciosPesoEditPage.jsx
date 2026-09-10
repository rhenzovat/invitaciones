import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, RangeRule } from "devextreme-react/form";
import { PortletHeader, PortletHeaderToolbar } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { SimpleCard } from "app/components";
import UbigeoIndexPage from "../../components/Modales/modal_ubigeo/UbigeoIndexPage";
import { listarEstadoSimple, listarDimencionPaquete, } from "../../utils/utils";

const PreciosPesoEditPage = ({ accessButton, dataRowEditNew, ...props }) => {

  const intl = useIntl();
  const [visibleModalUbicacion, setVisibleModalUbicacion] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [dimencionPaquete, setDimencionPaquete] = useState([]);


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      // Crea una copia de dataRowEditNew para no modificar el estado original directamente
      const dataToSend = { ...dataRowEditNew };

      // Formatea 'hora_regresiva' si existe y es un objeto Date
      if (dataToSend.hora_regresiva instanceof Date) {
        const date = dataToSend.hora_regresiva;
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        dataToSend.hora_regresiva = `${hours}:${minutes}:${seconds}`;
      } else {
        dataToSend.hora_regresiva = null; // O '' según lo que necesites
      }

      if (dataToSend.esNuevoRegistro) {
        props.agregarRegistro(dataToSend);
      } else {
        props.actualizarRegistro(dataToSend);
      }
    }
  }

  const obtenerDireccionDetalle = async (dataPopup) => {
    const { departamento, provincia, distrito, direccion, id_departamento, id_provincia, id_distrito } = dataPopup;

    dataRowEditNew.address_id_departamento = id_departamento;
    dataRowEditNew.address_id_provincia = id_provincia;
    dataRowEditNew.address_ubigueo = id_distrito;

    dataRowEditNew.address_departamento = departamento;
    dataRowEditNew.address_provincia = provincia;
    dataRowEditNew.address_distrito = distrito;

    dataRowEditNew.address_direccion = direccion ?? "";

    dataRowEditNew.ubicacion =
      direccion ?? "" + ',' +
      departamento + '-' +
      provincia + '-' +
      distrito
  }

  async function cargarCombos() {
    setEstadoSimple(listarEstadoSimple());
    setDimencionPaquete(listarDimencionPaquete());

  }

  useEffect(() => {
    if (dataRowEditNew) {
      dataRowEditNew.ubicacion = dataRowEditNew.address_departamento + '-' + dataRowEditNew.address_provincia + '-' + dataRowEditNew.address_distrito
    }
    cargarCombos();
  }, [dataRowEditNew]);

  return (
    <div className="container mt-3">
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <ButtonDev
              icon="save"
              type="default"
              hint="Grabar"
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={accessButton.crear}
            />
            &nbsp;
            <ButtonDev
              icon="remove"
              type="normal"
              stylingMode="outlined"
              onClick={props.cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />
      <SimpleCard>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2}>

            {/* Campos de Dirección */}
            <Item
              dataField="ubicacion"
              isRequired={true}
              label={{ text: intl.formatMessage({ id: "PROGRAMACION.EDITAR_FORMULARIO.UBICACION" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                // inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: false,
                    onClick: () => setVisibleModalUbicacion(true),
                  }
                }]
              }}
            />

            {/* Campos de Peso y Precio */}
            <Item
              dataField="rango_min"
              label={{ text: "Peso mínimo (kg)" }}
              editorType="dxNumberBox"
              isRequired={true}
              editorOptions={{
                min: 0,
                step: 0.001,
                format: "#0.000"
              }}
            >
              <RequiredRule message="El peso mínimo es requerido" />
              <RangeRule min={0} message="El valor debe ser positivo" />
            </Item>
            <Item
              dataField="rango_max"
              label={{ text: "Peso máximo (kg)" }}
              editorType="dxNumberBox"
              isRequired={true}
              editorOptions={{
                min: 0,
                step: 0.001,
                format: "#0.000"
              }}
            >
              <RequiredRule message="El peso máximo es requerido" />
              <RangeRule min={0} message="El valor debe ser positivo" />
            </Item>
            <Item
              dataField="precio"
              label={{ text: "Precio (S/)" }}
              editorType="dxNumberBox"
              isRequired={true}
              editorOptions={{
                min: 0,
                step: 0.01,
                format: "#,##0.00"
              }}
            >
              <RequiredRule message="El precio es requerido" />
              <RangeRule min={0} message="El precio debe ser positivo" />
            </Item>

            {/* Campos de Medidas y Dimensiones */}
            <Item
              dataField="paquete_medidas"
              label={{ text: "Medidas del paquete" }}
              editorType="dxTextBox"
              editorOptions={{ placeholder: "Ej: 10x20x30 cm" }}
            />




            {/* Campos de Tiempo de Entrega y Pago */}
            <Item
              dataField="hora_regresiva"
              label={{ text: "Hora de entrega regresiva" }}
              editorType="dxDateBox"
              editorOptions={{
                placeholder: "HH:mm:ss",
                type: "time",
                showClearButton: true,
                useMaskBehavior: true,
              }}
            />

            <Item
              dataField="hora_regresiva_descripcion"
              label={{ text: "Descripción de hora regresiva" }}
              editorType="dxTextBox"
              editorOptions={{ placeholder: "Ej: Entrega en 24 horas" }}
            />
            <Item
              dataField="pago_contra_entrega"
              label={{ text: "Pago contra entrega" }}
              editorType="dxSwitch"
              editorOptions={{
                switchedOnText: "Sí",
                switchedOffText: "No"
              }}
            />

            {/* Campo Activo */}
            <Item
              dataField="Activo"
              label={{ text: "Estado" }}
              editorType="dxSelectBox"
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion"
              }}
            />
          </GroupItem>
        </Form>
      </SimpleCard>

      {/*** PopUp -> Direccion de Detalle ****/}
      {visibleModalUbicacion && (
        <UbigeoIndexPage
          selectData={obtenerDireccionDetalle}
          showPopup={{ isVisiblePopUp: visibleModalUbicacion, setisVisiblePopUp: setVisibleModalUbicacion }}
          cancelarEdicion={() => setVisibleModalUbicacion(false)}
          selectionMode={"row"}
        />
      )}

    </div>
  );
};

export default PreciosPesoEditPage;