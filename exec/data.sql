-- ================================
-- data.sql 수정
-- ================================

-- 1. 캠퍼스 (created_at, updated_at 유지 - BaseTimeEntity 상속)
INSERT INTO campus (campus_id, name, created_at, updated_at) VALUES
                                                                 (1, '서울', NOW(), NOW()),
                                                                 (2, '대전', NOW(), NOW()),
                                                                 (3, '구미', NOW(), NOW()),
                                                                 (4, '부울경', NOW(), NOW()),
                                                                 (5, '광주', NOW(), NOW())
    ON DUPLICATE KEY UPDATE
                         name = VALUES(name),
                         updated_at = NOW();

-- 2. 메인코드 (created_at, updated_at 제거)
INSERT INTO maincode (upper_code_id, main_code, main_code_name, main_code_description, is_used)
VALUES
    (1, 'EDU', '학사', '학사 관련 메인코드', 1),
    (2, 'JOB', '취업', '취업 관련 메인코드', 1)
    ON DUPLICATE KEY UPDATE
                         main_code_name = VALUES(main_code_name),
                         main_code_description = VALUES(main_code_description),
                         is_used = VALUES(is_used);

-- 3. 서브코드 - 학사 (created_at, updated_at 제거)
INSERT INTO subcode (upper_code_id, sub_code, sub_code_name, sub_code_description, is_used) VALUES
                                                                                                (1, 'TODO', '할일', '학사 - 할일', 1),
                                                                                                (1, 'LECT', '특강', '학사 - 특강', 1),
                                                                                                (1, 'INFO', '정보', '학사 - 정보', 1),
                                                                                                (1, 'EVT', '이벤트', '학사 - 이벤트', 1)
    ON DUPLICATE KEY UPDATE
                         sub_code_name = VALUES(sub_code_name),
                         sub_code_description = VALUES(sub_code_description),
                         is_used = VALUES(is_used);

-- 4. 서브코드 - 취업 (created_at, updated_at 제거)
INSERT INTO subcode (upper_code_id, sub_code, sub_code_name, sub_code_description, is_used) VALUES
                                                                                                (2, 'TODO', '할일', '취업 - 할일', 1),
                                                                                                (2, 'LECT', '특강', '취업 - 특강', 1),
                                                                                                (2, 'INFO', '정보', '취업 - 정보', 1),
                                                                                                (2, 'EVT', '이벤트', '취업 - 이벤트', 1)
    ON DUPLICATE KEY UPDATE
                         sub_code_name = VALUES(sub_code_name),
                         sub_code_description = VALUES(sub_code_description),
                         is_used = VALUES(is_used);

-- 5. 직무 (created_at, updated_at 유지 - BaseTimeEntity 상속)
INSERT INTO position (position_id, position_name, created_at, updated_at) VALUES
                                                                              (1, '백엔드', NOW(), NOW()),
                                                                              (2, '프론트엔드', NOW(), NOW()),
                                                                              (3, '풀스택', NOW(), NOW()),
                                                                              (4, '모바일', NOW(), NOW()),
                                                                              (5, 'AI', NOW(), NOW()),
                                                                              (6, '데이터', NOW(), NOW()),
                                                                              (7, '인프라', NOW(), NOW()),
                                                                              (8, '보안', NOW(), NOW()),
                                                                              (9, '임베디드', NOW(), NOW()),
                                                                              (10, 'QA', NOW(), NOW()),
                                                                              (11, '전산', NOW(), NOW()),
                                                                              (12, '기획', NOW(), NOW()),
                                                                              (13, 'SW', NOW(), NOW()),
                                                                              (14, '게임', NOW(), NOW())
    ON DUPLICATE KEY UPDATE
                         position_name = VALUES(position_name),
                         updated_at = NOW();

INSERT INTO skill (skill_name) VALUES
                                   ('Java'),
                                   ('Python'),
                                   ('C'),
                                   ('C++'),
                                   ('C#'),
                                   ('Go'),
                                   ('Rust'),
                                   ('Kotlin'),
                                   ('Swift'),
                                   ('JavaScript'),
                                   ('TypeScript'),
                                   ('HTML5'),
                                   ('CSS3'),
                                   ('SASS'),
                                   ('Tailwind CSS'),
                                   ('React'),
                                   ('Vue.js'),
                                   ('Angular'),
                                   ('Next.js'),
                                   ('Nuxt.js'),
                                   ('Node.js'),
                                   ('Express.js'),
                                   ('Spring Boot'),
                                   ('Hibernate'),
                                   ('JPA'),
                                   ('MyBatis'),
                                   ('MySQL'),
                                   ('PostgreSQL'),
                                   ('MariaDB'),
                                   ('MongoDB'),
                                   ('Redis'),
                                   ('Elasticsearch'),
                                   ('Kibana'),
                                   ('Logstash'),
                                   ('Docker'),
                                   ('Kubernetes'),
                                   ('Nginx'),
                                   ('AWS EC2'),
                                   ('AWS S3'),
                                   ('AWS Lambda'),
                                   ('AWS RDS'),
                                   ('GCP'),
                                   ('Azure'),
                                   ('Firebase'),
                                   ('Git'),
                                   ('GitHub Actions'),
                                   ('GitLab CI/CD'),
                                   ('Jenkins'),
                                   ('Linux'),
                                   ('Ubuntu'),
                                   ('CentOS'),
                                   ('Shell Script'),
                                   ('REST API'),
                                   ('GraphQL'),
                                   ('WebSocket'),
                                   ('gRPC'),
                                   ('JUnit'),
                                   ('Mockito'),
                                   ('Selenium'),
                                   ('Playwright'),
                                   ('Cypress'),
                                   ('TensorFlow'),
                                   ('PyTorch'),
                                   ('scikit-learn'),
                                   ('OpenCV'),
                                   ('Pandas'),
                                   ('NumPy'),
                                   ('Matplotlib'),
                                   ('Seaborn'),
                                   ('HuggingFace Transformers'),
                                   ('LangChain'),
                                   ('FastAPI'),
                                   ('Flask'),
                                   ('Django'),
                                   ('Streamlit'),
                                   ('Android Studio'),
                                   ('Xcode'),
                                   ('Unity'),
                                   ('Unreal Engine'),
                                   ('Blender'),
                                   ('Figma'),
                                   ('Adobe XD'),
                                   ('Zeplin'),
                                   ('Postman'),
                                   ('Swagger'),
                                   ('Prometheus'),
                                   ('Grafana'),
                                   ('Terraform'),
                                   ('Ansible'),
                                   ('SonarQube'),
                                   ('Burp Suite'),
                                   ('Wireshark'),
                                   ('Metasploit'),
                                   ('Nmap'),
                                   ('CyberArk'),
                                   ('TensorRT'),
                                   ('ONNX'),
                                   ('OpenAI API'),
                                   ('LLM Fine-tuning'),
                                   ('Prompt Engineering'),
                                   ('RAG Pipeline');