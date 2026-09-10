import React, { useEffect, useState, } from "react";
import { useIntl, injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  EmailRule,
} from "devextreme-react/form";
import { PortletHeader, PortletHeaderToolbar, } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { listarEstadoSimple, } from "../../utils/utils";
// import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import { SimpleCard, } from "app/components";
import FieldsetHeader from '../../components/FieldsetHeader/FieldsetHeader';

const EmpleadosEditPage = props => {
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
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarEmpleado(props.dataRowEditNew);
      } else {
        props.actualizarEmpleado(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <div className="content-box analytics">
        <PortletHeader
          title={props?.titulo}
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
          <FieldsetHeader title={intl.formatMessage({ id: "ADMINISTRACION.EMPLEADOS.INFO.DATOS_PERSONALES" })}>
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
                  label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.EMAIL" }) + " (Propio del empleado)" }}
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
                  dataField="dni"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRACION.CLIENTES.FORM.DNI" }) }}
                />
                <Item />
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
          </FieldsetHeader>

          {
            props.dataRowEditNew.esNuevoRegistro && (

              <FieldsetHeader title={intl.formatMessage({ id: "ADMINISTRACION.EMPLEADOS.INFO.USUARIO" })}>

                <Form
                  formData={props.dataRowEditNew}
                  id={'editForm'}
                  validationGroup="FormEdicion">

                  <GroupItem itemType="group" colCount={2} colSpan={2}>

                    <Item
                      dataField="email_acceso"
                      label={{ text: intl.formatMessage({ id: "ADMINISTRACION.EMPLEADOS.INFO.EMAIL" }) }}
                      // isRequired={true}
                      // colSpan={2}
                      editorOptions={{
                        // inputAttr: { 'style': 'text-transform: uppercase' },
                        maxLength: 50,
                        showClearButton: true,
                      }}
                    >
                      {/* <RequiredRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ISREQUIERD" })} /> */}
                      <EmailRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.EMAL.INVALID" })} />
                    </Item>
                    <Item
                      dataField="password"
                      label={{ text: intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.PASSWORD" }) }}
                      // isRequired={true}
                      editorOptions={{
                        maxLength: 50,
                        // inputAttr: { 'style': 'text-transform: uppercase' },
                        mode: "password",
                        showClearButton: true,
                      }}
                    >
                      {/* <RequiredRule message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ISREQUIERD" })} /> */}
                    </Item>


                  </GroupItem>
                </Form>
              </FieldsetHeader>
            )
          }


        </SimpleCard>
      </div>
    </>
  );
}
export default injectIntl((EmpleadosEditPage));


