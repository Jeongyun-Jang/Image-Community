//게시글 작성 페이지

import React from "react";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import CommentWrite from "../components/CommentWrite";

import Permit from "../shared/Permit";

import { useDispatch, useSelector } from "react-redux";

import { actionCreators as postActions } from "../redux/modules/post";

const PostDetail = (props) => {
  const dispatch = useDispatch();

  const id = props.match.params.id; // props로 받은 id 값

  const user_info = useSelector((state) => state.user.user); //is_me 정보 가져오는 곳

  const post_list = useSelector((store) => store.post.list);

  const post_idx = post_list.findIndex((p) => p.id === id);//post_idx에서 p.id가 id인 index 찾는다
  const post = post_list[post_idx]; //post_list에서 id 값에 맞는 post 가져오기
  //const [psot, setPost] = React.useState(post_data? post_data : null);

  React.useEffect(() => {

    /*
    const postDB = firestore.collection("post");
    postDB.doc(id).get().then(doc=>{
      console.log(doc);
      console.log(doc.data());
    })*/
    
    if (post) {//포스트가 있으면 있는거 return
      return;
    }

    dispatch(postActions.getOnePostFB(id));//포스트 없다면 data 하나만 firestore에서 가져오기
  }, []);

  return (
    <React.Fragment>
      {/* post && 조건도 처리하는 이유는 url 주소 값이 올바르지 않을 때를 대비 */}
      {post && (
        <Post {...post} is_me={post.user_info.user_id === user_info?.uid} />
      )}
      <Permit>{/* 로그인 상태인 경우만 보여준다. */}
        <CommentWrite post_id={id} /> {/*post_id 댓글 달 때 필요*/}
      </Permit>
      <CommentList post_id={id} /> {/*post_id 댓글 보여줄 때 필요*/}
    </React.Fragment>
  );
};

export default PostDetail;
