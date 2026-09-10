import React, { useEffect, useState, } from "react";
import { useIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  EmailRule,
} from "devextreme-react/form";
import { PortletHeader, PortletHeaderToolbar, } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { listarEstadoSimple, } from "../../utils/utils";
import { SimpleCard, } from "app/components";
import {
  listar_membresias,
} from "../../api/promocion.api";

const PromocionEditPage = props => {
  const { accessButton } = props;
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listaMembresias, setListaMembresias] = useState([]);
  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();

    await listar_membresias().then(response => {
      setListaMembresias(response);
    });

    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarUsuario(props.dataRowEditNew);
      } else {
        props.actualizarUsuario(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <div className="container mt-3">
        <PortletHeader
          title={props.titulo}
          toolbar={
            <PortletHeaderToolbar>

              <ButtonDev
                icon="save"
                type="default"
                hint={"Grabar"}
                onClick={grabar}
                useSubmitBehavior={true}
                validationGroup="FormEdicion"
                visible={accessButton.crear ? true : false}
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
          <Form
            formData={props.dataRowEditNew}
            id={'editForm'}
            validationGroup="FormEdicion">

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item
                dataField="nombre"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.NOMBRE" }) }}
                isRequired={true}
                />
              <Item
                dataField="descripcion"
                label={{ text: "Descripción" }}
                />
              <Item
                dataField="start_date"
                label={{ text: "Fecha Inicio" }}
                editorType="dxDateBox"
                isRequired={true}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  type: "date",
                }}
              />

              <Item
                dataField="end_date"
                label={{ text: "Fecha Fianal" }}
                editorType="dxDateBox"
                isRequired={true}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  type: "date",
                }}
              />
              
              <Item
                dataField="id_membresia"
                label={{ text: "Lista de Membresías" }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: listaMembresias,
                  valueExpr: "id_membresia",
                  displayExpr: "nombre",
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.ACTIVO" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

            </GroupItem>
          </Form>
        </SimpleCard>

      </div>
    </>
  );
}

export default PromocionEditPage;

