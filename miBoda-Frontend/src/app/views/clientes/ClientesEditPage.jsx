import React, { useEffect, useState, } from "react";
import { useIntl } from "react-intl";
import { styled, } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  EmailRule,
} from "devextreme-react/form";
import Button from "@mui/material/Button";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { PortletHeader, PortletHeaderToolbar, } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { listarEstadoSimple, } from "../../utils/utils";
import { SimpleCard, } from "app/components";
// STYLED COMPONENTS
const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" }
}));

const ClientesEditPage = props => {
  const { accessButton } = props;
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);
  const navigate = useNavigate();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  const Container = styled("div")(({ theme }) => ({
    margin: 30,
    [theme.breakpoints.down("sm")]: { margin: 16 },
    "& .breadcrumb": { marginBottom: 30, [theme.breakpoints.down("sm")]: { marginBottom: 16 } }
  }));


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
    <Container>
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
                dataField="apellido"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.APELLIDO" }) }}
                editorOptions={{
                  // inputAttr: { style: "text-transform: uppercase" },
                }}
              />
              <Item
                dataField="telefono"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.TELEFONO" }) }}
              />
              <Item
                dataField="email"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.EMAIL" }) }}
                // isRequired={true}
                colSpan={2}
                editorOptions={{
                  // inputAttr: { 'style': 'text-transform: uppercase' },
                  maxLength: 50
                }}
              >
                {/* <RequiredRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ISREQUIERD" })} /> */}
                <EmailRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.EMAL.INVALID" })} />
              </Item>

              <Item
                dataField="direccion"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.DIRECCION" }) }}
                editorOptions={{
                  // inputAttr: { style: "text-transform: uppercase" },
                }}
              />

              <Item
                dataField="ruc"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.RUC" }) }}
              />

              <Item
                dataField="razon_social"
                label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.RAZON_SOCIAL" }) }}
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
    </Container >
  );
}

export default ClientesEditPage;

