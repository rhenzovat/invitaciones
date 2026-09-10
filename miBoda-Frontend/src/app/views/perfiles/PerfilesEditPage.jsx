import React, { useEffect, useState, } from "react";
import { useIntl } from "react-intl";
import { styled, } from "@mui/material/styles";
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
// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const PerfilesEditPage = props => {
  const { accessButton } = props;
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      // if (!validateListMailFormat()) {
      //   handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "Hay un correo incorrecto en el campo Alerta Email" }));
      //   return;
      // }

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
      <ContentBox className="analytics">


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
                editorOptions={{
                  // inputAttr: { style: "text-transform: uppercase" },
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
      </ContentBox>
    </>
  );
}

export default PerfilesEditPage;

