import React from "react";
import _ from "lodash";
import {Spinner} from "../elements";


const InfinityScroll = (props) => {//InfinityScroll은 끝에 닿기전 next로 이동시키기

    const {children, callNext, is_next, loading} = props;  //props 가져옴

    const _handleScroll = _.throttle(() => { //

        if(loading){//로딩중일 때는 callNext 안함
            return;
        }

        //강의자료 4주차->4-2) 스크롤 계산하기 참고. innerHeight, scrollHeight, scrollTop
        const {innerHeight} = window; 
        const {scrollHeight} = document.body; 

        //브라우저 호환성을 맞추기 위해 아래와 같이 불러온다. document아래에 documentElement가 있다면 scrollTop을 가지고 와라. 그렇지 않다면 document.body.scrollTop을 가져와라
        //크롬만 사용하면 document.body.scrollTop; 만 적어줘도 된다.
        const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        
        if(scrollHeight - innerHeight - scrollTop < 200) {//전체높이 - 스크롤한 길이 - 보이는 화면 영역 길이 < 200
            callNext();//다음 리스트 보여주기
        } 
    }, 300);

    const handleScroll = React.useCallback(_handleScroll, [loading]); //memoization이 되면서 위 로딩 값이 고정되어 있음 So 2번째 파라미터에 [loading]를 배열에 넣어 리덕스에서 바뀌었을 때 비뀐 값을 mwmoization된 함수에 전달가능


    React.useEffect(() => {//처음 load 했을 때 달아주는 것
        
        if(loading){
            return;
        }

        if(is_next){//다음 리스트가 있는 경우에만 scroll 이벤트 살행
            window.addEventListener("scroll", handleScroll); //scroll 이벤트, handleScroll함수 -> 이벤트 구독
        }else{// 없으면 remove 리스너 -> 이러면 리소스가 조금 줄은다.
            window.removeEventListener("scroll", handleScroll);
        }

        return () => window.removeEventListener("scroll", handleScroll); //함수형 컴포넌트에서 이벤트 구독 해제 방법 : (class형 컴포넌트의 unMount와 비슷하게 동작)
    }, [is_next, loading]);

    return (
        <React.Fragment>
            {props.children} {/*list임. children으로 내보내 줘야 화면에 나온다 */}
            {is_next && (<Spinner/>)} {/*is_next가 있을 때만 스피너를 보여준다.*/}
        </React.Fragment>
    )
}

InfinityScroll.defaultProps = {
    children: null, //
    callNext: () => {}, //다음 목록을 불러오는 함수
    is_next: false, //다음게 있는지 확인 (callnext를 부를지 여부에 관여함)
    loading: false, // 
}

export default InfinityScroll;