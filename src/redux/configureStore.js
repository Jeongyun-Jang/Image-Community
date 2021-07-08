import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { createBrowserHistory } from "history";
import { connectRouter } from "connected-react-router";

import User from "./modules/user";
import Post from "./modules/post";
import Image from "./modules/image";
import Comment from "./modules/comment";

export const history = createBrowserHistory();

const rootReducer = combineReducers({//combineReducers이용해서 export한 reducers 모아 root reducer 만든다.
  user: User,
  post: Post,
  image: Image,
  comment: Comment,
  router: connectRouter(history),
});

const middlewares = [thunk.withExtraArgument({ history: history })]; //미들웨어 적용

// 지금이 어느 환경인 지 알려줘요. (개발환경, 프로덕션(배포)환경 ...)
const env = process.env.NODE_ENV;

// 개발환경에서는 로거라는 걸 하나만 더 써볼게요.
if (env === "development") {
  const { logger } = require("redux-logger");
  middlewares.push(logger);
}

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middlewares)); //미들웨어 묶기

let store = (initialStore) => createStore(rootReducer, enhancer); //createStore사용해서 root reducer와 미들웨어 엮어 스토어 만든다.

export default store();
