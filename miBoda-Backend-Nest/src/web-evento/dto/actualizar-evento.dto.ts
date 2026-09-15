import { IsArray, IsBoolean, IsDateString, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

/**
 * Espejo de las reglas de validacion de WebEventoController::actualizar
 * (Laravel). Todo es opcional porque cada modulo del admin guarda solo los
 * campos que le pertenecen (guardado parcial).
 */
export class ActualizarEventoDto {
  @IsOptional() @IsString() novio?: string;
  @IsOptional() @IsString() novia?: string;
  @IsOptional() @IsString() monograma?: string;
  @IsOptional() @IsDateString() fecha_boda?: string;
  @IsOptional() @IsString() fecha_boda_texto?: string;
  @IsOptional() @IsString() hero_subtitulo?: string;
  @IsOptional() @IsString() hero_foto?: string;
  @IsOptional() @IsString() countdown_nota_1?: string;
  @IsOptional() @IsString() countdown_nota_2?: string;
  @IsOptional() @IsString() invitado_por_defecto?: string;
  @IsOptional() @IsNumber() pases_por_defecto?: number;
  @IsOptional() @IsNumber() capacidad_maxima?: number;

  @IsOptional() @IsString() frase_texto?: string;
  @IsOptional() @IsString() frase_referencia?: string;

  @IsOptional() @IsString() envelope_verse_texto?: string;
  @IsOptional() @IsString() envelope_verse_referencia?: string;
  @IsOptional() @IsString() envelope_sello_img?: string;
  @IsOptional() @IsString() envelope_foto1?: string;
  @IsOptional() @IsString() envelope_foto2?: string;

  @IsOptional() @IsArray() familia?: unknown[];
  @IsOptional() @IsArray() ubicaciones?: unknown[];
  @IsOptional() @IsArray() itinerario?: unknown[];
  @IsOptional() @IsArray() historia?: unknown[];
  @IsOptional() @IsArray() vestimenta_colores?: unknown[];
  @IsOptional() @IsArray() regalos_transferencias?: unknown[];
  @IsOptional() @IsArray() regalos_yape_plin?: unknown[];
  @IsOptional() @IsArray() cancion_generos?: unknown[];

  @IsOptional() @IsString() vestimenta_tipo?: string;
  @IsOptional() @IsString() vestimenta_restriccion?: string;
  @IsOptional() @IsString() vestimenta_img_novia?: string;
  @IsOptional() @IsString() vestimenta_img_novio?: string;

  @IsOptional() @IsBoolean() solo_adultos_activo?: boolean;
  @IsOptional() @IsString() solo_adultos_texto?: string;

  @IsOptional() @IsString() foto_pareja_src?: string;

  @IsOptional() @IsString() rsvp_fecha_limite?: string;
  @IsOptional() @IsString() rsvp_contacto_nombre?: string;
  @IsOptional() @IsString() rsvp_contacto_whatsapp?: string;

  @IsOptional() @IsBoolean() regalos_sobre_activo?: boolean;
  @IsOptional() @IsString() regalos_tienda_nombre?: string;
  @IsOptional() @IsString() regalos_tienda_url?: string;
  @IsOptional() @IsString() regalos_direccion_fisica?: string;

  @IsOptional() @IsString() video_src?: string;
  @IsOptional() @IsString() video_texto?: string;
  @IsOptional() @IsString() estacionamiento_texto?: string;

  @IsOptional() @IsString() galeria_texto?: string;
  @IsOptional() @IsString() galeria_nota?: string;
  @IsOptional() @IsString() galeria_boton_subir?: string;
  @IsOptional() @IsString() galeria_boton_ver?: string;

  @IsOptional() @IsString() cancion_texto?: string;
  @IsOptional() @IsString() cancion_label_nombre?: string;
  @IsOptional() @IsString() cancion_label_genero?: string;
  @IsOptional() @IsString() cancion_label_de?: string;
  @IsOptional() @IsString() cancion_boton?: string;

  @IsOptional() @IsString() icono_countdown?: string;
  @IsOptional() @IsString() icono_ubicaciones?: string;
  @IsOptional() @IsString() icono_itinerario?: string;
  @IsOptional() @IsString() icono_vestimenta?: string;
  @IsOptional() @IsString() icono_rsvp?: string;
  @IsOptional() @IsString() icono_regalos?: string;
  @IsOptional() @IsString() icono_video?: string;
  @IsOptional() @IsString() icono_galeria?: string;
  @IsOptional() @IsString() icono_cancion?: string;
  @IsOptional() @IsString() icono_historia?: string;

  @IsOptional() @IsString() musica_src?: string;
  @IsOptional() @IsNumber() musica_volumen?: number;

  @IsOptional() @IsString() footer_texto?: string;

  @IsOptional() @IsString() momento1_verso_texto?: string;
  @IsOptional() @IsString() momento1_verso_referencia?: string;
  @IsOptional() @IsString() momento1_foto?: string;
  @IsOptional() @IsString() momento2_foto?: string;
  @IsOptional() @IsString() momento2_verso_texto?: string;
  @IsOptional() @IsString() momento2_verso_referencia?: string;
  @IsOptional() @IsString() momento3_foto?: string;

  @IsOptional() @IsObject() cloudinary_config?: Record<string, unknown>;
  @IsOptional() @IsObject() google_form_rsvp?: Record<string, unknown>;
  @IsOptional() @IsObject() google_form_cancion?: Record<string, unknown>;
  @IsOptional() @IsObject() google_form_galeria?: Record<string, unknown>;
}
