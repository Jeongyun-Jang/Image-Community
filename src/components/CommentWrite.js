//for PostDetails.js
import React from "react";
import { Grid, Input, Button } from "../elements";

import { actionCreators as commentActions } from "../redux/modules/comment";
import { useDispatch} from "react-redux";

const CommentWrite = (props) => {
  const dispatch = useDispatch();
  const [comment_text, setCommentText] = React.useState(); //작성한 텍스트를 저장해 놓는 공간

  const {post_id} = props;

  const onChange = (e) => {
    setCommentText(e.target.value); //input 값을 바꿔줌
  };

  const write = () => { //
    //console.log(comment_text);
    dispatch(commentActions.addCommentFB(post_id, comment_text)); //comment.js의 ADD_COMMENT Action에 comment 정보를 보내주기 위함
    setCommentText("");//작성 btn 누르면 input textbox에 담겨있던 댓글 지움 
  };

  return (
    <React.Fragment>
      <Grid padding="16px" is_flex> {/* is_flex 주면 한 행에 2개의 열 (input 과 button)이 배치된다. */}
        <Input
          placeholder="댓글 내용을 입력해주세요 :)"
          _onChange={onChange} //입력이 이루어지는 내내 onChange함수 실행
          value={comment_text}
          onSubmit={write}
          is_submit //Input.js 처리를 위한
        />
        <Button width="50px" margin="0px 2px 0px 2px" _onClick={write}>
          작성
        </Button>
      </Grid>
    </React.Fragment>
  );
};

export default CommentWrite;
