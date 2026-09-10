import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule } from "devextreme-react/form";
import { PortletHeader, PortletHeaderToolbar } from "../../partials/content/Portlet";
import { Button as ButtonDev } from "devextreme-react";
import { listarEstadoSimple } from "../../utils/utils";
import { SimpleCard } from "app/components";
import { listar, } from "../../api/producto.api";
import FieldsetHeader from '../../components/FieldsetHeader/FieldsetHeader';
import Grid from '@mui/material/Grid';

const OfertaDelDiaEditPage = ({
  accessButton,
  dataRowEditNew,
  listaMembresias,
  ...props
}) => {
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading_, setLoading_] = useState(true);
  const [formKey, setFormKey] = useState(0);


  async function cargarCombos() {
    setEstadoSimple(listarEstadoSimple());

    try {
      const response = await listar();
      setProductos(response);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading_(false);
    }
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarOferta(dataRowEditNew);
      } else {
        props.actualizarOferta(dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

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
        <Grid container spacing={2}>
          <Grid item xs={6} >
            <FieldsetHeader title={"Producto con Tiempo"}>
              <Form formData={dataRowEditNew} validationGroup="FormEdicion">
                <GroupItem itemType="group" colCount={2} colSpan={2}>

                  <Item
                    dataField="nombre_oferta"
                    label={{ text: "Nombre de la oferta" }}
                    isRequired={true}
                  />
                  <Item
                    dataField="id_producto"
                    label={{ text: "Producto" }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    editorOptions={{
                      dataSource: productos,
                      valueExpr: "id_producto",
                      displayExpr: "nombre",
                      searchEnabled: true,
                      showClearButton: true,
                      placeholder: "Seleccione un producto",
                      noDataText: loading_ ? "Cargando productos..." : "No hay productos disponibles",
                      onValueChanged: (e) => {
                        if (e.value) {
                          const selectedProduct = productos.find(p => p.id_producto === e.value);
                          if (selectedProduct) {
                            const selectedProduct = productos.find(p => p.id_producto === e.value);
                            const { precio, stock } = selectedProduct;
                            dataRowEditNew.cantidad_disponible = stock;
                            dataRowEditNew.precio_original = precio;
                            setFormKey(prev => prev + 1); // Esto fuerza el re-render
                          }

                        }
                      }
                    }}
                  />
                  <Item
                    dataField="precio_original"
                    label={{ text: "Precio original" }}
                    editorType="dxNumberBox"
                    isRequired={true}
                    editorOptions={{
                      format: "S/ #,##0.##",
                      min: 0,
                      readOnly: true
                    }}
                  />
                  <Item
                    dataField="precio_oferta"
                    label={{ text: "Precio oferta" }}
                    editorType="dxNumberBox"
                    isRequired={true}
                    editorOptions={{
                      format: "S/ #,##0.##",
                      min: 0
                    }}
                  />
                  <Item
                    dataField="start_time"
                    label={{ text: "Fecha inicio" }}
                    editorType="dxDateBox"
                    isRequired={true}
                    editorOptions={{
                      displayFormat: "dd/MM/yyyy HH:mm",
                      type: "datetime"
                    }}
                  />
                  <Item
                    dataField="end_time"
                    label={{ text: "Fecha fin" }}
                    editorType="dxDateBox"
                    isRequired={true}
                    editorOptions={{
                      displayFormat: "dd/MM/yyyy HH:mm",
                      type: "datetime"
                    }}
                  />
                  <Item
                    dataField="cantidad_disponible"
                    label={{ text: "Cantidad disponible" }}
                    editorType="dxNumberBox"
                    isRequired={true}
                    editorOptions={{
                      min: 1,
                      step: 1,
                      readOnly: true,

                    }}
                  />
                  {/* <Item
              dataField="id_membresia"
              label={{ text: "Membresía" }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listaMembresias,
                valueExpr: "id_membresia",
                displayExpr: "nombre"
              }}
            /> */}
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
            </FieldsetHeader>
          </Grid>

          <Grid item xs={6} >
            <FieldsetHeader title={"Solo Producto"}>
              <Form formData={dataRowEditNew} validationGroup="FormEdicion">
                <GroupItem itemType="group" colCount={2} colSpan={2}>

                  <Item
                    dataField="segundo_nombre_oferta"
                    label={{ text: "Nombre de la oferta" }}
                  />
                  <Item
                    dataField="segundo_id_producto"
                    label={{ text: "Producto" }}
                    editorType="dxSelectBox"
                    editorOptions={{
                      dataSource: productos,
                      valueExpr: "id_producto",
                      displayExpr: "nombre",
                      searchEnabled: true,
                      showClearButton: true,
                      placeholder: "Seleccione un producto",
                      noDataText: loading_ ? "Cargando productos..." : "No hay productos disponibles",
                      onValueChanged: (e) => {
                        if (e.value) {
                          const selectedProduct = productos.find(p => p.id_producto === e.value);
                          if (selectedProduct) {
                            const { precio, stock } = selectedProduct;
                            dataRowEditNew.segundo_cantidad_disponible = stock;
                            dataRowEditNew.segundo_precio_original = precio;
                            setFormKey(prev => prev + 1); // Esto fuerza el re-render
                          }
                        }
                      }
                    }}
                  />
                  <Item
                    dataField="segundo_precio_original"
                    label={{ text: "Precio original" }}

                    editorType="dxNumberBox"
                    editorOptions={{
                      format: "S/ #,##0.##",
                      min: 0,
                      readOnly: true
                    }}
                  />
                  <Item
                    dataField="segundo_precio_oferta"
                    label={{ text: "Precio oferta" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                      format: "S/ #,##0.##",
                      min: 0
                    }}
                  />

                  <Item
                    dataField="segundo_cantidad_disponible"
                    label={{ text: "Cantidad disponible" }}
                    editorType="dxNumberBox"
                    editorOptions={{
                      min: 1,
                      step: 1,
                      readOnly: true

                    }}
                  />

                </GroupItem>
              </Form>
            </FieldsetHeader>
          </Grid>
        </Grid>
      </SimpleCard>
    </div>
  );
};

export default OfertaDelDiaEditPage;