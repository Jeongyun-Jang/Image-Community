//로그인 여부에 따라 
import React from "react";
import { Grid, Text, Button, Image, Input } from "../elements";
import Upload from "../shared/Upload";

import { useSelector, useDispatch } from "react-redux";
import { actionCreators as postActions } from "../redux/modules/post";
import { actionCreators as imageActions } from "../redux/modules/image";

const PostWrite = (props) => {
  const dispatch = useDispatch();
  const is_login = useSelector((state) => state.user.is_login); //로그인 여부
  const preview = useSelector((state) => state.image.preview);//image.js에서 불러온 preview
  const post_list = useSelector((state) => state.post.list);

  const post_id = props.match.params.id;//현재 아이디 값을 가져 온다.리덕스에 저장해둔 포스트 내용을 찾음. 이것을 이용해 수정중인지 아닌지 판별 
  const is_edit = post_id ? true : false;

  const { history } = props;

  let _post = is_edit ? post_list.find((p) => p.id === post_id) : null; //수정모드라면

  const [contents, setContents] = React.useState(_post ? _post.contents : "");

  React.useEffect(() => {//맨 처음 렌더링 할 때
    if (is_edit && !_post) { //post 정보가 없다면
      console.log("포스트 정보가 없어요!");
      history.goBack();

      return;
    }
    //아래는 위 if문 이후니까 post 정보 있는 경우임
    if (is_edit) {//편집 모드일때
      dispatch(imageActions.setPreview(_post.image_url));//_post.image_url
    }
  }, []);

  const changeContents = (e) => {
    setContents(e.target.value);
  };

  const addPost = () => {//게시글 작성 버튼을 누르면 함수 실행
    dispatch(postActions.addPostFB(contents));
  };

  const editPost = () => {
    dispatch(postActions.editPostFB(post_id, {contents: contents})); //{contents: contents} 이용해 수정한 텍스트 내용으로 업로드
  }

  if (!is_login) {//로그인 안한 상태면 로그인 페이지로 이동할 수 있게
    return (
      <Grid margin="100px 0px" padding="16px" center>
        <Text size="32px" bold>
          앗! 잠깐!
        </Text> 
        <Text size="16px">로그인 후에만 글을 쓸 수 있어요!</Text>
        <Button
          _onClick={() => {
            history.replace("/"); 
            //push(새로 가는거)가 아닌 replace(지금 있는 페이지에서 갈아끼우는 것)를 해주는 이유 뒤로가기 눌렀을 때 다시 이 페이지로 오지 않게 됨
          }}
        >
          로그인 하러가기
        </Button>
      </Grid>
    );
  }

  return (//Grid 나누는 이유: padding 여부가 달라서
    <React.Fragment>
      <Grid padding="16px">
        <Text margin="0px" size="36px" bold>
          {is_edit ? "게시글 수정" : "게시글 작성"} 
        </Text>
        <Upload />
      </Grid>

      <Grid>
        <Grid padding="16px">
          <Text margin="0px" size="24px" bold>
            미리보기
          </Text>
        </Grid>

        <Image
          shape="rectangle"
          src={preview ? preview : "http://via.placeholder.com/400x300"} //받아온 preview가 있으면 그 preview를, 없으면 미리 지정해놓은 img 파일을
        />
      </Grid>

      <Grid padding="16px">
        <Input
          value={contents}
          _onChange={changeContents}
          label="게시글 내용"
          placeholder="게시글 작성"
          multiLine
        />
      </Grid>

      <Grid padding="16px">
        {is_edit ? ( //편집 상태일 때는 원래있던 데이터를 수정, 새 글 작성 상태일 때는 새로운 데이터 추가
          <Button text="게시글 수정" _onClick={editPost}></Button>
        ) : (
          <Button text="게시글 작성" _onClick={addPost}></Button>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default PostWrite;
