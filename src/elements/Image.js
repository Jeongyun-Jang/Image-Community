import styled from 'styled-components';
import React from "react";

const Image = (props) => {
    const {shape, src, size} = props;

    const styles = {
        src: src,
        size: size,
        //shape: shape 넣지 않는 이유 이건 style 속성에서 사용할게 아니므로
    }

    if(shape === "circle"){//profile용
        return (
            <ImageCircle {...styles}></ImageCircle>
        )
    }

    if(shape === "rectangle"){//post image 용
        return (
            <AspectOutter>
                <AspectInner {...styles}></AspectInner>
            </AspectOutter>
        )
    }

    //알림용 이미지
    return (
        <React.Fragment>
            <ImageDefault {...styles}></ImageDefault>
        </React.Fragment>
    )
}

Image.defaultProps = {
  shape: "circle",
  src: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  size: 36,
};
//size를 변수로 사용
//그리고 그 변수를 가져다 쓸때는 var(--size); 처럼 해야한다.
const ImageDefault = styled.div`
  --size: ${(props) => props.size}px;
  width: var(--size);
  height: var(--size);
  background-image: url("${(props) => props.src}");
  background-size: cover;
`;

const AspectOutter = styled.div`
    width: 100%;
    min-width: 250px;
`;

const AspectInner = styled.div`
    position: relative;
    padding-top: 75%;
    overflow: hidden;
    background-image: url("${(props) => props.src}");
    background-size: cover;
`;

const ImageCircle = styled.div`
    --size: ${(props) => props.size}px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);

    background-image: url("${(props) => props.src}");
    background-size: cover;
    margin: 4px;
`;

export default Image;