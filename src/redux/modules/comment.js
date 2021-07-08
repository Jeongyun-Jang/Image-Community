import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, realtime } from "../../shared/firebase"; //realtime for 알림뱃지
import "moment";
import moment from "moment";

import firebase from "firebase/app";

import { actionCreators as postActions } from "./post";

const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT";

const LOADING = "LOADING";

const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({
  post_id,
  comment_list,
}));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({
  post_id,
  comment,
}));

const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: {},
  is_loading: false,
};

const addCommentFB = (post_id, contents) => { //post의 아이디와, 입력한 댓글 가져온다.
  return function (dispatch, getState, { history }) {
    const commentDB = firestore.collection("comment");
    const user_info = getState().user.user;

    let comment = { //댓글 관련 정보들 넣는 변수
      post_id: post_id,
      user_id: user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    commentDB.add(comment).then((doc) => { //firestore에 comment 넣음
      const postDB = firestore.collection("post");

      const post = getState().post.list.find((l) => l.id === post_id);

      const increment = firebase.firestore.FieldValue.increment(1); //increment()괄호안의 숫자만큼 현재 가진 값에 더해줌

      comment = {...comment, id: doc.id};
      postDB
        .doc(post_id)//doc의 post_id 값을 가져와서
        .update({ comment_cnt: increment }) //comment_cnt 값을 +1
        .then((_post) => {// 댓글 작성 성공 & post 게시물 firestore에 comment_cnt 값 +1로 업데이트까지 성공한 경우 _post
          
          dispatch(addComment(post_id, comment));

          if (post) {//post의 게시물 정보 리덱스의 cmment_cnt 값을 +1한 값으로 수정해준다.(editPostFB 아니고 editPost !!리덕스 고치는 거니까)
            dispatch(
              postActions.editPost(post_id, {
                comment_cnt: parseInt(post.comment_cnt) + 1, //문자랑 숫자를 더하면 문자가 나오기 때문에 변수 타입이 확실하지 않은 경우 원하는 타입으로 형변환이 필요하다.
              })
            );
            
            //게시글 작성한 사람에게 알람이가도록
            const _noti_item = realtime.ref(`noti/${post.user_info.user_id}/list`).push();//ref로 해당 경로 참조 가져와 

            _noti_item.set({//set 1번째 파라미터 : , 2번째 파라미터 : error일 때
              post_id: post.id,
              user_name: comment.user_name,//user.user_name 아님, 댓글 단 사람의 user_name
              image_url: post.image_url,
              insert_dt: comment.insert_dt //알림 페이지에서 소팅하기 위함
            }, (err) => {
              if(err){
                console.log("알림 저장에 실패했어요! 8ㅛ8");
              }else{
                const notiDB = realtime.ref(`noti/${post.user_info.user_id}`);

                notiDB.update({read: false});//알람 울리도록
              }
            });

          }
        });
    });
  };
};

const getCommentFB = (post_id = null) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) { //post_id = null라면 query 날릴게 없으므로 return
      return;
    }

    const commentDB = firestore.collection("comment");

    //where() 괄호안 댓글들은 post와 관련된 댓글만 나와야하므로
    commentDB
      .where("post_id", "==", post_id) //작
      .orderBy("insert_dt", "desc")//정렬 기준 : 날짜 역순(최신순 desc)
      .get()//가져오고
      .then((docs) => {//쿼리 결과물 리스트 받아옴
        //post 가져올 때 처럼 하나씩 처리
        let list = [];

        docs.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id });// doc.data(), comment의 id
        });

        dispatch(setComment(post_id, list)); //post_id와 comment list 넘겨준다.
      })
      .catch((err) => {
        console.log("댓글 정보를 가져올 수가 없네요!", err);
      });
  };
};

export default handleActions(
  {
    [SET_COMMENT]: (state, action) =>
    //댓글 정보를 담을 dict를 만들어 구성 ex. let data = {[post_id]: com_list, ...}
      produce(state, (draft) => {
        draft.list[action.payload.post_id] = action.payload.comment_list;
      }),
    [ADD_COMMENT]: (state, action) => produce(state, (draft) => {
      //작성한 comment가 기존의 comment list에 추가가 된다. 추가될 때 가장 최근에 입력한 댓글이 리스트의 맨 앞으로 가게 한다.
      draft.list[action.payload.post_id].unshift(action.payload.comment);
    }),
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
  },
  initialState
);

const actionCreators = {
  getCommentFB,
  addCommentFB,
  setComment,
  addComment,
};

export { actionCreators };
