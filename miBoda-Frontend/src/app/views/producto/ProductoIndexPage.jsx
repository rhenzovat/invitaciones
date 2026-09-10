import React, { useEffect, useState, } from "react";
import { useSidebarModuleReset } from "../../hooks/useSidebarModuleReset";
import { useIntl, injectIntl } from "react-intl";
import {
  obtener,
  listar,
  listar_filtro,

  crear,
  actualizar,
  eliminar,
  actualizar_subproducto,
  verificarCodigo,

  crear_imagen,
  crear_fotos,
  listar_imagen,
  listar_fotos,
  eliminar_imagen,
  eliminar_fotos,

  actualizar_imagen_orden,
  actualizar_foto_orden,
  obtener_imagen,

  actualizar_imagen_principal,

} from "../../api/producto.api";

import { listar as listarCategoria, listar_tipo as listarTipo } from "../../api/producto_categoria.api";
import { listar_obtener as listarCategoriaSub, } from "../../api/producto_categoria_sub.api";

import ProductoListPage from "./ProductoListPage";
import ProductoEditPage from "./ProductoEditPage";
import ProductoImgEditPage from "./ProductoImgEditPage";

import { handleErrorMessages, toastSuccess, toastError, } from "../../components/notify-messages";
import Confirm from "../../components/Confirm";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { isNotEmpty, listarEstadoSimple, } from "../../utils/utils";
//1. Permisos
import { WithLoandingPanel } from "../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../utils/useAccesosObjetos";
import AddImageIndexPage from "../../components/Modales/modal_add_image/AddImageIndexPage";
import ModalFichaTecnicaIndexPage from "../../components/Modales/modal_ficha_tecnica/ModalFichaTecnicaIndexPage";
import ModalDocumentIndexPage from "../../components/Modales/modal_imagen/ModalDocumentIndexPage";
import DeliveryConfigModal from "./DeliveryConfigModal";

/** FormData serializa `undefined` como el string "undefined" y rompe columnas DECIMAL en MySQL. */
const fd = (v) => (v === undefined || v === null ? "" : v);

const ProductoIndexPage = props => {
  //1. Permisos.
  const { accessButton } = UseAccesosObjetos();
  const [listarProductoFiltro, setListarProductoFiltro] = useState(0);

  const { setLoading } = props;
  const intl = useIntl();
  const [titulo, setTitulo] = useState("Lista de Productos");
  const [listarProductos, setListarProductos] = useState([]);

  const [modoList, setModoList] = useState(false);
  const [modoEdit, setModoEdit] = useState(false);
  const [modoAddImagen, setModoAddImagen] = useState(false);
  const [listarDatos, setListarDatos] = useState([]);
  const [listarFotos, setListarFotos] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listaCategoria, setListaCategoria] = useState([]);
  const [listaCategoriaSub, setListaCategoriaSub] = useState([]);
  const [listaTipo, setListaTipo] = useState([]);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [dataRowEditNewImg, setDataRowEditNewImg] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selected, setSelected] = useState({});
  const [visibleModalFichaTecnica, setVisibleModalFichaTecnica] = useState(false);
  const [idProducto, setIdProducto] = useState(null);
  const [imagenProfile, setImagenProfile] = useState(null);
  const [visibleModalImagenProducto, setVisibleModalImagenProducto] = useState(false);
  const [imagenProducto, setImagenProducto] = useState(null);
  const [modalSubimagenesOpen, setModalSubimagenesOpen] = useState(false);
  const [modalSubimagenesTexto, setModalSubimagenesTexto] = useState("");
  const [deliveryConfigOpen, setDeliveryConfigOpen] = useState(false);
  const [codigosError, setCodigosError] = useState({ codigo_producto_new: null, codigo_barra: null });

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let listarProductoCategoria = await listarCategoria();
    setListaCategoria(listarProductoCategoria);

    let listarProductoTipo = await listarTipo();
    setListaTipo(listarProductoTipo);

  }

  async function onVerificarCodigo(campo, valor, idProducto) {
    if (!valor || valor === '') {
      setCodigosError(prev => ({ ...prev, [campo]: null }));
      return;
    }
    try {
      const res = await verificarCodigo({ campo, valor, id_producto: idProducto || '' });
      const mensajes = {
        codigo_producto_new: `El código de producto «${valor}» ya está en uso.`,
        codigo_barra:        `El código de barra «${valor}» ya está en uso.`,
      };
      setCodigosError(prev => ({
        ...prev,
        [campo]: res.duplicado ? (mensajes[campo] ?? `«${valor}» ya está en uso.`) : null,
      }));
    } catch (_) {}
  }

  //============= 1. OPERACIONES CON PRODUCTOS ============
  const nuevoRegistro = () => {
    setCodigosError({ codigo_producto_new: null, codigo_barra: null });
    let dataState = { Activo: "S" };
    setDataRowEditNew({ ...dataState, esNuevoRegistro: true });
    setTitulo("Nuevo");
    openComponet(false, true, false);
  };


  const editarRegistro = dataRow => {
    const { id_producto } = dataRow;
    setCodigosError({ codigo_producto_new: null, codigo_barra: null });
    let filtro = { id: id_producto };
    openComponet(false, true, false);
    setTitulo("Editar");
    obtenerRegistro(filtro);

    setIdProducto(id_producto)// ID del producto
    listarFotosProductos(id_producto);//Lista sus imagenes sin descripcion

  };

  const editarRegistroImgList = async (dataRow) => {
    const { id_producto } = dataRow;
    openComponet(false, false, true);

    //ADD=========================================
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let dataState = { esNuevoRegistro: true, Activo: "S" };
    setDataRowEditNewImg({ ...dataState });

    setIdProducto(id_producto)
    listarRegistrosImagenes(id_producto);
    //===========================================
  };

  const cancelarEdicion = () => {
    openComponet(true, false, false);
    setTitulo("Listar");
    setDataRowEditNew({});
  };

  async function agregarProducto(usuarios) {
    if (codigosError.codigo_producto_new || codigosError.codigo_barra) {
      toastError(codigosError.codigo_producto_new || codigosError.codigo_barra);
      return;
    }
    setLoading(true);
    const {
      id_producto, nombre, descripcion
      , precio, stock, id_producto_categoria
      , id_producto_categoria_sub, id_producto_tipo
      , pro_imagen
      , Activo

      , precio_old
      , precio_yape
      , peso_kilogramo
      , numero_estrellas
      , corte_tiempo_promocion
      , corte_tiempo_sabado

      , paquete_medidas
      // , paquete_dimencion
      , meta_titulo_producto
      , meta_descripcion_producto
      , codigo_producto_new
      , codigo_barra
      , ratings_enabled
      , admin_rating
      , precio_mayorista
      , precio_mayorista_old
      , oferta_maxima_cantidad
      , oferta_maxima_cantidad_por_precio

    } = usuarios;
    const formData = new FormData();

    formData.append("id_producto", fd(id_producto));
    formData.append("nombre", fd(nombre));
    formData.append("descripcion", fd(descripcion));
    formData.append("precio", fd(precio));
    formData.append("precio_yape", fd(precio_yape));
    formData.append("precio_mayorista", fd(precio_mayorista));
    formData.append("precio_mayorista_old", fd(precio_mayorista_old));

    formData.append("stock", fd(stock));
    formData.append("id_producto_categoria", fd(id_producto_categoria));
    formData.append("id_producto_categoria_sub", fd(id_producto_categoria_sub));
    formData.append("id_producto_tipo", fd(id_producto_tipo));
    formData.append("pro_imagen", pro_imagen);
    formData.append("Activo", fd(Activo));

    formData.append("precio_old", fd(precio_old));
    formData.append("peso_kilogramo", fd(peso_kilogramo));
    formData.append("corte_tiempo_promocion", fd(corte_tiempo_promocion));
    formData.append("corte_tiempo_sabado", fd(corte_tiempo_sabado));

    formData.append("numero_estrellas", fd(numero_estrellas));

    formData.append("paquete_medidas", fd(paquete_medidas));
    // formData.append("paquete_dimencion", paquete_dimencion);
    formData.append("meta_titulo_producto", fd(meta_titulo_producto));
    formData.append("meta_descripcion_producto", fd(meta_descripcion_producto));
    formData.append("codigo_producto_new", fd(codigo_producto_new));
    formData.append("codigo_barra", fd(codigo_barra));
    formData.append("ratings_enabled", fd(ratings_enabled));
    formData.append("admin_rating", fd(admin_rating));
    formData.append("oferta_maxima_cantidad", fd(oferta_maxima_cantidad));
    formData.append("oferta_maxima_cantidad_por_precio", fd(oferta_maxima_cantidad_por_precio));

    await crear(formData).then(response => {
      if (response.success) {
        toastSuccess(response.result.message);
      } else {
        toastError(response.result.message);
      }
      listarRegistros(listarProductoFiltro);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function actualizarProducto(dataRows) {
    if (codigosError.codigo_producto_new || codigosError.codigo_barra) {
      toastError(codigosError.codigo_producto_new || codigosError.codigo_barra);
      return;
    }
    setLoading(true);
    const { id_producto, nombre, descripcion
      , precio, stock, id_producto_categoria
      , id_producto_categoria_sub, id_producto_tipo
      , pro_imagen
      , Activo

      , precio_old
      , precio_yape

      , peso_kilogramo
      , numero_estrellas
      , corte_tiempo_promocion
      , corte_tiempo_sabado

      , paquete_medidas
      // , paquete_dimencion
      , meta_titulo_producto
      , meta_descripcion_producto
      , codigo_producto_new
      , codigo_barra
      , ratings_enabled
      , admin_rating
      , precio_mayorista
      , precio_mayorista_old
      , oferta_maxima_cantidad
      , oferta_maxima_cantidad_por_precio
    } = dataRows;


    const formData = new FormData();

    formData.append("id_producto", fd(id_producto));
    formData.append("nombre", fd(nombre));
    formData.append("descripcion", fd(descripcion));
    formData.append("precio", fd(precio));
    formData.append("precio_yape", fd(precio_yape));
    formData.append("precio_mayorista", fd(precio_mayorista));
    formData.append("precio_mayorista_old", fd(precio_mayorista_old));

    formData.append("stock", fd(stock));
    formData.append("id_producto_categoria", fd(id_producto_categoria));
    formData.append("id_producto_categoria_sub", fd(id_producto_categoria_sub));

    formData.append("id_producto_tipo", fd(id_producto_tipo));
    formData.append("pro_imagen", pro_imagen);
    formData.append("Activo", fd(Activo));

    formData.append("precio_old", fd(precio_old));
    formData.append("peso_kilogramo", fd(peso_kilogramo));
    formData.append("corte_tiempo_promocion", fd(corte_tiempo_promocion));
    formData.append("corte_tiempo_sabado", fd(corte_tiempo_sabado));

    formData.append("numero_estrellas", fd(numero_estrellas));

    formData.append("paquete_medidas", fd(paquete_medidas));
    // formData.append("paquete_dimencion", paquete_dimencion);
    formData.append("meta_titulo_producto", fd(meta_titulo_producto));
    formData.append("meta_descripcion_producto", fd(meta_descripcion_producto));
    formData.append("codigo_producto_new", fd(codigo_producto_new));
    formData.append("codigo_barra", fd(codigo_barra));
    formData.append("ratings_enabled", fd(ratings_enabled));
    formData.append("admin_rating", fd(admin_rating));
    formData.append("oferta_maxima_cantidad", fd(oferta_maxima_cantidad));
    formData.append("oferta_maxima_cantidad_por_precio", fd(oferta_maxima_cantidad_por_precio));

    await actualizar(formData).then(response => {
      if (response.success) {
        toastSuccess(response.result.message);
      } else {
        toastError(response.result.message);
      }
      listarRegistros(listarProductoFiltro);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });


  }


  async function listarRegistros(listarProductoFiltro) {
    openComponet(true, false, false);
    setLoading(true);
    setTitulo("Lista de Productos");
    await listar_filtro({ id_producto_tipo: listarProductoFiltro }).then(response => {
      setListarProductos(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  async function obtenerRegistro(filtro) {
    const { id: data } = filtro;
    if (data) {
      let usuarios = await obtener({ id: data });
      setDataRowEditNew({ ...usuarios[0], esNuevoRegistro: false });
    }
  }

  //============= 2. OPERACIONES CON IMAGENES ============
  const editarRegistroImagen = dataRow => {
    obtenerRegistroImg(dataRow);
  };

  const listarRegistrosImagenes = async (idProducto) => {
    setLoading(true);
    setTitulo("Productos Relacionados al original");
    await listar_imagen({ id_producto: idProducto }).then(response => {
      setListarDatos(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  };

  const limpiarImagen = () => {
    setDataRowEditNewImg({});
    let dataState = { esNuevoRegistro: true, Activo: "S" };
    setDataRowEditNewImg({ ...dataState });
    setImagenProfile(null)
  };

  async function actualizarImagen(dataRows) {
    // console.log('%c [test]-129', 'font-size:13px; background:pink; color:#bf2c9f;', dataRows)
    setLoading(true);
    const { id_producto_imagen, titulo, precio, stock, Activo, descripcion, url_imagen, precio_old, numero_estrellas, precio_yape } = dataRows;
    const formData = new FormData();
    formData.append("id_producto_imagen", id_producto_imagen);
    formData.append("titulo", titulo);
    formData.append("precio", precio);
    formData.append("stock", stock);
    formData.append("Activo", Activo);
    formData.append("descripcion", descripcion);
    formData.append("pro_imagen", url_imagen);
    formData.append("precio_old", precio_old);
    formData.append("precio_yape", precio_yape);

    formData.append("numero_estrellas", numero_estrellas ?? 0);

    await actualizar_subproducto(formData).then(response => {
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.ACTUALIZADO" }));
      listarRegistrosImagenes(idProducto)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function agregarImagen(dataRows) {
    setLoading(true);
    const formData = new FormData();
    formData.append("id_producto", idProducto);
    formData.append("image", dataRows.url_imagen);
    formData.append("Activo", dataRows.Activo);

    formData.append("precio_old", dataRows.precio_old);
    formData.append("precio_yape", dataRows.precio_yape);

    formData.append("stock", dataRows.stock);

    formData.append("titulo", dataRows.titulo);
    formData.append("precio", dataRows.precio);
    formData.append("descripcion", dataRows.descripcion);

    await crear_imagen(formData).then(response => {
      if (response)
        toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      listarRegistrosImagenes(idProducto)
      limpiarImagen();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarImagenOrden(dataRow) {
    const soloIdYOrden = dataRow.map(item => ({
      id_producto_imagen: item.id_producto_imagen,
      orden: item.orden
    }));
    await actualizar_imagen_orden({ items: soloIdYOrden });
  }

  async function obtenerRegistroImg(dataRow) {
    setLoading(true);
    const { id_producto_imagen } = dataRow;
    if (id_producto_imagen) {
      await obtener_imagen({ id: id_producto_imagen }).then((response) => {
        setDataRowEditNewImg({ ...response[0], esNuevoRegistro: false });
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }).finally(() => { setLoading(false); });
    }
  }

  async function eliminarRegistro(usuario, confirm) {
    setSelected(usuario);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_producto } = usuario;
      await eliminar({ id: id_producto }).then(() => {
        toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
        listarRegistros();
      }).catch(err => {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 409 && data?.code === "TIENE_SUBIMAGENES") {
          setModalSubimagenesTexto(
            data.message ||
              "Elimine primero todas las fotos de la galería y las subimágenes del producto antes de borrar el registro principal."
          );
          setModalSubimagenesOpen(true);
          return;
        }
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }).finally(() => { setLoading(false); });
    }
  }

  async function eliminarRegistroImagen(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisible(!confirm);
    if (confirm) {
      setLoading(true);
      const { id_producto_imagen } = dataRow;
      await eliminar_imagen({ id_producto_imagen: id_producto_imagen }).then(() => {
        toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
        listarRegistrosImagenes(idProducto)
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }).finally(() => { setLoading(false); });
    }
  }

  async function eliminarListRowTab(selected, confirm) {
    if (modoAddImagen)
      eliminarRegistroImagen(selected, confirm);
    else
      eliminarRegistro(selected, confirm);
  }

  const obtenerCliente = async (dataPopup) => { };

  const openComponet = async (list, edit, addImagen) => {
    if (list == true && edit == false && addImagen == false) {
      setModoList(true)
      setModoEdit(false)
      setModoAddImagen(false)
    } else if (list == false && edit == true && addImagen == false) {
      setModoList(false)
      setModoEdit(true)
      setModoAddImagen(false)
    } else if (list == false && edit == false && addImagen == true) {
      setModoList(false)
      setModoEdit(false)
      setModoAddImagen(true)
    }
  };

  const openModalFichaTecnica = dataRow => {
    const { id_producto } = dataRow;
    setIdProducto(id_producto)
    setVisibleModalFichaTecnica(true);
  };

  const funOpenModalProductoImagen = dataRow => {
    const { url_imagen, id_producto } = dataRow;
    setImagenProducto(url_imagen);
    setIdProducto(id_producto);
    setVisibleModalImagenProducto(true);
  };

  const actualizarImagenPrincipalModal = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id_producto", idProducto);
    formData.append("pro_imagen", file);
    await actualizar_imagen_principal(formData).then(response => {
      if (response.success) {
        toastSuccess(response.result.message);
        setVisibleModalImagenProducto(false);
        listarRegistros(listarProductoFiltro);
      } else {
        toastError(response.result.message);
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  };

  //======================== AGREGAR FOTO AL PRODUCTO ========================
  const listarFotosProductos = async (idProducto) => {
    setLoading(true);
    setTitulo("Lista de Fotos");
    await listar_fotos({ id_producto: idProducto }).then(response => {
      setListarFotos(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  };

  async function agregarFotoProducto(fileOrEvent) {
    const file =
      fileOrEvent instanceof File
        ? fileOrEvent
        : fileOrEvent?.target?.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("id_producto", idProducto);
    formData.append("image", file);

    await crear_fotos(formData).then(response => {
      // if (response)
      toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
      listarFotosProductos(idProducto)
      // limpiarImagen();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroFotos(dataRow) {
    setLoading(true);
    const idFoto =
      dataRow?.id_producto_foto ??
      dataRow?.ID_PRODUCTO_FOTO ??
      dataRow?.Id_Producto_Foto;
    if (idFoto === undefined || idFoto === null || idFoto === "") {
      setLoading(false);
      handleErrorMessages(
        intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }),
        new Error("No se pudo identificar la foto a eliminar. Vuelva a abrir la edición del producto.")
      );
      return;
    }
    await eliminar_fotos({ id_producto_foto: idFoto }).then(() => {
      toastSuccess(intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.MESSAGES.REMOVE.SUCESS" }));
      listarFotosProductos(idProducto)

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarOrdenFoto(dataRow) {
    const soloIdYOrden = dataRow.map(item => ({
      id_producto_foto: item.id_producto_foto,
      orden: item.orden
    }));
    await actualizar_foto_orden({ items: soloIdYOrden });
  }


  const obtenerListaSubCategoria = async (dataRow) => {
    setLoading(true);
    if (dataRow) {
      await listarCategoriaSub(dataRow).then((response) => {
        setListaCategoriaSub(response)
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
      }).finally(() => { setLoading(false); });
    }
  }


  useEffect(() => {
    cargarCombos();
    listarRegistros(listarProductoFiltro);
  }, [listarProductoFiltro]);

  useSidebarModuleReset(() => {
    listarRegistros(listarProductoFiltro);
  });

  return (
    <>
      {modoEdit && (
        <>
          <ProductoEditPage
            cancelarEdicion={cancelarEdicion}
            dataRowEditNew={dataRowEditNew}
            actualizarProducto={actualizarProducto}
            agregarProducto={agregarProducto}
            titulo={titulo}
            accessButton={accessButton}
            estadoSimple={estadoSimple}
            listaCategoria={listaCategoria}
            listaCategoriaSub={listaCategoriaSub}
            obtenerListaSubCategoria={obtenerListaSubCategoria}

            listaTipo={listaTipo}
            //1. Lista de Fotos
            listarFotos={listarFotos}
            agregarFotoProducto={agregarFotoProducto}
            eliminarRegistroFotos={eliminarRegistroFotos}
            actualizarOrdenFoto={actualizarOrdenFoto}
            // Validación de códigos únicos
            codigosError={codigosError}
            onVerificarCodigo={onVerificarCodigo}
          />
        </>
      )}

      {modoList && (
        <>
          <ProductoListPage
            listarProductos={listarProductos}
            setListarProductoFiltro={setListarProductoFiltro}

            editarRegistro={editarRegistro}
            editarRegistroImgList={editarRegistroImgList}
            titulo={titulo}
            eliminarRegistro={eliminarRegistro}
            nuevoRegistro={nuevoRegistro}
            accessButton={accessButton}

            openModalFichaTecnica={openModalFichaTecnica}
            funOpenModalProductoImagen={funOpenModalProductoImagen}

            abrirDeliveryConfig={() => setDeliveryConfigOpen(true)}
          />
        </>
      )}

      {/* 1 LISTA DE SUB IMAGENBES */}
      {modoAddImagen && (
        <>
          <ProductoImgEditPage
            listarDatos={listarDatos}
            estadoSimple={estadoSimple}
            actualizarImagen={actualizarImagen}
            agregarImagen={agregarImagen}
            editarRegistroImagen={editarRegistroImagen}
            eliminarRegistroImagen={eliminarRegistroImagen}
            actualizarImagenOrden={actualizarImagenOrden}

            cancelarEdicion={cancelarEdicion}
            dataRowEditNew={dataRowEditNewImg}
            titulo={titulo}
            accessButton={accessButton}
            setImagenProfile={setImagenProfile}
            imagenProfile={imagenProfile}
            limpiarImagen={limpiarImagen}

          />
        </>
      )}

      {/*** PopUp -> Ficha Tecnica ****/}
      {visibleModalFichaTecnica && (
        <ModalFichaTecnicaIndexPage
          idProducto={idProducto}
          selectData={obtenerCliente}
          showPopup={{ isVisiblePopUp: visibleModalFichaTecnica, setisVisiblePopUp: setVisibleModalFichaTecnica }}
          cancelarEdicion={() => setVisibleModalFichaTecnica(false)}
          selectionMode={"row"}
        />
      )}

      {/*** PopUp -> Agregar Imagen al producto ****/}
      {/* {visibleModalAddImage && (
        <AddImageIndexPage
          idProducto={idProducto}
          selectData={obtenerCliente}
          showPopup={{ isVisiblePopUp: visibleModalAddImage, setisVisiblePopUp: setVisibleModalAddImage }}
          cancelarEdicion={() => setVisibleModalAddImage(false)}
          selectionMode={"row"}
        />
      )} */}

      {/*** PopUp -> Modal imagen ****/}
      {visibleModalImagenProducto && (
        <ModalDocumentIndexPage
          imagenProducto={imagenProducto}
          selectData={null}
          showPopup={{ isVisiblePopUp: visibleModalImagenProducto, setisVisiblePopUp: setVisibleModalImagenProducto }}
          cancelarEdicion={() => setVisibleModalImagenProducto(false)}
          selectionMode={"row"}
          onCambiarImagen={actualizarImagenPrincipalModal}
        />
      )}

      <Confirm
        message={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        // setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "SEGURIDAD.USUARIOS.CREAR_USUARIO.CONFIRM.CANCEL.TEXT" })}
      />

      <Dialog
        open={modalSubimagenesOpen}
        onClose={() => setModalSubimagenesOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          No se puede eliminar el producto
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
            {modalSubimagenesTexto}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button variant="contained" onClick={() => setModalSubimagenesOpen(false)} sx={{ textTransform: "none" }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de configuración de Delivery */}
      <DeliveryConfigModal
        open={deliveryConfigOpen}
        onClose={() => setDeliveryConfigOpen(false)}
        setLoading={setLoading}
      />
    </>
  );
}

export default injectIntl(WithLoandingPanel(ProductoIndexPage));