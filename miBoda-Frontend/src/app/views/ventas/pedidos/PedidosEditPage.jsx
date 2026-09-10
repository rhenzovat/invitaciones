import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button as ButtonDev } from "devextreme-react";
import { listarEstadoSimple } from "../../../utils/utils";
import { listar } from "../../../api/producto_categoria.api";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";

// STYLED COMPONENTS
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#f5f7fa",
  minHeight: "100%",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(3),
  borderRadius: "16px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  boxShadow: "0 10px 40px rgba(102, 126, 234, 0.3)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const HeaderLeft = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const HeaderIconWrapper = styled(Box)({
  width: "56px",
  height: "56px",
  borderRadius: "14px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(10px)",
  "& svg": {
    fontSize: "28px",
    color: "#fff",
  },
});

const HeaderActions = styled(Box)({
  display: "flex",
  gap: "12px",
  alignItems: "center",
});

const ActionButton = styled(ButtonDev)(({ variant }) => ({
  borderRadius: "12px !important",
  padding: "10px 24px !important",
  fontWeight: "600 !important",
  textTransform: "none !important",
  boxShadow: variant === "save"
    ? "0 4px 15px rgba(76, 175, 80, 0.3) !important"
    : "none !important",
}));

const FormCard = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  marginBottom: theme.spacing(3),
}));

const SectionHeader = styled(Box)(({ bgcolor }) => ({
  padding: "16px 24px",
  background: bgcolor || "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
}));

const SectionIcon = styled(Box)(({ color }) => ({
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  backgroundColor: color || "#667eea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "20px",
    color: "#fff",
  },
}));

const SectionContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#fff",
  "& .dx-field-item-label-text": {
    color: "#5a6a85",
    fontWeight: 500,
    fontSize: "13px",
  },
  "& .dx-texteditor": {
    borderRadius: "10px",
    border: "1px solid #e0e6ed",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#667eea",
    },
    "&.dx-state-focused": {
      borderColor: "#667eea",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.15)",
    },
  },
  "& .dx-texteditor-input": {
    padding: "12px 16px",
    fontSize: "14px",
  },
  "& .dx-textarea .dx-texteditor-input": {
    padding: "12px 16px",
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontWeight: 600,
  fontSize: "12px",
  height: "28px",
  backgroundColor: status === "new" ? "rgba(76, 175, 80, 0.15)" : "rgba(255, 152, 0, 0.15)",
  color: status === "new" ? "#2e7d32" : "#f57c00",
  border: `1px solid ${status === "new" ? "#4caf50" : "#ff9800"}`,
}));

const QuickInfoBar = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: "wrap",
}));

const InfoCard = styled(Paper)(({ color }) => ({
  padding: "16px 20px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flex: "1 1 200px",
  minWidth: "200px",
  backgroundColor: "#fff",
  border: `1px solid ${color}20`,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 8px 25px ${color}20`,
  },
}));

const InfoIconWrapper = styled(Box)(({ color }) => ({
  width: "44px",
  height: "44px",
  borderRadius: "10px",
  backgroundColor: `${color}15`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "22px",
    color: color,
  },
}));

const PedidosEditPage = (props) => {
  const { accessButton } = props;
  const intl = useIntl();
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadosDelProducto, setEstadosDelProducto] = useState([]);

  async function cargarCombos() {
    const estadoSimple = listarEstadoSimple();
    const listarProductoCategoria = await listar();
    setEstadoSimple(estadoSimple);
    setEstadosDelProducto(listarProductoCategoria);
  }

  function grabar(e) {
    const result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarProducto(props.dataRowEditNew);
      } else {
        props.actualizarProducto(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  const isNewRecord = props.dataRowEditNew?.esNuevoRegistro;

  return (
    <PageContainer>
      {/* Header Section */}
      <HeaderCard elevation={0}>
        <HeaderLeft>
          <HeaderIconWrapper>
            {isNewRecord ? <AddBusinessIcon /> : <EditNoteIcon />}
          </HeaderIconWrapper>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              {props.titulo}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <StatusChip
                label={isNewRecord ? "Nuevo Registro" : "Editando"}
                status={isNewRecord ? "new" : "edit"}
                size="small"
              />
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Gestión de inventario
              </Typography>
            </Box>
          </Box>
        </HeaderLeft>

        <HeaderActions>
          {accessButton?.crear && (
            <ActionButton
              icon="save"
              text="Guardar"
              type="success"
              stylingMode="contained"
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              variant="save"
            />
          )}
          <ActionButton
            icon="close"
            text="Cancelar"
            type="normal"
            stylingMode="outlined"
            onClick={props.cancelarEdicion}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          />
        </HeaderActions>
      </HeaderCard>

      {/* Quick Info Bar */}
      <QuickInfoBar>
        <InfoCard color="#667eea">
          <InfoIconWrapper color="#667eea">
            <InventoryIcon />
          </InfoIconWrapper>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Tipo
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#667eea">
              Producto
            </Typography>
          </Box>
        </InfoCard>

        <InfoCard color="#4caf50">
          <InfoIconWrapper color="#4caf50">
            <WarehouseIcon />
          </InfoIconWrapper>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Almacén
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#4caf50">
              Principal
            </Typography>
          </Box>
        </InfoCard>

        <InfoCard color="#ff9800">
          <InfoIconWrapper color="#ff9800">
            <LocalOfferIcon />
          </InfoIconWrapper>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Estado
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#ff9800">
              {isNewRecord ? "Por crear" : "Activo"}
            </Typography>
          </Box>
        </InfoCard>
      </QuickInfoBar>

      {/* Main Form */}
      <Form
        formData={props.dataRowEditNew}
        id="editForm"
        validationGroup="FormEdicion"
        labelMode="floating"
        showColonAfterLabel={false}
      >
        {/* Basic Information Section */}
        <GroupItem colCount={1}>
          <Item
            itemType="group"
            render={() => (
              <FormCard elevation={0}>
                <SectionHeader>
                  <SectionIcon color="#667eea">
                    <DescriptionIcon />
                  </SectionIcon>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="#1a2038">
                      Información Básica
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Datos principales del producto
                    </Typography>
                  </Box>
                </SectionHeader>
                <SectionContent>
                  <Form
                    formData={props.dataRowEditNew}
                    labelMode="floating"
                    showColonAfterLabel={false}
                    validationGroup="FormEdicion"
                  >
                    <GroupItem colCount={2} colSpan={2}>
                      <Item
                        dataField="nombre"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.NOMBRE" }) }}
                        isRequired={true}
                        editorOptions={{
                          placeholder: "Ingrese el nombre del producto",
                          stylingMode: "outlined",
                        }}
                      />
                      <Item
                        dataField="id_producto_categoria"
                        editorType="dxSelectBox"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.CATEGORIA" }) }}
                        editorOptions={{
                          items: estadosDelProducto,
                          valueExpr: "id_producto_categoria",
                          displayExpr: "nombre",
                          showClearButton: true,
                          placeholder: "Seleccione categoría",
                          stylingMode: "outlined",
                          searchEnabled: true,
                        }}
                      />
                    </GroupItem>
                    <GroupItem colCount={1}>
                      <Item
                        dataField="descripcion"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.DESCRIPCION" }) }}
                        isRequired={true}
                        editorType="dxTextArea"
                        editorOptions={{
                          maxLength: 500,
                          height: 100,
                          placeholder: "Describa el producto detalladamente...",
                          stylingMode: "outlined",
                        }}
                      />
                    </GroupItem>
                  </Form>
                </SectionContent>
              </FormCard>
            )}
          />
        </GroupItem>

        {/* Pricing and Stock Section */}
        <GroupItem colCount={1}>
          <Item
            itemType="group"
            render={() => (
              <FormCard elevation={0}>
                <SectionHeader>
                  <SectionIcon color="#4caf50">
                    <AttachMoneyIcon />
                  </SectionIcon>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="#1a2038">
                      Precio e Inventario
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configuración de precios y stock
                    </Typography>
                  </Box>
                </SectionHeader>
                <SectionContent>
                  <Form
                    formData={props.dataRowEditNew}
                    labelMode="floating"
                    showColonAfterLabel={false}
                    validationGroup="FormEdicion"
                  >
                    <GroupItem colCount={3} colSpan={3}>
                      <Item
                        dataField="precio"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.PRECIO" }) }}
                        editorType="dxNumberBox"
                        editorOptions={{
                          format: "S/. #,##0.00",
                          placeholder: "0.00",
                          stylingMode: "outlined",
                          min: 0,
                          showSpinButtons: true,
                        }}
                      />
                      <Item
                        dataField="stock"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.STOCK" }) }}
                        editorType="dxNumberBox"
                        editorOptions={{
                          placeholder: "0",
                          stylingMode: "outlined",
                          min: 0,
                          showSpinButtons: true,
                          format: "#,##0",
                        }}
                      />
                      <Item
                        dataField="Activo"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRACION.PRODUCTO.FORM.ACTIVO" }) }}
                        editorType="dxSelectBox"
                        editorOptions={{
                          items: estadoSimple,
                          valueExpr: "Valor",
                          displayExpr: "Descripcion",
                          placeholder: "Seleccione estado",
                          stylingMode: "outlined",
                        }}
                      />
                    </GroupItem>
                  </Form>
                </SectionContent>
              </FormCard>
            )}
          />
        </GroupItem>
      </Form>
    </PageContainer>
  );
};

export default PedidosEditPage;
