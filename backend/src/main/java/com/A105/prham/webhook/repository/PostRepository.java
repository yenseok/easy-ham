package com.A105.prham.webhook.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

// ⚠️ com.A105.prham.messages.entity.Message 임포트는 이제 필요 없으므로 삭제합니다.
import com.A105.prham.webhook.entity.Post;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

	// mattermost 메시지 id로 조회 (중복 체크용)
	Optional<Post> findByPostId(String postId);

	@Query("SELECT p FROM Post p WHERE p.id = :id")
	Optional<Post> findPostById(@Param("id") Long id);

	// 메시지 존재하는가
	boolean existsByPostId(String postId);

	// 1. 키워드 검색
	List<Post> findByCleanedTextContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);

	// 2. 채널별 조회
	List<Post> findByChannelIdOrderByCreatedAtDesc(String channelId);

	// 3. 마감일 임박순 조회
	List<Post> findByDeadlineIsNotNullOrderByDeadlineAsc();

	// 전체 채용 공고 조회
	@Query("SELECT DISTINCT p FROM Post p " +
		"LEFT JOIN FETCH p.position " +
		"WHERE p.mainCategory = '취업' AND p.subCategory = '채용' " +
		"ORDER BY p.createdAt DESC")
	List<Post> findAllJobPostings();

	//사용자 선호 직무에 맞는 채용 공고만 조회
	@Query("SELECT DISTINCT p FROM Post p " +
		"LEFT JOIN FETCH p.position pos " +
		"WHERE p.mainCategory = '취업' AND p.subCategory = '채용' " +
		"AND pos.id IN :positionIds " +
		"ORDER BY p.createdAt DESC")
	List<Post> findJobPostingsByPositions(@Param("positionIds") Set<Long> positionIds);

	//이거 쿼리 효율 나쁘니까 나중에 뭉탱이 쿼리로 바꿔야함
	@Query("""
			SELECT p.id FROM Post p
			WHERE p.postId = :postId
			""")
	Long SelectPostIdByMMPOSTID(@Param("postId") String postId);

	@Query("""
			SELECT p.id FROM Post p
			WHERE p.postId IN :postIds
			""")
	List<Long> selectPostIdsByMMPostIds(@Param("postIds") List<String> postIds);

}