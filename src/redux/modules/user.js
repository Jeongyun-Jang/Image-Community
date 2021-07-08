import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";

import { setCookie, getCookie, deleteCookie } from "../../shared/Cookie";

import { auth } from "../../shared/firebase";
import firebase from "firebase/app";

// actions
const LOG_OUT = "LOG_OUT";
const GET_USER = "GET_USER";
const SET_USER = "SET_USER";

// action creators
const logOut = createAction(LOG_OUT, (user) => ({ user }));
const getUser = createAction(GET_USER, (user) => ({ user }));
const setUser = createAction(SET_USER, (user) => ({ user }));

// initialState
const initialState = {
  user: null,
  is_login: false,
};

// middleware actions
const loginFB = (id, pwd) => {
  return function (dispatch, getState, { history }) {
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then((res) => {
      auth
        .signInWithEmailAndPassword(id, pwd) //firebase 인증 기능으로 이메일 패스워드 이용해서 로그인하기 (firebase 공식문서 참고)
        .then((user) => {//user 정보를 가지고 오고 싶을 땐 then()괄호 안에다 넣어준다.
          
          console.log(user);
          //cf. username을 가져오는 다른 방법: auth.currentUser를 사용한다.
          dispatch(
            setUser({
              user_name: user.user.displayName,
              id: id,
              user_profile: "",
              uid: user.user.uid,//고유값인 id를 저장해주기
            })
          );

          history.push("/");
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;

          console.log(errorCode, errorMessage);
        });
    });
  };
};

const signupFB = (id, pwd, user_name) => {//유저의 형식은 아이디,이메일,닉네임
  return function (dispatch, getState, { history }) {
    auth
      .createUserWithEmailAndPassword(id, pwd)
      .then((user) => {//성공시
        console.log('firestore 인증 성공');
        console.log(user);

        auth.currentUser
          .updateProfile({ //id, pwd 만 들어있으므로 user_name도 firestore에 update
            displayName: user_name,
          })
          .then(() => {//user리덕스에도 넣어주기 
            dispatch(
              setUser({
                user_name: user_name,
                id: id,
                user_profile: "",
                uid: user.user.uid, //uid는 auth에서 주는 값이다. 현재 사용자를 가져올 때 user.user.uid처럼 사용한다.
              })
            );
            history.push("/");
          })
          .catch((error) => {//fireStore에 넣는게 실패한 경우
            console.log('firestore에 넣는거 실패');
            console.log(error);
          });

        // Signed in
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('firestore 인증 실패');
        console.log(errorCode, errorMessage);
        // ..
      });
  };
};

const loginCheckFB = () => {
  return function (dispatch, getState, {history}){
    auth.onAuthStateChanged((user) => {
      if(user){
        dispatch(
          setUser({
            user_name: user.displayName,
            user_profile: "",
            id: user.email,
            uid: user.uid,
          })
        );
      }else{
        dispatch(logOut());
      }
    })
  }
}

const logoutFB = () => {
  return function (dispatch, getState, {history}) {
    auth.signOut().then(() => {
      dispatch(logOut());
      history.replace('/');
    })
  }
}

// reducer
export default handleActions(
  {
    [SET_USER]: (state, action) =>
      produce(state, (draft) => {
        setCookie("is_login", "success");
        draft.user = action.payload.user;
        draft.is_login = true;
      }),
    [LOG_OUT]: (state, action) =>
      produce(state, (draft) => {
        deleteCookie("is_login");
        draft.user = null;
        draft.is_login = false;
      }),
    [GET_USER]: (state, action) => produce(state, (draft) => {}),
  },
  initialState
);

// action creator export
const actionCreators = {
  logOut,
  getUser,
  signupFB,
  loginFB,
  loginCheckFB,
  logoutFB,
};

export { actionCreators };
