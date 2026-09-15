import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assetUrl } from "../common/storage.util";

function looksLikeImagePath(v: string): boolean {
  return (
    /^(https?:)?\/\//i.test(v) ||
    v.startsWith("storage_/") ||
    /\.(png|jpe?g|gif|svg|webp)$/i.test(v)
  );
}

/** Igual que el helper `$ico($custom, $default)` de index.blade.php. */
function icono(custom: string | null | undefined, def: string): string {
  const resolved = custom ? assetUrl(custom) : null;
  return resolved || def;
}

@Injectable()
export class PublicConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async build() {
    const evento = await this.prisma.webEvento.findFirst({ where: { Activo: "S" } });
    if (!evento) return {};

    const ubicaciones = ((evento.ubicaciones as any[]) ?? []).map((u) => ({
      ...u,
      imagen: assetUrl(u.imagen),
    }));
    const itinerario = ((evento.itinerario as any[]) ?? []).map((i) => ({
      ...i,
      imagen: assetUrl(i.imagen),
    }));
    const historia = ((evento.historia as any[]) ?? []).map((h) => ({
      ...h,
      imagen: assetUrl(h.imagen),
      icono: h.icono && looksLikeImagePath(h.icono) ? assetUrl(h.icono) : h.icono,
    }));

    return {
      novio: evento.novio,
      novia: evento.novia,
      monograma: evento.monograma,
      fechaBodaISO: evento.fecha_boda ? evento.fecha_boda.toISOString().slice(0, 19) : null,
      fechaBodaTexto: evento.fecha_boda_texto,
      invitadoPorDefecto: evento.invitado_por_defecto,
      pasesPorDefecto: evento.pases_por_defecto,

      frase: { texto: evento.frase_texto, referencia: evento.frase_referencia },

      familia: evento.familia ?? [],
      ubicaciones,
      itinerario,
      historia,

      vestimenta: {
        tipo: evento.vestimenta_tipo,
        restriccion: evento.vestimenta_restriccion,
        colores: evento.vestimenta_colores ?? [],
      },
      vestimentaImgNovia: assetUrl(evento.vestimenta_img_novia),
      vestimentaImgNovio: assetUrl(evento.vestimenta_img_novio),

      soloAdultos: { activo: !!evento.solo_adultos_activo, texto: evento.solo_adultos_texto },

      rsvp: {
        fechaLimite: evento.rsvp_fecha_limite,
        contactoNombre: evento.rsvp_contacto_nombre,
        contactoWhatsapp: evento.rsvp_contacto_whatsapp,
      },

      googleForm: evento.google_form_rsvp ?? {},
      googleFormCancion: evento.google_form_cancion ?? {},
      cloudinary: evento.cloudinary_config ?? {},
      googleFormGaleria: evento.google_form_galeria ?? {},

      regalos: {
        sobre: !!evento.regalos_sobre_activo,
        tienda: { nombre: evento.regalos_tienda_nombre, url: evento.regalos_tienda_url },
        transferencias: evento.regalos_transferencias ?? [],
        yapePlin: evento.regalos_yape_plin ?? [],
        direccionFisica: evento.regalos_direccion_fisica,
      },

      estacionamiento: evento.estacionamiento_texto,

      musica: { src: assetUrl(evento.musica_src), volumen: Number(evento.musica_volumen) },

      fotoParejaSrc: assetUrl(evento.foto_pareja_src),

      // Campos que en el sitio Blade original se inyectaban directo en el
      // HTML (no via CONFIG) - aqui se agregan para que el mismo main.js los
      // pueda pintar via fetch, sin necesitar un motor de plantillas server-side.
      heroFoto: assetUrl(evento.hero_foto),
      heroSubtitulo: evento.hero_subtitulo,

      envelopeVerseTexto: evento.envelope_verse_texto,
      envelopeVerseReferencia: evento.envelope_verse_referencia,
      envelopeSelloImg: assetUrl(evento.envelope_sello_img),
      envelopeFoto1: assetUrl(evento.envelope_foto1),
      envelopeFoto2: assetUrl(evento.envelope_foto2),

      countdownNota1: evento.countdown_nota_1,
      countdownNota2: evento.countdown_nota_2,

      momento1VersoTexto: evento.momento1_verso_texto,
      momento1VersoReferencia: evento.momento1_verso_referencia,
      momento1Foto: assetUrl(evento.momento1_foto),
      momento2VersoTexto: evento.momento2_verso_texto,
      momento2VersoReferencia: evento.momento2_verso_referencia,
      momento2Foto: assetUrl(evento.momento2_foto),
      momento3Foto: assetUrl(evento.momento3_foto),

      videoSrc: assetUrl(evento.video_src),
      videoTexto: evento.video_texto,

      galeriaTexto: evento.galeria_texto,
      galeriaNota: evento.galeria_nota,
      galeriaBotonSubir: evento.galeria_boton_subir,
      galeriaBotonVer: evento.galeria_boton_ver,

      cancionTexto: evento.cancion_texto,
      cancionLabelNombre: evento.cancion_label_nombre,
      cancionLabelGenero: evento.cancion_label_genero,
      cancionLabelDe: evento.cancion_label_de,
      cancionBoton: evento.cancion_boton,
      cancionGeneros: evento.cancion_generos ?? [],

      footerTexto: evento.footer_texto,

      iconoCountdown: icono(evento.icono_countdown, "assets/img/decor/icon-invitacion/calendario.png"),
      iconoUbicaciones: icono(evento.icono_ubicaciones, "assets/img/decor/icon-invitacion/mapa.png"),
      iconoItinerario: icono(evento.icono_itinerario, "assets/img/decor/icon-invitacion/fecha-limite.png"),
      iconoVestimenta: icono(evento.icono_vestimenta, "assets/img/decor/icon-invitacion/camisa.png"),
      iconoRsvp: icono(evento.icono_rsvp, "assets/img/decor/icon-invitacion/papiro.png"),
      iconoRegalos: icono(evento.icono_regalos, "assets/img/decor/icon-invitacion/caja-de-regalo.png"),
      iconoVideo: icono(evento.icono_video, "assets/img/decor/icon-invitacion/silla-de-director.png"),
      iconoGaleria: icono(evento.icono_galeria, "assets/img/decor/icon-invitacion/camara-reflex-digital.png"),
      iconoCancion: icono(evento.icono_cancion, "assets/img/decor/icon-invitacion/guitarra.png"),
      iconoHistoria: icono(evento.icono_historia, "assets/img/decor/icon-invitacion/amor.png"),
    };
  }

  async galeria() {
    const fotos = await this.prisma.webGaleriaFoto.findMany({
      where: { Activo: "S" },
      orderBy: { orden: "asc" },
    });
    return fotos.map((f) => ({
      full: assetUrl(f.url_imagen),
      thumb: f.url_imagen_thumb ? assetUrl(f.url_imagen_thumb) : assetUrl(f.url_imagen),
    }));
  }
}
