import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";
import campusRoutes from "./views/campus/campus-routes";
// Onboarding p├║blico (sin autenticaci├│n)
const OnboardingPublicPage   = Loadable(lazy(() => import("app/views/onboarding/OnboardingPublicPage")));
const OnboardingReportePage  = Loadable(lazy(() => import("app/views/onboarding/OnboardingReportePage")));

// E-CHART PAGE
const AppEchart = Loadable(lazy(() => import("app/views/charts/echarts/AppEchart")));
// DASHBOARD PAGE

// jorge <Inicio de actividades>
const ClientesVentasIndexPage = Loadable(lazy(() => import("app/views/clientes/ClientesIndexPage")));
const EmpleadosIndexPage = Loadable(lazy(() => import("app/views/empleados/EmpleadosIndexPage")));
const VendedorIndexPage = Loadable(lazy(() => import("app/views/vendedor/VendedorIndexPage")));

const PerfilesIndexPage = Loadable(lazy(() => import("app/views/perfiles/PerfilesIndexPage")));
const RolesIndexPage = Loadable(lazy(() => import("app/views/roles/RolesIndexPage")));
const MenuIndexPage = Loadable(lazy(() => import("app/views/menu/MenuIndexPage")));
const MenuOrdenSidebarPage = Loadable(lazy(() => import("app/views/menu/MenuOrdenSidebarPage")));
const EtiquetasMenuIndexPage = Loadable(lazy(() => import("app/views/menu/EtiquetasMenuIndexPage")));
const ObjetosIndexPage = Loadable(lazy(() => import("app/views/objetos/ObjetosIndexPage")));
const UsuarioIndexPage = Loadable(lazy(() => import("app/views/usuarios/UsuarioIndexPage")));
const ProfileIndexPage = Loadable(lazy(() => import("app/views/profile/ProfileIndexPage")));

const ProductoIndexPage = Loadable(lazy(() => import("app/views/producto/ProductoIndexPage")));
const ProductoImportPage = Loadable(lazy(() => import("app/views/producto/ProductoImportPage")));
const FooterIndexPage = Loadable(lazy(() => import("app/views/web/footer/FooterIndexPage")));
const WhatsappConfigIndexPage = Loadable(lazy(() => import("app/views/web/whatsapp/WhatsappConfigIndexPage")));
const SliderIndexPage = Loadable(lazy(() => import("app/views/web/slider/SliderIndexPage")));
// const MasVendidosIndexPage = Loadable(lazy(() => import("app/views/web/masvendidos/MasVendidosIndexPage")));
const AboutIndexPage = Loadable(lazy(() => import("app/views/web/about/AboutIndexPage")));
const PlanesIndexPage = Loadable(lazy(() => import("app/views/web/planes/PlanesIndexPage")));

const FacturasIndexPage = Loadable(lazy(() => import("app/views/ventas/facturas/FacturasIndexPage")));
const BalanceVentasIndexPage = Loadable(lazy(() => import("app/views/ventas/balance_ventas/BalanceVentasIndexPage")));
const CategoriaIndexPage = Loadable(lazy(() => import("app/views/categoria/CategoriaIndexPage")));

const PromocionIndexPage = Loadable(lazy(() => import("app/views/promocion/PromocionIndexPage")));
const MetadatosPaginaIndexPage = Loadable(lazy(() => import("app/views/metadatospagina/MetadatosPaginaIndexPage")));
const PopularIndexPage = Loadable(lazy(() => import("app/views/web/popular_categoria/PopularIndexPage")));
const LibroReclamoIndexPage = Loadable(lazy(() => import("app/views/web/libro_reclamo/LibroReclamoIndexPage")));
const PasarelaIndexPage = Loadable(lazy(() => import("app/views/configuracion/pasarela/PasarelaIndexPage")));
const AuthProveedorIndexPage = Loadable(lazy(() => import("app/views/configuracion/auth/AuthProveedorIndexPage")));
const FaviconConfigPage = Loadable(lazy(() => import("app/views/configuracion/favicon/FaviconConfigPage")));
const BackupIndexPage = Loadable(lazy(() => import("app/views/backup/BackupIndexPage")));
const BeneficioIndexPage = Loadable(lazy(() => import("app/views/web/beneficio/BeneficioIndexPage")));
const MetodologiaIndexPage = Loadable(lazy(() => import("app/views/web/metodologia/MetodologiaIndexPage")));
const ServiciosIndexPage = Loadable(lazy(() => import("app/views/web/servicios/ServiciosIndexPage")));
const PorqueElejirnosIndexPage = Loadable(lazy(() => import("app/views/web/porque_elejirnos/PorqueElejirnosIndexPage")));
const FaqIndexPage = Loadable(lazy(() => import("app/views/web/faq/FaqIndexPage")));
const NuestroEquipoIndexPage = Loadable(lazy(() => import("app/views/web/nuestro_equipo/NuestroEquipoIndexPage")));
const TestimoniosIndexPage = Loadable(lazy(() => import("app/views/web/testimonios/TestimoniosIndexPage")));
const HeaderIndexPage      = Loadable(lazy(() => import("app/views/web/header/HeaderIndexPage")));
const CarruselIndexPage    = Loadable(lazy(() => import("app/views/web/carrusel/CarruselIndexPage")));
const PublicacionesIndexPage = Loadable(lazy(() => import("app/views/web/publicaciones/PublicacionesIndexPage")));
const ContadoresIndexPage  = Loadable(lazy(() => import("app/views/web/contadores/ContadoresIndexPage")));
const PaginaNosotrosIndexPage = Loadable(lazy(() => import("app/views/web/pagina_nosotros/PaginaNosotrosIndexPage")));
const PaginaProductosIndexPage = Loadable(lazy(() => import("app/views/web/pagina_productos/PaginaProductosIndexPage")));
const PaginaContactoIndexPage = Loadable(lazy(() => import("app/views/web/pagina_contacto/PaginaContactoIndexPage")));
const ProductoDestacadoIndexPage = Loadable(lazy(() => import("app/views/web/producto_destacado/ProductoDestacadoIndexPage")));
const ProductoCatalogoIndexPage = Loadable(lazy(() => import("app/views/web/producto_catalogo/ProductoCatalogoIndexPage")));
const LineaProductoIndexPage = Loadable(lazy(() => import("app/views/web/linea_producto/LineaProductoIndexPage")));
const VideosIndexPage = Loadable(lazy(() => import("app/views/web/videos/VideosIndexPage")));
const WebClientesIndexPage = Loadable(lazy(() => import("app/views/web/clientes/ClientesIndexPage")));
const ContactoLandingIndexPage = Loadable(lazy(() => import("app/views/web/contacto_landing/ContactoLandingIndexPage")));
const PromoBannerIndexPage = Loadable(lazy(() => import("app/views/web/promo_banner/PromoBannerIndexPage")));
const ExperienciasIndexPage = Loadable(lazy(() => import("app/views/web/experiencias/ExperienciasIndexPage")));
const MasajeFaqIndexPage    = Loadable(lazy(() => import("app/views/web/masaje_faq/MasajeFaqIndexPage")));
const PaginaExperienciasIndexPage = Loadable(lazy(() => import("app/views/web/pagina_experiencias/PaginaExperienciasIndexPage")));
const PaginaMasajesIndexPage      = Loadable(lazy(() => import("app/views/web/pagina_masajes/PaginaMasajesIndexPage")));
const PaginaGaleriaIndexPage = Loadable(lazy(() => import("app/views/web/pagina_galeria/PaginaGaleriaIndexPage")));
const ContactoMensajesIndexPage = Loadable(lazy(() => import("app/views/web/contacto_mensajes/ContactoMensajesIndexPage")));
const RsvpRespuestasIndexPage = Loadable(lazy(() => import("app/views/web/rsvp_respuestas/RsvpRespuestasIndexPage")));
const CancionSugerenciasIndexPage = Loadable(lazy(() => import("app/views/web/cancion_sugerencias/CancionSugerenciasIndexPage")));
const GaleriaFotosIndexPage = Loadable(lazy(() => import("app/views/web/galeria_fotos/GaleriaFotosIndexPage")));
const EventoIndexPage = Loadable(lazy(() => import("app/views/web/evento/EventoIndexPage")));
const EventoGeneralIndexPage = Loadable(lazy(() => import("app/views/web/evento_general/EventoGeneralIndexPage")));
const EventoHeroIndexPage = Loadable(lazy(() => import("app/views/web/evento_hero/EventoHeroIndexPage")));
const EventoSobreIndexPage = Loadable(lazy(() => import("app/views/web/evento_sobre/EventoSobreIndexPage")));
const EventoFamiliaIndexPage = Loadable(lazy(() => import("app/views/web/evento_familia/EventoFamiliaIndexPage")));
const EventoUbicacionesIndexPage = Loadable(lazy(() => import("app/views/web/evento_ubicaciones/EventoUbicacionesIndexPage")));
const EventoItinerarioIndexPage = Loadable(lazy(() => import("app/views/web/evento_itinerario/EventoItinerarioIndexPage")));
const EventoVestimentaIndexPage = Loadable(lazy(() => import("app/views/web/evento_vestimenta/EventoVestimentaIndexPage")));
const EventoRsvpIndexPage = Loadable(lazy(() => import("app/views/web/evento_rsvp/EventoRsvpIndexPage")));
const EventoRegalosIndexPage = Loadable(lazy(() => import("app/views/web/evento_regalos/EventoRegalosIndexPage")));
const EventoMomento1IndexPage = Loadable(lazy(() => import("app/views/web/evento_momento1/EventoMomento1IndexPage")));
const EventoMomento2IndexPage = Loadable(lazy(() => import("app/views/web/evento_momento2/EventoMomento2IndexPage")));
const EventoMomento3IndexPage = Loadable(lazy(() => import("app/views/web/evento_momento3/EventoMomento3IndexPage")));
const EventoCountdownIndexPage = Loadable(lazy(() => import("app/views/web/evento_countdown/EventoCountdownIndexPage")));
const EventoHistoriaIndexPage = Loadable(lazy(() => import("app/views/web/evento_historia/EventoHistoriaIndexPage")));
const EventoMultimediaIndexPage = Loadable(lazy(() => import("app/views/web/evento_multimedia/EventoMultimediaIndexPage")));
const EventoRestriccionesIndexPage = Loadable(lazy(() => import("app/views/web/evento_restricciones/EventoRestriccionesIndexPage")));
const EventoVideoIndexPage = Loadable(lazy(() => import("app/views/web/evento_video/EventoVideoIndexPage")));
const EventoGaleriaIndexPage = Loadable(lazy(() => import("app/views/web/evento_galeria/EventoGaleriaIndexPage")));
const EventoDashboardIndexPage = Loadable(lazy(() => import("app/views/web/evento_dashboard/EventoDashboardIndexPage")));
const InvitadosIndexPage = Loadable(lazy(() => import("app/views/web/invitados/InvitadosIndexPage")));
const AboutCaracteristicaIndexPage = Loadable(lazy(() => import("app/views/web/about_caracteristica/AboutCaracteristicaIndexPage")));
const ConfianzaItemIndexPage = Loadable(lazy(() => import("app/views/web/confianza_item/ConfianzaItemIndexPage")));
const InformeSistemaPage = Loadable(lazy(() => import("app/views/informe_sistema/InformeSistemaPage")));
const routes = [
  { path: "/", element: <Navigate to="dashboard/default" /> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,

      // jorge <Inicio de actividades>
      { path: "/clientes-ventas/index", element: <ClientesVentasIndexPage /> },
      { path: "/empleados/index", element: <EmpleadosIndexPage /> },
      { path: "/vendedor/index", element: <VendedorIndexPage /> },
      { path: "/backup/index", element: <BackupIndexPage /> },
      { path: "/beneficio/index", element: <BeneficioIndexPage /> },
      { path: "/usuarios/index", element: <UsuarioIndexPage /> },
      { path: "/perfiles/index", element: <PerfilesIndexPage /> },
      { path: "/roles/index", element: <RolesIndexPage /> },
      { path: "/menu/index", element: <MenuIndexPage /> },
      { path: "/menu/orden", element: <MenuOrdenSidebarPage /> },
      { path: "/administracion-etiquetas/index", element: <EtiquetasMenuIndexPage /> },
      { path: "/objetos/index", element: <ObjetosIndexPage /> },
      { path: "/profile/index", element: <ProfileIndexPage /> },

      { path: "/producto/index", element: <ProductoIndexPage /> },
      { path: "/producto/importar", element: <ProductoImportPage /> },
      { path: "/footer/index", element: <FooterIndexPage /> },
      { path: "/whatsapp/index", element: <WhatsappConfigIndexPage /> },
      { path: "/slider/index", element: <SliderIndexPage /> },
      { path: "/about/index", element: <AboutIndexPage /> },
      { path: "/planes/index", element: <PlanesIndexPage /> },
      { path: "/porque_elejirnos/index", element: <PorqueElejirnosIndexPage /> },
      { path: "/nuestro_equipo/index", element: <NuestroEquipoIndexPage /> },


      { path: "/facturas/index", element: <FacturasIndexPage /> },
      { path: "/balance_ventas/index", element: <BalanceVentasIndexPage /> },
      { path: "/categoria/index", element: <CategoriaIndexPage /> },
      { path: "/promocion/index", element: <PromocionIndexPage /> },
      { path: "/metadatospagina/index", element: <MetadatosPaginaIndexPage /> },
      { path: "/popular/index", element: <PopularIndexPage /> },
      { path: "/libro_reclamo/index", element: <LibroReclamoIndexPage /> },
      { path: "/configuracion/pasarela", element: <PasarelaIndexPage /> },
      { path: "/configuracion/auth-proveedor", element: <AuthProveedorIndexPage /> },
      { path: "/configuracion/favicon", element: <FaviconConfigPage /> },
      { path: "/dashboard/default", element: <EventoDashboardIndexPage /> },
      { path: "/charts/echarts", element: <AppEchart /> },

      { path: "/metodologia/index", element: <MetodologiaIndexPage /> },
      { path: "/servicios/index", element: <ServiciosIndexPage /> },
      { path: "/faq/index", element: <FaqIndexPage /> },
      { path: "/testimonios/index", element: <TestimoniosIndexPage /> },
      { path: "/header/index", element: <HeaderIndexPage /> },
      { path: "/carrusel/index", element: <CarruselIndexPage /> },
      { path: "/publicaciones/index", element: <PublicacionesIndexPage /> },
      { path: "/contadores/index", element: <ContadoresIndexPage /> },
      { path: "/pagina-nosotros/index", element: <PaginaNosotrosIndexPage /> },
      { path: "/pagina-productos/index", element: <PaginaProductosIndexPage /> },
      { path: "/pagina-contacto/index", element: <PaginaContactoIndexPage /> },
      { path: "/producto-destacado/index", element: <ProductoDestacadoIndexPage /> },
      { path: "/producto-catalogo/index", element: <ProductoCatalogoIndexPage /> },
      { path: "/linea-producto/index", element: <LineaProductoIndexPage /> },
      { path: "/videos/index", element: <VideosIndexPage /> },
      { path: "/clientes/index", element: <WebClientesIndexPage /> },
      { path: "/contacto-landing/index", element: <ContactoLandingIndexPage /> },
      { path: "/promo-banner/index", element: <PromoBannerIndexPage /> },
      { path: "/experiencias/index", element: <ExperienciasIndexPage /> },
      { path: "/masaje-faq/index",   element: <MasajeFaqIndexPage /> },
      { path: "/pagina-experiencias/index", element: <PaginaExperienciasIndexPage /> },
      { path: "/pagina-masajes/index",      element: <PaginaMasajesIndexPage /> },
      { path: "/pagina-galeria/index", element: <PaginaGaleriaIndexPage /> },
      { path: "/contacto-mensajes/index", element: <ContactoMensajesIndexPage /> },
      { path: "/rsvp-respuestas/index", element: <RsvpRespuestasIndexPage /> },
      { path: "/cancion-sugerencias/index", element: <CancionSugerenciasIndexPage /> },
      { path: "/galeria-fotos/index", element: <GaleriaFotosIndexPage /> },
      { path: "/evento/index", element: <EventoIndexPage /> },
      { path: "/evento-general/index", element: <EventoGeneralIndexPage /> },
      { path: "/evento-hero/index", element: <EventoHeroIndexPage /> },
      { path: "/evento-sobre/index", element: <EventoSobreIndexPage /> },
      { path: "/evento-familia/index", element: <EventoFamiliaIndexPage /> },
      { path: "/evento-ubicaciones/index", element: <EventoUbicacionesIndexPage /> },
      { path: "/evento-itinerario/index", element: <EventoItinerarioIndexPage /> },
      { path: "/evento-vestimenta/index", element: <EventoVestimentaIndexPage /> },
      { path: "/evento-rsvp/index", element: <EventoRsvpIndexPage /> },
      { path: "/evento-regalos/index", element: <EventoRegalosIndexPage /> },
      { path: "/evento-momento1/index", element: <EventoMomento1IndexPage /> },
      { path: "/evento-momento2/index", element: <EventoMomento2IndexPage /> },
      { path: "/evento-momento3/index", element: <EventoMomento3IndexPage /> },
      { path: "/evento-countdown/index", element: <EventoCountdownIndexPage /> },
      { path: "/evento-historia/index", element: <EventoHistoriaIndexPage /> },
      { path: "/evento-multimedia/index", element: <EventoMultimediaIndexPage /> },
      { path: "/evento-restricciones/index", element: <EventoRestriccionesIndexPage /> },
      { path: "/evento-video/index", element: <EventoVideoIndexPage /> },
      { path: "/evento-galeria/index", element: <EventoGaleriaIndexPage /> },
      { path: "/evento-dashboard/index", element: <EventoDashboardIndexPage /> },
      { path: "/invitados/index", element: <InvitadosIndexPage /> },
      { path: "/about-caracteristica/index", element: <AboutCaracteristicaIndexPage /> },
      { path: "/confianza-item/index", element: <ConfianzaItemIndexPage /> },
      { path: "/informe-sistema/index", element: <InformeSistemaPage /> },
      { path: "/informe_sistema/index", element: <Navigate to="/informe-sistema/index" replace /> },

      // Campus DeliverBox
      ...campusRoutes,
    ]
  },

  // session pages route
  // Onboarding p├║blico ÔÇö fuera de AuthGuard
  { path: "/onboarding/reporte/:token",  element: <OnboardingReportePage /> },
  { path: "/onboarding/:token",          element: <OnboardingPublicPage /> },

  ...sessionRoutes
];

export default routes;
