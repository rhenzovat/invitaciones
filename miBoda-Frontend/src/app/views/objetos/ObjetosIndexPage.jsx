import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DataGrid, { Column, Pager, Paging, SearchPanel, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button as ButtonDev } from "devextreme-react";
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import { PortletHeader, PortletHeaderToolbar } from "../../partials/content/Portlet";
import { listar, crear, actualizar, eliminar } from "../../api/objetos.api";
import { handleErrorMessages, toastSuccess } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import { isNotEmpty } from "../../utils/utils";

const ContentBox = styled("div")(({ theme }) => ({
  margin: "2rem",
  [theme.breakpoints.down("sm")]: { margin: "1rem" },
}));

function ObjetosIndexPageInner(props) {
  const { setLoading, useAuth } = props;
  const intl = useIntl();
  const [lista, setLista] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "" });
  const [editingId, setEditingId] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  async function loadList() {
    setLoading?.(true);
    try {
      const data = await listar();
      setLista(Array.isArray(data) ? data : []);
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading?.(false);
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  const openNew = () => {
    setFormData({ nombre: "" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setFormData({ nombre: row.nombre ?? "" });
    setEditingId(row.id_objetos);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!isNotEmpty(formData.nombre)) return;
    setLoading(true);
    try {
      if (editingId) {
        await actualizar({ id_objetos: editingId, ...formData });
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      } else {
        await crear(formData);
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      }
      setDialogOpen(false);
      loadList();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    setLoading(true);
    try {
      await eliminar({ id_objetos: confirmEliminar.id_objetos });
      toastSuccess("Registro eliminado");
      setConfirmEliminar(null);
      loadList();
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentBox>
      <PortletHeader
          title="Objetos (botones, vistas, acciones)"
          toolbar={
            <PortletHeaderToolbar>
              <ButtonDev icon="add" type="default" text="Nuevo" onClick={openNew} />
            </PortletHeaderToolbar>
          }
        />
        <DataGrid
          keyExpr="id_objetos"
          dataSource={lista}
          showBorders
          columnAutoWidth
          rowAlternationEnabled
          onRowDblClick={(e) => openEdit(e.data)}
        >
          <Paging defaultPageSize={15} />
          <Pager showPageSizeSelector showInfo />
          <SearchPanel visible highlightCaseSensitive placeholder="Buscar..."/>
          <Column dataField="id_objetos" caption="Código" width={90} alignment="center" />
          <Column dataField="nombre" caption="Nombre" />
          <Column type="buttons" width={110} fixedPosition="right"  caption={'Acciones'}>
            <ColumnButton icon="edit" hint="Editar" onClick={(e) => openEdit(e.row.data)} />
            <ColumnButton icon="trash" hint="Eliminar" onClick={(e) => setConfirmEliminar(e.row.data)} />
          </Column>
        </DataGrid>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {editingId ? "Editar objeto" : "Nuevo objeto"}
            <IconButton
              aria-label="cerrar"
              onClick={() => setDialogOpen(false)}
              sx={(theme) => ({ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] })}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Nombre</label>
              <input
                type="text"
                value={formData.nombre ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
                style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <ButtonDev text="Guardar" type="default" onClick={handleSave} />
              <ButtonDev text="Cancelar" onClick={() => setDialogOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>

      <Confirm
        open={!!confirmEliminar}
        title="Eliminar"
        text="¿Eliminar este objeto?"
        onConfirm={handleEliminar}
        onCancel={() => setConfirmEliminar(null)}
      />
    </ContentBox>
  );
}

export default injectIntl(WithLoandingPanel(ObjetosIndexPageInner));
