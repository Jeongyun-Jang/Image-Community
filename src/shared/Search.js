import React from "react";
import _ from "lodash"; //debounce, throttle가 _에 담겨 있다.

const Search = () => {

    const [text, setText] = React.useState(""); //input의 value를 state로 관리

     const debounce = _.debounce((e) => {//debounce는 다음께 실행되면 이전께 취소되어 콘솔이 안나왔음 즉 키보드 누르는 동안에는 안나옴. 특정 시간(1000ms) 후에 {} 실행
       //e 입력하는 값 콘솔로 확인
       console.log("debounce ::: ", e.target.value);
     }, 1000);

     const throttle = _.throttle((e) => {//throttle은 키보드를 누르는 순간에도 콘솔로 확인 가능
       console.log("throttle ::: ", e.target.value);
     }, 1000);
     
    const keyPress = React.useCallback(debounce, []); //이 함수를 어딘가 저장하고, 컴포넌트가 리렌더링 되더라도 초기화 하지 말도록 하는 것이다. 두번째 파라미터의arr []값이 변할때 함수가 변하도록 한다.

    const onChange = (e) => {
        setText(e.target.value);//텍스트가 바뀔 때 마다 리렌러링 되는 것을 볼 수 있다. 모두 초기화 됨
        keyPress(e); 
    }

   

    return (
      <div>
        <input type="text" onChange={onChange} value={text}/>
      </div>
    );
}

export default Search;