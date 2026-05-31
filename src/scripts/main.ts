import Router from "../core/Router";
import ROUTES from "./route.settings";
import "../styles/main.scss";

const router = Router.getInstance(ROUTES);
router.goto(window.location.pathname);
