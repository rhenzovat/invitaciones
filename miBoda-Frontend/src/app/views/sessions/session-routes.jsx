import { lazy } from "react";
import Loadable from "../../components/Loadable";

const NotFound = lazy(() => import("./NotFound"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));

const JwtLogin = Loadable(lazy(() => import("./login/JwtLogin")));
const JwtRegister = Loadable(lazy(() => import("./register/JwtRegister")));
const OAuthCallback = Loadable(lazy(() => import("./login/OAuthCallback")));
const TwoFactorChallenge = Loadable(lazy(() => import("./login/TwoFactorChallenge")));
const TwoFactorMandatorySetup = Loadable(lazy(() => import("./login/TwoFactorMandatorySetup")));

const sessionRoutes = [
  { path: "/session/signup", element: <JwtRegister /> },
  { path: "/session/signin", element: <JwtLogin /> },
  { path: "/session/oauth-callback", element: <OAuthCallback /> },
  { path: "/session/two-factor", element: <TwoFactorChallenge /> },
  { path: "/session/two-factor-setup", element: <TwoFactorMandatorySetup /> },
  { path: "/session/forgot-password", element: <ForgotPassword /> },
  { path: "*", element: <NotFound /> }
];

export default sessionRoutes;
