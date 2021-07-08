//for PostDetails.js
//한파일에 여러개 컴포넌트를 넣어도 된다. CommentList와 CommentItem
import React from "react";
import {Grid, Image, Text} from "../elements";

import {useDispatch, useSelector} from "react-redux";
import {actionCreators as commentActions} from "../redux/modules/comment";

const CommentList = (props) => {
  const dispatch = useDispatch();
  const comment_list = useSelector(state => state.comment.list);

  const {post_id} = props;

  React.useEffect(() => {

    if(!comment_list[post_id]){ //해당 list가 없을 때
      dispatch(commentActions.getCommentFB(post_id)); //dispatch
    }
  }, []);
  
  if(!comment_list[post_id] || !post_id){ //comment_list[post_id]가 없거나 post_id가 안넘어 올 때
    return null;
  }

  return (
    <React.Fragment>
      <Grid padding="16px">
        {comment_list[post_id].map(c => { //comment_list에 해당 id로 있는 댓글들 불러온다.
          return <CommentItem key={c.id} {...c}/>;
        })}
      </Grid>
    </React.Fragment>
  );
};

CommentList.defaultProps = {
  post_id: null,
}

export default CommentList;


const CommentItem = (props) => {//리스트 하나하나

    const {user_profile, user_name, user_id, post_id, contents, insert_dt} = props;

    return (
        <Grid is_flex>{/* 가로로 배치하기 */}
            <Grid is_flex width="auto">
                <Image shape="circle"/>
                <Text bold>{user_name}</Text>
            </Grid>
            <Grid is_flex margin="0px 4px"> {/* text 간격 */}
                <Text margin="0px">{contents}</Text>
                <Text margin="0px">{insert_dt}</Text>
            </Grid>
        </Grid>
    )
}

CommentItem.defaultProps = {
    user_profile: "",
    user_name: "mean0",
    user_id: "",
    post_id: 1,
    contents: "귀여운 고양이네요!",
    insert_dt: '2021-01-01 19:00:00'
}