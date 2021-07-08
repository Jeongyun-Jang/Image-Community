// PostList.js
import React from "react";
import {useSelector, useDispatch} from "react-redux"; //리덕스 가져오기위한 작업, useDispatch를 이용해 불러온다

import Post from "../components/Post";
import {actionCreators as postActions} from "../redux/modules/post";
import InfinityScroll from "../shared/InfinityScroll";
import {Grid} from "../elements";

//PsotList 페이지에 들어오는 순간 값을 가져온다
const PostList = (props) => {
    const dispatch = useDispatch();
    const post_list = useSelector((state) => state.post.list);
    const user_info = useSelector((state) => state.user.user);
    const is_loading = useSelector((state) => state.post.is_loading); 
    const paging = useSelector((state) => state.post.paging);

    const {history} = props;
    
    console.log(post_list); // 해보면 잘 출력 됨
    React.useEffect(() => {
      //if 조건문을 줘서 이미 작성된 게시글이 있다면 getPostFB를 하지 않고, 이미있던 리덕스에 작성한글을 맨 앞에 추가
        if(post_list.length < 2){  //최대 한개만 들어가므로 < 2 
             dispatch(postActions.getPostFB());//actioncreators에서 가지고 옴
        }
       
    }, []);//두번째 파라미터에 빈 배열 들어가면 처음에 한번만 실행한다.

    return (
      <React.Fragment>
        <Grid bg={"#EFF6FF"} padding="20px 0px">
          {/* <Post/> */}
          <InfinityScroll //무한 스크롤은 스크롤을 예측해 끝자락일 때 next 페이지 불러오는 것
            callNext={() => {//스크롤할 때 실행되는 함수
              /*
                console.log("next!");
              */
              dispatch(postActions.getPostFB(paging.next));//다음 목록 paging.next를 가져온다
            }}
            is_next={paging.next ? true : false}
            loading={is_loading} //is_loading이 false일 때 callNext가 실행 안됨
          >
            {post_list.map((p, idx) => {
              if (p.user_info.user_id === user_info?.uid) {//p에 있는 user_info.user_id 가 내가가지고오 uid와 같다면 <Post>에 is_me를 준다.
                return (
                  //클릭한 Post의 PostDetail 페이지로 가도록
                  //Grid컴포넌트에 key={p.id}를 줘야한다.
                  <Grid
                    bg="#ffffff"
                    margin="8px 0px"
                    key={p.id}
                    _onClick={() => {
                      history.push(`/post/${p.id}`);
                    }}
                  >
                    {/* map을 쓰려면 꼭 key 사용  포스트 정보 넘어오게 : {...p}*/}
                    <Post key={p.id} {...p} is_me /> {/* is_me라는 값으로 내 작성자인지 넘겨줘 수저가능 여부 판별*/}
                  </Grid>
                );
              } 
              
              
              else {
                return (
                  <Grid
                    key={p.id}
                    bg="#ffffff"
                    _onClick={() => {
                      history.push(`/post/${p.id}`);
                    }}>
                    <Post {...p} />
                  </Grid>
                );
              }
            })}
          </InfinityScroll>
          {/* 잘 로딩되나 확인 용 btn*/}
          {/* 
          <button onClick={()=>{
            console.log(paging);
            dispatch(postActions.getPostFB(paging.next));
          }}>추가로드 btn</button>
           */}
        </Grid>
      </React.Fragment>
    );
}

export default PostList;

