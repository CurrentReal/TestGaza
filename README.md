# TestGaza

#해당 프로젝트 폴더가 위치한 경로에서 콘솔창에 npm start로 시작(로컬주소 127.0.0.1:3000)
#기본으로는 index.jade가 보여짐 welcome express

#/topic 으로 기존 data폴더에 있는 데이터의 타이틀과 내용을 보여주는 페이지
#/topic/new 로 새 데이터 입력(글쓰기), 제목과 내용이 data폴더에 저장
#/upload 로 uploads폴더에 데이터 저장

#아직 DB연결 없는 연습용 코드

#자세한 코드 설명은 생활코딩에 나와있음

# 05.23
#필요없던 view 제거 DB와 연동시킨 코드로 변경
#/topic 에서 글쓰기, 읽기 그리고 편집, 삭제 간단하게 구현

# 5.24
#topic 관련 라우터 app.js에서 routes폴더 topic.js파일로 모듈화
#app.js에 테스트 코드 추가
