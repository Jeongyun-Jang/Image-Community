// createAction ,handleActions 사용하면 쉬움
import { createAction, handleActions } from "redux-actions";
import { produce } from "immer"; // 리듀서 만들 때 불변성 유지를 위해 immer 사용
import { firestore, storage } from "../../shared/firebase";
import "moment";
import moment from "moment";

import { actionCreators as imageActions } from "./image"; //저장이 완료되고 preview 값을 다시 원래대로 바꿔주기 위해

//action type
const SET_POST = "SET_POST";//for 목록 가지고 와 리덕스에 넣어줌
const ADD_POST = "ADD_POST";//리덕스 목록에 추가
const EDIT_POST = "EDIT_POST";
const LOADING = "LOADING";

//action 생성자
const setPost = createAction(SET_POST, (post_list, paging) => ({ post_list, paging }));//post_list: 리스트
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading })); //

const initialState = { 
  list: [],  
  paging: { start: null, next: null, size: 3 }, //시작점 정보, 다음 목록, 사이즈
  is_loading: false,//로딩중이니?
};

const initialPost = {
  //주석처리한 부분은 postWrite에서 사용자가 입력하는 내용이 아니므로 initialPost에 담지 않는다. 
  // id: 0,
  // user_info: {
  //   user_name: "mean0",
  //   user_profile: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  // },
  image_url: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  contents: "",
  comment_cnt: 0,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"), //현재시간
};

const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }
    //이미지가 업로드 됐나 안됐나 확인하는 방법
    //이미지를 새로 업로드 한 경우는 data_url로 preview가 들어감
    //그렇지 않은 경우는 url넘겨 링크가 들어감
    const _image = getState().image.preview;

    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];

    console.log(_post);

    const postDB = firestore.collection("post");


    //이전 시간에 preview에 업로드 하는 작업할 때 input에 파일이 들어가 있다가 파일 리더로 읽어서 preview에 넣어줬음. preview에 data_url로 들어가 있다. 
    //만약 파일을 새로 업로드 하지 않았다면 임의로 넣어줬던 이미지 링크가 들어가 있을 것이다.
    //아래는 두 값을 비교해 같은지 아닌지를 확인하는 과정이다.

    if (_image === _post.image_url) {//_post의 이미지 url과 preview가 같다면 이미지 업로드가 안된거
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }));
          history.replace("/");
        });

      return;
    } else {//data url로 바뀌어있거나 null이 들어가 있으면 이미지
      const user_id = getState().user.user.uid;
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url");

      _upload.then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            console.log(url);

            return url;
          })
          .then((url) => {
            postDB
              .doc(post_id)
              .update({ ...post, image_url: url })
              .then((doc) => {
                dispatch(editPost(post_id, { ...post, image_url: url }));
                history.replace("/");
              });
          })
          .catch((err) => {
            window.alert("앗! 이미지 업로드에 문제가 있어요!");
            console.log("앗! 이미지 업로드에 문제가 있어요!", err);
          });
      });
    }
  };
};

const addPostFB = (contents = "") => { // firestore에 추가
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");

    const _user = getState().user.user; //store에 있는 정보를 getState로 가져옴

    const user_info = {
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    };

    const _post = {
      ...initialPost,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    const _image = getState().image.preview; //// getState()로 store의 상태값에 접근할 수 있어요! preview 불러옴

    console.log(_image);
    console.log(typeof _image); //string 형태
    /*
    console.log({ ...user_info, ..._post, image_url: url }); //값이 잘 불러와지다찍어본다.
    return 
    */
   //게시글(comments)을 작성하기 전에 이미지를 먼저 업로드하고 성공했을 때만 firestore에 게시글 정보를 저장하도록 함
    const _upload = storage //storage를 가져와 ref 설정한다. 
    //이때 중복된 파일 생기지 않기 위해 파일명을 id는 고유값을 이용해서 한다. user_id + _ + 현재 시간(밀리초)으로 저장
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url"); //Data URL String

    _upload.then((snapshot) => {// 업로드 잘되었나 확인 -> snapshot이 우리가 올린 파일
      snapshot.ref
        .getDownloadURL()
        .then((url) => {
          console.log(url);

          return url; //url을 return 해주면 아래 then부분에서 url을 사용할 수 있다.
        })
        .then((url) => {
          postDB
            .add({ ...user_info, ..._post, image_url: url })
            .then((doc) => {//then안에는 추가된 것이 들어간다 then은 업로드 잘 끝난 후에 실행됨
              let post = { user_info, ..._post, id: doc.id, image_url: url }; // 위에 선언 된 user_info, post 전부, id, addpost
              dispatch(addPost(post)); //만들었던 것 add
              history.replace("/");

              dispatch(imageActions.setPreview(null)); //null로 바꿔 preview를 비워준다.
            })
            .catch((err) => {
              window.alert("앗! 포스트 작성에 문제가 있어요!");
              console.log("post 작성에 실패했어요!", err);
            });
        })
        .catch((err) => {
          window.alert("앗! 이미지 업로드에 문제가 있어요!");
          console.log("앗! 이미지 업로드에 문제가 있어요!", err);
        });
    });
  };
};

const getPostFB = (start = null, size = 3) => {//전부다 가져올게 아니면 ()안에 조건을 지정하기

  return function (dispatch, getState, { history }) {

    let _paging = getState().post.paging; //getState()로 페이징 데이터를 가지고 와 _paging 에 넣어 준다.

    if(_paging.start && !_paging.next){//만약 이 페이징에서 start 값이 있는데 다음 목록이 없는 없다면 return.
      return;
    }

    dispatch(loading(true));//로딩중일 때 dispatch loading해줌
    const postDB = firestore.collection("post"); //firebase의 콜렉션 선택

    postDB.get().then((docs)=>{
      docs.forEach((doc)=>{
        console.log(doc.id, doc.data());
      })
    }) 

    let query = postDB.orderBy("insert_dt", "desc"); //firebase data postDB를 가져와 insert_dt 기준으로 정렬

    if(start){//파라미터로 가져오는 start 값이 있다면
      query = query.startAt(start);//query에다가 firebase startAt함수를 쓴 query.startAt(start);를 대치해 줘야한다.
    }


    query
      .limit(size + 1) //limit 사이즈보다 1개 더 가져와서 다음페이지것 까지 가져온다.
      .get()
      .then((docs) => {
        let post_list = [];

        let paging = {
          start: docs.docs[0],//docs중 제일 처음것
          next: docs.docs.length === size+1? docs.docs[docs.docs.length -1] : null, //길이가 size+1이면 다음페이지에 가기위해 docs.docs[docs.docs.length -1]번째로 저장 size+1과 크기 같음, 사이즈가 맞지 않으면 null
          size: size,//받아오 ㄴ사이즈 그대로 입력
        }

        docs.forEach((doc) => {
          let _post = doc.data(); //firestire에서 가져온 값 

          /* //아래와 같은 것
            let post = {
              id: doc.id,
              user_info: {
                user_name: _post.user_name,
                user_profile: _post.user.user_profile,
                user_id: _post.user_id,
              },
              image_url: _post.image_url,
              contenst: _post.contents,
              comment_cnt: _post.cooment_cnt,
              insert_dt: _post.insert_dt,
            };
          */

          // ['commenct_cnt', 'contents', ..]
          let post = Object.keys(_post).reduce( //딕셔너리의 key값들을 배열로 만들어준다. 배열을,  recude
            (acc, cur) => {
              if (cur.indexOf("user_") !== -1) { //cur 에 user_ 가 포함되어 있다면
                return {
                  ...acc,
                  user_info: { ...acc.user_info, [cur]: _post[cur] },
                };
              }
              return { ...acc, [cur]: _post[cur] }; // 연산된 id: doc.id가 acc에 들어감 & [key값]: _post[key값] 
            },
            { id: doc.id, user_info: {} }
          );

          post_list.push(post);
        });

        post_list.pop(); // 

        console.log(post_list);

        dispatch(setPost(post_list, paging)); //  
      });
  };
};

const getOnePostFB = (id) => {//하나의 포스트만 가지고 오기 위함
  return function(dispatch, getState, {history}){
    const postDB = firestore.collection("post");
    postDB
      .doc(id)
      .get()
      .then((doc) => {
        console.log(doc);
        console.log(doc.data());

        let _post = doc.data();
        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user_") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              };
            }
            return { ...acc, [cur]: _post[cur] };
          },
          { id: doc.id, user_info: {} }
        );

        dispatch(setPost([post])); //post를 배열 형태로 
      });
  }
}
//reducer 
export default handleActions( //immer를 이용한 불변성 관리
  {
    [SET_POST]: (state, action) => 
      produce(state, (draft) => {//불변성 관리 위해 produce이용. produce 두번째 인자에 ~~한거 할거야 정의
        draft.list.push(...action.payload.post_list);//...로 리스트에 있는 post를 하나하나씩 추가해준다.

        draft.list = draft.list.reduce((acc, cur) => {//reduce이용해 중복 값 제거 acc는 누산된 값, cur은 현재 값
          if(acc.findIndex(a => a.id === cur.id) === -1){ //id 중복 된 값 없음
            return [...acc, cur]; //기존 배열 acc, cur 
          }else{//중복 되었을 때 (누산된 acc 배열 중 a의 포스트의 id가 현재 가지고 있는 post의 id와 같을 때)
            acc[acc.findIndex((a) => a.id === cur.id)] = cur; //게시글 순서대로 정렬
            return acc;//중복된 값 추가 없이 acc return
          }
        }, []);


        if(action.payload.paging){//paging이 있는 경우에만
          draft.paging = action.payload.paging;
        }
        
        draft.is_loading = false; //SET_POST 땐 다 불러왔으니 무조건 로딩아님 So false로 바꿈
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => { 
        draft.list.unshift(action.payload.post); //.push 하면 배열의 뒤에 붙음, unshift로 배열의 앞에 붙도록 함
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id); //list는 배열, findIndex하면 괄호안 조건에 맞는 인덱스가 반환 됨. 맞지 않는 경우는 인덱스를 찾을 수 없는 경우인데 위에서 다 확인하고 넘어오므로 지금은 그런 경우 없음

        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };//찾은 인덱스 위치 값을 action.payload.post 값으로 변경
      }),
    [LOADING]: (state, action) => produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      })
  },
  initialState
);

const actionCreators = {//actionCreators로 액션들 묶어 한번에 export
  setPost,
  addPost,
  editPost,
  getPostFB,
  addPostFB,
  editPostFB,
  getOnePostFB,
  //isloading은 가지고올 때 true, false 판단하는 것임으로 export 필요 x
};

export { actionCreators };
