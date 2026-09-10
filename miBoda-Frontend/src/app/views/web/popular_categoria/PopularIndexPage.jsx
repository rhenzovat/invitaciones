import React, { useEffect, useState } from "react";
import { useIntl, injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../utils/withLoandingPanel";
import UseAccesosObjetos from "../../../utils/useAccesosObjetos";
import CategoriaPopularListPage from "../popular_categoria/CategoriaPopularListPage";
import CategoriaPopularEditPage from "../popular_categoria/CategoriaPopularEditPage";
import BannerPopularListPage from "../pupular_banner/BannerPopularListPage";
import BannerPopularEditPage from "../pupular_banner/BannerPopularEditPage";
import {
    listarCategoriasPopulares
    , crearCategoriaPopular
    , actualizar_categoria_popular
    , eliminar_categoria_popular

    , listarBannersPopulares
    , crearBannerPopular
    , actualizar_banner_popular
    , eliminar_banner_popular
} from "../../../api/popular.api";
import { handleErrorMessages, toastSuccess } from "../../../components/notify-messages";
import ConfirmPopular from "../../../components/ConfirmPopular";
import { listarEstadoSimple, } from "../../../utils/utils";


const PopularIndexPage = ({ setLoading, ...props }) => {
const { accessButton } = UseAccesosObjetos();// Ajusta el id_menu según corresponda
    const intl = useIntl();

    const [titulo, setTitulo] = useState("Categorías Populares");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [tabActivo, setTabActivo] = useState('categorias');
    const [isVisible, setIsVisible] = useState(false);
    const [selected, setSelected] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [banners, setBanners] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [imagenProfile, setImagenProfile] = useState(null);


    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }
    //========================== Funciones para Categorías Populares==================   
    const nuevaCategoriaPopular = () => {
        setDataRowEditNew({
            Activo: 'S',
            esNuevoRegistro: true,
            nombre_categoria: '',
            url_direccion: '',
            orden: '', // Cambiar de 0 a string vacío
            url_imagen: '',
        });
        setTitulo("Nueva Categoría Popular");
        setModoEdicion(true);
        setImagenProfile(null)
    };
    const editarCategoriaPopular = (dataRow) => {
        setDataRowEditNew({ ...dataRow, esNuevoRegistro: false });
        setTitulo("Editar Categoría Popular");
        setModoEdicion(true);
        setImagenProfile(null);
    };

    const agregarCategoriaPopular = async (dataRow) => {
        setLoading(true);
        try {
            // Validaciones del cliente...
            if (!dataRow.nombre_categoria || dataRow.nombre_categoria.trim().length < 3) {
                throw new Error('El nombre de categoría debe tener al menos 3 caracteres');
            }

            if (dataRow.orden === undefined || dataRow.orden === null || dataRow.orden === '' || isNaN(dataRow.orden)) {
                throw new Error('El orden debe ser un número válido');
            }

            if (parseInt(dataRow.orden) === 0) {
                throw new Error('El orden no puede ser cero');
            }

            if (!/^\d+$/.test(dataRow.orden.toString())) {
                throw new Error('El orden solo debe contener números enteros positivos');
            }

            // Validación de URL
            // Validación de URL - PERMITIR rutas relativas
            // Validación de URL - PERMITIR rutas relativas CON o SIN barra inicial
            if (dataRow.url_direccion) {
                const urlValue = dataRow.url_direccion.trim();

                // ✅ CASO 1: Ruta relativa (con o sin / al inicio)
                if (urlValue.startsWith('/') || /^[a-zA-Z0-9\-_\/]+$/.test(urlValue.split('/')[0])) {
                    // Validar caracteres permitidos en rutas relativas
                    if (!/^[a-zA-Z0-9\-_\/.]+$/.test(urlValue.replace(/^\//, ''))) {
                        throw new Error('La ruta solo puede contener letras, números, guiones, puntos y slashes');
                    }
                    // Si pasa la validación, continuar
                }
                // ✅ CASO 2: URL completa
                else {
                    try {
                        // Intentar con http:// por defecto si no tiene protocolo
                        if (!urlValue.startsWith('http')) {
                            new URL(`http://${urlValue}`);
                        } else {
                            new URL(urlValue);
                        }
                    } catch {
                        throw new Error('La URL debe ser una ruta relativa (ej: modulo/lista/lis o /admin/index) o URL válida (ej: https://ejemplo.com)');
                    }
                }
            }

            const formData = new FormData();
            formData.append('nombre_categoria', dataRow.nombre_categoria);
            formData.append('orden', dataRow.orden);
            formData.append('Activo', dataRow.Activo);
            formData.append('url_direccion', dataRow.url_direccion);

            if (dataRow.url_imagen) {
                formData.append('imagen', dataRow.url_imagen);
            }

            await crearCategoriaPopular(formData);
            toastSuccess("Categoría creada exitosamente");
            cancelarEdicion();
            cargarDatosCategorias();

        } catch (error) {
            console.log('%c [test]-76', 'font-size:13px; background:pink; color:#bf2c9f;', error);

            // ✅ SOLO ESTO - handleErrorMessages YA maneja todo
            handleErrorMessages("Error de validación", error);

        } finally {
            setLoading(false);
        }
    };

    const actualizarCategoriaPopular = async (dataRow) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nombre_categoria', dataRow.nombre_categoria);
            formData.append('orden', dataRow.orden);
            formData.append('Activo', dataRow.Activo);
            formData.append('imagen', dataRow.url_imagen);
            formData.append('url_direccion', dataRow.url_direccion);


            await actualizar_categoria_popular(dataRow.id_categoria_popular, formData);
            toastSuccess("Categoría actualizada exitosamente");
            cancelarEdicion();
            cargarDatosCategorias();
        } catch (error) {
            handleErrorMessages("Error al actualizar categoría", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarCategoriaPopular = async (id_categoria_popular, confirm) => {
        if (!confirm) {
            setSelected(id_categoria_popular);
            setIsVisible(true);
            return;
        }
        setLoading(true);
        try {
            const data = await eliminar_categoria_popular(id_categoria_popular);
            toastSuccess("Categoría eliminada exitosamente");
            cargarDatosCategorias();
        } catch (error) {
            handleErrorMessages("Error al eliminar categoría", error);
        } finally {
            setLoading(false);
        }
    };
    //========================== Funciones para Banners Populares ==================
    const nuevoBannerPopular = () => {
        setDataRowEditNew({
            Activo: 'S',
            esNuevoRegistro: true,
            titulo_principal: '',
            titulo_secundario: '',
            texto_descuento: '',
            precio_desde: 0,
            orden: 0,
            url_imagen: '',
            estilo_css: 'col-sm-6 col-lg-3',
            url_direccion: '',


        });
        setTitulo("Nuevo Banner Popular");
        setModoEdicion(true);
        setImagenProfile(null)
    };

    const editarBannerPopular = (dataRow) => {
        setDataRowEditNew({ ...dataRow, esNuevoRegistro: false });
        setTitulo("Editar Banner Popular");
        setModoEdicion(true);
        setImagenProfile(null);
    };

    const agregarBannerPopular = async (dataRow) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('titulo_principal', dataRow.titulo_principal);
        formData.append('titulo_secundario', dataRow.titulo_secundario || '');
        formData.append('texto_descuento', dataRow.texto_descuento || '');
        formData.append('precio_desde', dataRow.precio_desde || 0);
        formData.append('orden', dataRow.orden);
        formData.append('Activo', dataRow.Activo);
        formData.append('estilo_css', dataRow.estilo_css);
        formData.append('url_direccion', dataRow.url_direccion);


        if (dataRow.url_imagen) {
            formData.append('imagen', dataRow.url_imagen);
        }
        await crearBannerPopular(formData).then(response => {
            // if (response)
            toastSuccess(intl.formatMessage({ id: "COMMON.ACTION.MENSAJE.REGISTRO" }));
            cancelarEdicion();
            cargarDatosBanners();
            // limpiarImagen();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "COMMON.ACTION.TITULO.ALERTA" }), err);
        }).finally(() => { setLoading(false); });

    };

    const actualizarBannerPopular = async (dataRow) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('titulo_principal', dataRow.titulo_principal);
            formData.append('titulo_secundario', dataRow.titulo_secundario || '');
            formData.append('texto_descuento', dataRow.texto_descuento || '');
            formData.append('precio_desde', dataRow.precio_desde || 0);
            formData.append('orden', dataRow.orden);
            formData.append('Activo', dataRow.Activo);
            formData.append('imagen', dataRow.url_imagen);
            formData.append('estilo_css', dataRow.estilo_css);
            formData.append('url_direccion', dataRow.url_direccion);

            await actualizar_banner_popular(dataRow.id_banner_popular, formData);
            toastSuccess("Banner actualizado exitosamente");
            cancelarEdicion();
            cargarDatosBanners();
        } catch (error) {
            handleErrorMessages("Error al actualizar banner", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarBannerPopular = async (id, confirm) => {
        if (!confirm) {
            setSelected(id);
            setIsVisible(true);
            return;
        }

        setLoading(true);
        try {
            await eliminar_banner_popular(id);
            toastSuccess("Banner eliminado exitosamente");
            cargarDatosBanners();
        } catch (error) {
            handleErrorMessages("Error al eliminar banner", error);
        } finally {
            setLoading(false);
        }
    };

    // Funciones auxiliares
    const cargarDatosCategorias = async () => {
        setLoading(true);
        try {
            const data = await listarCategoriasPopulares();
            setCategorias(data);
        } catch (error) {
            handleErrorMessages("Error al cargar categorías populares", error);
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosBanners = async () => {
        setLoading(true);
        try {
            const data = await listarBannersPopulares();
            setBanners(data);
        } catch (error) {
            handleErrorMessages("Error al cargar banners populares", error);
        } finally {
            setLoading(false);
        }
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo(tabActivo === 'categorias' ? "Categorías Populares" : "Banners Populares");
        setDataRowEditNew({});
        setImagenProfile(null);
    };

    useEffect(() => {
        if (tabActivo === 'categorias') {
            cargarDatosCategorias();
        } else {
            cargarDatosBanners();
        }
        cargarCombos();
    }, [tabActivo]);

    return (
        <>
            {modoEdicion ? (
                tabActivo === 'categorias' ? (
                    <CategoriaPopularEditPage
                        {...props}
                        accessButton={accessButton}
                        titulo={titulo}
                        dataRowEditNew={dataRowEditNew}
                        cancelarEdicion={cancelarEdicion}
                        agregarCategoriaPopular={agregarCategoriaPopular}
                        actualizarCategoriaPopular={actualizarCategoriaPopular}

                        setImagenProfile={setImagenProfile}
                        imagenProfile={imagenProfile}
                        estadoSimple={estadoSimple}


                    />
                ) : (
                    <BannerPopularEditPage
                        {...props}
                        accessButton={accessButton}
                        titulo={titulo}
                        dataRowEditNew={dataRowEditNew}
                        cancelarEdicion={cancelarEdicion}
                        agregarBannerPopular={agregarBannerPopular}
                        actualizarBannerPopular={actualizarBannerPopular}

                        setImagenProfile={setImagenProfile}
                        imagenProfile={imagenProfile}
                        estadoSimple={estadoSimple}
                    />
                )
            ) : (
                <div className="container mt-3">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${tabActivo === 'categorias' ? 'active' : ''}`}
                                onClick={() => {
                                    setTabActivo('categorias');
                                    setTitulo("Categorías Populares");
                                }}
                            >
                                Categorías Populares
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${tabActivo === 'banners' ? 'active' : ''}`}
                                onClick={() => {
                                    setTabActivo('banners');
                                    setTitulo("Banners Populares");
                                }}
                            >
                                Banners Populares
                            </button>
                        </li>
                    </ul>

                    {/* // En la parte de renderizado del PopularIndexPage.jsx */}
                    {tabActivo === 'categorias' ? (
                        <>
                            <CategoriaPopularListPage
                                {...props}
                                accessButton={accessButton}
                                titulo={titulo}
                                listarUsuario={categorias}
                                nuevoRegistro={nuevaCategoriaPopular}
                                editarRegistro={(dataRow) => editarCategoriaPopular(dataRow)}
                                eliminarRegistro={eliminarCategoriaPopular}
                            />
                            <ConfirmPopular
                                tipo="categoria_popular"
                                isVisible={isVisible}
                                setIsVisible={setIsVisible}
                                onConfirm={() => eliminarCategoriaPopular(selected, true)}
                            />
                        </>
                    ) : (
                        <>
                            <BannerPopularListPage
                                {...props}
                                accessButton={accessButton}
                                titulo={titulo}
                                listarUsuario={banners}
                                nuevoRegistro={nuevoBannerPopular}
                                editarRegistro={(dataRow) => editarBannerPopular(dataRow)}
                                eliminarRegistro={eliminarBannerPopular}
                            />
                            <ConfirmPopular
                                tipo="banner_popular"
                                isVisible={isVisible}
                                setIsVisible={setIsVisible}
                                onConfirm={() => eliminarBannerPopular(selected, true)}
                            />
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default injectIntl(WithLoandingPanel(PopularIndexPage));