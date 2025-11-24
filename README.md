# 편리햄! – AI 기반 워크스페이스 관리 서비스

## 프로젝트 개요
편리햄은 Mattermost 플랫폼을 확장하여 협업 환경을 더 효율적이고 편리하게 관리할 수 있도록 만든 서비스입니다.
메시지·파일을 실시간으로 수집하고, AI 기반 분류, 고급 검색, 실시간 알림, 추천 기능을 제공합니다.

---

## 주요 기능

### AI 기반 메시지 분석
- 문서 및 메시지 자동 분류 및 라벨링

<img src="https://github.com/user-attachments/assets/849b4c93-fbc0-49d7-922a-e917b8ea1d54" height="400" weight ="600"/>


### 실시간 알림 (SSE & Chatbot)
- 키워드 알림
- 마감 임박 알림
- 선호 포지션 & 기술 스택 구직 정보 알림
- 게시글 수정·삭제 정보 실시간 반영
- Spring SSE 기반 스트리밍
- Mattermost Chatbot 실시간 알림

#### <br>[SSE 알림]<br>
<img src="https://github.com/user-attachments/assets/9829ab57-10cb-47c3-bb64-aa395d2a3ed6" height="400" weight ="600"/>

#### <br>[Chatbot 긴급 알림]<br>
<img src="https://github.com/user-attachments/assets/08f05f8e-ec01-4b99-b27f-f9ce4a9929b1" height="400" weight ="600"/>

### 통합 검색 엔진 (Meilisearch)
- 메시지 + 파일명 + 파일 확장자 통합 검색
- 유사어, 오타 허용 검색 지원
- 변경/삭제 실시간 색인 반영

#### <br>[키워드 통합 검색]<br>
<img src="https://github.com/user-attachments/assets/491b7c77-7281-400c-8678-1788f0f5e9b5" height="400" weight ="600"/>

#### <br>[오타 검색]<br>
<img src="https://github.com/user-attachments/assets/657b37a7-643d-4552-ab09-a375c5354516" height="400" weight ="600"/>

#### <br>[유사어 검색]<br>
<img src="https://github.com/user-attachments/assets/719aeb30-d410-4b43-a7a2-2178a2ef3a36" height="400" weight ="600"/>

#### <br>[파일 검색]<br>
<img width="600" height="400" alt="6파일검색" src="https://github.com/user-attachments/assets/ebde7209-3df2-4b8a-9123-69483f8ee7f7" />

### Mattermost Plugin 연동
- Post Updated / Deleted Hook 기반 이벤트 처리
- Webhook → Backend → Search 자동 연동 구조
- 플러그인 persist 기반 지속성 유지


---

## 아키텍처
![Architecture](https://github.com/user-attachments/assets/9286307c-a641-4457-9f43-7e7258f6f500)

```
Mattermost
└─ Custom Plugin (Post Update/Delete Hook)
↓ Webhook
Spring Boot Server
├─ SSAFY SSO Login
├─ Webhook Event Processor
├─ AI Classification
├─ SSE Real-time Notification
├─ Chatbot Notification
└─ DB / FileInfo / Meilisearch Indexing
↓
Meilisearch
└─ 검색 API 제공
React Frontend (Vite)
└─ 실시간 스트림 UI / 검색 UI
```

---

## ERD

![ERD](https://github.com/user-attachments/assets/99e4325a-6c65-4b77-a59c-ce263076d60b)


---

## 기술 스택


| Category | Technologies |
|----------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/-React-20232A?logo=react&logoColor=61DAFB) ![Zustand](https://img.shields.io/badge/-Zustand-443E38?logo=zustand&logoColor=white) |
| **Backend** | ![Spring Boot](https://img.shields.io/badge/-Spring_Boot-6DB33F?logo=springboot&logoColor=white) ![Java](https://img.shields.io/badge/-Java-007396?logo=openjdk&logoColor=white) ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) ![MeiliSearch](https://img.shields.io/badge/-MeiliSearch-4E75F6?logo=meilisearch&logoColor=white) |
| **AI** | ![OpenAI](https://img.shields.io/badge/-OpenAI-412991?logo=openai&logoColor=white) |
| **DevOps** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) ![Jenkins](https://img.shields.io/badge/-Jenkins-D24939?logo=jenkins&logoColor=white) |
| **Collaboration** | ![Git](https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white) ![GitLab](https://img.shields.io/badge/-GitLab-FC6D26?logo=gitlab&logoColor=white) ![Jira](https://img.shields.io/badge/-Jira-0052CC?logo=jira&logoColor=white) ![Notion](https://img.shields.io/badge/-Notion-000000?logo=notion&logoColor=white) |

---


## API 명세

- [API 문서 바로가기](https://gilded-angle-55e.notion.site/API-27d67182e119814a9183c2dfec85c698?source=copy_link)

---

## 팀 구성
2025.10.10~2025.11.20 <br>

| 이름 | 역할 |
|------|------|
| 이현석 | Frontend |
| 조영우 | Frontend |
| 김은재 | Backend |
| 이예린 | Backend |
| 석예은 | Backend |
| 봉혜린 | Infra |

---
