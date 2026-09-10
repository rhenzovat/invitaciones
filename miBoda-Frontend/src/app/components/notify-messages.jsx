//import notify from "devextreme/ui/notify";
import Swal from 'sweetalert2';
// import { toAbsoluteUrl } from "../../../_metronic/utils/utils";
import notify from "devextreme/ui/notify";
import { toast } from "react-toastify";

const customMessageHandlerElementId = 'customMessageHandlerElementId';

export function handleErrorMessages(msgTitle, error, custom = false) {
    if (!!custom) {
        handleInfoMessages(msgTitle, error);
        return;
    }

    // ✅ PRIMERO: Errores del servidor (con response)
    if (error?.response) {
        let dataError = error.response;
        let data = dataError.data || {};

        // 📌 CASO ESPECÍFICO: Error 422 de validación de Laravel
        if (dataError.status === 422) {
            // Extraer el primer mensaje de error de validación de los campos
            if (data.errors) {
                const firstErrorField = Object.keys(data.errors)[0];
                const firstErrorMessage = data.errors[firstErrorField];
                const mensaje = Array.isArray(firstErrorMessage) ? firstErrorMessage[0] : firstErrorMessage;
                handleWarningMessages(msgTitle, mensaje);
                return;
            }
            // Si hay responseException
            if (data.responseException?.exceptionMessage) {
                handleWarningMessages(msgTitle, data.responseException.exceptionMessage);
                return;
            }
            // Si hay message
            if (data.message) {
                handleWarningMessages(msgTitle, data.message);
                return;
            }
        }

        // Resto de códigos de estado
        let { responseException } = data;
        if (responseException) {
            let { exceptionMessage } = responseException;
            switch (dataError.status) {
                case 400:
                    handleWarningMessages(msgTitle, exceptionMessage);
                    break;
                case 500:
                    const { title, status } = exceptionMessage;
                    localHandleErrorMessages(status + "-" + title, "");
                    break;
                default:
                    localHandleErrorMessages(msgTitle, exceptionMessage);
                    break;
            }
        } else {
            switch (dataError.status) {
                case 404:
                    localHandleErrorMessages(msgTitle, data);
                    break;
                case 401:
                    handleInfoMessagesRedirect(msgTitle, "¡Ha finalizado, el inicio de sesión. Vuelva a ingresar, por favor!");
                    break;
                default:
                    localHandleErrorMessages(msgTitle, data?.message || "Error no especificado");
                    break;
            }
        }
    }
    // ✅ SEGUNDO: Errores de validación del cliente (sin response)
    else if (error && error.message) {
        handleWarningMessages(msgTitle, error.message);
    }
    // ✅ TERCERO: Error sin mensaje
    else {
        localHandleErrorMessages("Server connection error", "");
    }
}

export function handleSuccessMessages(title, message) {
    notificar(title, message, "success");
}

export function handleErrorMessagesSimple(title, message) {
    notificar(title, message, "error");
}

function localHandleErrorMessages(title, message) {
    notificar(title, message, "error");
}

export function handleInfoMessages(title, message) {
    notificar(title, message, "info");
}
export function handleInfoMessagesRedirect(title, message) {
    notificarRedirect(title, message, "info");
}
export function handleWarningMessages(title, message) {
    notificar(title, message, "warning",
        // toAbsoluteUrl("/media/iconsapp/notify_warning.png")
        null
    );
}

function notificar(tittle, message, type, imgUrl = null) {
    Swal.fire({
        title: tittle,
        text: message,
        icon: imgUrl ? null : type,
        imageUrl: imgUrl,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, type, 3500);

}


function notificarRedirect(tittle, message, type, imgUrl = null) {

    Swal.fire({
        title: tittle,
        text: message,
        icon: imgUrl ? null : type,
        imageUrl: imgUrl,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, type, 3500).then((result) => {
        if (result.isConfirmed) {
            //const fullDomain = `${window.location.protocol}//${window.location.hostname}:5173`;
            // window.location.href = window.location.href.replace(/#.*$/, '');
            window.location.href = window.location.href;
        }
    })

}


export function notificarCustomer(tittle, message, type, imgUrl = null) {
    Swal.fire({
        title: tittle,
        text: message,
        icon: imgUrl ? null : type,
        imageUrl: imgUrl,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, type, 3500);

}

export function toasts(icon, message) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: false,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        borderRadius: "20px",
        height: "90px",
        width: "450px",
        fontSize: "25px",
        fontWeight: "700",
        lineHeight: "28px",
        letterSpacing: "0.75px,"
    })

    Toast.fire({
        icon: icon,
        title: message
    })
}

export function handleSuccessMessagesHTML(title, message) {
    notificarHtml(title, message, "success");
}

function notificarHtml(tittle, message, type, imgUrl = null) {
    Swal.fire({
        title: tittle,
        html: message,
        icon: imgUrl ? null : type,
        imageUrl: imgUrl,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, type, 3500);

}

export async function confirmAction(title = "Confirmar", confirmButtonText = "SI", cancelButtonText = "NO") {
    return Swal.fire({
        title,
        icon: 'question',
        iconHtml: '?', //'؟'
        confirmButtonText,
        cancelButtonText,
        showCancelButton: true,
        showCloseButton: true,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, 'question', 3500);
}

export const customMessageHandler = (message, { displayTime = 30000, type = 'warning', position = 'top center', closeOnClick = true } = {}) => {
    notify({ message, type, elementAttr: { id: customMessageHandlerElementId }, position, displayTime, closeOnClick });
}
//Notificador - Otra Forma de notificacion
export function toastSuccess(message) {
    toast.success(message);
}
export function toastInfo(message) {
    toast.info(message);
}
export function toastError(message) {
    toast.error(message);
}
