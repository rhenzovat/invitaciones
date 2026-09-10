import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import useAuth from 'app/hooks/useAuth';
import useTabs from 'app/contexts/TabsContext';
import { resolverModuloRuta, desactivarModuloRol } from 'app/api/menu.api';
import { refreshAppSidebarMenu } from 'app/utils/refreshAppSidebarMenu';
import { handleErrorMessages, toastSuccess } from 'app/components/notify-messages';
import Confirm from 'app/components/Confirm';

const SKIP_PATHS = new Set(['/', '/dashboard/default', '/profile/index']);

/**
 * Botón en la barra de pestañas: desactiva el módulo de la ruta actual para el rol de sesión.
 */
export default function MenuModuloDeactivateButton({ path }) {
  const { perfil } = useAuth();
  const { closeAllTabs, setActiveTab } = useTabs();
  const idRoles = perfil?.id_roles != null ? Number(perfil.id_roles) : null;

  const [ctx, setCtx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const normalizedPath = (path || '').replace(/\/$/, '') || '/';

  const loadContext = useCallback(async () => {
    if (!idRoles || SKIP_PATHS.has(normalizedPath)) {
      setCtx(null);
      return;
    }
    try {
      const res = await resolverModuloRuta(normalizedPath, idRoles);
      setCtx(res || null);
    } catch {
      setCtx(null);
    }
  }, [normalizedPath, idRoles]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  if (!ctx || !ctx.puede_desactivar || ctx.oculto_para_rol) {
    return null;
  }

  if (ctx.tipo === 'menu' && ctx.id_menu) {
    const esSubmodulo = Boolean(ctx.id_modulo);
    return (
      <>
        <Tooltip
          title={
            esSubmodulo
              ? 'Ocultar este submódulo y sus hijos para su rol (el módulo padre sigue activo)'
              : 'Desactivar este menú para su rol'
          }
        >
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            disabled={loading}
            onClick={() => setConfirmOpen(true)}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              py: 0.35,
              whiteSpace: 'nowrap',
              borderColor: 'rgba(239,68,68,0.5)',
            }}
          >
            {esSubmodulo ? 'Desactivar submódulo' : 'Desactivar menú'}
          </Button>
        </Tooltip>
        <Confirm
          open={confirmOpen}
          title={esSubmodulo ? 'Desactivar submódulo' : 'Desactivar menú'}
          text={
            esSubmodulo
              ? `¿Ocultar «${ctx.nombre}» y sus submenús para su rol? El módulo padre y los demás submódulos no se verán afectados.`
              : `¿Desactivar «${ctx.nombre}» para su rol? Dejará de verse en el menú lateral.`
          }
          onCancel={() => setConfirmOpen(false)}
          onConfirm={async () => {
            setLoading(true);
            try {
              await desactivarModuloRol({ id_menu: ctx.id_menu, id_roles: idRoles });
              toastSuccess(esSubmodulo ? 'Submódulo oculto para su rol' : 'Menú desactivado');
              await refreshAppSidebarMenu();
              setConfirmOpen(false);
              closeAllTabs();
              setActiveTab('/dashboard/default');
            } catch (err) {
              handleErrorMessages('Error', err);
            } finally {
              setLoading(false);
            }
          }}
        />
      </>
    );
  }

  if (ctx.tipo !== 'modulo' || !ctx.id_modulo) {
    return null;
  }

  return (
    <>
      <Tooltip title={`Desactivar módulo «${ctx.nombre}» para su rol`}>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteOutlineIcon fontSize="small" />}
          disabled={loading || !ctx.activo_global}
          onClick={() => setConfirmOpen(true)}
          sx={{
            textTransform: 'none',
            fontSize: '0.72rem',
            py: 0.35,
            whiteSpace: 'nowrap',
            borderColor: 'rgba(239,68,68,0.5)',
          }}
        >
          Desactivar módulo
        </Button>
      </Tooltip>
      <Confirm
        open={confirmOpen}
        title="Desactivar módulo"
        text={`¿Ocultar el módulo «${ctx.nombre}» y todos sus submenús para su rol? Solo afecta a su rol, no a otros usuarios.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setLoading(true);
          try {
            await desactivarModuloRol({ id_modulo: ctx.id_modulo, id_roles: idRoles });
            toastSuccess(`Módulo «${ctx.nombre}» desactivado`);
            await refreshAppSidebarMenu();
            setConfirmOpen(false);
            closeAllTabs();
            setActiveTab('/dashboard/default');
          } catch (err) {
            handleErrorMessages('Error', err);
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
}
