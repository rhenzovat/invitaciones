    "devextreme": "23.2.3",
    "devextreme-react": "23.2.3",
    "sass": "^1.34.1",

https://github.com/microweber/microweber

https://ui-lib.com/downloads/matx-pro-react-admin/
 
https://matx-react-free.vercel.app/dashboard/default
https://mui.com/material-ui/react-button/

https://mui.com/material-ui/material-icons/
https://js.devexpress.com/React/Documentation/guide/themes_and_styles/icons/
https://js.devexpress.com/React/Demos/WidgetsGallery/Demo/DateBox/Overview/MaterialBlueLight/
https://js.devexpress.com/React/Demos/WidgetsGallery/Demo/Form/Overview/MaterialBlueLight/
https://js.devexpress.com/React/Demos/WidgetsGallery/Demo/TagBox/GroupedItems/MaterialBlueLight/

Agregar inputs
=============
https://js.devexpress.com/React/Demos/WidgetsGallery/Demo/Form/UpdateItemsDynamically/MaterialBlueLight/

Debemos instalr
=================
npm install @mui/styles

Hay 2 formas de trabajar los estilos
=====================================
import { styled, useTheme } from "@mui/material/styles";
import { makeStyles } from '@mui/styles';

Para los Idiomas
======================
npm install react-intl
"react-redux": "^7.1.3",
 "@formatjs/intl-pluralrules": "^1.3.5",
 "react-redux": "^7.1.3",
 "@mdi/font": "^7.4.47"
 "redux-persist": "^6.0.0"
https://localizely.com/blog/react-intl-tutorial/?tab=vite


API DE PRUEBAS
===============
https://js.devexpress.com/Demos/DevAV/odata/Tasks
https://jsonplaceholder.typicode.com/users

INSTACION APARA API
=====================
npm install rxjs
npm install axios

Alertas
==========
npm i sweetalert2
npm i react-toastify

INSTALANDO PARA EL CONFIRM
==============
  "jquery": "^3.5.1",    
  "react-bootstrap": "1.0.0-beta.16",

Iinstalando el confirm
======================
npm i react-confirm-bootstrap

Instalando el adicional para el confirm
=============================
npm i prop-types
npm install @toolpad/core (Ya no hay que evaluar)

Instalando bostrap
=================
https://create-react-app.dev/docs/adding-bootstrap/
npm install bootstrap

Instlando para los QKPI
==========================
npm install @mui/x-charts

 Template web
 =============
https://github.com/uilibrary/matx-react

Instalacion para el avatar
=====================
pnpm  install  @files-ui/react

Instalando complemento de descarga en jvascript
=====================
pnpm i file-saver-es
pnpm i exceljs    

node
==========
22.12.0

Con pnpm re compila mejor sin errores
========================
pnpm run build
pnpm run dev
pnpm run build

handleSuccessMessages( intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
https://marmelab.com/react-admin-demo/

INSTALAMOS EL CKEDITOR
===================
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
npm i ckeditor4-react


https://js.devexpress.com/React/Demos/WidgetsGallery/Demo/HtmlEditor/Overview/MaterialBlueLight/
https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxHtmlEditor/Configuration/imageUpload/

bostrap
=========
https://getbootstrap.com/docs/5.0/utilities/colors/

Instalando datagrid para imagenes
==================================
pnpm add @mui/x-data-grid

Cambio del color de los botones
=====================================
src\app\themes\generated\theme.base.css
src\app\components\Brand.jsx

BOTON ORIGINAL (Color Gris)
**********************************
ff5722

5a5a59

ACTIVE Y HOVER (Color menos Gris)
**********************************
f63b00
be2d00

8f8f8f

AL SUBIR A PRODUCCION DESACTIVAR
=================================
eN vITE Y PACKAGE.JSON
      proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }

      "proxy": "http://localhost:8000",


=============
ICONOS
=========
https://mui.com/material-ui/material-icons/?query=filte
