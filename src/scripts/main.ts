import AuthController from "../controllers/AuthController";
import Router from "../core/Router";
import ROUTES from "./route.settings";
import "../styles/main.scss";

/**
 * запрашиваем пользователя
 * если есть кука, получим 200 и отправим в /messenger
 * если куки нет - на страницу авторизации
 */
const authController = new AuthController();
await authController.entryPoint();

const router = Router.getInstance(ROUTES);
router.gotoHidden(window.location.pathname);
