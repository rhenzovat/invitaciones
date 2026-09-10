<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WebMasajeFaqSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('web_masaje_faq')->truncate();

        $faqs = [
            [
                'orden'    => 1,
                'icono'    => 'fas fa-question-circle',
                'titulo'   => '¿Qué es el masaje tántrico?',
                'contenido'=> '<p>El masaje tántrico es un masaje sensual de cuerpo completo con aceite que despierta tu cuerpo, libera emociones y sana la conexión entre el corazón y la sexualidad. Es una oportunidad para sentirte adorada, honrada y amada sin ningún tipo de expectativa. Una oportunidad para descubrir tu belleza y tu poder interior.</p><p>Es una celebración de tu feminidad conectada con el corazón. El objetivo es relajarte por completo, despertar tu energía erótica y permitir que fluya por todo tu cuerpo. Y a medida que esa energía fluye, te lleva a un viaje de dicha hacia estados superiores de conciencia y a descubrir quién eres realmente. Una posibilidad para despertar a la diosa que llevas dentro.</p>',
            ],
            [
                'orden'    => 2,
                'icono'    => 'fas fa-om',
                'titulo'   => '¿Qué significa masaje tántrico?',
                'contenido'=> '<p>La palabra "tantra" proviene de la raíz sánscrita "tan", que significa expandir o estirar. Un tantra es un instrumento para la expansión: expandir tu experiencia, tu conciencia y tu conexión contigo misma.</p><p>En el corazón de la práctica tántrica se encuentra la relación entre la conciencia y la energía. En la tradición, se les llama Shiva y Shakti: la consciencia y la fuerza vital que fluye a través de ti. No son entidades separadas. Donde va tu consciencia, va tu energía. Y a medida que tu energía fluye, tu consciencia se profundiza.</p><p>En un masaje tántrico, esto actúa a través del cuerpo. La relajación permite que la energía fluya con mayor libertad. La respiración facilita su flujo. El tacto consciente y amoroso la despierta. Y tu consciencia simplemente notando lo que sientes la dirige.</p>',
            ],
            [
                'orden'    => 3,
                'icono'    => 'fas fa-heart',
                'titulo'   => '¿Cuáles son los beneficios de un masaje tántrico?',
                'contenido'=> '<p>Un masaje tántrico puede:</p><ul><li>✦ Reducir el estrés emocional</li><li>✦ Aumentar la claridad mental</li><li>✦ Sanar traumas sexuales</li><li>✦ Revitalizar tu vida amorosa</li><li>✦ Reducir la ansiedad, la vergüenza y la sensación de bloqueo</li><li>✦ Aumentar la confianza en tu cuerpo</li><li>✦ Conectarte con el placer y el amor como parte de tu vida diaria</li><li>✦ Abrirte a experiencias sensitivas</li></ul>',
            ],
            [
                'orden'    => 4,
                'icono'    => 'fas fa-feather-alt',
                'titulo'   => '¿Qué hace que un masaje sea tántrico?',
                'contenido'=> '<p>El término masaje tántrico se usa comúnmente para referirse a un masaje sensual con un "final feliz". Y el masaje sensual puede ser una forma fantástica de explorar la sexualidad y los orgasmos. Sin embargo, un auténtico masaje tántrico:</p><ul><li>✦ Aspirará a acercarte a tu verdadero ser, a lo divino.</li><li>✦ Permitirá una gran presencia y consciencia, tanto en ti como en tu terapeuta.</li><li>✦ Transformará la energía sexual en energía erótica, una energía que fluye hacia el corazón y el amor.</li></ul><p><em>"La base misma del Tantra es la Maternidad de Dios y la glorificación de la mujer. Cada parte del cuerpo de una mujer debe considerarse Divinidad encarnada." — Sri Ramakrishna.</em></p>',
            ],
            [
                'orden'    => 5,
                'icono'    => 'fas fa-hands',
                'titulo'   => '¿Qué sucede en una sesión de masaje tántrico?',
                'contenido'=> '<p>El masaje comienza contigo acostada boca abajo. Se colocará suavemente una mano en tu espalda, a la altura del corazón, para que sientas la seguridad y el amor presentes, esenciales para esta experiencia revitalizante. Con suaves maniobras de masaje relajante, se buscará ayudarte a relajar tu cuerpo y permitir que tu energía interior fluya naturalmente.</p><p>A la mitad de la sesión, te invitarán a darte la vuelta y recibir caricias en la parte frontal de tu cuerpo. El objetivo es masajear cada parte de tu cuerpo, respetando los límites que se hayan acordado previamente.</p><p>Al finalizar el masaje, tendrás tiempo para relajarte e integrar la experiencia. Luego, se dedicará un momento de gratitud o una breve meditación para integrar tus energías a un nivel superior.</p>',
            ],
            [
                'orden'    => 6,
                'icono'    => 'fas fa-wind',
                'titulo'   => '¿Cómo fluye la energía en un masaje tántrico?',
                'contenido'=> '<p>A medida que tus energías se despierten naturalmente, se usarán caricias y un toque amoroso para amplificar y equilibrar las energías en todo tu cuerpo.</p><p>Se acarician puntos específicos del cuerpo, lo que puede desbloquear los canales de energía. También se estimulan las ubicaciones físicas de tus chakras; esto puede desbloquear energías y ayudar a que fluyan por tu cuerpo.</p><p>Se fomenta el movimiento ascendente de la energía sexual o kundalini desde tu base y, en particular, se impulsa hacia tu corazón. Es posible que tu cuerpo sienta la necesidad de moverse o temblar si hay mucha energía, y puedes permitir ese movimiento.</p>',
            ],
            [
                'orden'    => 7,
                'icono'    => 'fas fa-star',
                'titulo'   => '¿Qué se siente al recibir un masaje tántrico?',
                'contenido'=> '<p>Un masaje tántrico no se parece a un masaje tradicional. A nivel físico, te sentirás profundamente relajada y, a menudo, experimentarás un hermoso y placentero cosquilleo o vibraciones que recorren tu cuerpo.</p><p>A nivel emocional, puede ocurrir algo mágico y te sentirás profundamente amada y cuidada. Te sentirás absolutamente hermosa y valorada como la mujer extraordinaria que realmente eres.</p><p>Y a nivel espiritual, pueden ocurrir transformaciones que hacen que este tipo de experiencia se convierta en parte de tu vida: una mujer más despierta, vibrante, llena de amor y energía.</p>',
            ],
            [
                'orden'    => 8,
                'icono'    => 'fas fa-user-check',
                'titulo'   => '¿Es un masaje tántrico adecuado para mí?',
                'contenido'=> '<p>Puede que tengas algunas dudas o miedos sobre un masaje tántrico. Quizás te sientas demasiado mayor o incómoda con tu cuerpo. Quizás creas que no tienes derecho a disfrutar de placer o atención exclusivamente para ti. En realidad, esas son buenas razones para disfrutar del masaje.</p><p>Se ofrece un espacio seguro y amoroso, aceptándote tal como eres. Se ha trabajado con mujeres de toda edad, con personas de todas las formas y tamaños. Siempre se encuentra la belleza en cada mujer.</p><p>Si la experiencia te parece intimidante, se puede avanzar poco a poco o personalizarla para que te sientas cómoda y dentro de tus límites.</p>',
            ],
            [
                'orden'    => 9,
                'icono'    => 'fas fa-spa',
                'titulo'   => '¿Un masaje tántrico incluye un masaje yoni?',
                'contenido'=> '<p>El masaje yoni es un tipo específico de contacto consciente para la vulva y la vagina. Forma parte de un masaje tántrico, pero no es imprescindible.</p><p>El masaje tántrico genera una profunda relajación y una apertura a los flujos de energía. Al añadir un masaje yoni, se incorpora una enorme fuente de energía. Juntos, crean una oportunidad increíble para la sanación y las experiencias estimulantes.</p><p>Un masaje yoni solo debe realizarse con tu pleno consentimiento. <strong>Tu seguridad y tus límites son la máxima prioridad.</strong></p>',
            ],
            [
                'orden'    => 10,
                'icono'    => 'fas fa-seedling',
                'titulo'   => '¿Por qué se ofrecen masajes tántricos?',
                'contenido'=> '<p>La experiencia como masajista tántrico ha sido profunda. La conexión con el poder de lo femenino y con la sensualidad que a menudo necesita ser liberada fortalece la presencia, la intuición y la capacidad para ver la belleza profundamente oculta en cada persona.</p><p>Ver a las mujeres vivir con mayor confianza en sí mismas, libertad e irradiando sus hermosas cualidades es sumamente inspirador. El deseo de ver más de esto en el mundo llevó a formarse como terapeuta corporal para poder contribuir aún más a liberar una feminidad poderosa y auténtica.</p>',
            ],
            [
                'orden'    => 11,
                'icono'    => 'fas fa-map-marker-alt',
                'titulo'   => 'Masaje tántrico para mujeres en Lima',
                'contenido'=> '<p>Se ofrecen sesiones de masaje tántrico para mujeres en Lima. La especialidad es ayudar a mujeres que desean reconectar con su cuerpo y su erotismo, especialmente después de relaciones difíciles o traumas sexuales o emocionales.</p><p>Si el masaje tántrico no es lo tuyo ahora o prefieres empezar poco a poco, hay diversas opciones disponibles: desde masajes relajantes armónicos, masajes holísticos y ritual volcánico de relajación, entre otros.</p><p>Sean cuales sean tus aspiraciones, nos encantaría conversar contigo para descubrir qué es posible para ti.</p>',
            ],
        ];

        foreach ($faqs as $faq) {
            DB::table('web_masaje_faq')->insert(array_merge($faq, [
                'Activo'     => 'S',
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Seeded ' . count($faqs) . ' FAQ entries.');
    }
}
