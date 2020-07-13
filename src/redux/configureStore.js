import { createStore, applyMiddleware, compose, combineReducers } from "redux"
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly"
import { createLogger } from "redux-logger"
import { routerReducer, routerMiddleware } from "react-router-redux"
import createHistory from "history/createBrowserHistory"
import thunk from "redux-thunk"
import { persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import expireReducer from "redux-persist-expire"

import { initialState as loginInitialState } from "../modules/auth/reducers/reducer"
import reducers from "./reducers"
// import routes from "../routes"

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["login"],
  transforms: [
    expireReducer("login", {
      expireSeconds: 10 * 60,
      expiredState: loginInitialState,
      autoExpire: true,
    }),
  ],
}

export const history = createHistory()
const middleware = routerMiddleware(history)
const combinedReducers = persistReducer(
  persistConfig,
  combineReducers({ ...reducers, routerReducer })
)

const composer = composeWithDevTools || compose

const {
  location: { pathname },
  localStorage,
} = window
const firstUsage = localStorage.getItem("IS_FIRST_USAGE")
if (pathname === "/" && firstUsage) {
  history.push({ pathname: "/home" })
}

// const forceHttps = () => next => action => {
//   const {
//     location: { href, hostname, protocol, pathname },
//   } = window
//   const urlExist = routes.find(route => route.path === pathname)
//   if (hostname !== "localhost" && (protocol === "http" || !urlExist)) {
//     history.push({ pathname: "/home" })
//     const httpsUrl = href.replace(/^http:\/\//i, "https://")
//     window.location.href = httpsUrl
//   }
//   next(action)
// }

export function configureStore(initialState) {
  const logger = createLogger({
    predicate: () => process.env.REACT_APP_ENV !== "prod",
  })

  // const logger = createLogger()

  const enhancer = composer(applyMiddleware(thunk, logger, middleware))

  return createStore(combinedReducers, initialState, enhancer)
}
