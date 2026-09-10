import {
  Modal, Row, Col, Typography, Divider, Spin, Alert, Button, Space,
} from 'antd';
import PersonIcon from '@mui/icons-material/Person';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Stack, FormHelperText,
} from '@mui/material';

import ProyectoNombreSelector from './ProyectoNombreSelectorFields';

const { Title, Text } = Typography;

/**
 * Modal antd: cliente (izquierda) + último proyecto principal (derecha).
 */
export default function ClienteProyectoEditModal({
  open,
  onClose,
  saving,
  loadingProject,
  clienteNombre,
  tieneProyecto,
  nombreProyecto,
  formCliente,
  setFormCliente,
  formProyecto,
  setFormProyecto,
  modoNombreEdit,
  setModoNombreEdit,
  tiposCatalogo,
  loadingTipos,
  tipoProyectoEditSel,
  onTipoEditChange,
  estadosCliente,
  estadosProyecto,
  progresoOpciones,
  ordenPrioridadOpciones,
  nombreProyectoValido,
  onSave,
}) {
  const puedeGuardar = Boolean(formCliente.nombre?.trim())
    && (!tieneProyecto || (
      nombreProyectoValido
      && formProyecto.fecha_inicio
      && formProyecto.fecha_entrega
    ));

  return (
    <Modal
      title={(
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 16 }}>Editar cliente y proyecto</Text>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {clienteNombre || 'Cliente'}
            {tieneProyecto && nombreProyecto ? ` · ${nombreProyecto}` : ''}
          </Text>
        </Space>
      )}
      open={open}
      onCancel={onClose}
      width={Math.min(1040, typeof window !== 'undefined' ? window.innerWidth - 32 : 1040)}
      centered
      destroyOnHidden
      maskClosable={!saving}
      footer={(
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="primary"
            icon={<SaveIcon sx={{ fontSize: 16 }} />}
            loading={saving}
            disabled={!puedeGuardar || loadingProject}
            onClick={onSave}
          >
            Guardar todo
          </Button>
        </div>
      )}
      styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingTop: 8 } }}
    >
      <Row gutter={[20, 16]}>
        {/* ── Cliente ── */}
        <Col xs={24} lg={12}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <PersonIcon sx={{ color: '#1976d2', fontSize: 18 }} />
            <Title level={5} style={{ margin: 0 }}>Datos del cliente</Title>
          </Space>
          <Divider style={{ margin: '0 0 12px' }} />
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <TextField label="Nombre *" size="small" fullWidth value={formCliente.nombre}
                onChange={(e) => setFormCliente((f) => ({ ...f, nombre: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Apellido" size="small" fullWidth value={formCliente.apellido}
                onChange={(e) => setFormCliente((f) => ({ ...f, apellido: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Empresa / Razón social" size="small" fullWidth value={formCliente.empresa}
                onChange={(e) => setFormCliente((f) => ({ ...f, empresa: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="RUC" size="small" fullWidth value={formCliente.ruc}
                onChange={(e) => setFormCliente((f) => ({ ...f, ruc: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="DNI" size="small" fullWidth value={formCliente.dni}
                onChange={(e) => setFormCliente((f) => ({ ...f, dni: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Teléfono" size="small" fullWidth value={formCliente.telefono}
                onChange={(e) => setFormCliente((f) => ({ ...f, telefono: e.target.value }))} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="WhatsApp" size="small" fullWidth value={formCliente.whatsapp}
                onChange={(e) => setFormCliente((f) => ({ ...f, whatsapp: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Correo (opcional)" size="small" fullWidth type="email" value={formCliente.email}
                onChange={(e) => setFormCliente((f) => ({ ...f, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <InputLabel>Estado operativo</InputLabel>
                <Select
                  label="Estado operativo"
                  value={formCliente.id_notificacion_estado ?? ''}
                  onChange={(e) => setFormCliente((f) => ({ ...f, id_notificacion_estado: e.target.value || null }))}
                >
                  <MenuItem value=""><em>— Sin asignar —</em></MenuItem>
                  {estadosCliente.map((e) => (
                    <MenuItem key={e.id_estado} value={e.id_estado}>{e.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notas" size="small" fullWidth multiline rows={2} value={formCliente.notas}
                onChange={(e) => setFormCliente((f) => ({ ...f, notas: e.target.value }))} />
            </Grid>
          </Grid>
        </Col>

        {/* ── Proyecto ── */}
        <Col xs={24} lg={12}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <FolderOpenIcon sx={{ color: '#7b1fa2', fontSize: 18 }} />
            <Title level={5} style={{ margin: 0 }}>Proyecto principal</Title>
          </Space>
          <Divider style={{ margin: '0 0 12px' }} />
          {!tieneProyecto ? (
            <Alert
              type="info"
              showIcon
              message="Sin proyectos"
              description="Este cliente no tiene proyectos. Use el botón + en la tabla para crear uno."
            />
          ) : loadingProject ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Spin />
              <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>Cargando proyecto…</div>
            </div>
          ) : (
            <Stack spacing={1.5}>
              <Alert
                type="warning"
                showIcon
                message="Proyecto con mayor prioridad"
                description="Se edita el proyecto principal (orden de prioridad más alto). Para otros proyectos, use el lápiz en la fila expandida."
                style={{ marginBottom: 4 }}
              />
              <ProyectoNombreSelector
                modo={modoNombreEdit}
                onModoChange={setModoNombreEdit}
                tipos={tiposCatalogo}
                loadingTipos={loadingTipos}
                tipoSel={tipoProyectoEditSel}
                onTipoChange={onTipoEditChange}
                nombrePersonalizado={formProyecto.nombre}
                onNombrePersonalizadoChange={(v) => setFormProyecto((f) => ({ ...f, nombre: v }))}
              />
              <TextField label="Descripción" size="small" fullWidth multiline rows={2}
                value={formProyecto.descripcion}
                onChange={(e) => setFormProyecto((f) => ({ ...f, descripcion: e.target.value }))} />
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField label="Fecha inicio *" type="date" size="small" fullWidth required
                    InputLabelProps={{ shrink: true }}
                    value={formProyecto.fecha_inicio}
                    onChange={(e) => setFormProyecto((f) => ({ ...f, fecha_inicio: e.target.value }))} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Fecha entrega *" type="date" size="small" fullWidth required
                    InputLabelProps={{ shrink: true }}
                    value={formProyecto.fecha_entrega}
                    inputProps={{ min: formProyecto.fecha_inicio || undefined }}
                    onChange={(e) => setFormProyecto((f) => ({ ...f, fecha_entrega: e.target.value }))} />
                </Grid>
              </Grid>
              <FormControl size="small" fullWidth>
                <InputLabel id="combo-progreso-label">Progreso (%)</InputLabel>
                <Select
                  labelId="combo-progreso-label"
                  label="Progreso (%)"
                  value={formProyecto.progreso}
                  onChange={(e) => setFormProyecto((f) => ({ ...f, progreso: e.target.value }))}
                >
                  {progresoOpciones.map((pct) => (
                    <MenuItem key={pct} value={pct}>{pct}%</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Estado operativo</InputLabel>
                <Select
                  label="Estado operativo"
                  value={formProyecto.id_notificacion_estado ?? ''}
                  onChange={(e) => setFormProyecto((f) => ({ ...f, id_notificacion_estado: e.target.value || null }))}
                >
                  <MenuItem value=""><em>— Sin asignar —</em></MenuItem>
                  {estadosProyecto.map((e) => (
                    <MenuItem key={e.id_estado} value={e.id_estado}>{e.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="combo-orden-label">Orden de prioridad</InputLabel>
                <Select
                  labelId="combo-orden-label"
                  label="Orden de prioridad"
                  value={formProyecto.orden_prioridad ?? 5}
                  onChange={(e) => setFormProyecto((f) => ({ ...f, orden_prioridad: e.target.value }))}
                >
                  {ordenPrioridadOpciones.map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}{n === 1 ? ' — máxima prioridad' : ''}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>1 = máxima prioridad. Orden 1 en rojo: recordatorio cada 10 min.</FormHelperText>
              </FormControl>
            </Stack>
          )}
        </Col>
      </Row>
    </Modal>
  );
}
