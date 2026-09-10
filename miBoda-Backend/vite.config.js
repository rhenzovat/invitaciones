import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                //add
                'resources/sass/index.scss',
                'resources/sass/web_shopDetail.scss',
                'resources/sass/web_shopDetail_lista.scss',
                'resources/sass/web_shopResultado.scss',
                'resources/sass/login.scss',
                'resources/sass/whatsApp.scss',
                'resources/sass/customise_01.scss',
                'resources/sass/web_about.scss',
                'resources/sass/web_contact.scss',
                'resources/sass/web_gallery.scss',
                'resources/sass/web_checkout.scss',
                'resources/sass/web_footer.scss',
                'resources/sass/web_reclamos_estado.scss',
                'resources/sass/web_customizer.scss',

                'resources/js/web_shopDetail.js',
                'resources/js/web_checkout.js',
                'resources/js/index.js',
                'resources/js/web_contact.js',
                'resources/js/customise_01.js',
                'resources/js/web_customizer.js',
                'resources/js/web_cart_global.js',

            ],
            refresh: true,
        }),
    ],
//   build: {
//         outDir: '../../public_html/build', // Ruta relativa desde la carpeta de Laravel
//     },

});
