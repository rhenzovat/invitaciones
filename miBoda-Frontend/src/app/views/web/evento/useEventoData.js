import { useState, useEffect, useCallback } from "react";
import { obtener, actualizar } from "../../../api/web_evento.api";
import { handleErrorMessages, handleSuccessMessages } from "../../../components/notify-messages";

/**
 * Carga la fila única de web_evento y expone un guardado PARCIAL: cada
 * submódulo manda solo los campos que le pertenecen, así varias personas
 * pueden editar secciones distintas al mismo tiempo sin pisarse los cambios.
 */
export default function useEventoData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setData(await obtener()); }
    catch (e) { handleErrorMessages("Error", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarCampos = async (campos) => {
    setSaving(true);
    try {
      const res = await actualizar(campos);
      setData((prev) => ({ ...prev, ...res.result }));
      handleSuccessMessages("Guardado", "Los cambios se guardaron correctamente.");
      return true;
    } catch (e) {
      handleErrorMessages("Error", e);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { data, setData, loading, saving, guardarCampos, recargar: cargar };
}
