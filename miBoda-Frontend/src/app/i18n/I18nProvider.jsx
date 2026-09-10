import React from "react";
import { useSelector } from "react-redux";
import { IntlProvider } from "react-intl";
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/dist/locale-data/en";
import "@formatjs/intl-relativetimeformat/dist/locale-data/es";

import enMessages from "./messages/en";
import esMessages from "./messages/es";

const allMessages = {
    en: enMessages,
    es: esMessages,
    //fr: frMessages,
    //ja: jaMessages,
    //zh: zhMessages
};

export default function I18nProvider({ children }) {
    const locale = useSelector(({ i18n }) => i18n.lang);
    //const locale = useSelector(({ i18n }) => "es");
    const messages = allMessages[locale];

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );

}