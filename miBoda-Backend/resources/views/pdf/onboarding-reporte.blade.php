<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 28px 42px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Helvetica, Arial, DejaVu Sans, sans-serif;
    font-size: 9.5px;
    color: #1a1a1a;
    line-height: 1.35;
    background: #fff;
    margin: 28px 42px;
  }

  .row { display: table; width: 100%; table-layout: fixed; }
  .col-6  { display: table-cell; width: 50%; vertical-align: top; }
  .col-6r { display: table-cell; width: 50%; vertical-align: top; padding-left: 16px; }
  .pr8 { padding-right: 16px; }
  .gap { height: 7px; }
  .gap-lg { height: 12px; }

  .header {
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 5px;
    margin-bottom: 7px;
  }
  .header-inner { display: table; width: 100%; }
  .header-left  { display: table-cell; vertical-align: bottom; }
  .header-right { display: table-cell; vertical-align: bottom; text-align: right; }

  .brand-name {
    font-size: 15px; font-weight: 900; letter-spacing: 0.5px;
    text-transform: uppercase; color: #1a1a1a;
  }
  .brand-sub {
    font-size: 8.5px; color: #666; letter-spacing: 0.8px;
    text-transform: uppercase; margin-top: 1px;
  }
  .doc-title {
    font-size: 20px; font-weight: 900; letter-spacing: -0.5px;
    color: #1a1a1a; line-height: 1;
  }
  .doc-code {
    font-size: 10.5px; color: #444; margin-top: 2px;
    font-family: 'Courier New', monospace; letter-spacing: 0.5px;
  }
  .doc-badge {
    display: inline-block; border: 1.5px solid #1a1a1a;
    padding: 1px 6px; font-size: 7px; font-weight: 700;
    letter-spacing: 0.8px; text-transform: uppercase; margin-top: 3px;
  }

  .section { margin-top: 8px; page-break-inside: avoid; }
  .section-title {
    font-size: 8.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.9px; color: #1a1a1a;
    border-bottom: 1.5px solid #1a1a1a;
    padding-bottom: 2px; margin-bottom: 5px;
  }
  .section-subtitle {
    font-size: 8px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; color: #444; margin: 6px 0 3px;
  }

  table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
  th {
    background: #1a1a1a; color: #fff;
    padding: 4px 6px; text-align: left; font-size: 8.5px;
    font-weight: 700; letter-spacing: 0.4px;
  }
  td { padding: 3.5px 6px; border-bottom: 1px solid #e8e8e8; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  tr.alt td { background: #f7f7f7; }
  td.lbl { background: #f0f0f0; font-weight: 700; width: 36%; color: #333; }
  .tar { text-align: right; }
  .tac { text-align: center; }
  .fw7 { font-weight: 700; }
  .ok  { font-weight: 700; }
  .no  { color: #999; }

  .total-box {
    background: #1a1a1a; color: #fff;
    padding: 6px 10px;
    display: table; width: 100%; margin-top: 6px; margin-bottom: 6px;
  }
  .total-label { display: table-cell; font-size: 9.5px; font-weight: 700; letter-spacing: 0.5px; vertical-align: middle; }
  .total-amount { display: table-cell; text-align: right; font-size: 16px; font-weight: 900; vertical-align: middle; letter-spacing: -0.5px; }

  ul { margin: 0 0 0 11px; padding: 0; }
  li { margin-bottom: 2px; color: #333; }
  ul.faltantes li { color: #555; }

  .list-cols-3 { width: 100%; border-collapse: collapse; margin-top: 2px; }
  .list-cols-3 td {
    width: 33.33%;
    vertical-align: top;
    padding: 0 8px 0 0;
    border: none;
  }
  .list-cols-3 ul { margin: 0 0 0 10px; padding: 0; font-size: 8.5px; }
  .list-cols-3 li { margin-bottom: 2px; line-height: 1.3; }

  .note {
    font-size: 8.5px; color: #777; font-style: italic;
    margin-top: 4px; border-left: 2px solid #ccc; padding-left: 5px;
  }

  .desc-box {
    font-size: 9.5px; color: #333; line-height: 1.45;
    border: 1px solid #e8e8e8; padding: 6px 8px; background: #fafafa;
  }

  .proyecto-block {
    border: 1px solid #ccc;
    padding: 8px 10px;
    margin-top: 8px;
    page-break-inside: avoid;
  }
  .proyecto-header {
    display: table; width: 100%; margin-bottom: 6px;
    border-bottom: 1px solid #ddd; padding-bottom: 4px;
  }
  .proyecto-title { display: table-cell; font-size: 11px; font-weight: 900; vertical-align: middle; }
  .proyecto-meta  { display: table-cell; text-align: right; font-size: 8.5px; vertical-align: middle; }

  .stat-grid { display: table; width: 100%; margin-bottom: 4px; }
  .stat-cell {
    display: table-cell; width: 16.66%; text-align: center;
    border: 1px solid #ddd; padding: 5px 3px; background: #fafafa;
  }
  .stat-num { font-size: 14px; font-weight: 900; line-height: 1; }
  .stat-lbl { font-size: 7px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-top: 2px; }

  .img-row { margin-top: 4px; }
  .img-box {
    display: inline-block; text-align: center;
    margin-right: 12px; vertical-align: top;
  }
  .img-box img {
    width: 72px; height: 72px; object-fit: contain;
    border: 1px solid #ccc; background: #fff;
  }
  .img-lbl { font-size: 8px; color: #666; margin-top: 2px; }

  .comprobante-grid { width: 100%; border-collapse: collapse; margin-top: 4px; }
  .comprobante-grid td {
    padding: 6px 4px;
    border: none;
    width: 33.33%;
    vertical-align: top;
    text-align: center;
  }
  .comprobante-box {
    display: inline-block;
    width: 118px;
    height: 158px;
    border: 1px solid #ccc;
    background: #fff;
    padding: 4px;
    overflow: hidden;
    text-align: center;
  }
  .comprobante-box img {
    display: block;
    margin: 0 auto;
    border: none;
  }
  .comprobante-num { text-align: center; font-size: 8px; color: #666; margin-top: 4px; }

  .empty-box {
    border: 1px dashed #ccc; padding: 10px; text-align: center;
    color: #999; font-size: 9px; background: #fafafa;
  }

  .page-break { page-break-before: always; }

  .footer {
    margin-top: 10px; padding-top: 6px; border-top: 1.5px solid #1a1a1a;
    display: table; width: 100%;
  }
  .footer-left  { display: table-cell; font-size: 8.5px; color: #444; vertical-align: bottom; }
  .footer-right { display: table-cell; text-align: right; font-size: 8.5px; color: #444; vertical-align: bottom; }
  .footer-brand { font-weight: 900; font-size: 9.5px; color: #1a1a1a; }
</style>
</head>
<body>

@php
  $crm = $cliente ?? null;
  $nombreCompleto = $crm
    ? $crm->nombreCompleto()
    : trim(($link->form_nombres ?? '') . ' ' . ($link->form_apellidos ?? ''));
  $empresaNombre = $crm?->empresa ?: ($link->form_empresa ?: ($link->empresa_nombre ?: '—'));
  $reporteCodigo = 'ONB-' . str_pad((string) $link->id_onboarding, 6, '0', STR_PAD_LEFT);
  $estadoPago = $link->pago_confirmado ? 'CONFIRMADO' : 'PENDIENTE';
  $alt = false;
@endphp

{{-- CABECERA --}}
<div class="header">
  <div class="header-inner">
    <div class="header-left">
      <div class="brand-name">royalsensorymassage</div>
      <div class="brand-sub">Software Solutions &amp; Innovation · Lima, Perú</div>
    </div>
    <div class="header-right">
      <div class="doc-title">INFORME CLIENTE</div>
      <div class="doc-code">N.° {{ $reporteCodigo }}</div>
      <div class="doc-badge">Onboarding {{ $link->progreso ?? 0 }}%</div>
    </div>
  </div>
</div>

{{-- FILA 1: CLIENTE + DOCUMENTO --}}
<div class="row">
  <div class="col-6 pr8">
    <div class="section-title">Datos del cliente</div>
    <table>
      @if($nombreCompleto)
      <tr><td class="lbl">Nombre</td><td><strong>{{ $nombreCompleto }}</strong></td></tr>
      @endif
      @if($empresaNombre !== '—')
      <tr class="alt"><td class="lbl">Empresa</td><td>{{ $empresaNombre }}</td></tr>
      @endif
      @if($crm && $cliente_estado)
      <tr><td class="lbl">Estado CRM</td><td class="fw7">{{ $cliente_estado }}</td></tr>
      @endif
      @php $whatsapp = $crm?->whatsapp ?: $link->form_whatsapp; @endphp
      @if($whatsapp)
      <tr class="alt"><td class="lbl">WhatsApp</td><td>{{ $whatsapp }}</td></tr>
      @endif
      @php $email = $crm?->email ?: $link->form_email; @endphp
      @if($email)
      <tr><td class="lbl">Correo</td><td>{{ $email }}</td></tr>
      @endif
      @php $telefono = $crm?->telefono ?: $link->form_telefono; @endphp
      @if($telefono)
      <tr class="alt"><td class="lbl">Teléfono</td><td>{{ $telefono }}</td></tr>
      @endif
      @php $dni = $crm?->dni ?: $link->form_dni; @endphp
      @if($dni)
      <tr><td class="lbl">DNI</td><td>{{ $dni }}</td></tr>
      @endif
      @php $ruc = $crm?->ruc ?: $link->form_ruc; @endphp
      @if($ruc)
      <tr class="alt"><td class="lbl">RUC</td><td>{{ $ruc }}</td></tr>
      @endif
      @if($link->form_direccion)
      <tr><td class="lbl">Dirección</td><td>{{ $link->form_direccion }}</td></tr>
      @endif
      @if($crm?->user)
      <tr class="alt"><td class="lbl">Usuario campus</td><td>{{ $crm->user->name }} ({{ $crm->user->email }})</td></tr>
      @endif
      @if($crm?->notas)
      <tr><td class="lbl">Notas internas</td><td>{{ $crm->notas }}</td></tr>
      @endif
    </table>
  </div>
  <div class="col-6r">
    <div class="section-title">Acerca de este documento</div>
    <table>
      <tr><td class="lbl">Tipo</td><td>Informe integral de cliente y proyectos</td></tr>
      <tr class="alt"><td class="lbl">Número</td><td style="font-family:'Courier New',monospace;font-weight:700">{{ $reporteCodigo }}</td></tr>
      <tr><td class="lbl">Estado pago ONB</td><td class="fw7">{{ $estadoPago }}</td></tr>
      <tr class="alt"><td class="lbl">Progreso onboarding</td><td>{{ $link->progreso ?? 0 }}% completado</td></tr>
      <tr><td class="lbl">Generado</td><td>{{ $generado }}</td></tr>
      <tr class="alt"><td class="lbl">Referencia</td><td style="font-family:'Courier New',monospace;font-size:8.5px">{{ $token_short }}</td></tr>
    </table>
  </div>
</div>

<div class="gap"></div>

{{-- TIPOS DE PROYECTO --}}
@if(count($tipos_resumen) > 0)
<div class="section">
  <div class="section-title">Tipos de proyecto ({{ count($tipos_resumen) }} categorías · {{ $resumen['proyectos_total'] }} proyectos)</div>
  <table>
    <tr>
      <th>Tipo / Categoría</th>
      <th class="tac">Cantidad</th>
      <th>Proyectos</th>
    </tr>
    @foreach($tipos_resumen as $i => $tipo)
    <tr class="{{ $i % 2 ? 'alt' : '' }}">
      <td class="fw7">{{ $tipo['icono_label'] }}</td>
      <td class="tac">{{ $tipo['count'] }}</td>
      <td>{{ implode(' · ', $tipo['nombres']) }}</td>
    </tr>
    @endforeach
  </table>
</div>
<div class="gap"></div>
@endif

{{-- DETALLE DE PROYECTOS --}}
<div class="section">
  <div class="section-title">Detalle de proyectos ({{ count($proyectos) }})</div>

  @if(count($proyectos) === 0)
  <div class="empty-box">Este cliente aún no tiene proyectos registrados en Campus DeliverBox.</div>
  @else
  @foreach($proyectos as $idx => $proy)
  <div class="proyecto-block{{ $idx > 0 && $idx % 2 === 0 ? ' page-break' : '' }}">
    <div class="proyecto-header">
      <div class="proyecto-title">Proyecto {{ $idx + 1 }}: {{ $proy['nombre'] }}</div>
      <div class="proyecto-meta">
        {{ $proy['activo_label'] }} · {{ $proy['estado_label'] }} · {{ $proy['progreso'] }}%
      </div>
    </div>

    <div class="row">
      <div class="col-6 pr8">
        <table>
          <tr><td class="lbl">Estado</td><td class="fw7">{{ $proy['estado_label'] }}</td></tr>
          <tr class="alt"><td class="lbl">Activo en sistema</td><td>{{ $proy['activo_label'] }}</td></tr>
          <tr><td class="lbl">Progreso</td><td>{{ $proy['progreso'] }}%</td></tr>
          <tr class="alt"><td class="lbl">Tipo / Icono</td><td>{{ $proy['icono_label'] }}</td></tr>
          <tr><td class="lbl">Fecha inicio</td><td>{{ $proy['fecha_inicio'] ?: '—' }}</td></tr>
          <tr class="alt"><td class="lbl">Fecha entrega</td><td>{{ $proy['fecha_entrega'] ?: '—' }}</td></tr>
          <tr><td class="lbl">Creado</td><td>{{ $proy['created_at'] ?: '—' }}</td></tr>
          <tr><td class="lbl">Última actualización</td><td>{{ $proy['updated_at'] ?: '—' }}</td></tr>
          @if(!empty($proy['paquete']))
          <tr><td class="lbl">Paquete vendido (copia)</td><td>{{ $proy['paquete']['titulo'] }}</td></tr>
          <tr class="alt"><td class="lbl">Precio acordado</td><td class="fw7">{{ $proy['precio_paquete'] ?? '—' }}</td></tr>
          <tr><td class="lbl">Entrega estimada</td><td>{{ $proy['paquete']['dias_entrega'] ?: '—' }}</td></tr>
          <tr class="alt"><td class="lbl">Copiado el</td><td>{{ $proy['paquete']['copiado_en'] ?: '—' }}</td></tr>
          @endif
        </table>

        @if($proy['descripcion'])
        <div class="section-subtitle">Descripción</div>
        <div class="desc-box">{{ $proy['descripcion'] }}</div>
        @endif
      </div>

      <div class="col-6r">
        <div class="section-subtitle">Contenido del proyecto</div>
        <table>
          <tr><td class="lbl">Archivos totales</td><td>{{ $proy['archivos_total'] }}</td></tr>
          <tr class="alt"><td class="lbl">Enlaces / repos</td><td>{{ $proy['enlaces_total'] }}</td></tr>
          <tr><td class="lbl">Tareas agenda</td><td>{{ $proy['tareas_completadas'] }} / {{ $proy['tareas_total'] }} completadas</td></tr>
          <tr class="alt"><td class="lbl">Fases agenda</td><td>{{ count($proy['fases']) }}</td></tr>
        </table>

        @foreach($modulos_archivo as $modKey => $modLabel)
        @php $mod = $proy['archivos_por_modulo'][$modKey] ?? ['count' => 0, 'items' => []]; @endphp
        @if($mod['count'] > 0)
        <div class="section-subtitle">{{ $modLabel }} ({{ $mod['count'] }})</div>
        <ul>
          @foreach($mod['items'] as $arch)
          <li>{{ $arch['nombre'] }}{{ !empty($arch['extension']) ? ' (' . strtoupper($arch['extension']) . ', ' . $arch['tamano'] . ')' : '' }}</li>
          @endforeach
        </ul>
        @endif
        @endforeach

        @if(count($proy['enlaces']) > 0)
        <div class="section-subtitle">Enlaces y repositorios</div>
        <ul>
          @foreach($proy['enlaces'] as $en)
          <li><strong>{{ $en['nombre'] }}</strong> [{{ $en['categoria'] }}] — {{ $en['url'] }}</li>
          @endforeach
        </ul>
        @endif
      </div>
    </div>

    @php
      $colsAlcance = $proy['includes_cols'] ?? [[], [], []];
      $colsFuncs   = $proy['funcionalidades_cols'] ?? [[], [], []];
      $tieneAlcance = count($proy['includes'] ?? []) > 0;
      $tieneFuncs   = count($proy['funcionalidades'] ?? []) > 0;
      $fechaCopiaPaquete = data_get($proy, 'paquete.copiado_en');
    @endphp

    @if($tieneAlcance)
    <div class="section-subtitle" style="margin-top:8px;">
      Alcance incluido (copia del proyecto{{ $fechaCopiaPaquete ? ' · ' . $fechaCopiaPaquete : '' }})
    </div>
    <table class="list-cols-3">
      <tr>
        @foreach($colsAlcance as $col)
        <td valign="top">
          @if(count($col) > 0)
          <ul>
            @foreach($col as $texto)
            <li>{{ $texto }}</li>
            @endforeach
          </ul>
          @endif
        </td>
        @endforeach
      </tr>
    </table>
    @endif

    @if($tieneFuncs)
    <div class="section-subtitle" style="margin-top:6px;">Funcionalidades (copia del proyecto)</div>
    <table class="list-cols-3">
      <tr>
        @foreach($colsFuncs as $col)
        <td valign="top">
          @if(count($col) > 0)
          <ul>
            @foreach($col as $texto)
            <li>{{ $texto }}</li>
            @endforeach
          </ul>
          @endif
        </td>
        @endforeach
      </tr>
    </table>
    @endif

    @if(count($proy['faltantes']) > 0)
    <div class="section-subtitle" style="margin-top:8px;">Pendientes / faltantes ({{ count($proy['faltantes']) }})</div>
    <ul class="faltantes">
      @foreach($proy['faltantes'] as $f)
      <li>{{ $f }}</li>
      @endforeach
    </ul>
    @else
    <div class="note" style="margin-top:6px;">Sin pendientes registrados para este proyecto.</div>
    @endif

    @if(count($proy['tareas_pendientes']) > 0)
    <div class="section-subtitle">Tareas pendientes en agenda</div>
    <table>
      <tr><th>Tarea</th><th>Estado</th><th>Prioridad</th><th>Avance</th><th>Fin</th></tr>
      @foreach($proy['tareas_pendientes'] as $ti => $t)
      <tr class="{{ $ti % 2 ? 'alt' : '' }}">
        <td>{{ $t['nombre'] }}</td>
        <td>{{ $t['estado'] }}</td>
        <td>{{ $t['prioridad'] ?: '—' }}</td>
        <td class="tac">{{ $t['avance'] }}%</td>
        <td>{{ $t['fecha_fin'] ?: '—' }}</td>
      </tr>
      @endforeach
    </table>
    @endif
  </div>
  @endforeach
  @endif
</div>

<div class="gap-lg"></div>

{{-- ONBOARDING: EMPRESA + ESTADO --}}
<div class="section">
  <div class="section-title">Onboarding — datos del formulario</div>
</div>
<div class="row">
  <div class="col-6 pr8">
    <table>
      @if($link->form_marca)
      <tr><td class="lbl">Marca</td><td>{{ $link->form_marca }}</td></tr>
      @endif
      @if($link->form_rubro)
      <tr class="alt"><td class="lbl">Rubro</td><td>{{ $link->form_rubro }}</td></tr>
      @endif
      @if($link->form_dominio)
      <tr><td class="lbl">Dominio web</td><td>{{ $link->form_dominio }}</td></tr>
      @endif
      @if($link->form_colores)
      <tr class="alt"><td class="lbl">Colores</td><td>{{ $link->form_colores }}</td></tr>
      @endif
    </table>
    @if($link->form_desc_proyecto)
    <div class="section" style="margin-top:6px;">
      <div class="section-subtitle">Concepto del proyecto (formulario)</div>
      <div class="desc-box">{{ $link->form_desc_proyecto }}</div>
    </div>
    @endif
  </div>
  <div class="col-6r">
    <div class="section-subtitle">Estado del proceso onboarding</div>
    <table>
      <tr>
        <td class="lbl">Formulario</td>
        <td class="{{ $link->form_completado ? 'ok' : 'no' }}">{{ $link->form_completado ? 'Completado' : 'Pendiente' }}</td>
      </tr>
      <tr class="alt">
        <td class="lbl">Logo subido</td>
        <td class="{{ $link->form_imagen_path ? 'ok' : 'no' }}">{{ $link->form_imagen_path ? 'Sí' : 'No' }}</td>
      </tr>
      <tr>
        <td class="lbl">Pago confirmado</td>
        <td class="{{ $link->pago_confirmado ? 'ok' : 'no' }}">{{ $link->pago_confirmado ? 'Sí' : 'No' }}</td>
      </tr>
      <tr class="alt"><td class="lbl">Visitas al enlace</td><td>{{ $link->vistas ?? 0 }}</td></tr>
      <tr><td class="lbl">Días restantes</td><td>{{ $link->diasRestantes() }}</td></tr>
      <tr class="alt"><td class="lbl">Estado enlace</td><td class="fw7">{{ strtoupper($link->estado) }}</td></tr>
      @if($link->primer_acceso)
      <tr><td class="lbl">Primer acceso</td><td>{{ $link->primer_acceso->format('d/m/Y H:i') }}</td></tr>
      @endif
      @if($link->ultimo_acceso)
      <tr class="alt"><td class="lbl">Último acceso</td><td>{{ $link->ultimo_acceso->format('d/m/Y H:i') }}</td></tr>
      @endif
    </table>
    <div class="note">Progreso onboarding: formulario (80%), logo (10%) y pago confirmado (10%).</div>
  </div>
</div>

{{-- HISTORIAL ONBOARDING --}}
@if($links_historial->count() > 1)
<div class="section" style="margin-top:10px;">
  <div class="section-title">Historial de enlaces onboarding ({{ $links_historial->count() }})</div>
  <table>
    <tr>
      <th>Código</th>
      <th>Estado</th>
      <th>Progreso</th>
      <th>Pago</th>
      <th>Vigencia</th>
      <th>Creado</th>
    </tr>
    @foreach($links_historial as $li => $hl)
    @php $cod = 'ONB-' . str_pad((string) $hl->id_onboarding, 6, '0', STR_PAD_LEFT); @endphp
    <tr class="{{ $li % 2 ? 'alt' : '' }}">
      <td style="font-family:monospace;font-size:8.5px">{{ $cod }}</td>
      <td>{{ strtoupper($hl->estado) }}</td>
      <td class="tac">{{ $hl->progreso ?? 0 }}%</td>
      <td>{{ $hl->pago_confirmado ? 'Confirmado' : 'Pendiente' }}</td>
      <td>{{ $hl->fecha_expiracion?->format('d/m/Y') ?: '—' }}</td>
      <td>{{ $hl->created_at?->format('d/m/Y') ?: '—' }}</td>
    </tr>
    @endforeach
  </table>
</div>
@endif

<div class="gap"></div>

{{-- PAGO + ARCHIVOS --}}
<div class="row">
  <div class="col-6 pr8">
    <div class="section-title">Datos de pago del servicio</div>

    @if($link->empresa_monto)
    <div class="total-box">
      <div class="total-label">{{ ($link->num_cuotas ?? 1) > 1 ? 'MONTO TOTAL' : 'MONTO A PAGAR' }}</div>
      <div class="total-amount">S/ {{ number_format($link->empresa_monto, 2) }}</div>
    </div>
    @endif

    @php
      $cuotasPdf = is_array($link->cuotas_detalle) ? $link->cuotas_detalle : (json_decode($link->cuotas_detalle ?? '[]', true) ?: []);
    @endphp
    @if(($link->num_cuotas ?? 1) > 1 && count($cuotasPdf) > 0)
    <table style="margin-bottom:8px;">
      <tr><td class="lbl" colspan="2" style="font-weight:700;">Plan de {{ $link->num_cuotas }} cuotas</td></tr>
      @foreach($cuotasPdf as $i => $c)
      <tr class="{{ $i % 2 ? 'alt' : '' }}">
        <td class="lbl">Cuota {{ $c['numero'] ?? ($i+1) }}</td>
        <td>
          S/ {{ number_format((float)($c['monto'] ?? 0), 2) }}
          — {{ ucfirst($c['estado'] ?? 'pendiente') }}
        </td>
      </tr>
      @endforeach
    </table>
    @endif

    <table>
      @if($link->empresa_titular)
      <tr><td class="lbl">Titular</td><td>{{ $link->empresa_titular }}</td></tr>
      @endif
      @if($link->empresa_dni)
      <tr class="alt"><td class="lbl">DNI titular</td><td>{{ $link->empresa_dni }}</td></tr>
      @endif
      @if($link->empresa_yape)
      <tr><td class="lbl">Yape</td><td>{{ $link->empresa_yape }}</td></tr>
      @endif
      @if($link->empresa_cuenta)
      <tr class="alt"><td class="lbl">Cuenta BBVA</td><td>{{ $link->empresa_cuenta }}</td></tr>
      @endif
      @if($link->empresa_cci)
      <tr><td class="lbl">CCI BBVA</td><td>{{ $link->empresa_cci }}</td></tr>
      @endif
      @if($link->empresa_bcp_cuenta)
      <tr class="alt"><td class="lbl">Cuenta BCP</td><td>{{ $link->empresa_bcp_cuenta }}</td></tr>
      @endif
      @if($link->empresa_bcp_cci)
      <tr><td class="lbl">CCI BCP</td><td>{{ $link->empresa_bcp_cci }}</td></tr>
      @endif
    </table>

    @if($link->empresa_descripcion)
    <div class="note">{{ $link->empresa_descripcion }}</div>
    @endif
  </div>
  <div class="col-6r">
    <div class="section-title">Archivos adjuntos (onboarding)</div>
    <div class="img-row">
      <div class="img-box">
        @if($qr_url)
        <img src="{{ $qr_url }}" alt="QR">
        @else
        <div style="width:72px;height:72px;border:1px dashed #ccc;line-height:72px;font-size:8px;color:#999;">Sin QR</div>
        @endif
        <div class="img-lbl">QR de pago</div>
      </div>
      @if($logo_url)
      <div class="img-box">
        <img src="{{ $logo_url }}" alt="Logo">
        <div class="img-lbl">Logo cliente</div>
      </div>
      @endif
    </div>
  </div>
</div>

<div class="gap"></div>

{{-- COMPROBANTES --}}
<div class="section">
  <div class="section-title">Comprobantes de pago ({{ count($pagos) }})</div>
  @if(count($pagos) > 0)
  <table class="comprobante-grid">
    <tr>
      @foreach($pagos as $i => $pago)
      @php
        $pagoUrl = is_array($pago) ? ($pago['url'] ?? '') : $pago;
        $pagoW   = is_array($pago) ? (int) ($pago['width'] ?? 110) : 110;
        $pagoH   = is_array($pago) ? (int) ($pago['height'] ?? 150) : 150;
      @endphp
      <td>
        <div class="comprobante-box">
          <img src="{{ $pagoUrl }}" width="{{ $pagoW }}" height="{{ $pagoH }}" alt="Comprobante {{ $i + 1 }}">
        </div>
        <div class="comprobante-num">#{{ $i + 1 }}</div>
      </td>
      @if(($i + 1) % 3 === 0 && ($i + 1) < count($pagos))
    </tr><tr>
      @endif
      @endforeach
    </tr>
  </table>
  @else
  <div class="empty-box">El cliente aún no ha subido comprobantes de pago.</div>
  @endif
</div>

{{-- PIE --}}
<div class="footer">
  <div class="footer-left">
    <div class="footer-brand">LUCDESOFT</div>
    Desarrollo Web Profesional · Lima, Perú
  </div>
  <div class="footer-right">
    Generado el {{ $generado }}<br>
    Informe integral · {{ $reporteCodigo }} · {{ $resumen['proyectos_total'] }} proyecto(s)
  </div>
</div>

</body>
</html>
