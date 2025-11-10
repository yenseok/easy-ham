-- 캠퍼스 데이터 (중복 시 무시)
INSERT IGNORE INTO campus (campus_id, name) VALUES
    (1, '서울'),
    (2, '대전'),
    (3, '구미'),
    (4, '부울경'),
    (5, '광주');

-- 메인코드 (중복 시 무시)
INSERT IGNORE INTO maincode (upper_code_id, main_code, main_code_name, main_code_description, is_used)
VALUES
    (1, 'EDU', '학사', '학사 관련 메인코드', 1),
    (2, 'JOB', '취업', '취업 관련 메인코드', 1);

-- 서브코드 - 학사
INSERT IGNORE INTO subcode (upper_code_id, sub_code, sub_code_name, sub_code_description, is_used) VALUES
(1, 'TODO', '할일', '학사 - 할일', 1),
(1, 'LECT', '특강', '학사 - 특강', 1),
(1, 'INFO', '정보', '학사 - 정보', 1),
(1, 'EVT', '이벤트', '학사 - 이벤트', 1);

-- 서브코드 - 취업
INSERT IGNORE INTO subcode (upper_code_id, sub_code, sub_code_name, sub_code_description, is_used) VALUES
(2, 'TODO', '할일', '취업 - 할일', 1),
(2, 'LECT', '특강', '취업 - 특강', 1),
(2, 'INFO', '정보', '취업 - 정보', 1),
(2, 'EVT', '이벤트', '취업 - 이벤트', 1);