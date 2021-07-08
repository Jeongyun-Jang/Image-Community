import React from "react";
import styled from "styled-components";

import { Text, Grid } from "./index";

const Input = (props) => {
  const {
    label,
    placeholder,
    _onChange,
    type,
    multiLine,
    value,
    is_submit, //input 값이 전송 돼었는가 ? true or false
    onSubmit, //Enter 키 누르는 작업
  } = props;

  if (multiLine) {
    return (
      <Grid>
        {label && <Text margin="0px">{label}</Text>}
        <ElTextarea
          rows={10} //10줄이 들어갈 만큼으로 공간 만들어준다.
          value={value}
          placeholder={placeholder}
          onChange={_onChange}
        ></ElTextarea>
      </Grid>
    );
  }

  return ( //댓글 입력or 로그인 등 게시물 입력(multiline) 경우가 아닐 때
  //is_submit 상태에 따라 value 컨트롤 여부 

    <React.Fragment>
      <Grid>
        {label && <Text margin="0px">{label}</Text>} {/* 라벨을 안 넘겨줌 */}
        {is_submit ? ( //is_submit true :  로그인 , 회원가입의 input
          <ElInput
            type={type}
            placeholder={placeholder}
            onChange={_onChange}
            value={value} //value를 컨트롤 해! //PostEdit page 수정 상황일 때 value 값도 함께 넘겨준다. 그외 상황엔 "" 비어있다.
            onKeyPress={(e) => { //Enter를 누른경우 키보드 이벤트 Enter 키 코드를 onSubmit 
              if(e.key === "Enter"){
                onSubmit(e); 
              }
            }}
          />
        ) : ( //is_submit false : 댓글의 input
          <ElInput type={type} placeholder={placeholder} onChange={_onChange} />//value 없이 가즈아
        )}
      </Grid>
    </React.Fragment>
  );
};

Input.defaultProps = {
  multiLine: false,
  label: false,
  placeholder: "텍스트를 입력해주세요.",
  type: "text",
  value: "",  
  is_submit: false, //입력 값이 제출된 후에는 clear 비워준다. 이 상태를 false로 지정
  onSubmit: () => {},
  _onChange: () => {},
};

const ElTextarea = styled.textarea`
  border: 1px solid #212121;
  width: 100%;
  padding: 12px 4px;
  box-sizing: border-box;
`;

const ElInput = styled.input`
  border: 1px solid #212121;
  width: 100%;
  padding: 12px 4px;
  box-sizing: border-box;
`;

export default Input;
